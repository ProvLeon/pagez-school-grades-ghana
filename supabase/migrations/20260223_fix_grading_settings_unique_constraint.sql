-- Fix grading_settings unique constraint for multi-tenant (SaaS) support.
-- The original constraint UNIQUE(academic_year, term) prevents different organizations
-- from having settings for the same academic_year + term combo.
-- This migration updates it to UNIQUE(academic_year, term, organization_id).

-- Step 1: Drop the old unique constraint WITH CASCADE
-- CASCADE is required because grading_scales and assessment_configurations
-- have foreign keys referencing this unique index.
ALTER TABLE public.grading_settings
  DROP CONSTRAINT IF EXISTS grading_settings_academic_year_term_key CASCADE;

-- Step 2: Add the new multi-tenant unique constraint
ALTER TABLE public.grading_settings
  ADD CONSTRAINT grading_settings_academic_year_term_org_key
  UNIQUE (academic_year, term, organization_id);

-- Step 3: Re-create the foreign keys on dependent tables
-- Now referencing the new 3-column unique constraint
-- (only if both child tables also have organization_id columns)
ALTER TABLE public.grading_scales
  ADD CONSTRAINT grading_scales_academic_year_term_org_fkey
  FOREIGN KEY (academic_year, term, organization_id)
  REFERENCES public.grading_settings(academic_year, term, organization_id)
  ON DELETE CASCADE;

ALTER TABLE public.assessment_configurations
  ADD CONSTRAINT assessment_configurations_academic_year_term_org_fkey
  FOREIGN KEY (academic_year, term, organization_id)
  REFERENCES public.grading_settings(academic_year, term, organization_id)
  ON DELETE CASCADE;
