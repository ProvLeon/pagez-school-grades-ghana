-- ============================================
-- MIGRATION: Add SaaS Billing & Subscription Fields
-- ============================================

-- 1. Create Subscription Status Enum
CREATE TYPE subscription_status_type AS ENUM ('trial', 'active', 'trial_expired', 'grace', 'locked');

-- 2. Add columns to organizations
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS subscription_status subscription_status_type DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS declared_seat_count INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
ADD COLUMN IF NOT EXISTS current_subscription_ends_at TIMESTAMP WITH TIME ZONE;

-- Create an index to quickly lookup expired trials or blocked orgs
CREATE INDEX IF NOT EXISTS idx_orgs_sub_status ON public.organizations(subscription_status);

-- 3. Create the Anti-Cheat Trigger Function for students table
CREATE OR REPLACE FUNCTION check_seat_quota_before_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_current_count INTEGER;
  v_declared_limit INTEGER;
  v_subscription_status subscription_status_type;
BEGIN
  -- Get the organization's declared limit and status
  SELECT declared_seat_count, subscription_status 
  INTO v_declared_limit, v_subscription_status
  FROM public.organizations 
  WHERE id = NEW.organization_id;

  -- Default fallback if org not found or fields missing
  IF v_declared_limit IS NULL THEN
    v_declared_limit := 10;
  END IF;

  IF v_subscription_status IS NULL THEN
    v_subscription_status := 'trial';
  END IF;

  -- If status is locked, grace, or trial_expired, block ALL inserts
  IF v_subscription_status IN ('locked', 'grace', 'trial_expired') THEN
    RAISE EXCEPTION 'Account is in % state. Please complete payment to add more students.', v_subscription_status;
  END IF;

  -- Count existing students for this organization
  SELECT COUNT(id)
  INTO v_current_count
  FROM public.students
  WHERE organization_id = NEW.organization_id;

  -- Enforce Seat Limitation
  IF v_current_count >= v_declared_limit THEN
    RAISE EXCEPTION 'Seat Limit Reached. Your plan allows up to % student registrations. You must upgrade your limits before adding more.', v_declared_limit;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Attach trigger to students table
DROP TRIGGER IF EXISTS enforce_student_seat_quota ON public.students;
CREATE TRIGGER enforce_student_seat_quota
BEFORE INSERT ON public.students
FOR EACH ROW
EXECUTE FUNCTION check_seat_quota_before_insert();

-- Helper to log success
DO $$
BEGIN
  RAISE NOTICE 'SaaS Billing fields and Anti-Cheat triggers added successfully.';
END $$;
