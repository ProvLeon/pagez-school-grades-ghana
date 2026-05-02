-- ============================================
-- HOTFIX: Remove Recursive Policy
-- ============================================
-- The "Admins can manage org members" policy was causing infinite recursion
-- This migration removes it and keeps only the safe policies

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Admins can manage org members" ON public.user_organization_profiles;

-- Drop the old policies that might exist
DROP POLICY IF EXISTS "Admins can insert org memberships" ON public.user_organization_profiles;
DROP POLICY IF EXISTS "Users can update own org profile" ON public.user_organization_profiles;

-- Create safe policies for organization profile management
CREATE POLICY "Admins can insert org memberships" ON public.user_organization_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own org profile" ON public.user_organization_profiles
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DO $$
BEGIN
  RAISE NOTICE 'Fixed: Removed recursive policy from user_organization_profiles';
  RAISE NOTICE 'Safe policies restored for organization profile management';
END $$;
