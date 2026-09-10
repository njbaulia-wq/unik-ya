# FIXES — hasil audit vs PRD + ARCHITECTURE.md

> Metode: grep + baca kode per area (fitur §72–77, OWASP, konsistensi
> error/logging, NON-GOALS §2). PRD (`README.md`) tidak diubah.
> Non-goals: tidak satu pun temuan menuntut fitur commerce — tetap patuh.

## P0 — Security (perbaiki dulu)

- [ ] **F1 — JSON-LD XSS breakout.** `src/app/products/[slug]/page.tsx:113`:
  `JSON.stringify(jsonLd)` dari string DB disuntik mentah ke
  `<script>` — payload `</script><script>…` di nama/deskripsi lolos dari
  escaping React. Fix: escape `<` → `\u003c` sebelum inject.
- [ ] **F2 — CSRF di POST /api/contact-click.** Tanpa origin check; pihak
  ketiga bisa membanjiri event klik lintas-situs. Fix: tolak bila header
  `Origin`/`Referer` ada dan bukan same-origin (AppError FORBIDDEN generik).

## P1 — Kebenaran & kelengkapan PRD (perbaiki berurutan)

- [ ] **F3 — `searchParamsSchema` strictObject menolak `utm_*`.**
  Link marketing (`/products?utm_source=x`) → 422 error page. Fix: `z.object`
  (strip eksplisit) agar param tak dikenal diabaikan, sesuai standar §3.5.
- [ ] **F4 — Detail produk tak tampilkan pricing + skor.**
  PRD §7 (Pricing Information) & §9 (Quality Score 92/100) display-only.
  Fix: baris harga teks + skor di halaman detail.
- [ ] **F5 — Changelog tak tampil.** PRD §15 (Version, Changelog);
  tabel `product_versions` sudah ada tapi tak dibaca. Fix: repo
  `getProductVersions` + section Versi & Riwayat.
- [ ] **F6 — Admin tak bisa moderasi produk published.**
  PRD §56 (suspend/archive) + feature: `/admin/pending` hanya antrean
  submitted/under_review. Fix: daftar produk published (limit 50) dengan
  aksi suspend/archive/feature/unfeature.
- [ ] **F7 — Admin tak bisa suspend creator (PRD §22).**
  Fix: migrasi `0009_developer_suspend.sql` (kolom `suspended`, default
  false) + public reads kecualikan developer suspended + toggle di
  `/admin/creators` + guard test.
- [ ] **F8 — Dashboard tanpa Settings (PRD §19).**
  Fix: `/dashboard/settings` (info akun + keluar), tambah link nav.
- [ ] **F9 — Login abaikan `?next=`.** Middleware kirim `?next=` tapi
  halaman login/action tak meneruskannya. Fix: baca `next` di
  `/login`, teruskan ke `loginAction`, hormati via `postLoginRedirect`
  (sudah validasi same-path).
- [ ] **F10 — Kategori tanpa canonical.** Fix: `generateMetadata`
  `/categories/[slug]` pakai canonical + deskripsi kategori.
- [ ] **F11 — Gambar tanpa optimasi (PRD §41).** `ProductCard` + detail
  pakai `<img>` mentah. Fix: `next/image` (`fill`/`sizes`, `priority`
  untuk cover detail) dengan `remotePatterns` yang sudah ada.

## P2 — Dicatat, tidak dikerjakan di v1

- Rate-limit search publik (dampak rendah, RLS read-only).
- Pengetatan path Storage per-user (path memakai `developers.id`, bukan
  `auth.uid()` — butuh desain ulang klaim path; catat untuk hardening P2).
- UI baca `audit_logs` untuk admin.
- Section "Why This Marketplace" (§13) — tercakup CTA + Cara Kerja.

## Hasil audit bersih (tidak perlu fix)

- Tanpa `console.*` di kode; tanpa secret terkomit; service-role hanya server.
- Error: hanya `AppError` + envelope; unknown → INTERNAL generik; tanpa
  stack/SQL bocor (E2E guard menegaskan).
- Logging: satu logger JSON + `request-id` end-to-end (terlihat di log prod).
- Validasi: Zod tiap boundary; URL hanya `https://`; upload allowlist + 2 MB.
- RLS: kebijakan sesuai §51; guard test statis + unit peran hijau.
- Kontak: hanya channel enabled; tanpa internal chat; tanpa tombol Beli.
