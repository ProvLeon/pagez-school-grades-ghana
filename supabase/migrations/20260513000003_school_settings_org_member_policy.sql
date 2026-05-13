-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: Simplify school_settings read policy using organization_id directly
-- ─────────────────────────────────────────────────────────────────────────────
-- school_settings already has an organization_id column. Any authenticated
-- user who belongs to that organization (via user_organization_profiles)
-- should be able to read the row — no admin join needed.
-- ─────────────────────────────────────────────────────────────────────────────

-- Replace the complex admin-join policy with a direct org membership check
DROP POLICY IF EXISTS "Teachers can read org school settings" ON public.school_settings;

CREATE POLICY "Org members can read school settings"
ON public.school_settings
FOR SELECT
USING (
  -- Allow if current user belongs to this school's organization
  organization_id IN (
    SELECT organization_id
    FROM user_organization_profiles
    WHERE user_id = auth.uid()
      AND is_active = true
  )
  OR
  -- Keep backward-compat: admin who owns the row via admin_id
  admin_id = auth.uid()
);
