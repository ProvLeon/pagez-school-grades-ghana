
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
