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
