-- ─────────────────────────────────────────────────────────────────────────────
-- Backfill: user_organization_profiles for pre-existing teachers
-- ─────────────────────────────────────────────────────────────────────────────
-- Context:
--   The create-teacher Edge Function was updated to insert a row into
--   user_organization_profiles (role='teacher') when a new teacher is created.
--   Teachers created BEFORE that fix exist in the `teachers` table but have
--   no corresponding row in user_organization_profiles, causing the platform
--   to redirect them to the "No Organization Found" screen on login.
--
-- This migration is idempotent (ON CONFLICT DO NOTHING) and safe to run
-- multiple times. It only touches teachers whose user_id is not null and
-- not already present in user_organization_profiles for their organization.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO user_organization_profiles (user_id, organization_id, role)
SELECT
  t.user_id,
  t.organization_id,
  'teacher'
FROM teachers t
WHERE
  t.user_id IS NOT NULL
  AND t.organization_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM user_organization_profiles uop
    WHERE uop.user_id       = t.user_id
      AND uop.organization_id = t.organization_id
  )
ON CONFLICT (user_id, organization_id) DO NOTHING;

-- Verification query (commented out — run manually to confirm):
-- SELECT t.full_name, t.email, uop.role, uop.organization_id
-- FROM teachers t
-- LEFT JOIN user_organization_profiles uop
--   ON uop.user_id = t.user_id AND uop.organization_id = t.organization_id
-- WHERE t.user_id IS NOT NULL
-- ORDER BY uop.role NULLS LAST;
