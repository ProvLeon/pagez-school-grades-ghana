-- Create school_settings table
CREATE TABLE IF NOT EXISTS public.school_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL DEFAULT 'My School',
    location VARCHAR(255),
    address_1 TEXT,
    phone VARCHAR(50),
    motto TEXT,
    headteacher_name VARCHAR(255),
    primary_color VARCHAR(7) DEFAULT '#e11d48',
    logo_url TEXT,
    headteacher_signature_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create academic_sessions table
CREATE TABLE IF NOT EXISTS public.academic_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_name VARCHAR(20) NOT NULL UNIQUE,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create academic_terms table
CREATE TABLE IF NOT EXISTS public.academic_terms (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
    term_name VARCHAR(50) NOT NULL,
    is_current BOOLEAN DEFAULT false,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, term_name)
);

-- Enable RLS
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_terms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$
BEGIN
    -- school_settings policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'school_settings' AND policyname = 'Allow read access to authenticated users') THEN
        CREATE POLICY "Allow read access to authenticated users" ON public.school_settings FOR SELECT TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'school_settings' AND policyname = 'Allow full access to authenticated users') THEN
        CREATE POLICY "Allow full access to authenticated users" ON public.school_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    -- academic_sessions policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'academic_sessions' AND policyname = 'Allow read access to authenticated users') THEN
        CREATE POLICY "Allow read access to authenticated users" ON public.academic_sessions FOR SELECT TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'academic_sessions' AND policyname = 'Allow full access to authenticated users') THEN
        CREATE POLICY "Allow full access to authenticated users" ON public.academic_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    -- academic_terms policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'academic_terms' AND policyname = 'Allow read access to authenticated users') THEN
        CREATE POLICY "Allow read access to authenticated users" ON public.academic_terms FOR SELECT TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'academic_terms' AND policyname = 'Allow full access to authenticated users') THEN
        CREATE POLICY "Allow full access to authenticated users" ON public.academic_terms FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Insert default school settings
INSERT INTO public.school_settings (school_name, primary_color)
VALUES ('My School', '#e11d48')
ON CONFLICT (id) DO NOTHING;

-- Insert default academic session (current year)
INSERT INTO public.academic_sessions (session_name, is_current)
VALUES ('2024/2025', true)
ON CONFLICT (session_name) DO NOTHING;

-- Get the session_id for the default session
DO $$
DECLARE
    default_session_id UUID;
BEGIN
    SELECT id INTO default_session_id FROM public.academic_sessions WHERE session_name = '2024/2025';

    -- Insert default terms for the session
    IF default_session_id IS NOT NULL THEN
        INSERT INTO public.academic_terms (session_id, term_name, is_current)
        VALUES
            (default_session_id, 'First Term', true),
            (default_session_id, 'Second Term', false),
            (default_session_id, 'Third Term', false)
        ON CONFLICT (session_id, term_name) DO NOTHING;
    END IF;
END $$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_school_settings_updated_at ON public.school_settings;
CREATE TRIGGER update_school_settings_updated_at
    BEFORE UPDATE ON public.school_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_academic_sessions_updated_at ON public.academic_sessions;
CREATE TRIGGER update_academic_sessions_updated_at
    BEFORE UPDATE ON public.academic_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_academic_terms_updated_at ON public.academic_terms;
CREATE TRIGGER update_academic_terms_updated_at
    BEFORE UPDATE ON public.academic_terms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
