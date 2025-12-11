-- ============================================
-- MIGRATION: Consolidate Departments
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
-- VERIFICATION (will show in migration logs)
-- ============================================

DO $$
DECLARE
    dept_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO dept_count FROM public.departments;
    RAISE NOTICE 'Total departments after consolidation: %', dept_count;

    -- List all departments
    FOR dept_count IN
        SELECT name FROM public.departments ORDER BY
            CASE name
                WHEN 'KG' THEN 1
                WHEN 'PRIMARY' THEN 2
                WHEN 'JUNIOR HIGH' THEN 3
                WHEN 'SENIOR HIGH' THEN 4
                ELSE 5
            END
    LOOP
        RAISE NOTICE 'Department: %', dept_count;
    END LOOP;
END $$;
