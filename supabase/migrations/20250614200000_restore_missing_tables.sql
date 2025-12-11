
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
    name VARCHAR(100) NOT NULL,
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
