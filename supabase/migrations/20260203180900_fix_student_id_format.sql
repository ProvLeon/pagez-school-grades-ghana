-- Migration: Fix Student IDs to use consistent 7-character format
-- Format: {2 letter school initials}{2 digit year}{3 random alphanumeric}
-- Example: KA26VWD

-- Create a function to generate a random alphanumeric string
CREATE OR REPLACE FUNCTION generate_random_string(length INTEGER)
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create a function to generate a new student ID in the correct format
CREATE OR REPLACE FUNCTION generate_new_student_id(org_id UUID)
RETURNS TEXT AS $$
DECLARE
    school_name TEXT;
    school_initials TEXT;
    year_suffix TEXT;
    random_part TEXT;
    new_id TEXT;
    attempts INTEGER := 0;
    max_attempts INTEGER := 100;
BEGIN
    -- Try to get school name from school_settings first (using organization_id)
    SELECT COALESCE(ss.school_name, 'School')
    INTO school_name
    FROM school_settings ss
    WHERE ss.organization_id = org_id
    LIMIT 1;
    
    -- Fallback to organizations table if no school_settings found
    IF school_name IS NULL OR school_name = '' OR school_name = 'School' THEN
        SELECT COALESCE(o.name, 'School')
        INTO school_name
        FROM organizations o
        WHERE o.id = org_id
        LIMIT 1;
    END IF;
    
    -- Default if still null
    IF school_name IS NULL OR school_name = '' THEN
        school_name := 'School';
    END IF;
    
    -- Generate initials from school name (first letter of first two words)
    school_initials := UPPER(
        COALESCE(
            LEFT(REGEXP_REPLACE(school_name, '[^A-Za-z ]', '', 'g'), 1) ||
            COALESCE(
                LEFT(
                    SPLIT_PART(REGEXP_REPLACE(school_name, '[^A-Za-z ]', '', 'g'), ' ', 2),
                    1
                ),
                LEFT(REGEXP_REPLACE(school_name, '[^A-Za-z ]', '', 'g'), 2)
            ),
            'SC'
        )
    );
    
    -- Ensure we have exactly 2 characters
    IF LENGTH(school_initials) < 2 THEN
        school_initials := school_initials || 'X';
    END IF;
    school_initials := LEFT(school_initials, 2);
    
    -- Get current year suffix (last 2 digits)
    year_suffix := RIGHT(EXTRACT(YEAR FROM CURRENT_DATE)::TEXT, 2);
    
    -- Generate unique ID with collision check
    LOOP
        random_part := generate_random_string(3);
        new_id := school_initials || year_suffix || random_part;
        
        -- Check if this ID already exists
        IF NOT EXISTS (SELECT 1 FROM students WHERE student_id = new_id) THEN
            RETURN new_id;
        END IF;
        
        attempts := attempts + 1;
        IF attempts >= max_attempts THEN
            -- Fallback: add more random characters
            RETURN school_initials || year_suffix || generate_random_string(5);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Main migration: Update students with long IDs (> 7 characters)
DO $$
DECLARE
    student_record RECORD;
    new_id TEXT;
    updated_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Starting student ID migration...';
    
    -- Find all students with IDs longer than 7 characters
    FOR student_record IN 
        SELECT id, student_id, organization_id 
        FROM students 
        WHERE LENGTH(student_id) > 7
        ORDER BY created_at
    LOOP
        -- Generate new ID
        new_id := generate_new_student_id(student_record.organization_id);
        
        -- Update the student
        UPDATE students 
        SET student_id = new_id,
            updated_at = NOW()
        WHERE id = student_record.id;
        
        updated_count := updated_count + 1;
        
        RAISE NOTICE 'Updated student % from % to %', 
            student_record.id, 
            student_record.student_id, 
            new_id;
    END LOOP;
    
    RAISE NOTICE 'Migration complete. Updated % students.', updated_count;
END $$;

-- Clean up: Drop the helper functions (optional - you can keep them for future use)
-- DROP FUNCTION IF EXISTS generate_random_string(INTEGER);
-- DROP FUNCTION IF EXISTS generate_new_student_id(UUID);

-- Verify the migration
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'SUCCESS: All student IDs are now 7 characters or less'
        ELSE 'WARNING: ' || COUNT(*) || ' students still have IDs longer than 7 characters'
    END as migration_status
FROM students 
WHERE LENGTH(student_id) > 7;
