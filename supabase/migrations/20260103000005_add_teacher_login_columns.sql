-- ============================================
-- MIGRATION: Add Teacher Login Columns
-- ============================================
-- This migration adds missing columns to the teachers table
-- to support teacher authentication and login functionality.
-- ============================================

-- Add username column
ALTER TABLE public.teachers
ADD COLUMN IF NOT EXISTS username VARCHAR(100);

-- Add is_active column with default true
ALTER TABLE public.teachers
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add password_hash column (for optional local password storage)
ALTER TABLE public.teachers
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add last_login column
ALTER TABLE public.teachers
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Add created_by column to track who created the teacher account
ALTER TABLE public.teachers
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add user_id column if it doesn't exist (links to auth.users)
ALTER TABLE public.teachers
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create unique index on username
CREATE UNIQUE INDEX IF NOT EXISTS idx_teachers_username
ON public.teachers(username)
WHERE username IS NOT NULL;

-- Create unique index on user_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_teachers_user_id
ON public.teachers(user_id)
WHERE user_id IS NOT NULL;

-- ============================================
-- Update existing teachers to be active by default
-- ============================================
UPDATE public.teachers
SET is_active = true
WHERE is_active IS NULL;

-- ============================================
-- VERIFICATION
-- ============================================
DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'teachers'
    AND column_name IN ('username', 'is_active', 'password_hash', 'last_login', 'created_by', 'user_id');

    RAISE NOTICE 'Teachers table now has % login-related columns', col_count;
END $$;
