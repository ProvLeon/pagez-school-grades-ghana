-- ============================================
-- MIGRATION: Add organization_id to all data tables
-- ============================================
-- This migration ensures ALL tables have organization_id for multi-tenant support

-- Add organization_id to students (if not already present)
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to teachers
ALTER TABLE public.teachers
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to classes
ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to departments
ALTER TABLE public.departments
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to subjects
ALTER TABLE public.subjects
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to ca_types
ALTER TABLE public.ca_types
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to results
ALTER TABLE public.results
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to transfers
ALTER TABLE public.transfers
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to grading_scales
ALTER TABLE public.grading_scales
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to mock_exam_sessions
ALTER TABLE public.mock_exam_sessions
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to mock_exam_results
ALTER TABLE public.mock_exam_results
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to sheet_operations
ALTER TABLE public.sheet_operations
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to sheet_templates
ALTER TABLE public.sheet_templates
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to teacher_assignments (if table exists)
ALTER TABLE IF EXISTS public.teacher_assignments
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to subject_marks (if needed - links to results)
ALTER TABLE IF EXISTS public.subject_marks
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Create indexes for all organization_id columns for better query performance
CREATE INDEX IF NOT EXISTS idx_students_organization_id ON public.students(organization_id);
CREATE INDEX IF NOT EXISTS idx_teachers_organization_id ON public.teachers(organization_id);
CREATE INDEX IF NOT EXISTS idx_classes_organization_id ON public.classes(organization_id);
CREATE INDEX IF NOT EXISTS idx_departments_organization_id ON public.departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_subjects_organization_id ON public.subjects(organization_id);
CREATE INDEX IF NOT EXISTS idx_ca_types_organization_id ON public.ca_types(organization_id);
CREATE INDEX IF NOT EXISTS idx_results_organization_id ON public.results(organization_id);
CREATE INDEX IF NOT EXISTS idx_transfers_organization_id ON public.transfers(organization_id);
CREATE INDEX IF NOT EXISTS idx_grading_scales_organization_id ON public.grading_scales(organization_id);
CREATE INDEX IF NOT EXISTS idx_mock_exam_sessions_organization_id ON public.mock_exam_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_mock_exam_results_organization_id ON public.mock_exam_results(organization_id);
CREATE INDEX IF NOT EXISTS idx_sheet_operations_organization_id ON public.sheet_operations(organization_id);
CREATE INDEX IF NOT EXISTS idx_sheet_templates_organization_id ON public.sheet_templates(organization_id);

DO $$
BEGIN
  RAISE NOTICE 'Successfully added organization_id columns to all data tables';
  RAISE NOTICE 'All tables now support multi-tenant data isolation';
END $$;
