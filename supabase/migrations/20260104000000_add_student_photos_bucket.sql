-- Create storage bucket for student photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-photos', 'student-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for student-photos bucket
DO $$
BEGIN
    -- Allow public read access to student photos
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow public read access to student photos') THEN
        CREATE POLICY "Allow public read access to student photos"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'student-photos');
    END IF;

    -- Allow authenticated users to upload student photos
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to upload student photos') THEN
        CREATE POLICY "Allow authenticated users to upload student photos"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'student-photos');
    END IF;

    -- Allow authenticated users to update student photos
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to update student photos') THEN
        CREATE POLICY "Allow authenticated users to update student photos"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'student-photos');
    END IF;

    -- Allow authenticated users to delete student photos
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to delete student photos') THEN
        CREATE POLICY "Allow authenticated users to delete student photos"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'student-photos');
    END IF;
END $$;
