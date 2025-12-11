
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
