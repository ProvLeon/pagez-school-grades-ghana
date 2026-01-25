-- ============================================
-- MIGRATION: Allow Users to Create Organizations
-- ============================================
-- This fixes the chicken-and-egg problem where new users
-- cannot create an organization because there was no INSERT policy

-- Allow authenticated users to create their own organization
-- The check ensures they can only create an org where they are the admin
CREATE POLICY "Users can create own organization" ON public.organizations
  FOR INSERT WITH CHECK (admin_id = auth.uid());
