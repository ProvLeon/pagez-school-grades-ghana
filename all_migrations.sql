
-- Define the missing function to update 'updated_at' columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create departments table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create classes table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  academic_year VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, department_id)
);

-- Create subjects table
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teachers table
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
  date_of_birth DATE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  academic_year VARCHAR(20) NOT NULL,
  photo_url TEXT,
  guardian_name VARCHAR(255),
  guardian_phone VARCHAR(50),
  guardian_email VARCHAR(255),
  address TEXT,
  has_left BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create results table
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  term VARCHAR(20) NOT NULL CHECK (term IN ('first', 'second', 'third')),
  academic_year VARCHAR(20) NOT NULL,
  days_school_opened INTEGER,
  days_present INTEGER,
  days_absent INTEGER,
  term_begin DATE,
  term_ends DATE,
  next_term_begin DATE,
  teachers_comment TEXT,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  admin_approved BOOLEAN DEFAULT FALSE,
  teacher_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subject results table
CREATE TABLE subject_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  result_id UUID REFERENCES results(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  score DECIMAL(5,2),
  grade VARCHAR(5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default departments
INSERT INTO departments (name, description) VALUES
  ('PRIMARY', 'Primary education department'),
  ('JUNIOR HIGH', 'Junior high school department'),
  ('SENIOR HIGH', 'Senior high school department');

-- Insert default subjects for primary
INSERT INTO subjects (name, code, department_id)
SELECT 'Mathematics', 'MATH', id FROM departments WHERE name = 'PRIMARY'
UNION ALL
SELECT 'English Language', 'ENG', id FROM departments WHERE name = 'PRIMARY'
UNION ALL
SELECT 'Science', 'SCI', id FROM departments WHERE name = 'PRIMARY'
UNION ALL
SELECT 'Social Studies', 'SS', id FROM departments WHERE name = 'PRIMARY'
UNION ALL
SELECT 'Religious and Moral Education', 'RME', id FROM departments WHERE name = 'PRIMARY'
UNION ALL
SELECT 'Creative Arts', 'CA', id FROM departments WHERE name = 'PRIMARY';

-- Insert default classes
INSERT INTO classes (name, department_id, academic_year)
SELECT 'Basic 1', id, '2022/2023' FROM departments WHERE name = 'PRIMARY'
UNION ALL
SELECT 'Basic 2', id, '2022/2023' FROM departments WHERE name = 'PRIMARY'
UNION ALL
SELECT 'Basic 3', id, '2022/2023' FROM departments WHERE name = 'PRIMARY'
UNION ALL
SELECT 'Basic 4', id, '2022/2023' FROM departments WHERE name = 'PRIMARY'
UNION ALL
SELECT 'Basic 5', id, '2022/2023' FROM departments WHERE name = 'PRIMARY'
UNION ALL
SELECT 'Basic 6', id, '2022/2023' FROM departments WHERE name = 'PRIMARY';

-- Create RLS policies
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to all authenticated users" ON students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to all authenticated users" ON classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to all authenticated users" ON subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to all authenticated users" ON teachers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to all authenticated users" ON results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to all authenticated users" ON subject_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to all authenticated users" ON departments FOR SELECT TO authenticated USING (true);

-- Allow insert/update/delete access to all authenticated users
CREATE POLICY "Allow full access to authenticated users" ON students FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to authenticated users" ON classes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to authenticated users" ON subjects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to authenticated users" ON teachers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to authenticated users" ON results FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to authenticated users" ON subject_results FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to authenticated users" ON departments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create storage bucket for signatures
INSERT INTO storage.buckets (id, name, public) VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for school logos if it doesn't exist
INSERT INTO storage.buckets (id, name, public) VALUES ('school-logos', 'school-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for student photos
INSERT INTO storage.buckets (id, name, public) VALUES ('student-photos', 'student-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for signatures bucket
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow public read access to signatures') THEN
        CREATE POLICY "Allow public read access to signatures"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'signatures');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to upload signatures') THEN
        CREATE POLICY "Allow authenticated users to upload signatures"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'signatures');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to update signatures') THEN
        CREATE POLICY "Allow authenticated users to update signatures"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'signatures');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to delete signatures') THEN
        CREATE POLICY "Allow authenticated users to delete signatures"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'signatures');
    END IF;
END $$;

-- Create storage policies for school-logos bucket if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow public read access to school logos') THEN
        CREATE POLICY "Allow public read access to school logos"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'school-logos');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to upload school logos') THEN
        CREATE POLICY "Allow authenticated users to upload school logos"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'school-logos');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to update school logos') THEN
        CREATE POLICY "Allow authenticated users to update school logos"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'school-logos');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to delete school logos') THEN
        CREATE POLICY "Allow authenticated users to delete school logos"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'school-logos');
    END IF;
END $$;

-- Create storage policies for student-photos bucket
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow public read access to student photos') THEN
        CREATE POLICY "Allow public read access to student photos"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'student-photos');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to upload student photos') THEN
        CREATE POLICY "Allow authenticated users to upload student photos"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'student-photos');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to update student photos') THEN
        CREATE POLICY "Allow authenticated users to update student photos"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'student-photos');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to delete student photos') THEN
        CREATE POLICY "Allow authenticated users to delete student photos"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'student-photos');
    END IF;
END $$;

