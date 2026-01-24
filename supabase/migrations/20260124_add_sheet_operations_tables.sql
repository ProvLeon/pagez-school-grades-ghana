-- Create sheet_templates table
CREATE TABLE IF NOT EXISTS sheet_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('student_registration', 'results_entry', 'attendance', 'teacher_assignment')),
  description TEXT,
  template_config JSONB DEFAULT '{}',
  file_path TEXT,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sheet_operations table
CREATE TABLE IF NOT EXISTS sheet_operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN ('student_upload', 'results_upload', 'template_download', 'report_export')),
  template_id UUID REFERENCES sheet_templates(id) ON DELETE SET NULL,
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sheet_operations_created_at ON sheet_operations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sheet_operations_status ON sheet_operations(status);
CREATE INDEX IF NOT EXISTS idx_sheet_operations_created_by ON sheet_operations(created_by);
CREATE INDEX IF NOT EXISTS idx_sheet_templates_is_active ON sheet_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_sheet_templates_type ON sheet_templates(type);

-- Enable RLS for sheet_operations
ALTER TABLE sheet_operations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own sheet operations" ON sheet_operations;
DROP POLICY IF EXISTS "Admins can view sheet operations" ON sheet_operations;
DROP POLICY IF EXISTS "Users can create sheet operations" ON sheet_operations;
DROP POLICY IF EXISTS "Users can update their own sheet operations" ON sheet_operations;

-- Create RLS policies for sheet_operations
-- Allow users to see their own operations
CREATE POLICY "Users can view their own sheet operations" ON sheet_operations
  FOR SELECT USING (auth.uid() = created_by);

-- Allow admins to view all operations in their organization
CREATE POLICY "Admins can view sheet operations" ON sheet_operations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'authenticated'
    )
  );

-- Allow users to create sheet operations
CREATE POLICY "Users can create sheet operations" ON sheet_operations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own operations
CREATE POLICY "Users can update their own sheet operations" ON sheet_operations
  FOR UPDATE USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Enable RLS for sheet_templates
ALTER TABLE sheet_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view sheet templates" ON sheet_templates;
DROP POLICY IF EXISTS "Authenticated users can create sheet templates" ON sheet_templates;
DROP POLICY IF EXISTS "Users can update sheet templates" ON sheet_templates;

-- Create RLS policies for sheet_templates (templates are public/shared)
CREATE POLICY "Anyone can view sheet templates" ON sheet_templates
  FOR SELECT USING (is_active = TRUE);

-- Allow authenticated users to create templates
CREATE POLICY "Authenticated users can create sheet templates" ON sheet_templates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow template authors to update
CREATE POLICY "Users can update sheet templates" ON sheet_templates
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
