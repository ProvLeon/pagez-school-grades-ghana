-- ============================================
-- MIGRATION: Fix Subject Marks Columns
-- ============================================
-- This migration ensures the subject_marks table has all required columns.
-- It handles the case where the table was renamed from subject_results
-- (which had only 'score' and 'grade' columns) to subject_marks.
-- ============================================

-- Add missing CA score columns
ALTER TABLE public.subject_marks ADD COLUMN IF NOT EXISTS ca1_score NUMERIC(5,2);
ALTER TABLE public.subject_marks ADD COLUMN IF NOT EXISTS ca2_score NUMERIC(5,2);
ALTER TABLE public.subject_marks ADD COLUMN IF NOT EXISTS ca3_score NUMERIC(5,2);
ALTER TABLE public.subject_marks ADD COLUMN IF NOT EXISTS ca4_score NUMERIC(5,2);

-- Add exam and total score columns
ALTER TABLE public.subject_marks ADD COLUMN IF NOT EXISTS exam_score NUMERIC(5,2);
ALTER TABLE public.subject_marks ADD COLUMN IF NOT EXISTS total_score NUMERIC(5,2);

-- Add position and remarks columns
ALTER TABLE public.subject_marks ADD COLUMN IF NOT EXISTS position INTEGER;
ALTER TABLE public.subject_marks ADD COLUMN IF NOT EXISTS subject_teacher_remarks TEXT;

-- Migrate data from old 'score' column to 'total_score' if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'subject_marks' AND column_name = 'score'
    ) THEN
        -- Copy score values to total_score where total_score is null
        UPDATE public.subject_marks
        SET total_score = score
        WHERE total_score IS NULL AND score IS NOT NULL;

        RAISE NOTICE 'Migrated data from score column to total_score';
    END IF;
END $$;

-- ============================================
-- Also fix mock_exam_subject_marks if it exists
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mock_exam_subject_marks') THEN
        -- Add missing columns to mock_exam_subject_marks
        ALTER TABLE public.mock_exam_subject_marks ADD COLUMN IF NOT EXISTS ca1_score NUMERIC(5,2);
        ALTER TABLE public.mock_exam_subject_marks ADD COLUMN IF NOT EXISTS ca2_score NUMERIC(5,2);
        ALTER TABLE public.mock_exam_subject_marks ADD COLUMN IF NOT EXISTS ca3_score NUMERIC(5,2);
        ALTER TABLE public.mock_exam_subject_marks ADD COLUMN IF NOT EXISTS ca4_score NUMERIC(5,2);
        ALTER TABLE public.mock_exam_subject_marks ADD COLUMN IF NOT EXISTS exam_score NUMERIC(5,2);
        ALTER TABLE public.mock_exam_subject_marks ADD COLUMN IF NOT EXISTS total_score NUMERIC(5,2);
        ALTER TABLE public.mock_exam_subject_marks ADD COLUMN IF NOT EXISTS position INTEGER;
        ALTER TABLE public.mock_exam_subject_marks ADD COLUMN IF NOT EXISTS subject_teacher_remarks TEXT;

        RAISE NOTICE 'Updated mock_exam_subject_marks columns';
    END IF;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'subject_marks';

    RAISE NOTICE 'subject_marks table now has % columns', col_count;
END $$;
