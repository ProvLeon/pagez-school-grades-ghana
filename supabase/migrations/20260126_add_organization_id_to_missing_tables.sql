-- ============================================
-- MIGRATION: Add organization_id to missing tables
-- ============================================
-- This migration adds organization_id column to tables that were created
-- before the multi-tenant organization support was fully implemented

-- Add organization_id to grading_settings
ALTER TABLE IF EXISTS public.grading_settings
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to assessment_configurations
ALTER TABLE IF EXISTS public.assessment_configurations
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to subject_combinations
ALTER TABLE IF EXISTS public.subject_combinations
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to comment_options
ALTER TABLE IF EXISTS public.comment_options
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to academic_sessions (if it exists)
ALTER TABLE IF EXISTS public.academic_sessions
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to academic_terms (if it exists)
ALTER TABLE IF EXISTS public.academic_terms
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_grading_settings_organization_id ON public.grading_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_assessment_configurations_organization_id ON public.assessment_configurations(organization_id);
CREATE INDEX IF NOT EXISTS idx_subject_combinations_organization_id ON public.subject_combinations(organization_id);
CREATE INDEX IF NOT EXISTS idx_comment_options_organization_id ON public.comment_options(organization_id);
CREATE INDEX IF NOT EXISTS idx_academic_sessions_organization_id ON public.academic_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_academic_terms_organization_id ON public.academic_terms(organization_id);

DO $$
BEGIN
  RAISE NOTICE 'Successfully added organization_id columns to missing tables';
  RAISE NOTICE 'Tables updated: grading_settings, assessment_configurations, subject_combinations, comment_options, academic_sessions, academic_terms';
END $$;
