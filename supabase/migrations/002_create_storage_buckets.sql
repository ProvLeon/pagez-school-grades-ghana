
-- Create storage bucket for signatures
INSERT INTO storage.buckets (id, name, public) VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for school logos if it doesn't exist
INSERT INTO storage.buckets (id, name, public) VALUES ('school-logos', 'school-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for signatures bucket
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow public read access to signatures') THEN
        CREATE POLICY "Allow public read access to signatures" 
        ON storage.objects FOR SELECT 
        USING (bucket_id = 'signatures');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to upload signatures') THEN
        CREATE POLICY "Allow authenticated users to upload signatures" 
        ON storage.objects FOR INSERT 
        TO authenticated
        WITH CHECK (bucket_id = 'signatures');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to update signatures') THEN
        CREATE POLICY "Allow authenticated users to update signatures" 
        ON storage.objects FOR UPDATE 
        TO authenticated
        USING (bucket_id = 'signatures');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to delete signatures') THEN
        CREATE POLICY "Allow authenticated users to delete signatures" 
        ON storage.objects FOR DELETE 
        TO authenticated
        USING (bucket_id = 'signatures');
    END IF;
END $$;

-- Create storage policies for school-logos bucket if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow public read access to school logos') THEN
        CREATE POLICY "Allow public read access to school logos" 
        ON storage.objects FOR SELECT 
        USING (bucket_id = 'school-logos');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to upload school logos') THEN
        CREATE POLICY "Allow authenticated users to upload school logos" 
        ON storage.objects FOR INSERT 
        TO authenticated
        WITH CHECK (bucket_id = 'school-logos');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to update school logos') THEN
        CREATE POLICY "Allow authenticated users to update school logos" 
        ON storage.objects FOR UPDATE 
        TO authenticated
        USING (bucket_id = 'school-logos');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to delete school logos') THEN
        CREATE POLICY "Allow authenticated users to delete school logos" 
        ON storage.objects FOR DELETE 
        TO authenticated
        USING (bucket_id = 'school-logos');
    END IF;
END $$;
