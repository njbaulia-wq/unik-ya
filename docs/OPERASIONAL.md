# Operasional DevMarket (lampiran PRD — bukan requirement baru)

> PRD tetap di `README.md` §1–90. Dokumen ini menjelaskan cara menjalankan,
> menguji, dan mendeploy hasil implementasi MVP (T01–T18).

## 1. Stack + versi exact (dikunci T01)

- next 16.3.4 · react 19.3.0 · typescript 5.9 · tailwindcss v4 · zod v4
- @supabase/supabase-js v2 · @supabase/ssr v0.7 · vitest 3 · @playwright/test (E2E)
- Node 22 (lihat `Dockerfile`). Install: `npm ci`.

## 2. Environment

Salin `.env.example` → `.env.local`, isi dari Supabase Dashboard → Project Settings → API:

```text
NEXT_PUBLIC_SITE_URL=https://domain-produksi.id
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role — server saja, jangan ke browser>
ADMIN_BOOTSTRAP_TOKEN=<token acak sekali pakai>
```

Tanpa env, halaman publik tetap render (empty/error state), dashboard/admin
mengarah ke `/login`. Ini disengaja agar build & E2E tanpa DB tetap hijau.

## 3. Database: migrasi (berurutan, jangan edit yang sudah merge)

Via Supabase SQL editor / `supabase db push`, urut:

1. `0001_core.sql` — 13 tabel + enum + CHECK (https/slug/skor)
2. `0002_rls.sql` — RLS + helper `is_admin()/own_developer_id()`
3. `0003_storage.sql` — bucket `product-images` (2 MB), `avatars` (1 MB)
4. `0004_profiles_insert.sql` — fixup insert profil saat signup
5. `0005_search_indexes.sql` — `search_vector` trigger + GIN + index filter/sort
6. `0006_status_checks.sql` — guard transisi status + slug immutable
7. `0007_audit.sql` — `audit_logs` immutable
8. `0008_analytics.sql` — index waktu + komentar retensi 12 bulan

## 4. Seed demo (fiktif, idempoten)

1. Buat 10 user auth (email `@contoh.dev` di `supabase/seed/seed.sql`).
2. Samakan `auth.users.id` ↔ UUID profiles di seed.
3. Jalankan `supabase/seed/seed.sql` (boleh diulang).
4. Upload `public/seed/cover.svg` ke bucket `product-images` per path `seed/<slug>/cover.svg`.

Isi: 10 developer · 24 produk (22 published + 2 draft) · 8 kategori · 32 tags.

## 5. Development & QA

```text
npm run dev          # lokal
npm run typecheck    # tsc --noEmit (wajib lolos)
npm run lint         # eslint src tests (tanpa console.* lepas)
npm run build        # Next build (wajib lolos)
npx vitest run       # unit (76 test)
npx playwright test  # E2E (6 test, butuh: npx playwright install chromium + deps)
```

Standar mengikat (`ARCHITECTURE.md` §3): error hanya `AppError` + envelope
generik; log hanya via `src/lib/logger.ts` JSON + `request-id`; validasi Zod
di tiap boundary; URL eksternal hanya `https://`; upload JPG/PNG/WebP ≤2 MB.

## 6. Testing matrix (PRD §76)

- Unit: mapper error, guards peran, seed counts, schema Zod, state machine,
  skor (bobot =100), KPI, rate-limit, compare.
- E2E (`e2e/`): visitor→search→product; anon→dashboard/admin→login;
  API contact-click 422 envelope; 404/error graceful tanpa stack trace.
- RLS allow/deny: diuji statis (`migrations-guard.test.ts`) + wajib diuji
  manual di Supabase SQL editor sebelum go-live (anon tak bisa edit; dev A
  tak bisa edit milik B; non-admin tak bisa admin).

## 7. Deployment

`Dockerfile` (Node 22, `npm ci` + `next build` + `next start`). Set env prod,
`NEXT_PUBLIC_SITE_URL` kanonisal untuk SEO/sitemap. Lighthouse target
90/90/90/95 per halaman (ukur pasca-deploy dengan data live).

## 8. Admin setup

1. User daftar biasa → 2. jalankan:
   `ADMIN_BOOTSTRAP_TOKEN=... SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... node scripts/bootstrap-admin.mjs <email>`
2. Login → `/admin`: overview, antrian review, kreator, kategori, laporan.
3. Semua aksi tercatat di `audit_logs`. SLA review: 2×24 jam.

## 9. Batasan v1 (NON-GOALS — jangan ditambah diam-diam)

Tanpa checkout/payment/escrow/order/wallet/refund/komisi/tombol Beli Sekarang;
tanpa one-click deploy/hosting; tanpa microservices; tanpa internal chat;
tanpa Elasticsearch; tanpa klaim Security Certified; tanpa revenue developer;
tanpa publish tanpa approval. CTA komersial satu-satunya: Hubungi Developer.
