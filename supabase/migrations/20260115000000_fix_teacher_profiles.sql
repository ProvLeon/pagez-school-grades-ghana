-- Migration: Fix teacher profiles
-- This migration ensures all teachers have a corresponding profile with user_type = 'teacher'

-- Step 1: Add profiles for existing teachers who have user_id but no profile
INSERT INTO public.profiles (user_id, user_type)
SELECT t.user_id, 'teacher'
FROM public.teachers t
WHERE t.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = t.user_id
  )
ON CONFLICT (user_id) DO UPDATE SET user_type = 'teacher';

-- Step 2: Update any existing profiles for teachers that might have wrong user_type
UPDATE public.profiles p
SET user_type = 'teacher', updated_at = NOW()
FROM public.teachers t
WHERE p.user_id = t.user_id
  AND p.user_type != 'teacher'
  AND p.user_type NOT IN ('admin', 'super_admin');

-- Step 3: Create a function to automatically create profile when teacher is created with user_id
CREATE OR REPLACE FUNCTION public.create_teacher_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create profile if user_id is set and profile doesn't exist
    IF NEW.user_id IS NOT NULL THEN
        INSERT INTO public.profiles (user_id, user_type)
        VALUES (NEW.user_id, 'teacher')
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create trigger to auto-create profile when teacher is inserted
DROP TRIGGER IF EXISTS create_teacher_profile_trigger ON public.teachers;
CREATE TRIGGER create_teacher_profile_trigger
    AFTER INSERT ON public.teachers
    FOR EACH ROW
    EXECUTE FUNCTION public.create_teacher_profile();

-- Step 5: Create trigger to handle teacher user_id updates
CREATE OR REPLACE FUNCTION public.update_teacher_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- If user_id is being set (was null, now has value)
    IF OLD.user_id IS NULL AND NEW.user_id IS NOT NULL THEN
        INSERT INTO public.profiles (user_id, user_type)
        VALUES (NEW.user_id, 'teacher')
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_teacher_profile_trigger ON public.teachers;
CREATE TRIGGER update_teacher_profile_trigger
    AFTER UPDATE ON public.teachers
    FOR EACH ROW
    WHEN (OLD.user_id IS DISTINCT FROM NEW.user_id)
    EXECUTE FUNCTION public.update_teacher_profile();

-- Step 6: Add permissions column to profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'permissions'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN permissions TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Add helpful comment
COMMENT ON FUNCTION public.create_teacher_profile() IS 'Automatically creates a profile with user_type=teacher when a teacher record is created with a user_id';
COMMENT ON FUNCTION public.update_teacher_profile() IS 'Automatically creates a profile when a teacher record is updated to have a user_id';
