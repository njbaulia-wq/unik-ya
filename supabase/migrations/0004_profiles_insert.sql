-- 0004_profiles_insert.sql — fixup: izinkan user membuat profilnya sendiri saat signup.
-- Tanpa policy ini, upsert profiles(id = auth.uid()) dari client ber-RLS selalu ditolak.
-- (File 0002_rls.sql tidak diubah karena sudah merge — fixup via migrasi baru.)

CREATE POLICY profiles_insert_own ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());
