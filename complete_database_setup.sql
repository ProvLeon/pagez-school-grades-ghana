-- ============================================
-- UNIFIED DATABASE SCHEMA FOR e-Results GH
-- ============================================
-- Complete database setup: All tables, RLS policies, triggers, and seed data
-- Generated: 2026-01-25
-- Version: 2.0.0 (Multi-tenant with Organizations)
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- SECTION 1: UTILITY FUNCTIONS
-- ============================================

-- Function to update 'updated_at' columns automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SECTION 2: CORE TABLES
-- ============================================

-- Organizations (Multi-tenant support)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_name VARCHAR(255),
  location VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Organization Profiles (links users to organizations with roles)
CREATE TABLE IF NOT EXISTS public.user_organization_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'teacher', 'staff', 'parent')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    user_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teachers
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  username VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  password_hash TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  academic_year VARCHAR(20) NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subjects
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20),
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id VARCHAR(50) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
  date_of_birth DATE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
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

-- CA Types (Continuous Assessment Types)
CREATE TABLE IF NOT EXISTS public.ca_types (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    configuration JSONB DEFAULT '{}'::jsonb,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Results
CREATE TABLE IF NOT EXISTS public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  term VARCHAR(20) NOT NULL CHECK (term IN ('first', 'second', 'third')),
  academic_year VARCHAR(20) NOT NULL,
  days_school_opened INTEGER,
  days_present INTEGER,
  days_absent INTEGER,
  term_begin DATE,
  term_ends DATE,
  next_term_begin DATE,
  teachers_comment TEXT,
  heads_remarks TEXT,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  admin_approved BOOLEAN DEFAULT FALSE,
  teacher_approved BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT false,
  attitude TEXT,
  conduct TEXT,
  interest TEXT,
  overall_position INTEGER,
  promoted_to_class VARCHAR(50),
  total_marks NUMERIC(10,2),
  total_score NUMERIC(10,2),
  ca_type_id UUID REFERENCES public.ca_types(id),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subject Marks
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

-- ============================================
-- SECTION 3: SETTINGS & CONFIGURATION TABLES
-- ============================================

-- School Settings
CREATE TABLE IF NOT EXISTS public.school_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    school_name VARCHAR(255) NOT NULL DEFAULT 'My School',
    location VARCHAR(255),
    address_1 TEXT,
    address_2 TEXT,
    phone VARCHAR(50),
    whatsapp_contact VARCHAR(50),
    site_description TEXT,
    motto TEXT,
    headteacher_name VARCHAR(255),
    primary_color VARCHAR(7) DEFAULT '#e11d48',
    logo_url TEXT,
    headteacher_signature_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Academic Sessions
CREATE TABLE IF NOT EXISTS public.academic_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_name VARCHAR(20) NOT NULL UNIQUE,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Academic Terms
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

-- Grading Settings
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

-- Grading Scales
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

-- Assessment Configurations
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

-- Comment Options
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

-- Subject Combinations
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

-- ============================================
-- SECTION 4: MOCK EXAMS TABLES
-- ============================================

-- Mock Exam Sessions
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

-- Mock Exam Results
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

-- Mock Exam Subject Marks
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

-- ============================================
-- SECTION 5: OPERATIONAL TABLES
-- ============================================

-- Notifications
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

-- Transfers
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

-- Teacher Assignments
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    academic_year VARCHAR(20),
    is_primary_teacher BOOLEAN DEFAULT false,
    is_class_teacher BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sheet Templates
CREATE TABLE IF NOT EXISTS public.sheet_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('student_registration', 'results_entry', 'attendance', 'teacher_assignment')),
  description TEXT,
  template_config JSONB DEFAULT '{}',
  file_path TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sheet Operations
CREATE TABLE IF NOT EXISTS public.sheet_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN ('student_upload', 'results_upload', 'template_download', 'report_export')),
  template_id UUID REFERENCES public.sheet_templates(id) ON DELETE SET NULL,
  file_name VARCHAR(255),
  file_path TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  error_log JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform Events (managed by superadmins externally)
CREATE TABLE IF NOT EXISTS public.platform_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  color VARCHAR(20) DEFAULT 'bg-blue-500',
  event_type VARCHAR(50) DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SECTION 6: INDEXES
-- ============================================