-- Seed an admin user for the seed script to use
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'seed_admin@pagez.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'seed_admin@pagez.com',
      crypt('Password123!', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  ELSE
    UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'seed_admin@pagez.com';
  END IF;
END $$;

-- Restore missing tables

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    user_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create or restore subject_marks table
DO $$
BEGIN
    -- If subject_results exists but subject_marks does not, rename it
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subject_results')
       AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subject_marks') THEN
        ALTER TABLE public.subject_results RENAME TO subject_marks;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.subject_marks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    result_id UUID REFERENCES public.results(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    ca1_score NUMERIC(5,2),
    ca2_score NUMERIC(5,2),
    ca3_score NUMERIC(5,2),
    ca4_score NUMERIC(5,2),
    exam_score NUMERIC(5,2),
    total_score NUMERIC(5,2),
    grade VARCHAR(5),
    position INTEGER,
    subject_teacher_remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure subject_marks has all required columns (handles case where table was renamed from subject_results)
ALTER TABLE public.subject_marks ADD COLUMN IF NOT EXISTS ca1_score NUMERIC(5,2);
ALTER TABLE public.subject_marks ADD COLUMN IF NOT EXISTS ca2_score NUMERIC(5,2);
ALTER TABLE public.subject_marks ADD COLUMN IF NOT EXISTS ca3_score NUMERIC(5,2);
ALTER TABLE public.subject_marks ADD COLUMN IF NOT EXISTS ca4_score NUMERIC(5,2);
ALTER TABLE public.subject_marks ADD COLUMN IF NOT EXISTS exam_score NUMERIC(5,2);
ALTER TABLE public.subject_marks ADD COLUMN IF NOT EXISTS total_score NUMERIC(5,2);
ALTER TABLE public.subject_marks ADD COLUMN IF NOT EXISTS position INTEGER;
ALTER TABLE public.subject_marks ADD COLUMN IF NOT EXISTS subject_teacher_remarks TEXT;

-- Migrate data from old 'score' column to 'total_score' if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'subject_marks' AND column_name = 'score'
    ) THEN
        UPDATE public.subject_marks
        SET total_score = score
        WHERE total_score IS NULL AND score IS NOT NULL;
    END IF;
END $$;

-- Create grading_settings table
CREATE TABLE IF NOT EXISTS public.grading_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    academic_year VARCHAR(20) NOT NULL,
    term VARCHAR(20) NOT NULL,
    attendance_for_term INTEGER,
    term_begin DATE,
    term_ends DATE,
    next_term_begin DATE,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(academic_year, term)
);

-- Create assessment_configurations table
CREATE TABLE IF NOT EXISTS public.assessment_configurations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    academic_year VARCHAR(20) NOT NULL,
    term VARCHAR(20) NOT NULL,
    ca_type_name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    configuration JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (academic_year, term) REFERENCES public.grading_settings(academic_year, term) ON DELETE CASCADE
);

-- Create grading_scales table
CREATE TABLE IF NOT EXISTS public.grading_scales (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    academic_year VARCHAR(20) NOT NULL,
    term VARCHAR(20) NOT NULL,
    department VARCHAR(100) NOT NULL,
    grade VARCHAR(5) NOT NULL,
    from_percentage NUMERIC(5,2) NOT NULL,
    to_percentage NUMERIC(5,2) NOT NULL,
    remark TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (academic_year, term) REFERENCES public.grading_settings(academic_year, term) ON DELETE CASCADE
);

-- Create ca_types table
CREATE TABLE IF NOT EXISTS public.ca_types (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    configuration JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comment_options table
CREATE TABLE IF NOT EXISTS public.comment_options (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    option_type VARCHAR(50) NOT NULL,
    option_value TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(option_type, option_value)
);

-- Add missing columns to results table
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS attitude TEXT;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS conduct TEXT;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS interest TEXT;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS heads_remarks TEXT;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS overall_position INTEGER;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS promoted_to_class VARCHAR(50);
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS total_marks NUMERIC(10,2);
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS total_score NUMERIC(10,2);
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS ca_type_id UUID REFERENCES public.ca_types(id);

-- Create mock_exam_sessions table
CREATE TABLE IF NOT EXISTS public.mock_exam_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    academic_year VARCHAR(20) NOT NULL,
    term VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    exam_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mock_exam_results table
CREATE TABLE IF NOT EXISTS public.mock_exam_results (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.mock_exam_sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    total_score NUMERIC(10,2),
    position INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, student_id)
);

