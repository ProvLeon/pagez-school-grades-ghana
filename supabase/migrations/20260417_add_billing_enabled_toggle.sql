-- ============================================
-- MIGRATION: Add Admin Billing Enable/Disable Toggle
-- ============================================

-- Add billing_enabled column to organizations with default true
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS billing_enabled BOOLEAN DEFAULT TRUE;

-- Create index for quick billing status lookup
CREATE INDEX IF NOT EXISTS idx_orgs_billing_enabled ON public.organizations(billing_enabled);

-- Create a helper function for toggling billing (called from frontend with RLS)
CREATE OR REPLACE FUNCTION toggle_organization_billing(
  org_id UUID,
  enabled BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Check if the current user is an admin of this organization
  SELECT EXISTS(
    SELECT 1
    FROM public.user_organization_profiles
    WHERE user_id = auth.uid()
      AND organization_id = org_id
      AND is_active = true
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin of this organization';
  END IF;

  -- Update the billing_enabled flag
  UPDATE public.organizations
  SET billing_enabled = enabled,
      updated_at = NOW()
  WHERE id = org_id;

  RETURN TRUE;
END;
$$;

-- Allow authenticated users to call this function
GRANT EXECUTE ON FUNCTION toggle_organization_billing(UUID, BOOLEAN) TO authenticated;

-- Helper to log success
DO $$
BEGIN
  RAISE NOTICE 'Billing enable/disable toggle added successfully.';
END $$;
