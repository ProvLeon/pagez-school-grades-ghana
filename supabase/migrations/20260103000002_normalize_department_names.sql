-- ============================================
-- MIGRATION: Normalize Department Names
-- ============================================
-- This migration updates department names to use consistent naming:
-- - JHS → JUNIOR HIGH
-- - SHS → SENIOR HIGH
-- - Primary/primary → PRIMARY
-- - KG/Kindergarten → KG
-- ============================================

-- Update JHS variations to JUNIOR HIGH
UPDATE public.departments
SET name = 'JUNIOR HIGH', updated_at = NOW()
WHERE LOWER(TRIM(name)) IN (
    'jhs',
    'j.h.s',
    'j.h.s.',
    'junior high school'
)
AND name != 'JUNIOR HIGH';

-- Update SHS variations to SENIOR HIGH
UPDATE public.departments
SET name = 'SENIOR HIGH', updated_at = NOW()
WHERE LOWER(TRIM(name)) IN (
    'shs',
    's.h.s',
    's.h.s.',
    'senior high school'
)
AND name != 'SENIOR HIGH';

-- Update Primary variations to PRIMARY
UPDATE public.departments
SET name = 'PRIMARY', updated_at = NOW()
WHERE LOWER(TRIM(name)) IN (
    'primary',
    'primary school',
    'pri',
    'p'
)
AND name != 'PRIMARY';

-- Update KG variations to KG
UPDATE public.departments
SET name = 'KG', updated_at = NOW()
WHERE LOWER(TRIM(name)) IN (
    'kg',
    'kindergarten',
    'kinder',
    'k.g',
    'k.g.'
)
AND name != 'KG';

-- Update grading_scales table
UPDATE public.grading_scales
SET department = 'JUNIOR HIGH', updated_at = NOW()
WHERE LOWER(TRIM(department)) IN ('jhs', 'j.h.s', 'j.h.s.', 'junior high school')
AND department != 'JUNIOR HIGH';

UPDATE public.grading_scales
SET department = 'SENIOR HIGH', updated_at = NOW()
WHERE LOWER(TRIM(department)) IN ('shs', 's.h.s', 's.h.s.', 'senior high school')
AND department != 'SENIOR HIGH';

UPDATE public.grading_scales
SET department = 'PRIMARY', updated_at = NOW()
WHERE LOWER(TRIM(department)) IN ('primary', 'primary school', 'pri')
AND department != 'PRIMARY';

-- Update assessment_configurations table
UPDATE public.assessment_configurations
SET department = 'JUNIOR HIGH', updated_at = NOW()
WHERE LOWER(TRIM(department)) IN ('jhs', 'j.h.s', 'j.h.s.', 'junior high school')
AND department != 'JUNIOR HIGH';

UPDATE public.assessment_configurations
SET department = 'SENIOR HIGH', updated_at = NOW()
WHERE LOWER(TRIM(department)) IN ('shs', 's.h.s', 's.h.s.', 'senior high school')
AND department != 'SENIOR HIGH';

UPDATE public.assessment_configurations
SET department = 'PRIMARY', updated_at = NOW()
WHERE LOWER(TRIM(department)) IN ('primary', 'primary school', 'pri')
AND department != 'PRIMARY';

-- Update class names that start with JHS/SHS
UPDATE public.classes
SET name = REPLACE(name, 'JHS ', 'JUNIOR HIGH '), updated_at = NOW()
WHERE name LIKE 'JHS %';

UPDATE public.classes
SET name = REPLACE(name, 'SHS ', 'SENIOR HIGH '), updated_at = NOW()
WHERE name LIKE 'SHS %';
