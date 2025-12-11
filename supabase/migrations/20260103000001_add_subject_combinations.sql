-- Create subject_combinations table
CREATE TABLE IF NOT EXISTS public.subject_combinations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    subject_ids UUID[] NOT NULL DEFAULT '{}',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on department_id for faster queries
CREATE INDEX IF NOT EXISTS idx_subject_combinations_department_id
    ON public.subject_combinations(department_id);

-- Create index on is_active for faster filtering
CREATE INDEX IF NOT EXISTS idx_subject_combinations_is_active
    ON public.subject_combinations(is_active);

-- Enable RLS
ALTER TABLE public.subject_combinations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid duplicates)
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON public.subject_combinations;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON public.subject_combinations;

-- Create RLS policies
CREATE POLICY "Allow read access to authenticated users"
    ON public.subject_combinations FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow full access to authenticated users"
    ON public.subject_combinations FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_subject_combinations_updated_at ON public.subject_combinations;
CREATE TRIGGER update_subject_combinations_updated_at
    BEFORE UPDATE ON public.subject_combinations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some example subject combinations for each department
DO $$
DECLARE
    primary_dept_id UUID;
    jhs_dept_id UUID;
    shs_dept_id UUID;
    math_id UUID;
    eng_id UUID;
    sci_id UUID;
BEGIN
    -- Get department IDs
    SELECT id INTO primary_dept_id FROM public.departments WHERE name = 'PRIMARY';
    SELECT id INTO jhs_dept_id FROM public.departments WHERE name = 'JUNIOR HIGH';
    SELECT id INTO shs_dept_id FROM public.departments WHERE name = 'SENIOR HIGH';

    -- Get some subject IDs from PRIMARY department
    SELECT id INTO math_id FROM public.subjects WHERE code = 'MATH' AND department_id = primary_dept_id LIMIT 1;
    SELECT id INTO eng_id FROM public.subjects WHERE code = 'ENG' AND department_id = primary_dept_id LIMIT 1;
    SELECT id INTO sci_id FROM public.subjects WHERE code = 'SCI' AND department_id = primary_dept_id LIMIT 1;

    -- Insert example combinations for PRIMARY (if we have the subjects)
    IF primary_dept_id IS NOT NULL AND math_id IS NOT NULL THEN
        INSERT INTO public.subject_combinations (name, department_id, subject_ids, description, is_active)
        VALUES
            ('Core Subjects', primary_dept_id, ARRAY[math_id, eng_id, sci_id]::UUID[], 'Essential subjects for primary education', true)
        ON CONFLICT DO NOTHING;
    END IF;

    -- You can add more combinations for other departments here as needed
END $$;
