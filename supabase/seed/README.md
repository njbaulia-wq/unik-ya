# Seed data demo (fiktif)

## Cara pakai

1. Jalankan skema dulu: `supabase/migrations/0001_core.sql` → `0002_rls.sql` → `0003_storage.sql` (via `supabase db push` atau SQL editor).
2. Jalankan `supabase/seed/seed.sql` SEKALI di SQL editor (service role / bypass RLS). File ini otomatis membuat dulu 10 user auth demo (`auth.users`, password `devmarket-demo-123`, email terkonfirmasi), baru profiles/developers/produk. Aman diulang (idempoten).
3. Upload `public/seed/cover.svg` ke bucket `product-images` dengan path `seed/<slug>/cover.svg` untuk tiap produk (atau ganti `storage_path` sesuai file asli).

## Isi

- 10 developers (jelas fiktif, domain `@contoh.dev`)
- 24 produk (22 published + 2 draft), 8 kategori, 32 tags
- Semua demo URL `https://demo.devmarket.id/<slug>` (dummy valid-routing)
- Semua data punya deskripsi, stack, fitur, dan creator

Jangan memakai data ini sebagai data customer asli.
