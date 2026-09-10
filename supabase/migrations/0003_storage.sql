-- 0003_storage.sql — bucket media (PRD §48, §53; keputusan #7 media).
-- Screenshot: upload ke Storage (maks 5 file @2MB, jpg/png/webp — ditegakkan
-- app-side + file_size_limit). Video: embed URL saja, tanpa bucket video.
-- Binary image TIDAK PERNAH di PostgreSQL.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', TRUE, 2097152, ARRAY['image/jpeg','image/png','image/webp']),
  ('avatars', 'avatars', TRUE, 1048576, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Publik boleh baca kedua bucket.
CREATE POLICY "public read product-images" ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');
CREATE POLICY "public read avatars" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- User login boleh upload ke folder miliknya (product-images/<uid>/*, avatars/<uid>/*).
CREATE POLICY "auth upload product-images" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "auth upload avatars" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Update/delete: pemilik (path diawali uid) atau admin (service role bypass RLS).
CREATE POLICY "owner manage product-images" ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "owner delete product-images" ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "owner manage avatars" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "owner delete avatars" ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
