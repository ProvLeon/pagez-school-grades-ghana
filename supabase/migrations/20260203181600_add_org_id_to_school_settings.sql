-- Migration: Add organization_id to school_settings for proper multi-tenancy
-- This ensures each school is properly bound to its organization

-- Step 1: Add organization_id column to school_settings
ALTER TABLE public.school_settings 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Step 2: Backfill organization_id from existing admin relationships
-- This looks up the organization that the admin belongs to via user_organization_profiles
UPDATE public.school_settings ss
SET organization_id = (
    SELECT uop.organization_id 
    FROM user_organization_profiles uop 
    WHERE uop.user_id = ss.admin_id 
    AND uop.is_active = true
    LIMIT 1
)
WHERE ss.organization_id IS NULL 
AND ss.admin_id IS NOT NULL;

-- Step 3: For any remaining records without organization_id, 
-- try to find via organizations table directly (where admin is the org admin)
UPDATE public.school_settings ss
SET organization_id = (
    SELECT o.id 
    FROM organizations o 
    WHERE o.admin_id = ss.admin_id
    LIMIT 1
)
WHERE ss.organization_id IS NULL 
AND ss.admin_id IS NOT NULL;

-- Step 4: Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_school_settings_organization_id 
ON public.school_settings(organization_id);

-- Verify the migration
SELECT 
    COUNT(*) as total_settings,
    COUNT(organization_id) as with_org_id,
    COUNT(*) - COUNT(organization_id) as missing_org_id
FROM public.school_settings;

-- Show any records that still don't have organization_id
SELECT id, admin_id, school_name, organization_id 
FROM public.school_settings 
WHERE organization_id IS NULL;