-- Create mock_exam_subject_marks table
CREATE TABLE IF NOT EXISTS public.mock_exam_subject_marks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    mock_result_id UUID REFERENCES public.mock_exam_results(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    ca1_score NUMERIC(5,2),
    ca2_score NUMERIC(5,2),
    ca3_score NUMERIC(5,2),
    ca4_score NUMERIC(5,2),
    exam_score NUMERIC(5,2),
    total_score NUMERIC(5,2),
    grade VARCHAR(5),
    position INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mock_result_id, subject_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transfers table
CREATE TABLE IF NOT EXISTS public.transfers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    from_class_id UUID REFERENCES public.classes(id),
    to_class_id UUID REFERENCES public.classes(id),
    status VARCHAR(50) DEFAULT 'pending',
    reason TEXT,
    notes TEXT,
    academic_year VARCHAR(20),
    request_date DATE DEFAULT CURRENT_DATE,
    requested_by_teacher_id UUID REFERENCES public.teachers(id),
    approved_by_teacher_id UUID REFERENCES public.teachers(id),
    approved_date DATE,
    completed_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teacher_assignments table
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    academic_year VARCHAR(20),
    is_primary_teacher BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for these tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grading_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grading_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exam_subject_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;

-- Create basic policies (checked to avoid duplicates)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow full access to authenticated users') THEN
        CREATE POLICY "Allow full access to authenticated users" ON public.profiles FOR ALL TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subject_marks' AND policyname = 'Allow full access to authenticated users') THEN
        CREATE POLICY "Allow full access to authenticated users" ON public.subject_marks FOR ALL TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'grading_settings' AND policyname = 'Allow full access to authenticated users') THEN
        CREATE POLICY "Allow full access to authenticated users" ON public.grading_settings FOR ALL TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assessment_configurations' AND policyname = 'Allow full access to authenticated users') THEN
        CREATE POLICY "Allow full access to authenticated users" ON public.assessment_configurations FOR ALL TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'grading_scales' AND policyname = 'Allow full access to authenticated users') THEN
        CREATE POLICY "Allow full access to authenticated users" ON public.grading_scales FOR ALL TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ca_types' AND policyname = 'Allow full access to authenticated users') THEN
        CREATE POLICY "Allow full access to authenticated users" ON public.ca_types FOR ALL TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comment_options' AND policyname = 'Allow full access to authenticated users') THEN
        CREATE POLICY "Allow full access to authenticated users" ON public.comment_options FOR ALL TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mock_exam_sessions' AND policyname = 'Allow full access to authenticated users') THEN
        CREATE POLICY "Allow full access to authenticated users" ON public.mock_exam_sessions FOR ALL TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mock_exam_results' AND policyname = 'Allow full access to authenticated users') THEN
        CREATE POLICY "Allow full access to authenticated users" ON public.mock_exam_results FOR ALL TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mock_exam_subject_marks' AND policyname = 'Allow full access to authenticated users') THEN
        CREATE POLICY "Allow full access to authenticated users" ON public.mock_exam_subject_marks FOR ALL TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Allow full access to authenticated users') THEN
        CREATE POLICY "Allow full access to authenticated users" ON public.notifications FOR ALL TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transfers' AND policyname = 'Allow full access to authenticated users') THEN
        CREATE POLICY "Allow full access to authenticated users" ON public.transfers FOR ALL TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teacher_assignments' AND policyname = 'Allow full access to authenticated users') THEN
        CREATE POLICY "Allow full access to authenticated users" ON public.teacher_assignments FOR ALL TO authenticated USING (true);
    END IF;
END $$;
-- supabase/migrations/20251207000000_add_profile_for_seed_user.sql

INSERT INTO public.profiles (user_id, user_type)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (user_id) DO NOTHING;
-- Fix RLS policies to ensure authenticated users can Insert/Update/Delete
-- This drops existing policies and recreates them with 'WITH CHECK (true)'

DO $$
DECLARE
    tables text[] := ARRAY['departments', 'classes', 'subjects', 'teachers', 'students', 'results', 'subject_results', 'subject_marks', 'mock_exam_sessions', 'mock_exam_results', 'mock_exam_subject_marks', 'notifications', 'transfers', 'teacher_assignments', 'profiles', 'grading_settings', 'assessment_configurations', 'grading_scales', 'ca_types', 'comment_options'];
    t text;
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        -- Drop specific policy if exists
        EXECUTE format('DROP POLICY IF EXISTS "Allow full access to authenticated users" ON %I', t);

        -- Recreate it with permissive checks
        EXECUTE format('CREATE POLICY "Allow full access to authenticated users" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
    END LOOP;
END $$;

-- Fix read policies to allow anonymous access since auth is disabled
DO $$
DECLARE
    read_tables text[] := ARRAY['departments', 'classes', 'subjects', 'teachers', 'students', 'results', 'subject_results'];
    t text;
BEGIN
    FOREACH t IN ARRAY read_tables
    LOOP
        -- Drop the authenticated-only read policy
        EXECUTE format('DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON %I', t);

        -- Create new policy allowing all users (authenticated and anonymous)
        EXECUTE format('CREATE POLICY "Allow read access to all users" ON %I FOR SELECT USING (true)', t);
    END LOOP;
END $$;
-- Migration: Add user_id to teachers table and create teacher_assignments table
-- This migration links teachers to auth users and allows teachers to be assigned to classes

-- Add user_id column to teachers table
ALTER TABLE teachers
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create unique index on user_id to ensure one teacher per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id) WHERE user_id IS NOT NULL;

-- Create teacher_assignments table to link teachers to classes and subjects
CREATE TABLE IF NOT EXISTS teacher_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  academic_year VARCHAR(20) NOT NULL,
  is_class_teacher BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(teacher_id, class_id, subject_id, academic_year)
);

-- Enable RLS on teacher_assignments
ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to authenticated users"
ON teacher_assignments FOR SELECT
TO authenticated
USING (true);

-- Allow teachers to read their own assignments
CREATE POLICY "Teachers can read their assignments"
ON teacher_assignments FOR SELECT
TO authenticated
USING (
  teacher_id IN (
    SELECT id FROM teachers WHERE user_id = auth.uid()
  )
);

