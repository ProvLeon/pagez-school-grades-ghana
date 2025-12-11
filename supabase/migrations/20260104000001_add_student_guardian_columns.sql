-- Add guardian and address columns to students table
-- These columns are used in the student form but were missing from the original schema

ALTER TABLE students
ADD COLUMN IF NOT EXISTS guardian_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS guardian_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS guardian_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add comments for documentation
COMMENT ON COLUMN students.guardian_name IS 'Name of the student''s parent or guardian';
COMMENT ON COLUMN students.guardian_phone IS 'Phone number of the guardian';
COMMENT ON COLUMN students.guardian_email IS 'Email address of the guardian';
COMMENT ON COLUMN students.address IS 'Home address of the student';
