-- Run this in your Supabase SQL Editor

-- 1. Ensure the bucket is public (CRITICAL for public URLs to work)
UPDATE storage.buckets SET public = true WHERE id = 'product-images';

-- 2. Allow public read access
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

-- 3. Allow authenticated users (admins) to upload
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- 4. Allow admins to update/delete
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');