-- Allow admins to manage all assignments
CREATE POLICY "Allow full access to authenticated users"
ON teacher_assignments FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add update trigger for teacher_assignments
DROP TRIGGER IF EXISTS update_teacher_assignments_updated_at ON teacher_assignments;
CREATE TRIGGER update_teacher_assignments_updated_at
    BEFORE UPDATE ON teacher_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment to explain the user_id column
COMMENT ON COLUMN teachers.user_id IS 'Links teacher record to auth.users for authentication and authorization';
COMMENT ON TABLE teacher_assignments IS 'Assigns teachers to specific classes and subjects for an academic year';
-- Create school_settings table
CREATE TABLE IF NOT EXISTS public.school_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL DEFAULT 'My School',
    location VARCHAR(255),
    address_1 TEXT,
    phone VARCHAR(50),
    motto TEXT,
    headteacher_name VARCHAR(255),
    primary_color VARCHAR(7) DEFAULT '#e11d48',
    logo_url TEXT,
    headteacher_signature_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create academic_sessions table
CREATE TABLE IF NOT EXISTS public.academic_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_name VARCHAR(20) NOT NULL UNIQUE,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create academic_terms table
CREATE TABLE IF NOT EXISTS public.academic_terms (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
    term_name VARCHAR(50) NOT NULL,
    is_current BOOLEAN DEFAULT false,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, term_name)
);

-- Enable RLS
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_terms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$
BEGIN
    -- school_settings policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'school_settings' AND policyname = 'Allow read access to authenticated users') THEN
        CREATE POLICY "Allow read access to authenticated users" ON public.school_settings FOR SELECT TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'school_settings' AND policyname = 'Allow full access to authenticated users') THEN
        CREATE POLICY "Allow full access to authenticated users" ON public.school_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    -- academic_sessions policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'academic_sessions' AND policyname = 'Allow read access to authenticated users') THEN
        CREATE POLICY "Allow read access to authenticated users" ON public.academic_sessions FOR SELECT TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'academic_sessions' AND policyname = 'Allow full access to authenticated users') THEN
        CREATE POLICY "Allow full access to authenticated users" ON public.academic_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    -- academic_terms policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'academic_terms' AND policyname = 'Allow read access to authenticated users') THEN
        CREATE POLICY "Allow read access to authenticated users" ON public.academic_terms FOR SELECT TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'academic_terms' AND policyname = 'Allow full access to authenticated users') THEN
        CREATE POLICY "Allow full access to authenticated users" ON public.academic_terms FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Insert default school settings
INSERT INTO public.school_settings (school_name, primary_color)
VALUES ('My School', '#e11d48')
ON CONFLICT (id) DO NOTHING;

-- Insert default academic session (current year)
INSERT INTO public.academic_sessions (session_name, is_current)
VALUES ('2024/2025', true)
ON CONFLICT (session_name) DO NOTHING;

-- Get the session_id for the default session
DO $$
DECLARE
    default_session_id UUID;
BEGIN
    SELECT id INTO default_session_id FROM public.academic_sessions WHERE session_name = '2024/2025';

    -- Insert default terms for the session
    IF default_session_id IS NOT NULL THEN
        INSERT INTO public.academic_terms (session_id, term_name, is_current)
        VALUES
            (default_session_id, 'First Term', true),
            (default_session_id, 'Second Term', false),
            (default_session_id, 'Third Term', false)
        ON CONFLICT (session_id, term_name) DO NOTHING;
    END IF;
END $$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_school_settings_updated_at ON public.school_settings;
CREATE TRIGGER update_school_settings_updated_at
    BEFORE UPDATE ON public.school_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_academic_sessions_updated_at ON public.academic_sessions;
CREATE TRIGGER update_academic_sessions_updated_at
    BEFORE UPDATE ON public.academic_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_academic_terms_updated_at ON public.academic_terms;
CREATE TRIGGER update_academic_terms_updated_at
    BEFORE UPDATE ON public.academic_terms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
-- Create subject_combinations table
CREATE TABLE IF NOT EXISTS public.subject_combinations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    subject_ids UUID[] NOT NULL DEFAULT '{}',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on department_id for faster queries
CREATE INDEX IF NOT EXISTS idx_subject_combinations_department_id
    ON public.subject_combinations(department_id);

-- Create index on is_active for faster filtering
CREATE INDEX IF NOT EXISTS idx_subject_combinations_is_active
    ON public.subject_combinations(is_active);

-- Enable RLS
ALTER TABLE public.subject_combinations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid duplicates)
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON public.subject_combinations;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON public.subject_combinations;

-- Create RLS policies
CREATE POLICY "Allow read access to authenticated users"
    ON public.subject_combinations FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow full access to authenticated users"
    ON public.subject_combinations FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_subject_combinations_updated_at ON public.subject_combinations;
CREATE TRIGGER update_subject_combinations_updated_at
    BEFORE UPDATE ON public.subject_combinations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some example subject combinations for each department
DO $$
DECLARE
    primary_dept_id UUID;
    jhs_dept_id UUID;
    shs_dept_id UUID;
    math_id UUID;
    eng_id UUID;
    sci_id UUID;