-- Organization Indexes
CREATE INDEX IF NOT EXISTS idx_organizations_admin_id ON public.organizations(admin_id);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON public.organizations(is_active);
CREATE INDEX IF NOT EXISTS idx_user_org_profiles_user_id ON public.user_organization_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_org_profiles_org_id ON public.user_organization_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_org_profiles_role ON public.user_organization_profiles(role);

-- Core Table Indexes
CREATE INDEX IF NOT EXISTS idx_students_organization_id ON public.students(organization_id);
CREATE INDEX IF NOT EXISTS idx_teachers_organization_id ON public.teachers(organization_id);
CREATE INDEX IF NOT EXISTS idx_classes_organization_id ON public.classes(organization_id);
CREATE INDEX IF NOT EXISTS idx_departments_organization_id ON public.departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_subjects_organization_id ON public.subjects(organization_id);
CREATE INDEX IF NOT EXISTS idx_ca_types_organization_id ON public.ca_types(organization_id);
CREATE INDEX IF NOT EXISTS idx_results_organization_id ON public.results(organization_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON public.classes(teacher_id);

-- Teacher Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_teachers_username ON public.teachers(username) WHERE username IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_teachers_user_id ON public.teachers(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_teachers_email ON public.teachers(email);
CREATE INDEX IF NOT EXISTS idx_teachers_is_active ON public.teachers(is_active);

-- School Settings Indexes
CREATE INDEX IF NOT EXISTS idx_school_settings_admin_id ON public.school_settings(admin_id);

-- Subject Combinations Indexes
CREATE INDEX IF NOT EXISTS idx_subject_combinations_department_id ON public.subject_combinations(department_id);
CREATE INDEX IF NOT EXISTS idx_subject_combinations_is_active ON public.subject_combinations(is_active);

-- Sheet Operations Indexes
CREATE INDEX IF NOT EXISTS idx_sheet_operations_created_at ON public.sheet_operations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sheet_operations_status ON public.sheet_operations(status);
CREATE INDEX IF NOT EXISTS idx_sheet_operations_created_by ON public.sheet_operations(created_by);
CREATE INDEX IF NOT EXISTS idx_sheet_templates_is_active ON public.sheet_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_sheet_templates_type ON public.sheet_templates(type);

-- Platform Events Indexes
CREATE INDEX IF NOT EXISTS idx_platform_events_date ON public.platform_events(event_date);
CREATE INDEX IF NOT EXISTS idx_platform_events_active ON public.platform_events(is_active);
CREATE INDEX IF NOT EXISTS idx_platform_events_type ON public.platform_events(event_type);

-- ============================================
-- SECTION 7: ENABLE RLS FOR ALL TABLES
-- ============================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_organization_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grading_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grading_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_combinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exam_subject_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sheet_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sheet_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECTION 8: RLS POLICIES - ORGANIZATION-BASED
-- ============================================

-- Organizations Policies
CREATE POLICY "Admins can view own organization" ON public.organizations
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Users can create own organization" ON public.organizations
  FOR INSERT WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Admins can update own organization" ON public.organizations
  FOR UPDATE USING (admin_id = auth.uid())
  WITH CHECK (admin_id = auth.uid());

-- User Organization Profiles Policies
CREATE POLICY "Users can view own org profiles" ON public.user_organization_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can insert org memberships" ON public.user_organization_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own org profile" ON public.user_organization_profiles
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own profile" ON public.profiles
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- School Settings Policies (Admin-specific)
CREATE POLICY "Users can read their own school settings" ON public.school_settings
  FOR SELECT TO authenticated USING (admin_id = auth.uid());

CREATE POLICY "Users can create their own school settings" ON public.school_settings
  FOR INSERT TO authenticated WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Users can update their own school settings" ON public.school_settings
  FOR UPDATE TO authenticated USING (admin_id = auth.uid())
  WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Users can delete their own school settings" ON public.school_settings
  FOR DELETE TO authenticated USING (admin_id = auth.uid());

-- Organization-Isolated Table Policies (Students, Classes, etc.)
-- Students
CREATE POLICY "Users can view organization students" ON public.students
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert students in own org" ON public.students
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update org students" ON public.students
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can delete org students" ON public.students
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Classes
CREATE POLICY "Users can view organization classes" ON public.classes
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert classes in own org" ON public.classes
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update org classes" ON public.classes
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Subjects
CREATE POLICY "Users can view organization subjects" ON public.subjects
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert subjects in own org" ON public.subjects
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update org subjects" ON public.subjects
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Teachers
CREATE POLICY "Users can view organization teachers" ON public.teachers
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert teachers in own org" ON public.teachers
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update org teachers" ON public.teachers
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Departments
CREATE POLICY "Users can view organization departments" ON public.departments
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert departments in own org" ON public.departments
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update org departments" ON public.departments
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Results
CREATE POLICY "Users can view organization results" ON public.results
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert results in own org" ON public.results
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update org results" ON public.results
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- CA Types
CREATE POLICY "Users can view organization ca_types" ON public.ca_types
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
    OR organization_id IS NULL
  );

CREATE POLICY "Users can insert ca_types in own org" ON public.ca_types
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- ============================================
-- SECTION 9: RLS POLICIES - SHARED TABLES
-- ============================================

-- Academic Sessions (shared across orgs for now)
CREATE POLICY "Allow read access to academic sessions" ON public.academic_sessions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow full access to academic sessions" ON public.academic_sessions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Academic Terms
CREATE POLICY "Allow read access to academic terms" ON public.academic_terms
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow full access to academic terms" ON public.academic_terms
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Subject Marks
CREATE POLICY "Allow full access to subject_marks" ON public.subject_marks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Grading Settings
CREATE POLICY "Allow full access to grading_settings" ON public.grading_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Grading Scales
CREATE POLICY "Allow full access to grading_scales" ON public.grading_scales
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Assessment Configurations
CREATE POLICY "Allow full access to assessment_configurations" ON public.assessment_configurations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Comment Options
CREATE POLICY "Allow full access to comment_options" ON public.comment_options
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Subject Combinations
CREATE POLICY "Allow read access to subject_combinations" ON public.subject_combinations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow full access to subject_combinations" ON public.subject_combinations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Mock Exam Tables
CREATE POLICY "Allow full access to mock_exam_sessions" ON public.mock_exam_sessions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to mock_exam_results" ON public.mock_exam_results
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to mock_exam_subject_marks" ON public.mock_exam_subject_marks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Notifications
CREATE POLICY "Allow full access to notifications" ON public.notifications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Transfers
CREATE POLICY "Allow full access to transfers" ON public.transfers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Teacher Assignments
CREATE POLICY "Allow full access to teacher_assignments" ON public.teacher_assignments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Sheet Templates (public templates)
CREATE POLICY "Anyone can view sheet templates" ON public.sheet_templates
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Authenticated users can create sheet templates" ON public.sheet_templates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update sheet templates" ON public.sheet_templates
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Sheet Operations
CREATE POLICY "Users can view their own sheet operations" ON public.sheet_operations
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create sheet operations" ON public.sheet_operations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own sheet operations" ON public.sheet_operations
  FOR UPDATE USING (auth.uid() = created_by);

-- Platform Events (read-only for users, managed by superadmins)
CREATE POLICY "Anyone can view active events" ON public.platform_events
  FOR SELECT USING (is_active = true);

-- ============================================
-- SECTION 10: STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('school-logos', 'school-logos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('student-photos', 'student-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DO $$
BEGIN
    -- Signatures bucket policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow public read access to signatures') THEN
        CREATE POLICY "Allow public read access to signatures" ON storage.objects FOR SELECT USING (bucket_id = 'signatures');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to upload signatures') THEN
        CREATE POLICY "Allow authenticated users to upload signatures" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'signatures');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to update signatures') THEN
        CREATE POLICY "Allow authenticated users to update signatures" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'signatures');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to delete signatures') THEN
        CREATE POLICY "Allow authenticated users to delete signatures" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'signatures');
    END IF;

    -- School logos bucket policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow public read access to school logos') THEN
        CREATE POLICY "Allow public read access to school logos" ON storage.objects FOR SELECT USING (bucket_id = 'school-logos');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to upload school logos') THEN
        CREATE POLICY "Allow authenticated users to upload school logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'school-logos');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to update school logos') THEN
        CREATE POLICY "Allow authenticated users to update school logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'school-logos');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to delete school logos') THEN
        CREATE POLICY "Allow authenticated users to delete school logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'school-logos');
    END IF;

    -- Student photos bucket policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow public read access to student photos') THEN
        CREATE POLICY "Allow public read access to student photos" ON storage.objects FOR SELECT USING (bucket_id = 'student-photos');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to upload student photos') THEN
        CREATE POLICY "Allow authenticated users to upload student photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'student-photos');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to update student photos') THEN
        CREATE POLICY "Allow authenticated users to update student photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'student-photos');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to delete student photos') THEN
        CREATE POLICY "Allow authenticated users to delete student photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'student-photos');
    END IF;
