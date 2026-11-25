-- Only an organization owner may bootstrap their own admin membership.
DROP POLICY IF EXISTS "Admins can insert org memberships" ON public.user_organization_profiles;
DROP POLICY IF EXISTS "Users can update own org profile" ON public.user_organization_profiles;
DROP POLICY IF EXISTS "Owners can bootstrap admin membership" ON public.user_organization_profiles;
REVOKE UPDATE, DELETE ON public.user_organization_profiles FROM PUBLIC, anon, authenticated;
CREATE POLICY "Owners can bootstrap admin membership" ON public.user_organization_profiles
  FOR INSERT TO authenticated WITH CHECK (
    user_id = (SELECT auth.uid()) AND role = 'admin' AND is_active IS TRUE
    AND EXISTS (SELECT 1 FROM public.organizations o
                WHERE o.id = organization_id AND o.admin_id = (SELECT auth.uid()))
  );

CREATE OR REPLACE FUNCTION public.protect_org_billing() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF current_user IN ('anon', 'authenticated') THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.subscription_status IS DISTINCT FROM 'trial' OR NEW.declared_seat_count IS DISTINCT FROM 10
        OR NEW.billing_enabled IS DISTINCT FROM true OR NEW.current_subscription_ends_at IS NOT NULL THEN
        RAISE EXCEPTION 'Billing fields are managed by the server' USING ERRCODE = '42501';
      END IF;
    ELSIF ROW(NEW.admin_id, NEW.subscription_status, NEW.declared_seat_count, NEW.billing_enabled,
              NEW.current_subscription_ends_at)
       IS DISTINCT FROM ROW(OLD.admin_id, OLD.subscription_status, OLD.declared_seat_count, OLD.billing_enabled,
                            OLD.current_subscription_ends_at) THEN
      RAISE EXCEPTION 'Billing fields are managed by the server' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS protect_org_billing ON public.organizations;
CREATE TRIGGER protect_org_billing BEFORE INSERT OR UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.protect_org_billing();

-- Billing exemptions are an operator action, not a tenant-admin entitlement.
REVOKE EXECUTE ON FUNCTION public.toggle_organization_billing(uuid, boolean) FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS public.checkout_orders (
  reference uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key text NOT NULL UNIQUE CHECK (length(idempotency_key) BETWEEN 16 AND 128),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  mode text NOT NULL CHECK (mode IN ('test', 'live')),
  seats integer NOT NULL CHECK (seats BETWEEN 1 AND 1000000),
  amount_pesewas integer NOT NULL CHECK (amount_pesewas > 0),
  top_up_seats integer NOT NULL DEFAULT 0,
  term_end timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  outcome text CHECK (outcome IN ('fulfilled', 'review'))
);
CREATE INDEX IF NOT EXISTS checkout_orders_org_idx ON public.checkout_orders (organization_id, created_at DESC);
DROP INDEX IF EXISTS checkout_orders_open_org_idx;
CREATE INDEX IF NOT EXISTS checkout_orders_rate_idx ON public.checkout_orders (organization_id, created_at DESC);
ALTER TABLE public.checkout_orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.checkout_orders FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.checkout_orders TO service_role;

CREATE OR REPLACE FUNCTION public.create_checkout_order(p_org uuid, p_user uuid, p_seats integer, p_mode text, p_idempotency_key text)
RETURNS public.checkout_orders LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  org public.organizations;
  checkout public.checkout_orders;
  existing public.checkout_orders;
  delta integer := 0;
  total integer;
  term_end timestamptz := make_timestamptz(extract(year FROM now() AT TIME ZONE 'UTC')::integer, 12, 31, 23, 59, 59, 'UTC');