BEGIN
    -- Get department IDs
    SELECT id INTO primary_dept_id FROM public.departments WHERE name = 'PRIMARY';
    SELECT id INTO jhs_dept_id FROM public.departments WHERE name = 'JUNIOR HIGH';
    SELECT id INTO shs_dept_id FROM public.departments WHERE name = 'SENIOR HIGH';

    -- Get some subject IDs from PRIMARY department
    SELECT id INTO math_id FROM public.subjects WHERE code = 'MATH' AND department_id = primary_dept_id LIMIT 1;
    SELECT id INTO eng_id FROM public.subjects WHERE code = 'ENG' AND department_id = primary_dept_id LIMIT 1;
    SELECT id INTO sci_id FROM public.subjects WHERE code = 'SCI' AND department_id = primary_dept_id LIMIT 1;

    -- Insert example combinations for PRIMARY (if we have the subjects)
    IF primary_dept_id IS NOT NULL AND math_id IS NOT NULL THEN
        INSERT INTO public.subject_combinations (name, department_id, subject_ids, description, is_active)
        VALUES
            ('Core Subjects', primary_dept_id, ARRAY[math_id, eng_id, sci_id]::UUID[], 'Essential subjects for primary education', true)
        ON CONFLICT DO NOTHING;
    END IF;

    -- You can add more combinations for other departments here as needed
END $$;
-- ============================================
-- FIX DEPARTMENT NAMES - Normalize to Standard Format
-- ============================================
-- This script updates department names to use consistent naming:
-- - JHS → JUNIOR HIGH
-- - SHS → SENIOR HIGH
-- - Primary/primary → PRIMARY
-- - KG/Kindergarten → KG
--
-- Run this in your Supabase SQL Editor
-- Project: hpvqxjgzfqfwkcxcbvtr
-- ============================================

-- ============================================
-- PART 1: UPDATE DEPARTMENT NAMES
-- ============================================

-- Update JHS variations to JUNIOR HIGH
UPDATE public.departments
SET name = 'JUNIOR HIGH', updated_at = NOW()
WHERE LOWER(TRIM(name)) IN (
    'jhs',
    'j.h.s',
    'j.h.s.',
    'junior high school'
)
AND name != 'JUNIOR HIGH';

-- Update SHS variations to SENIOR HIGH
UPDATE public.departments
SET name = 'SENIOR HIGH', updated_at = NOW()
WHERE LOWER(TRIM(name)) IN (
    'shs',
    's.h.s',
    's.h.s.',
    'senior high school'
)
AND name != 'SENIOR HIGH';

-- Update Primary variations to PRIMARY
UPDATE public.departments
SET name = 'PRIMARY', updated_at = NOW()
WHERE LOWER(TRIM(name)) IN (
    'primary',
    'primary school',
    'pri',
    'p'
)
AND name != 'PRIMARY';

-- Update KG variations to KG
UPDATE public.departments
SET name = 'KG', updated_at = NOW()
WHERE LOWER(TRIM(name)) IN (
    'kg',
    'kindergarten',
    'kinder',
    'k.g',
    'k.g.'
)
AND name != 'KG';

-- ============================================
-- PART 2: UPDATE RELATED TABLES
-- ============================================

-- Update grading_scales table if it has department column with old values
UPDATE public.grading_scales
SET department = 'JUNIOR HIGH', updated_at = NOW()
WHERE LOWER(TRIM(department)) IN ('jhs', 'j.h.s', 'j.h.s.', 'junior high school')
AND department != 'JUNIOR HIGH';

UPDATE public.grading_scales
SET department = 'SENIOR HIGH', updated_at = NOW()
WHERE LOWER(TRIM(department)) IN ('shs', 's.h.s', 's.h.s.', 'senior high school')
AND department != 'SENIOR HIGH';

UPDATE public.grading_scales
SET department = 'PRIMARY', updated_at = NOW()
WHERE LOWER(TRIM(department)) IN ('primary', 'primary school', 'pri')
AND department != 'PRIMARY';

-- Update assessment_configurations table if it has department column with old values
UPDATE public.assessment_configurations
SET department = 'JUNIOR HIGH', updated_at = NOW()
WHERE LOWER(TRIM(department)) IN ('jhs', 'j.h.s', 'j.h.s.', 'junior high school')
AND department != 'JUNIOR HIGH';

UPDATE public.assessment_configurations
SET department = 'SENIOR HIGH', updated_at = NOW()
WHERE LOWER(TRIM(department)) IN ('shs', 's.h.s', 's.h.s.', 'senior high school')
AND department != 'SENIOR HIGH';

UPDATE public.assessment_configurations
SET department = 'PRIMARY', updated_at = NOW()
WHERE LOWER(TRIM(department)) IN ('primary', 'primary school', 'pri')
AND department != 'PRIMARY';

-- ============================================
-- PART 3: UPDATE CLASS NAMES (if they contain JHS/SHS)
-- ============================================

-- Update class names that start with JHS to JUNIOR HIGH
UPDATE public.classes
SET name = REPLACE(name, 'JHS ', 'JUNIOR HIGH '), updated_at = NOW()
WHERE name LIKE 'JHS %';

-- Update class names that start with SHS to SENIOR HIGH
UPDATE public.classes
SET name = REPLACE(name, 'SHS ', 'SENIOR HIGH '), updated_at = NOW()
WHERE name LIKE 'SHS %';

-- ============================================
-- PART 4: VERIFICATION
-- ============================================

