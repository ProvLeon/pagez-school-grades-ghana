-- ============================================
-- MIGRATION: Fix all global UNIQUE constraints for multi-tenant support
-- ============================================
-- Replace global UNIQUE constraints with composite (field, organization_id) constraints
-- This allows same values in different organizations

-- 1. DEPARTMENTS: Fix name uniqueness
ALTER TABLE public.departments
DROP CONSTRAINT IF EXISTS departments_name_key;

ALTER TABLE public.departments
ADD CONSTRAINT departments_name_organization_id_key UNIQUE (name, organization_id);

-- 2. SUBJECTS: Fix code uniqueness
ALTER TABLE public.subjects
DROP CONSTRAINT IF EXISTS subjects_code_key;

-- Code should be unique per organization
ALTER TABLE public.subjects
ADD CONSTRAINT subjects_code_organization_id_key UNIQUE (code, organization_id);

-- 3. TEACHERS: Fix email uniqueness
-- Email should be unique per organization (teachers in different schools can have same email)
ALTER TABLE public.teachers
DROP CONSTRAINT IF EXISTS teachers_email_key;

ALTER TABLE public.teachers
ADD CONSTRAINT teachers_email_organization_id_key UNIQUE (email, organization_id);

-- 4. STUDENTS: Fix student_id uniqueness
-- Student ID should be unique per organization (different schools can have same student IDs)
ALTER TABLE public.students
DROP CONSTRAINT IF EXISTS students_student_id_key;

ALTER TABLE public.students
ADD CONSTRAINT students_student_id_organization_id_key UNIQUE (student_id, organization_id);

DO $$
BEGIN
  RAISE NOTICE 'Successfully updated all UNIQUE constraints to support multi-tenant data isolation';
  RAISE NOTICE 'All unique constraints now scoped to organization_id';
END $$;
