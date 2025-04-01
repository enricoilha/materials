-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('confirmations', 'confirmations', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to the bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'confirmations');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'confirmations' AND
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
);

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'confirmations' AND
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'confirmations' AND
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
); 