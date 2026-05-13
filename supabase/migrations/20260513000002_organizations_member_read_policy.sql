-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: Allow teachers (and all org members) to read their organization row
-- ─────────────────────────────────────────────────────────────────────────────
-- Problem:
--   The existing RLS policy "Admins can view own organization" uses
--   USING (admin_id = auth.uid()), which only allows the organization owner
--   (admin) to read the organizations row. Teachers logged in get a 406
--   PGRST116 error when the billing service or sidebar tries to read their org.
--
-- Fix:
--   Add a new SELECT policy that allows any user who has a row in
--   user_organization_profiles for a given org to read that org's record.
--   Write policies (UPDATE) remain admin-only.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;

CREATE POLICY "Users can view their own organization"
ON public.organizations
FOR SELECT
USING (
  id IN (
    SELECT organization_id
    FROM user_organization_profiles
    WHERE user_id = auth.uid()
      AND is_active = true
  )
);
