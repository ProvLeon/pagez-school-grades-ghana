-- Add admin_id column to school_settings to support multi-tenant setup
-- This makes school_settings linked to specific admin users

-- Step 1: Add the admin_id column (allow NULL temporarily for existing records)
ALTER TABLE public.school_settings
ADD COLUMN admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Create an index on admin_id for faster queries
CREATE INDEX IF NOT EXISTS idx_school_settings_admin_id ON public.school_settings(admin_id);

-- Step 3: Update RLS policies to be multi-tenant aware
-- Drop existing policies
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON public.school_settings;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON public.school_settings;

-- Create new multi-tenant policies
-- Admins can only see their own school settings
CREATE POLICY "Users can read their own school settings" ON public.school_settings
FOR SELECT TO authenticated
USING (admin_id = auth.uid());

-- Admins can only update their own school settings
CREATE POLICY "Users can update their own school settings" ON public.school_settings
FOR UPDATE TO authenticated
USING (admin_id = auth.uid())
WITH CHECK (admin_id = auth.uid());

-- Admins can only insert their own school settings
CREATE POLICY "Users can create their own school settings" ON public.school_settings
FOR INSERT TO authenticated
WITH CHECK (admin_id = auth.uid());

-- Admins can only delete their own school settings
CREATE POLICY "Users can delete their own school settings" ON public.school_settings
FOR DELETE TO authenticated
USING (admin_id = auth.uid());

-- Step 4: Remove the default "My School" entry if it has no admin_id
-- (This will allow new signups to create their own schools)
DELETE FROM public.school_settings 
WHERE admin_id IS NULL AND school_name = 'My School';

-- Add comment to explain the admin_id column
COMMENT ON COLUMN public.school_settings.admin_id IS 'References the admin user who owns this school. Enables multi-tenant school settings.';