END $$;

-- ============================================
-- SECTION 11: TRIGGERS
-- ============================================

-- Organization triggers
DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_org_profiles_updated_at ON public.user_organization_profiles;
CREATE TRIGGER update_user_org_profiles_updated_at
    BEFORE UPDATE ON public.user_organization_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- School settings triggers
DROP TRIGGER IF EXISTS update_school_settings_updated_at ON public.school_settings;
CREATE TRIGGER update_school_settings_updated_at
    BEFORE UPDATE ON public.school_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_academic_sessions_updated_at ON public.academic_sessions;
CREATE TRIGGER update_academic_sessions_updated_at
    BEFORE UPDATE ON public.academic_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_academic_terms_updated_at ON public.academic_terms;
CREATE TRIGGER update_academic_terms_updated_at
    BEFORE UPDATE ON public.academic_terms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subject_combinations_updated_at ON public.subject_combinations;
CREATE TRIGGER update_subject_combinations_updated_at
    BEFORE UPDATE ON public.subject_combinations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teacher_assignments_updated_at ON public.teacher_assignments;
CREATE TRIGGER update_teacher_assignments_updated_at
    BEFORE UPDATE ON public.teacher_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_platform_events_updated_at ON public.platform_events;
CREATE TRIGGER update_platform_events_updated_at
    BEFORE UPDATE ON public.platform_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SECTION 12: HELPER FUNCTIONS