-- Show all departments after update
SELECT
    '✅ DEPARTMENT NAMES UPDATED' as status,
    'Below are the current department names' as message;

SELECT
    id,
    name as department_name,
    description,
    updated_at
FROM public.departments
ORDER BY name;

-- Count departments by name
SELECT
    name as department_name,
    COUNT(*) as count
FROM public.departments
GROUP BY name
ORDER BY name;

-- Check for any remaining non-standard department names
SELECT
    'Warning: Non-standard department names found' as status,
    name
FROM public.departments
WHERE name NOT IN ('KG', 'PRIMARY', 'JUNIOR HIGH', 'SENIOR HIGH')
UNION ALL
SELECT
    'All department names are standardized!' as status,
    '' as name
WHERE NOT EXISTS (
    SELECT 1 FROM public.departments
    WHERE name NOT IN ('KG', 'PRIMARY', 'JUNIOR HIGH', 'SENIOR HIGH')
);

-- Show classes with updated names
SELECT
    c.name as class_name,
    d.name as department_name
FROM public.classes c
LEFT JOIN public.departments d ON c.department_id = d.id
ORDER BY d.name, c.name;

-- ============================================
-- PART 5: ADD DEPARTMENT CONSTRAINTS (OPTIONAL)
-- ============================================
-- Uncomment and run these if you want to enforce
-- standard department names at the database level

/*
-- Add a check constraint to ensure only valid department names
ALTER TABLE public.departments
DROP CONSTRAINT IF EXISTS valid_department_names;

ALTER TABLE public.departments
ADD CONSTRAINT valid_department_names
CHECK (name IN ('KG', 'PRIMARY', 'JUNIOR HIGH', 'SENIOR HIGH'));

-- Add similar constraints to related tables
ALTER TABLE public.grading_scales
DROP CONSTRAINT IF EXISTS valid_grading_department;

ALTER TABLE public.grading_scales
ADD CONSTRAINT valid_grading_department
CHECK (department IN ('KG', 'PRIMARY', 'JUNIOR HIGH', 'SENIOR HIGH'));

ALTER TABLE public.assessment_configurations
DROP CONSTRAINT IF EXISTS valid_assessment_department;

ALTER TABLE public.assessment_configurations
ADD CONSTRAINT valid_assessment_department
CHECK (department IN ('KG', 'PRIMARY', 'JUNIOR HIGH', 'SENIOR HIGH'));
*/

-- ============================================
-- SUMMARY
-- ============================================
SELECT
    '🎯 MIGRATION COMPLETE' as status,
    'Department names have been standardized to:' as message
UNION ALL
SELECT '', '• KG (Kindergarten)'
UNION ALL
SELECT '', '• PRIMARY (Primary School)'
UNION ALL
SELECT '', '• JUNIOR HIGH (formerly JHS)'
UNION ALL
SELECT '', '• SENIOR HIGH (formerly SHS)';

-- ============================================
-- END OF NORMALIZE DEPARTMENT NAMES SCRIPT
-- ============================================

-- ============================================
-- MIGRATION: Consolidate Departments (20260103000003)
-- ============================================
-- This migration:
-- 1. Merges duplicate departments (JHS → JUNIOR HIGH, Primary → PRIMARY)
-- 2. Ensures all 4 standard departments exist (KG, PRIMARY, JUNIOR HIGH, SENIOR HIGH)
-- 3. Cleans up any orphaned references
-- ============================================

-- ============================================
-- STEP 1: Update references from duplicate departments to canonical ones
-- ============================================

-- First, find and update subjects from JHS-named departments to JUNIOR HIGH
UPDATE public.subjects
SET department_id = (
    SELECT id FROM public.departments
    WHERE UPPER(TRIM(name)) = 'JUNIOR HIGH'
    ORDER BY created_at ASC
    LIMIT 1
)
WHERE department_id IN (
    SELECT id FROM public.departments
    WHERE UPPER(TRIM(name)) IN ('JHS', 'J.H.S', 'J.H.S.')
);

-- Update subjects from Primary-named departments to PRIMARY
UPDATE public.subjects
SET department_id = (
    SELECT id FROM public.departments
    WHERE UPPER(TRIM(name)) = 'PRIMARY'
    ORDER BY created_at ASC
    LIMIT 1
)
WHERE department_id IN (
    SELECT id FROM public.departments
    WHERE UPPER(TRIM(name)) IN ('PRIMARY', 'Primary', 'primary')
    AND id != (
        SELECT id FROM public.departments
        WHERE UPPER(TRIM(name)) = 'PRIMARY'
        ORDER BY created_at ASC
        LIMIT 1
    )
);

-- ============================================
-- STEP 2: Update classes references
-- ============================================

UPDATE public.classes
SET department_id = (
    SELECT id FROM public.departments
    WHERE UPPER(TRIM(name)) = 'JUNIOR HIGH'
    ORDER BY created_at ASC
    LIMIT 1
)
WHERE department_id IN (
    SELECT id FROM public.departments
    WHERE UPPER(TRIM(name)) IN ('JHS', 'J.H.S', 'J.H.S.')
);

