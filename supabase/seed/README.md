# Seed data demo (fiktif)

## Cara pakai

1. Buat 10 user auth di Supabase (sign-up dengan email di `seed.sql`, mis. `rizky@contoh.dev`).
2. Samakan `auth.users.id` dengan UUID di `INSERT INTO profiles` (atau update `profile_id` di seed sebelum jalan).
3. Jalankan skema dulu: `supabase/migrations/0001_core.sql` → `0002_rls.sql` → `0003_storage.sql` (via `supabase db push` atau SQL editor).
4. Jalankan `supabase/seed/seed.sql`. Aman diulang (idempoten).
5. Upload `public/seed/cover.svg` ke bucket `product-images` dengan path `seed/<slug>/cover.svg` untuk tiap produk (atau ganti `storage_path` sesuai file asli).

## Isi

- 10 developers (jelas fiktif, domain `@contoh.dev`)
- 24 produk (22 published + 2 draft), 8 kategori, 32 tags
- Semua demo URL `https://demo.devmarket.id/<slug>` (dummy valid-routing)
- Semua data punya deskripsi, stack, fitur, dan creator

Jangan memakai data ini sebagai data customer asli.