-- ============================================

-- Function to create teacher profile when teacher is linked to a user
CREATE OR REPLACE FUNCTION public.create_teacher_profile()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS NOT NULL THEN
        INSERT INTO public.profiles (user_id, user_type)
        VALUES (NEW.user_id, 'teacher')
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS create_teacher_profile_trigger ON public.teachers;
CREATE TRIGGER create_teacher_profile_trigger
    AFTER INSERT ON public.teachers
    FOR EACH ROW
    EXECUTE FUNCTION public.create_teacher_profile();

-- ============================================
-- SECTION 13: SEED DATA
-- ============================================

-- Insert default academic session
INSERT INTO public.academic_sessions (session_name, is_current)
VALUES ('2025/2026', true)
ON CONFLICT (session_name) DO NOTHING;

-- Insert default terms
DO $$
DECLARE
    default_session_id UUID;
BEGIN
    SELECT id INTO default_session_id FROM public.academic_sessions WHERE session_name = '2025/2026';

    IF default_session_id IS NOT NULL THEN
        INSERT INTO public.academic_terms (session_id, term_name, is_current)
        VALUES
            (default_session_id, 'First Term', true),
            (default_session_id, 'Second Term', false),
            (default_session_id, 'Third Term', false)
        ON CONFLICT (session_id, term_name) DO NOTHING;
    END IF;
END $$;

-- Insert sample platform events (relative to current date)
INSERT INTO public.platform_events (title, description, event_date, color, event_type, priority) VALUES
  ('Term Examinations Begin', 'End of term examinations for all classes', CURRENT_DATE + INTERVAL '14 days', 'bg-red-500', 'exam', 10),
  ('Parent-Teacher Meeting', 'Mid-term progress review with parents', CURRENT_DATE + INTERVAL '21 days', 'bg-blue-500', 'meeting', 5),
  ('Report Cards Distribution', 'Collection of term report cards', CURRENT_DATE + INTERVAL '35 days', 'bg-green-500', 'announcement', 8)
ON CONFLICT DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'e-Results GH Database Setup Complete!';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Version: 2.0.0 (Multi-tenant)';
  RAISE NOTICE 'Tables created: 25+';
  RAISE NOTICE 'RLS policies: Applied';
  RAISE NOTICE 'Storage buckets: 3';
  RAISE NOTICE '============================================';
END $$;