UPDATE public.classes
SET department_id = (
    SELECT id FROM public.departments
    WHERE UPPER(TRIM(name)) = 'PRIMARY'
    ORDER BY created_at ASC
    LIMIT 1
)
WHERE department_id IN (
    SELECT id FROM public.departments
    WHERE UPPER(TRIM(name)) IN ('PRIMARY', 'Primary', 'primary')
    AND id != (
        SELECT id FROM public.departments
        WHERE UPPER(TRIM(name)) = 'PRIMARY'
        ORDER BY created_at ASC
        LIMIT 1
    )
);

-- ============================================
-- STEP 3: Update teachers references
-- ============================================

UPDATE public.teachers
SET department_id = (
    SELECT id FROM public.departments
    WHERE UPPER(TRIM(name)) = 'JUNIOR HIGH'
    ORDER BY created_at ASC
    LIMIT 1
)
WHERE department_id IN (
    SELECT id FROM public.departments
    WHERE UPPER(TRIM(name)) IN ('JHS', 'J.H.S', 'J.H.S.')
);

UPDATE public.teachers
SET department_id = (
    SELECT id FROM public.departments
    WHERE UPPER(TRIM(name)) = 'PRIMARY'
    ORDER BY created_at ASC
    LIMIT 1
)
WHERE department_id IN (
    SELECT id FROM public.departments
    WHERE UPPER(TRIM(name)) IN ('PRIMARY', 'Primary', 'primary')
    AND id != (
        SELECT id FROM public.departments
        WHERE UPPER(TRIM(name)) = 'PRIMARY'
        ORDER BY created_at ASC
        LIMIT 1
    )
);

-- ============================================
-- STEP 4: Update students references
-- ============================================

UPDATE public.students
SET department_id = (
    SELECT id FROM public.departments
    WHERE UPPER(TRIM(name)) = 'JUNIOR HIGH'
    ORDER BY created_at ASC
    LIMIT 1
)
WHERE department_id IN (
    SELECT id FROM public.departments
    WHERE UPPER(TRIM(name)) IN ('JHS', 'J.H.S', 'J.H.S.')
);

UPDATE public.students
SET department_id = (
    SELECT id FROM public.departments
    WHERE UPPER(TRIM(name)) = 'PRIMARY'
    ORDER BY created_at ASC
    LIMIT 1
)
WHERE department_id IN (
    SELECT id FROM public.departments
    WHERE UPPER(TRIM(name)) IN ('PRIMARY', 'Primary', 'primary')
    AND id != (
        SELECT id FROM public.departments
        WHERE UPPER(TRIM(name)) = 'PRIMARY'
        ORDER BY created_at ASC
        LIMIT 1
    )
);

-- ============================================
-- STEP 5: Update subject_combinations references (if table exists)
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subject_combinations') THEN
        UPDATE public.subject_combinations
        SET department_id = (
            SELECT id FROM public.departments
            WHERE UPPER(TRIM(name)) = 'JUNIOR HIGH'
            ORDER BY created_at ASC
            LIMIT 1
        )
        WHERE department_id IN (
            SELECT id FROM public.departments
            WHERE UPPER(TRIM(name)) IN ('JHS', 'J.H.S', 'J.H.S.')
        );

        UPDATE public.subject_combinations
        SET department_id = (
            SELECT id FROM public.departments
            WHERE UPPER(TRIM(name)) = 'PRIMARY'
            ORDER BY created_at ASC
            LIMIT 1
        )
        WHERE department_id IN (
            SELECT id FROM public.departments
            WHERE UPPER(TRIM(name)) IN ('PRIMARY', 'Primary', 'primary')
            AND id != (
                SELECT id FROM public.departments
                WHERE UPPER(TRIM(name)) = 'PRIMARY'
                ORDER BY created_at ASC
                LIMIT 1
            )
        );
    END IF;
END $$;

-- ============================================
-- STEP 6: Delete duplicate departments
-- ============================================

-- Delete JHS duplicates (keep JUNIOR HIGH)
DELETE FROM public.departments
WHERE UPPER(TRIM(name)) IN ('JHS', 'J.H.S', 'J.H.S.');

-- Delete Primary duplicates (keep the first PRIMARY)
DELETE FROM public.departments
WHERE UPPER(TRIM(name)) IN ('PRIMARY', 'Primary', 'primary')
AND id != (
    SELECT id FROM public.departments
    WHERE UPPER(TRIM(name)) = 'PRIMARY'
    ORDER BY created_at ASC
    LIMIT 1
);

-- ============================================
-- STEP 7: Normalize remaining department names
-- ============================================

UPDATE public.departments
SET name = 'PRIMARY',
    description = COALESCE(description, 'Primary education department'),
    updated_at = NOW()
WHERE UPPER(TRIM(name)) = 'PRIMARY';

UPDATE public.departments
SET name = 'JUNIOR HIGH',
    description = COALESCE(description, 'Junior high school department'),
    updated_at = NOW()
WHERE UPPER(TRIM(name)) = 'JUNIOR HIGH';

UPDATE public.departments
SET name = 'SENIOR HIGH',
    description = COALESCE(description, 'Senior high school department'),
    updated_at = NOW()
WHERE UPPER(TRIM(name)) = 'SENIOR HIGH';

UPDATE public.departments
SET name = 'KG',
    description = COALESCE(description, 'Kindergarten department'),
    updated_at = NOW()
WHERE UPPER(TRIM(name)) IN ('KG', 'KINDERGARTEN');

-- ============================================
-- STEP 8: Ensure all 4 standard departments exist
-- ============================================