BEGIN
  IF p_idempotency_key IS NULL OR length(p_idempotency_key) NOT BETWEEN 16 AND 128 THEN
    RAISE EXCEPTION 'Invalid idempotency key' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO existing FROM public.checkout_orders
    WHERE idempotency_key = p_idempotency_key AND created_by = p_user AND organization_id = p_org;
  IF FOUND THEN RETURN existing; END IF;
  SELECT * INTO org FROM public.organizations WHERE id = p_org FOR UPDATE;
  IF NOT FOUND OR org.is_active IS NOT TRUE OR org.billing_enabled IS NOT TRUE
    OR (org.admin_id <> p_user AND NOT EXISTS (SELECT 1 FROM public.user_organization_profiles
                   WHERE organization_id = p_org AND user_id = p_user AND role = 'admin' AND is_active IS TRUE)) THEN
    RAISE EXCEPTION 'Checkout not authorized' USING ERRCODE = '42501';
  END IF;
  IF p_seats IS NULL OR p_seats NOT BETWEEN 1 AND 1000000 OR p_seats <
    (SELECT count(*) FROM public.students WHERE organization_id = p_org) THEN
    RAISE EXCEPTION 'Invalid seat count' USING ERRCODE = '22023';
  END IF;
  IF (SELECT count(*) FROM public.checkout_orders WHERE organization_id = p_org AND created_at > now() - interval '1 minute') >= 5 THEN
    RAISE EXCEPTION 'Checkout rate limit reached' USING ERRCODE = 'P4290';
  END IF;
  IF org.subscription_status = 'active' AND org.current_subscription_ends_at > now() THEN
    delta := p_seats - org.declared_seat_count;
    IF delta IS NULL OR delta <= 0 THEN
      RAISE EXCEPTION 'Invalid top-up seat count' USING ERRCODE = '22023';
    END IF;
    term_end := org.current_subscription_ends_at;
    total := delta * 200;
  ELSE
    total := greatest(20000, p_seats * 200);
  END IF;
  INSERT INTO public.checkout_orders (idempotency_key, created_by, organization_id, mode, seats, amount_pesewas, top_up_seats, term_end)
    VALUES (p_idempotency_key, p_user, p_org, p_mode, p_seats, total, delta, term_end) RETURNING * INTO checkout;
  RETURN checkout;
END;
$$;
REVOKE ALL ON FUNCTION public.create_checkout_order(uuid, uuid, integer, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_checkout_order(uuid, uuid, integer, text, text) TO service_role;

CREATE OR REPLACE FUNCTION public.settle_checkout_order(p_reference uuid, p_mode text, p_amount integer, p_currency text,
                                              p_paid_at timestamptz, p_channel text)
RETURNS text LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  checkout public.checkout_orders;
  org public.organizations;
  outcome text := 'fulfilled';
  seats integer;
BEGIN
  SELECT * INTO STRICT checkout FROM public.checkout_orders WHERE reference = p_reference FOR UPDATE;
  IF p_mode IS DISTINCT FROM checkout.mode OR p_amount IS DISTINCT FROM checkout.amount_pesewas
    OR p_currency IS DISTINCT FROM 'GHS' OR p_paid_at IS NULL OR p_paid_at < date_trunc('second', checkout.created_at) THEN
    RAISE EXCEPTION 'Payment does not match checkout order' USING ERRCODE = '22023';
  END IF;
  IF checkout.outcome IS NOT NULL THEN RETURN checkout.outcome; END IF;
  SELECT * INTO STRICT org FROM public.organizations WHERE id = checkout.organization_id FOR UPDATE;
  seats := checkout.seats;
  IF checkout.top_up_seats > 0 THEN
    seats := org.declared_seat_count + checkout.top_up_seats;
  END IF;
  -- Record paid orders that cannot safely change the current term for manual reconciliation.
  IF checkout.term_end <= greatest(now(), p_paid_at) OR org.billing_enabled IS NOT TRUE OR org.is_active IS NOT TRUE
    OR seats IS NULL OR seats > 1000000
    OR (checkout.top_up_seats > 0 AND (org.subscription_status IS DISTINCT FROM 'active'
                                       OR org.current_subscription_ends_at IS DISTINCT FROM checkout.term_end))
    OR (checkout.top_up_seats = 0 AND org.current_subscription_ends_at >= checkout.term_end)
    OR seats < (SELECT count(*) FROM public.students WHERE organization_id = org.id) THEN
    outcome := 'review';
  END IF;
  INSERT INTO public.payment_logs (organization_id, transaction_reference, amount_paid_ghs, payment_status, payment_channel, payment_date)
    VALUES (org.id, p_reference::text, p_amount::numeric / 100, CASE WHEN outcome = 'fulfilled' THEN 'success' ELSE 'needs_review' END,
            left(p_channel, 50), p_paid_at);
  IF outcome = 'fulfilled' THEN
    UPDATE public.organizations SET subscription_status = 'active', declared_seat_count = seats,
      current_subscription_ends_at = checkout.term_end WHERE id = org.id;
  END IF;
  UPDATE public.checkout_orders SET paid_at = p_paid_at, outcome = settle_checkout_order.outcome WHERE reference = p_reference;
  RETURN outcome;
END;
$$;
REVOKE ALL ON FUNCTION public.settle_checkout_order(uuid, text, integer, text, timestamptz, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_checkout_order(uuid, text, integer, text, timestamptz, text) TO service_role;