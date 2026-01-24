-- ============================================
-- MIGRATION: Create Multi-Tenant Organization System
-- ============================================
-- This migration implements proper multi-tenant data isolation
-- by creating organizations and linking all data to organizations

-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_name VARCHAR(255),
  location VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create user_organization_profiles table to link users to organizations with roles
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_organizations_admin_id ON public.organizations(admin_id);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON public.organizations(is_active);
CREATE INDEX IF NOT EXISTS idx_user_org_profiles_user_id ON public.user_organization_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_org_profiles_org_id ON public.user_organization_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_org_profiles_role ON public.user_organization_profiles(role);

-- Ensure students table has organization_id (should already exist from type definitions)
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Ensure teachers table has organization_id
ALTER TABLE public.teachers
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Ensure classes table has organization_id (should already exist)
ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Ensure departments table has organization_id (should already exist)
ALTER TABLE public.departments
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Ensure subjects table has organization_id
ALTER TABLE public.subjects
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Ensure ca_types table has organization_id if it exists
ALTER TABLE public.ca_types
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Ensure results table has organization_id (should already exist)
ALTER TABLE public.results
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Create indexes for organization_id lookups
CREATE INDEX IF NOT EXISTS idx_students_organization_id ON public.students(organization_id);
CREATE INDEX IF NOT EXISTS idx_teachers_organization_id ON public.teachers(organization_id);
CREATE INDEX IF NOT EXISTS idx_classes_organization_id ON public.classes(organization_id);
CREATE INDEX IF NOT EXISTS idx_departments_organization_id ON public.departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_subjects_organization_id ON public.subjects(organization_id);
CREATE INDEX IF NOT EXISTS idx_ca_types_organization_id ON public.ca_types(organization_id);
CREATE INDEX IF NOT EXISTS idx_results_organization_id ON public.results(organization_id);

-- Enable RLS for new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_organization_profiles ENABLE ROW LEVEL SECURITY;

-- Drop old insecure policies if they exist
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON public.students;
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON public.classes;
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON public.subjects;
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON public.teachers;
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON public.results;
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON public.departments;
DROP POLICY IF EXISTS "Allow update for all authenticated users" ON public.students;
DROP POLICY IF EXISTS "Allow update for all authenticated users" ON public.classes;
DROP POLICY IF EXISTS "Allow update for all authenticated users" ON public.subjects;
DROP POLICY IF EXISTS "Allow update for all authenticated users" ON public.teachers;
DROP POLICY IF EXISTS "Allow update for all authenticated users" ON public.results;
DROP POLICY IF EXISTS "Allow insert for all authenticated users" ON public.students;
DROP POLICY IF EXISTS "Allow insert for all authenticated users" ON public.classes;
DROP POLICY IF EXISTS "Allow insert for all authenticated users" ON public.subjects;
DROP POLICY IF EXISTS "Allow insert for all authenticated users" ON public.teachers;
DROP POLICY IF EXISTS "Allow insert for all authenticated users" ON public.results;
DROP POLICY IF EXISTS "Allow delete for all authenticated users" ON public.students;
DROP POLICY IF EXISTS "Allow delete for all authenticated users" ON public.classes;
DROP POLICY IF EXISTS "Allow delete for all authenticated users" ON public.subjects;
DROP POLICY IF EXISTS "Allow delete for all authenticated users" ON public.teachers;
DROP POLICY IF EXISTS "Allow delete for all authenticated users" ON public.results;

-- ============================================
-- NEW RLS POLICIES: Strict Organization Isolation
-- ============================================

-- Organizations: Admins can see only their own organization
CREATE POLICY "Admins can view own organization" ON public.organizations
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Admins can update own organization" ON public.organizations
  FOR UPDATE USING (admin_id = auth.uid())
  WITH CHECK (admin_id = auth.uid());

-- User Organization Profiles: Can see own profile
CREATE POLICY "Users can view own org profiles" ON public.user_organization_profiles
  FOR SELECT USING (user_id = auth.uid());

-- Admins can insert new organization memberships (used during signup/onboarding)
CREATE POLICY "Admins can insert org memberships" ON public.user_organization_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can update their own profile
CREATE POLICY "Users can update own org profile" ON public.user_organization_profiles
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Students: Users can only see students in their organization
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
  )
  WITH CHECK (
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

-- Classes: Users can only see classes in their organization
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
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Subjects: Users can only see subjects in their organization
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
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Teachers: Users can only see teachers in their organization
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
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Departments: Users can only see departments in their organization
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
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Results: Users can only see results in their organization
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
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- CA Types: Users can only see CA types in their organization
CREATE POLICY "Users can view organization ca_types" ON public.ca_types
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
    OR organization_id IS NULL -- Allow global CA types
  );

CREATE POLICY "Users can insert ca_types in own org" ON public.ca_types
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- ============================================
-- MIGRATION HELPER: Log migration execution
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Multi-tenant organization system created successfully';
  RAISE NOTICE 'Organizations table: CREATED';
  RAISE NOTICE 'User organization profiles table: CREATED';
  RAISE NOTICE 'Organization isolation RLS policies: CREATED';
  RAISE NOTICE 'Next steps: Update application queries to filter by organization_id';
END $$;