-- Insert KG if not exists
INSERT INTO public.departments (name, description, created_at, updated_at)
SELECT 'KG', 'Kindergarten department', NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.departments WHERE UPPER(TRIM(name)) = 'KG'
);

-- Insert PRIMARY if not exists
INSERT INTO public.departments (name, description, created_at, updated_at)
SELECT 'PRIMARY', 'Primary education department', NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.departments WHERE UPPER(TRIM(name)) = 'PRIMARY'
);

-- Insert JUNIOR HIGH if not exists
INSERT INTO public.departments (name, description, created_at, updated_at)
SELECT 'JUNIOR HIGH', 'Junior high school department', NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.departments WHERE UPPER(TRIM(name)) = 'JUNIOR HIGH'
);

-- Insert SENIOR HIGH if not exists
INSERT INTO public.departments (name, description, created_at, updated_at)
SELECT 'SENIOR HIGH', 'Senior high school department', NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.departments WHERE UPPER(TRIM(name)) = 'SENIOR HIGH'
);

-- ============================================
-- VERIFICATION
-- ============================================

SELECT
    '🎯 DEPARTMENT CONSOLIDATION COMPLETE' as status,
    'Final departments:' as message;

SELECT
    id,
    name,
    description,
    created_at,
    updated_at
FROM public.departments
ORDER BY
    CASE name
        WHEN 'KG' THEN 1
        WHEN 'PRIMARY' THEN 2
        WHEN 'JUNIOR HIGH' THEN 3
        WHEN 'SENIOR HIGH' THEN 4
        ELSE 5
    END;

-- ============================================
-- MIGRATION: Add Teacher Login Columns (20260103000005)
-- ============================================
-- This migration adds missing columns to the teachers table
-- to support teacher authentication and login functionality.
-- ============================================

-- Add username column
ALTER TABLE public.teachers
ADD COLUMN IF NOT EXISTS username VARCHAR(100);

-- Add is_active column with default true
ALTER TABLE public.teachers
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add password_hash column (for optional local password storage)
ALTER TABLE public.teachers
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add last_login column
ALTER TABLE public.teachers
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Add created_by column to track who created the teacher account
ALTER TABLE public.teachers
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Add user_id column if it doesn't exist (links to auth.users)
ALTER TABLE public.teachers
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Create unique index on username (only for non-null usernames)
CREATE UNIQUE INDEX IF NOT EXISTS idx_teachers_username
ON public.teachers(username)
WHERE username IS NOT NULL;

-- Create unique index on user_id (only for non-null user_ids)
CREATE UNIQUE INDEX IF NOT EXISTS idx_teachers_user_id
ON public.teachers(user_id)
WHERE user_id IS NOT NULL;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_teachers_email
ON public.teachers(email);

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_teachers_is_active
ON public.teachers(is_active);

-- Set is_active = true for all existing teachers
UPDATE public.teachers
SET is_active = true
WHERE is_active IS NULL;

-- ============================================
-- VERIFICATION
-- ============================================
DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'teachers'
    AND column_name IN ('username', 'is_active', 'password_hash', 'last_login', 'created_by', 'user_id');

    RAISE NOTICE 'Teachers table now has % login-related columns', col_count;
END $$;

-- ============================================
-- ADD UNIQUE CONSTRAINTS (for existing databases)
-- ============================================

-- Add unique constraint on classes (name, department_id) to prevent duplicates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'classes_name_department_id_key'
    ) THEN
        ALTER TABLE classes ADD CONSTRAINT classes_name_department_id_key UNIQUE (name, department_id);
        RAISE NOTICE 'Added unique constraint on classes (name, department_id)';
    END IF;
END $$;

-- Add unique constraint on ca_types.name to prevent duplicates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ca_types_name_key'
    ) THEN
        ALTER TABLE ca_types ADD CONSTRAINT ca_types_name_key UNIQUE (name);
        RAISE NOTICE 'Added unique constraint on ca_types (name)';
    END IF;
END $$;

-- Add unique constraint on comment_options (option_type, option_value) to prevent duplicates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'comment_options_type_value_key'
    ) THEN
        ALTER TABLE comment_options ADD CONSTRAINT comment_options_type_value_key UNIQUE (option_type, option_value);
        RAISE NOTICE 'Added unique constraint on comment_options (option_type, option_value)';
    END IF;
END $$;

-- Add unique constraint on subjects (name, department_id) to prevent duplicates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'subjects_name_department_id_key'
    ) THEN
        ALTER TABLE subjects ADD CONSTRAINT subjects_name_department_id_key UNIQUE (name, department_id);
        RAISE NOTICE 'Added unique constraint on subjects (name, department_id)';
    END IF;
END $$;

-- ============================================
-- END OF ALL MIGRATIONS
-- ============================================
-- Next steps:
-- 1. Verify the changes in the output above
-- 2. Hard refresh your browser (Cmd/Ctrl + Shift + R)
-- 3. Test the application to ensure department names display correctly
-- 4. You should now have exactly 4 departments: KG, PRIMARY, JUNIOR HIGH, SENIOR HIGH
-- 5. Teachers table now has login columns: username, is_active, password_hash, last_login, created_by, user_id
-- 6. Unique constraints added to prevent duplicate: classes, ca_types, comment_options, subjects
-- ============================================
