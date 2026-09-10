# DevMarket — Marketplace Produk Digital & Software Developer

![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-green)
![Tests](https://img.shields.io/badge/tests-78_unit_%2B_6_e2e-brightgreen)

Marketplace web yang mempertemukan **developer/creator pemilik produk digital**
dengan **pembeli** (bisnis, founder, developer) yang membutuhkan software siap pakai.

> **Model v1: Discovery + Contact Developer.** CTA komersial satu-satunya adalah
> **Hubungi Developer** — tanpa checkout, payment gateway, escrow, atau order
> system (sengaja, sesuai PRD).

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Arsitektur](#arsitektur)
- [Struktur Proyek](#struktur-proyek)
- [Memulai](#memulai)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Seed Data Demo](#seed-data-demo)
- [Testing](#testing)
- [Build & Deploy](#build--deploy)
- [Setup Admin](#setup-admin)
- [Rute & API](#rute--api)
- [Keamanan](#keamanan)
- [Analitik & KPI](#analitik--kpi)
- [Roadmap](#roadmap)
- [Dokumen Terkait](#dokumen-terkait)

---

## Fitur Utama

**Marketplace publik (tanpa login)**

- Homepage: hero + pencarian besar, produk unggulan/terbaru/terverifikasi, kategori, developer, cara kerja
- Katalog `/products`: full-text search PostgreSQL, filter (kategori, tipe, teknologi, verifikasi, ada demo), 4 mode urutan, pagination
- Detail produk `/products/[slug]`: screenshot, fitur, tech stack, harga (teks), **skor kualitas 0–100**, changelog, produk serupa, SEO + JSON-LD
- Profil developer `/developers/[slug]`, halaman kategori `/categories/[slug]` (slug lama → 301), `/how-it-works`
- Sitemap otomatis (hanya konten published) + `robots.txt`, metadata dinamis + canonical

**Developer (login)**

- Dashboard: overview, produk saya, profil, kontak per-channel (WA/email/website/GitHub/Telegram/LinkedIn — hanya yang diaktifkan yang publik), favorit, pengaturan
- Wizard 5 langkah: Dasar → Detail → Media → Harga → Review; simpan draft longgar, validasi penuh saat submit
- Upload screenshot (maks 5 × 2 MB, JPG/PNG/WebP); video hanya embed YouTube
- Alur status: `draft → submitted → under_review → approved → published` (+ `rejected/suspended/archived`); developer **tidak bisa publish langsung**

**Admin/kurator**

- Overview, antrian review, moderasi produk published (suspend/archive/feature), verifikasi + suspend kreator, kelola kategori (nama saja — slug immutable), laporan KPI
- **Semua aksi tercatat** di `audit_logs` (immutable)

**Trust**

- Badge `VERIFIED / LIVE DEMO / NEW / UPDATED / POPULAR` dari skor deterministik + review manual; label tegas **Platform Verified** vs **Developer Claimed** (tanpa klaim audit keamanan)

---

## Tech Stack

| Lapisan    | Teknologi (versi dikunci)                              |
| ---------- | ------------------------------------------------------ |
| Framework  | Next.js `16.3.4` (App Router), React `19.3.0`          |
| Bahasa     | TypeScript `5.9` (strict)                              |
| UI         | Tailwind CSS `4.1`, komponen gaya shadcn/ui            |
| Backend    | Supabase: Postgres + Auth + Storage (`supabase-js` v2, `@supabase/ssr` v0.7) |
| Validasi   | Zod v4 (tiap boundary)                                 |
| Test       | Vitest 3 (unit), Playwright 1.63 (E2E)                 |
| Runtime    | Node.js 22 (lihat `Dockerfile`)                        |

---

## Arsitektur

**Modular monolith** — tanpa microservices. Alur dependensi satu arah:

```text
L1 Routes (app/*: pages, actions, route handlers)
  → L2 Services (features/<modul>/service.ts — logika bisnis murni)
    → L3 Data Access (features/<modul>/repository.ts — satu-satunya bicara DB)
      → PostgreSQL (Supabase, selalu via RLS)
L4 Shared kernel (src/lib): error, logger, validasi env, auth, ratelimit, urls, files
```

Standar wajib (detail: [`ARCHITECTURE.md`](ARCHITECTURE.md)):

- **Error handling terpusat** — hanya `AppError` (`src/lib/error.ts`) + envelope `{ ok, error: { code, message } }`; pesan aman berbahasa Indonesia; tanpa stack/SQL/secret bocor ke client
- **Logging JSON terstruktur** — via `src/lib/logger.ts` (`timestamp, level, module, request-id, …`); `request-id` dipropagasi per request
- **Validasi Zod di tiap boundary**; URL eksternal hanya `https://`; upload dibatasi MIME + ukuran + sanitasi nama file

---

## Struktur Proyek

```text
src/
  app/                 # App Router: /(publik), products/, developers/, categories/,
                       # dashboard/, admin/, login/, register/, auth/, api/, sitemap, robots
  components/          # Header, States, ui/primitives (design system)
  features/            # Modul vertikal: auth, products, developers, categories,
                       # search, favorites, analytics, admin, verification, compare
    <modul>/           # schema.ts (Zod) · service.ts · repository.ts · actions.ts
  lib/                 # error, logger, http, action, env, db, auth, ratelimit, urls, files, copy
  types/               # tipe global + Database
  middleware.ts        # request-id + refresh session + guard dashboard/admin
supabase/
  migrations/          # 0001–0009 (skema, RLS, storage, FTS, state guard, audit, suspend)
  seed/                # seed.sql (fiktif, idempoten) + README
scripts/               # bootstrap-admin.mjs
tests/unit/            # 17 file, 78 test
e2e/                   # visitor.spec.ts, guards.spec.ts (Playwright)
docs/                  # PRD.md · OPERASIONAL.md
```

---

## Memulai

**Prasyarat:** Node.js 22+, npm, akun + project [Supabase](https://supabase.com) (gratis cukup untuk dev).

```bash
git clone <repo-ini> devmarket
cd devmarket
npm ci
cp .env.example .env.local   # lalu isi (lihat tabel di bawah)
npm run dev                  # http://localhost:3000
```

Perintah harian:

| Perintah          | Fungsi                              |
| ----------------- | ----------------------------------- |
| `npm run dev`     | development server                  |
| `npm run build`   | production build (wajib lolos)      |
| `npm run start`   | jalankan hasil build                |
| `npm run typecheck` | `tsc --noEmit` (wajib lolos)      |
| `npm run lint`    | ESLint `src` + `tests`              |
| `npm test`        | unit (Vitest)                       |
| `npm run test:e2e`| E2E (butuh `npx playwright install chromium` sekali) |

> Tanpa env Supabase pun aplikasi tetap build & jalan: halaman publik memakai
> empty/error state, `/dashboard` & `/admin` mengarah ke `/login`. Ini disengaja
> agar CI tanpa DB tetap hijau.

---

## Environment Variables

Salin `.env.example` → `.env.local`. Sumber nilai: Supabase Dashboard → **Project Settings → API**.

| Variable                        | Wajib | Klien/Server | Keterangan                                    |
| ------------------------------- | ----- | ------------ | --------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`          | Ya    | Klien        | URL kanonisal (SEO/sitemap), mis. `https://devmarket.id` |
| `NEXT_PUBLIC_SUPABASE_URL`      | Ya    | Klien        | Project URL `https://xyzcompany.supabase.co`  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Ya    | Klien        | anon key (aman untuk browser, dibatasi RLS)   |
| `SUPABASE_SERVICE_ROLE_KEY`     | Ya*   | **Server saja** | *Hanya di server* (bootstrap admin). Jangan pernah ke browser |
| `ADMIN_BOOTSTRAP_TOKEN`         | Ya*   | Server saja  | Token acak sekali pakai untuk promosi admin pertama |

Jangan commit `.env.local` (sudah di `.gitignore`).

---

## Database

Jalankan berurutan via Supabase SQL editor atau `supabase db push`. **Jangan edit migrasi yang sudah merge** — perbaiki lewat migrasi baru.

| #    | File                        | Isi                                                        |
| ---- | --------------------------- | ---------------------------------------------------------- |
| 0001 | `0001_core.sql`             | 13 tabel + enum + CHECK (`https://`, slug, skor 0–100)     |
| 0002 | `0002_rls.sql`              | RLS + helper `is_admin()` / `own_developer_id()`           |
| 0003 | `0003_storage.sql`          | Bucket `product-images` (2 MB) & `avatars` (1 MB)          |
| 0004 | `0004_profiles_insert.sql`  | Fixup: user boleh insert profilnya saat signup             |
| 0005 | `0005_search_indexes.sql`   | Kolom `search_vector` + trigger + index GIN/filter/sort    |
| 0006 | `0006_status_checks.sql`    | Guard transisi status + slug immutable + `published_at`    |
| 0007 | `0007_audit.sql`            | `audit_logs` immutable (tanpa policy update/delete)        |
| 0008 | `0008_analytics.sql`        | Index waktu KPI + retensi mentah 12 bulan                  |
| 0009 | `0009_developer_suspend.sql`| Flag `suspended` + publik sembunyikan kreator bermasalah   |

**Kebijakan RLS (ringkas):** publik baca produk *published* dari developer aktif; developer kelola miliknya; user kelola favoritnya; tulis analitik publik; baca analitik/audit hanya admin. Tidak ada tabel payment/order — v1 memang tanpa transaksi.

---

## Seed Data Demo

Data **jelas fiktif** (domain `@contoh.dev`, demo `https://demo.devmarket.id/<slug>`), idempoten (aman dijalankan ulang):

- 10 developer · 24 produk (22 published + 2 draft) · 8 kategori · 32 tags

```bash
# 1. Buat 10 user auth (email di supabase/seed/seed.sql), samakan auth.users.id ↔ UUID profiles
# 2. Jalankan supabase/seed/seed.sql setelah migrasi 0001–0009
# 3. Upload public/seed/cover.svg ke bucket product-images per path seed/<slug>/cover.svg
```

Detail: [`supabase/seed/README.md`](supabase/seed/README.md).

---

## Testing

- **Unit (78, Vitest):** mapper error, guard peran, seed counts, skema Zod, state machine, bobot skor (=100), KPI, rate-limit, kontrak compare — `npm test`
- **E2E (6, Playwright):** visitor→search→produk; anon→dashboard/admin→login; envelope error API 422; degradasi graceful tanpa DB — `npm run test:e2e`
- **Matriks RLS allow/deny** (anon tak bisa edit; dev A tak bisa edit milik B; non-admin tak bisa admin): guard statis di `migrations-guard.test.ts` + wajib uji manual di SQL editor sebelum go-live

---

## Build & Deploy

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

- `Dockerfile` (Node 22, `npm ci` → build → start) siap untuk VPS/registry mana pun
- Set env production + `NEXT_PUBLIC_SITE_URL` kanonisal
- Target Lighthouse: Performance/Accessibility/Best Practices ≥ 90, SEO ≥ 95 (ukur pasca-deploy dengan data live)

### Deploy ke Vercel (disarankan untuk MVP)

Prasyarat: project Supabase sudah ada + migrasi `0001–0009` + seed sudah
dijalankan (lihat [Database](#database)), dan 5 env var sudah siap
(lihat [Environment Variables](#environment-variables)).

1. Push repo ini ke GitHub, lalu di [vercel.com](https://vercel.com) → **Add New → Project → Import** repo tersebut. Framework Preset otomatis terdeteksi **Next.js** — biarkan Build Command (`next build`) dan Output Directory (default) apa adanya.
2. Di **Environment Variables**, tambahkan kelima variable (Production + Preview):
   `NEXT_PUBLIC_SITE_URL` (isi URL produksi, mis. `https://devmarket.vercel.app` — update lagi setelah domain final),
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_BOOTSTRAP_TOKEN`.
3. Klik **Deploy**. Tunggu hingga ✅ (typecheck + lint + build sudah lolos di CI lokal; Vercel menjalankan `next build` yang sama).
4. Pasca-deploy, verifikasi berurutan:
   - Buka `/` (harus 200 + hero tampil), `/products`, satu `/products/[slug]`, `/sitemap.xml`
   - Buka `/dashboard` tanpa login → harus dialihkan ke `/login`
   - Promosikan admin pertama dari laptop webhook lokal (jangan di console browser):
     ```bash
     ADMIN_BOOTSTRAP_TOKEN=... SUPABASE_SERVICE_ROLE_KEY=... \
     NEXT_PUBLIC_SUPABASE_URL=... node scripts/bootstrap-admin.mjs nama@email.com
     ```
   - Login → `/admin` → setujui satu produk → cek tampil di homepage
5. (Opsional) Pasang domain sendiri di **Settings → Domains**, lalu update `NEXT_PUBLIC_SITE_URL` ke domain final dan **Redeploy**.

> Catatan jujur: rate-limit klik (`src/lib/ratelimit.ts`) in-memory per instance —
> di Vercel multi-instance, batas 10x/10 mnt berlaku per instance. Cukup untuk
> v1; naik ke Redis saat traffic butuh (tanpa ubah API).

---

## Setup Admin

```bash
# 1. User daftar biasa lewat /register, lalu promosikan:
ADMIN_BOOTSTRAP_TOKEN=... SUPABASE_SERVICE_ROLE_KEY=... \
NEXT_PUBLIC_SUPABASE_URL=... node scripts/bootstrap-admin.mjs nama@email.com

# 2. Login → /admin (overview · antrian review · kreator · kategori · laporan)
```

SLA review: 2×24 jam. Semua aksi moderasi tercatat di `audit_logs` dengan alasan wajib untuk reject/suspend.

---

## Rute & API

| Rute | Akses |
| ---- | ----- |
| `/`, `/products`, `/products/[slug]`, `/categories/[slug]`, `/developers`, `/developers/[slug]`, `/how-it-works` | Publik |
| `/login`, `/register`, `/auth/callback`, `/login/google` | Publik (email/password + Google OAuth) |
| `/dashboard`, `/dashboard/products/**`, `/dashboard/profile`, `/dashboard/contacts`, `/dashboard/favorites`, `/dashboard/settings` | Login |
| `/admin`, `/admin/pending`, `/admin/creators`, `/admin/categories`, `/admin/reports` | Admin |
| `/sitemap.xml`, `/robots.txt` | Publik (sitemap: hanya konten published) |

**API** — `POST /api/contact-click` `{ productSlug, channel }` → `{ ok, data: { tracked } }`. Tanpa login, rate-limit 10x/10 mnt per IP+produk, origin check CSRF. Gagal tulis tidak memblokir navigasi user. Error selalu envelope `{ ok: false, error: { code, message } }` dengan kode `NOT_FOUND / UNAUTHORIZED / FORBIDDEN / VALIDATION_ERROR / CONFLICT / RATE_LIMITED / UPSTREAM_ERROR / INTERNAL`.

---

## Keamanan

- Auth Supabase + otorisasi selalu server-side (RLS + guard service); peran `visitor/buyer/developer/admin`, satu akun bisa buyer+developer
- Tidak ada service-role key di browser; tidak ada secret terkomit
- Rate-limit endpoint klik; JSON-LD di-escape dari breakout `<script>`; link eksternal `rel="nofollow noopener"`
- Upload: allowlist JPG/PNG/WebP ≤ 2 MB, maks 5/produk, nama file disanitasi; video hanya embed YouTube
- Analitik privasi-minimal: tanpa IP mentah (hash+salt harian), retensi mentah 12 bulan, tanpa tracking lintas situs

---

## Analitik & KPI

Event: `product_view, demo_click, developer_profile_view, contact_click, search, favorite` (lihat `/admin/reports`). **KPI primer: Contact Conversion Rate = contact clicks ÷ product views.** Target validasi awal: ≥20 produk published, ≥10 developer, ≥100 views, ≥20 demo clicks, ≥10 contact clicks.

---

## Roadmap

- **Phase 2 (Commerce):** payment, lisensi, checkout, komisi, payout
- **Phase 3 (Deployment):** one-click deploy, managed hosting
- **Phase 4 (AI):** pencocokan, generate listing, evaluasi, asisten pembeli
- **Phase 5:** akuisisi micro-SaaS
- **P2 terdekat di kode:** UI compare 2–4 produk (kontrak service sudah siap di `src/features/compare/`)

---

## Dokumen Terkait

| Dokumen | Isi |
| ------- | --- |
| [`docs/PRD.md`](docs/PRD.md) | PRD v1.0 lengkap (90 seksi, tidak diubah) |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Arsitektur mengikat: layer, error/logging/validasi, non-goals, keputusan final |
| [`TASKS.md`](TASKS.md) | 18 task atomik + progres (semua selesai ✅) |
| [`FIXES.md`](FIXES.md) | 11 temuan audit P0/P1 + perbaikan (semua selesai ✅) |
| [`docs/OPERASIONAL.md`](docs/OPERASIONAL.md) | Panduan operasi detail |
