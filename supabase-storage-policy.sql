-- =====================================================
-- SUPABASE STORAGE POLICY
-- File Manager Pribadi Universal
-- =====================================================

-- 1. Buat bucket 'private-files' (jika belum ada)
-- Jalankan ini di Supabase Dashboard > Storage > Create New Bucket
-- Nama bucket: private-files
-- Public: FALSE (unchecked)

-- 2. Set policy untuk bucket 'private-files'
-- Jalankan query ini di SQL Editor Supabase

-- Hapus policy lama jika ada
DROP POLICY IF EXISTS "Allow anon key full access" ON storage.objects;

-- Policy baru: Allow authenticated requests (via anon key) untuk semua operasi
CREATE POLICY "Allow anon key full access"
ON storage.objects
FOR ALL
TO anon
USING (bucket_id = 'private-files')
WITH CHECK (bucket_id = 'private-files');

-- =====================================================
-- PENJELASAN:
-- =====================================================
-- Policy ini mengizinkan anon key Supabase untuk:
-- - SELECT: List & read files
-- - INSERT: Upload files
-- - UPDATE: Replace files
-- - DELETE: Delete files
-- 
-- Keamanan dijaga dengan:
-- 1. Anon key hanya ada di proxy server (tidak pernah ke OpenAI)
-- 2. User harus punya API key custom untuk akses proxy server
-- 3. Bucket bersifat private (tidak bisa diakses langsung tanpa auth)
-- =====================================================

-- Verifikasi policy berhasil dibuat
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow anon key full access';
