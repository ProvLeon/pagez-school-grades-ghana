-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: Allow teachers to read school_settings for their organization
-- ─────────────────────────────────────────────────────────────────────────────
-- Problem:
--   The existing RLS policy "Users can read their own school settings" uses
--   USING (auth.uid() = admin_id), which only allows the admin who created the
--   school settings to read them. Teachers (different auth.uid()) are blocked.
--
-- Fix:
--   Add a new SELECT policy that allows any authenticated user who belongs
--   to the same organization (via user_organization_profiles) to read school
--   settings. This is read-only — write policies are unchanged.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Teachers can read org school settings" ON public.school_settings;

CREATE POLICY "Teachers can read org school settings"
ON public.school_settings
FOR SELECT
USING (
  -- Allow if the current user shares an organization with the admin who owns this row
  admin_id IN (
    SELECT uop_admin.user_id
    FROM user_organization_profiles uop_admin
    WHERE uop_admin.role IN ('admin', 'super_admin')
      AND uop_admin.organization_id = (
        SELECT uop_me.organization_id
        FROM user_organization_profiles uop_me
        WHERE uop_me.user_id = auth.uid()
        LIMIT 1
      )
  )
);
