# TASKS — DevMarket MVP (plan only, jangan eksekusi kode)

> Sumber: `README.md` (PRD v1.0) + `ARCHITECTURE.md` (§3–§5 mengikat).
> Status dokumen ini: **plan**. Dilarang menulis kode aplikasi saat menyusun/membaca dokumen ini.
> Arah dependensi layer: `L1 routes → L2 services → L3 data access → DB`. Shared kernel = `L4`.

## Cara pakai (wajib untuk semua task)

- Satu task = satu branch `agent/<nama-task>` = commit atomik `<scope>: <perubahan> — <hasil QA>`. Jangan campur task dalam satu commit/branch. Jangan commit ke `main` langsung. Jangan commit secret/`.env.local`.
- Sebelum delete/rename/rewrite file existing: `grep` semua pemakai (import, route, action, RLS policy, test, seed) dulu, cantumkan hasilnya di laporan task.
- Stop rule: 1 task gagal fix 3x berturut-turut → STOP total, laporkan (task+branch, error terakhir+repro, 3 hal dicoba, hipotesis, file/line, kebutuhan dari user). Dilarang loncat ke task lain.
- Standar error/logging/validasi di bawah **bukan opsional** — tiap task wajib menerapkannya sesuai kolom "Terapkan di sini".
- Gate tiap task (Definition of Done mini): typecheck + lint + unit/integration terkait lolos, RLS/auth terkait teruji bila menyentuh data, tidak ada `console.log` lepas, tidak ada error internal bocor ke client, ada loading/empty/error/not-found/unauthorized state bila menyentuh UI.

### Pola standar yang dirujuk singkat (detail di ARCHITECTURE.md §3.3–§3.5)

- **Error:** hanya `AppError` dari `src/lib/error.ts` (`NOT_FOUND, UNAUTHORIZED, FORBIDDEN, VALIDATION_ERROR, CONFLICT, RATE_LIMITED, UPSTREAM_ERROR, INTERNAL`). `try/catch` hanya di mapper boundary L1 (`src/lib/http.ts` / `src/lib/action.ts`) + tempat yang bisa pulih. Service tidak pernah `throw Error` mentah / error DB mentah. Response gagal = envelope `{ ok:false, error:{ code, message } }` berbahasa jelas (ID), tanpa stack/SQL/nama kolom/secret.
- **Logging:** hanya via `src/lib/logger.ts`, JSON satu baris `{ timestamp, level, module, request-id, message, ... }`. `request-id` dari middleware diteruskan ke service→repo. `error` + `errorCode` hanya untuk butuh aksi manusia. Tanpa PII/secret/kontak di log. Analytics event terpisah dari log operasional.
- **Validasi:** tiap boundary L1 divalidasi Zod di `features/<mod>/schema.ts`, lalu server-side re-validate. URL eksternal hanya `https://` (tolak `javascript:/data:`). Upload: MIME allowlist + size + sanitasi filename. Error validasi → `AppError(VALIDATION_ERROR)` + `details` per-field.

### Peta dependensi

```text
T01 scaffold+kernel ─┬─→ T02 schema+RLS ─→ T03 seed ─→ T04 auth
                     │                                  │
                     └─→ T05 design-system/shell ────────┘
                                                        ↓
T06 homepage → T07 katalog/search → T08 product-detail → T09 developer/kategori/statis
                                                        ↓
T10 dashboard-shell → T11 wizard+upload → T12 state-machine+skor
                                                        ↓
T13 admin+audit ─→ T14 contact-flow ─→ T15 analytics ─→ T16 favorites ─→ T17 compare-ready ─→ T18 QA-gate
```

---

## P0 — Foundation

### T01 — Scaffold Next.js + shared kernel (error/logger/env/request-id)
- Branch: `agent/scaffold-kernel` | Dep: — | PRD: §42–43, §78–79
- Tujuan: repo bisa `build/typecheck/lint` + satu pola error/log untuk semua task berikutnya.
- Layer: **L4 (shared kernel) + L1 tipis (middleware)**.
- File disentuh:
  - `package.json, tsconfig.json, next.config.*, tailwind.config.*, postcss.config.*, .env.example, .gitignore, Dockerfile`
  - `src/lib/error.ts, src/lib/logger.ts, src/lib/http.ts, src/lib/action.ts, src/lib/env.ts`
  - `src/middleware.ts` (buat/propagasi `x-request-id`), `src/types/index.ts`
- Terapkan standar di sini:
  - Error: definisikan `AppError` + `mapToResponse()` di `lib/http|action.ts`; sediakan `notFound()`/`forbidden()` messages ID sesuai PRD §57.
  - Logging: `logger.ts` (JSON prod / pretty dev); middleware menyuntik `request-id`; semua log wajib sertakan `module:"kernel"`.
  - Validasi: `env.ts` validasi env via Zod saat boot (gagal boot bila env wajib hilang, bukan gagal diam-diam saat runtime).
- Checklist:
  - [x] `npm run build`, `tsc --noEmit`, `lint` lolos
  - [x] `AppError` + envelope + mapper ada + unit test mapper (AppError→status, unknown→INTERNAL generik)
  - [x] `request-id` muncul di response header + log
  - [x] `.env.example` lengkap, `.env.local` gitignored, tidak ada secret terkomit
  - [x] Commit di `agent/scaffold-kernel`
- Progres T01: scaffold Next 16.3.4 + kernel L4 selesai (error/logger/http/action/env/middleware). QA: build, typecheck, lint, 4 unit test lolos. Versi dikunci di package.json + Dockerfile Node 22.

### T02 — Skema DB + RLS + Storage (migrasi)
- Branch: `agent/db-schema-rls` | Dep: T01 | PRD: §44–48, §50–51, §53, §66
- Tujuan: tabel inti + RLS + bucket sesuai keputusan taksonomi/pricing/media, tanpa tabel payment/order palsu.
- Layer: **L3 (migrasi/DDL/RLS) + L4 (`lib/db.ts` client ber-RLS)**.
- File disentuh:
  - `supabase/migrations/0001_core.sql` (profiles, developers, developers_socials, categories, category_redirects, tags, product_tags, products, product_versions, product_images, favorites, product_views, contact_clicks)
  - `supabase/migrations/0002_rls.sql` (enable RLS + policy: public baca published; developer kelola miliknya; user kelola favorites-nya; admin full via service role + cek role server-side)
  - `supabase/migrations/0003_storage.sql` (bucket `product-images`, `avatars` + policy MIME/size/auth)
  - `src/lib/db.ts, src/lib/auth.ts` (helper klaim role server-side), `src/types/database.ts` (generated)
- Terapkan standar di sini:
  - Error: pelanggaran RLS/auth dipetakan ke `FORBIDDEN/UNAUTHORIZED` generik (jangan bocorkan "policy X gagal / tabel Y").
  - Logging: log migrasi/seed hanya `module:"db"`, level `info`; kegagalan migrasi = `error` + `errorCode:UPSTREAM_ERROR` + `request-id` bila via request.
  - Validasi: constraint DB (enum status, pricing_model, CHECK url `https://`, CHECK jumlah image) sebagai jaring kedua setelah Zod.
- Checklist:
  - [x] Migrasi up/down berurutan, reversible, tidak edit migrasi yang sudah merge
  - [x] RLS test allow/deny: anonim tak bisa edit; dev A tak bisa edit milik B; non-admin tak bisa akses admin; service-role tak pernah ke browser
  - [x] Slug kategori immutable + tabel `category_redirects` ada
  - [x] Tidak ada tabel `orders/payments/transactions/licenses/subscriptions`
  - [x] Commit di `agent/db-schema-rls`
- Progres T02: migrasi 0001 (13 tabel + enum + CHECK https/slug/skor) + 0002 (RLS + helper is_admin/own_developer_id) + 0003 (bucket product-images/avatars 2MB/1MB). Guard test statis + unit auth guards. QA: 13 test, typecheck, lint lolos.

### T03 — Seed fiktif realistis
- Branch: `agent/seed-data` | Dep: T02 | PRD: §59–60
- Tujuan: 10 developers, 20–30 products, 8 kategori (§5 keputusan #4), 30+ tags, tiap produk ada thumbnail/deskripsi/stack/fitur/demo dummy valid-routing + creator.
- Layer: **L3 (seed)**.
- File disentuh: `supabase/seed/*.sql` (atau `*.ts`), `supabase/seed/README.md`, `public/seed/*` (placeholder lokal bila perlu)
- Terapkan standar di sini:
  - Error: seed idempoten — konflik slug → `CONFLICT` yang jelas di log seed, bukan crash tanpa pesan.
  - Logging: `module:"seed"`, ringkasan counts (developers/products/tags) `info`; tanpa PII asli.
  - Validasi: seed melewati skema Zod yang sama dengan produk (jadi data seed tidak "curang").
- Checklist:
  - [x] Counts memenuhi §59–60; data jelas fiktif (bukan customer asli)
  - [x] Seed rerunnable tanpa duplikat
  - [x] Commit di `agent/seed-data`
- Progres T03: seed.sql idempoten (10 dev, 24 produk 22 published+2 draft, 8 kategori, 32 tags, socials/versions/images/tags) + cover.svg + README seed. Validasi Zod di test (slug/https/counts/fiktif). QA: 18 test, typecheck, lint lolos.

### T04 — Auth (email/password + Google) + role guard server-side
- Branch: `agent/auth-roles` | Dep: T02 | PRD: §49–51, §69
- Tujuan: login/register/logout, peran `visitor/buyer/developer/admin` (satu akun bisa buyer+developer), guard server-side.
- Layer: **L1 (login pages, actions, middleware) → L2 (`features/auth/service.ts`) → L3 (profiles)**.
- File disentuh:
  - `src/app/login/page.tsx, src/app/(auth)/*`
  - `src/features/auth/schema.ts, service.ts, repository.ts`
  - `src/lib/auth.ts` (getSession/requireRole di server), `src/middleware.ts` (proteksi `/dashboard`, `/admin`)
  - `scripts/bootstrap-admin.ts` (token sekali pakai, sesuai keputusan #9)
- Terapkan standar di sini:
  - Error: kredensial salah → `UNAUTHORIZED` generik ("Email atau kata sandi salah"), bukan "user tidak ada"; non-admin ke `/admin` → `FORBIDDEN` + halaman unauthorized ID.
  - Logging: `module:"auth"`, `info` untuk login/logout sukses (tanpa password/token), `warn` untuk gagal login + `request-id`; tidak pernah log secret.
  - Validasi: Zod email/password strength + callback OAuth state; re-validate di server action.
- Checklist:
  - [x] Email/password + Google OAuth bekerja; magic link belum ada (sesuai keputusan #1)
  - [x] Guard server-side untuk `/dashboard` dan `/admin`; RLS + cek service konsisten
  - [x] Test: anonim tak bisa akses dashboard; dev tak bisa akses admin
  - [x] Commit di `agent/auth-roles`
- Progres T04: auth schema/service/repo/actions + login/register/Google OAuth + callback + middleware guard + bootstrap-admin + fixup 0004_profiles_insert. Catatan: nomor migrasi 0004 terpakai fixup ini, jadi search-index T07 jadi 0005, status-check T12 jadi 0006, audit T13 jadi 0007, analytics T15 jadi 0008. QA: 23 test, typecheck, lint, build lolos.

### T05 — Design system + app shell + global states
- Branch: `agent/design-shell` | Dep: T01, T04 | PRD: §30–36, §41, §57–58, §78
- Tujuan: fondasi visual non-AI-slop + semua halaman punya loading/empty/error/not-found/unauthorized.
- Layer: **L1 (layout, components) + L4 (`lib/copy.ts` abstraksi copy ID)**.
- File disentuh:
  - `src/app/layout.tsx, globals.css, loading.tsx, error.tsx, not-found.tsx, unauthorized.tsx`
  - `src/components/ui/*` (shadcn wrapper), `src/components/{Button,Card,Badge,Input,Modal,EmptyState,ErrorState}.tsx`
  - `src/lib/copy.ts`
- Terapkan standar di sini:
  - Error: `error.tsx` render dari `AppError.message` aman saja; `cause`/stack hanya ke logger.
  - Logging: `module:"ui"`, log render-error boundary level `error` + `route` + `request-id`.
  - Validasi: props komponen kritis (mis. ProductCard) diberi tipe strict; a11y: label, focus, alt, dialog accessible.
- Checklist:
  - [x] Tipografi netral, 1 aksen, border halus, radius moderat; tanpa gradient/glass/blob (PRD §31)
  - [x] Grid 3/2/1, max-w 1200–1280, nav mobile khusus (bukan desktop dikecilkan)
  - [x] Semua state §57–58 ada dan berbahasa Indonesia jelas
  - [x] Commit di `agent/design-shell`
- Progres T05: layout+header/footer+nav mobile, primitif UI (Button/Badge/Card/Field), States ID, loading/error/not-found/unauthorized, copy.ts. QA: typecheck, lint, build, 23 test lolos.

---

## P1 — Public marketplace

### T06 — Homepage
- Branch: `agent/homepage` | Dep: T05 | PRD: §12–13, §72
- Tujuan: jawab 3 pertanyaan buyer dalam hitungan detik + search besar + section Featured/Kategori/New/Verified/Developers/HowItWorks/CTA.
- Layer: **L1 (Server Components) → L2 (`features/products/service.ts` read-model) → L3 (queries published)**.
- File disentuh: `src/app/page.tsx`, `src/features/products/{service,repository,schema}.ts`, `src/features/products/components/ProductCard.tsx`, `src/features/categories/*`
- Terapkan standar di sini:
  - Error: gagal fetch section → section fallback empty/error ID, bukan halaman 500; unknown → `INTERNAL` generik.
  - Logging: `module:"products"`, `info` per section `action:"homepage_section" + durationMs`; `error` + `errorCode` bila query gagal.
  - Validasi: query params homepage (mis. `?q=`) via Zod; tanpa query SQL dari input mentah.
- Checklist:
  - [x] Tanpa login bisa dibuka, responsif, SEO metadata ada, tanpa broken image/overflow
  - [x] CTA primer Jelajahi Produk, sekunder Publikasikan Produk
  - [x] Commit di `agent/homepage`
- Progres T06: repo L3 (list published/featured/verified/new + kategori + developer, error→UPSTREAM generik), service L2 fallback per-section, ProductCard §14, homepage penuh. QA: 25 test, typecheck, lint, build (homepage static) lolos.

### T07 — Katalog + search FTS + filter + sort
- Branch: `agent/catalog-search` | Dep: T06 | PRD: §23–24, §64
- Tujuan: Postgres FTS + indexed fields atas name/description/category/technology/features/use-cases/developer/tags; filter + sort sesuai PRD.
- Layer: **L1 (`/products` page + actions) → L2 (`features/search/service.ts`) → L3 (FTS queries + index)**.
- File disentuh:
  - `src/app/products/page.tsx`, `src/features/search/{schema,service,repository}.ts`
  - `supabase/migrations/0004_search_indexes.sql` (tsvector + GIN + index filter/sort)
  - `src/features/search/components/{SearchBar,Filters,SortSelect,EmptyResults}.tsx`
- Terapkan standar di sini:
  - Error: query invalid → `VALIDATION_ERROR` + empty-result yang membantu ("Tidak menemukan X, coba: SaaS/inventory/AI/Next.js"); DB error → `UPSTREAM_ERROR` generik.
  - Logging: `module:"search"`, `info action:"search" + query(normalized, tanpa PII) + resultCount + durationMs`.
  - Validasi: Zod untuk `q/category/productType/technology/verified/hasDemo/sort/page`; clamp pagination; escape FTS input.
- Checklist:
  - [x] Tanpa Elasticsearch; ada EXPLAIN/index untuk kolom search; tanpa N+1
  - [x] Empty result membantu sesuai PRD §64
  - [x] Commit di `agent/catalog-search`
- Progres T07: migrasi 0005 (search_vector trigger + GIN + index filter/sort), search schema/service/repo (tsquery sanitasi, filter kategori/tipe/teknologi/verified/demo, sort 4 mode, pagination), halaman /products + EmptyResults. QA: 28 test, typecheck, lint, build lolos.

### T08 — Product detail (`/products/[slug]`) + SEO + structured data
- Branch: `agent/product-detail` | Dep: T07 | PRD: §15–16, §37–38, §73
- Tujuan: layout §15 lengkap + CTA Hubungi Developer/Live Demo + similar products + metadata dinamis jujur.
- Layer: **L1 (page + generateMetadata) → L2 (products service: detail+similar+badges) → L3 (repo by slug)**.
- File disentuh: `src/app/products/[slug]/page.tsx`, `src/features/products/{service,repository}.ts`, `src/features/products/components/{VerificationBadges,ContactCTA,SimilarProducts}.tsx`
- Terapkan standar di sini:
  - Error: slug tak ada/belum published → `NOT_FOUND` ("Produk belum ditemukan…") + `not-found.tsx`; produk suspended → `FORBIDDEN`-rasa "tidak tersedia" tanpa bocorkan alasan internal.
  - Logging: `module:"products"`, `info action:"product_view"` (terpisah dari log operasional; tanpa IP mentah — lihat T15).
  - Validasi: Zod untuk `slug` (lowercase, pola aman); URL demo/repo hanya `https://`.
- Checklist:
  - [x] Slug bekerja, screenshot/stack/creator/verified benar, Live Demo + Contact bekerja, similar tampil, mobile baik, SEO (title/desc/canonical/OG/Twitter) + schema jujur
  - [x] Istilah "Platform Verification", bukan "Security Certified"
  - [x] Commit di `agent/product-detail`
- Progres T08: repo bySlug+similar+socials, service detail (non-published→NOT_FOUND) + deriveBadges, halaman /products/[slug] + metadata + JSON-LD jujur, ContactCTA/channels sementara (modal+tracking di T14). QA: 34 test, typecheck, lint, build lolos.

### T09 — Developer profile + kategori + halaman statis + sitemap/robots
- Branch: `agent/profiles-categories-seo` | Dep: T08 | PRD: §18, §39–40, §65
- Tujuan: `/developers`, `/developers/[slug]`, `/categories/[slug]` (pakai redirect table), `/how-it-works`, `/sitemap.xml`, `/robots.txt`.
- Layer: **L1 → L2 (`features/developers`, `features/categories`) → L3**.
- File disentuh: `src/app/developers/**, src/app/categories/[slug]/page.tsx, src/app/how-it-works/page.tsx, src/app/sitemap.ts, src/app/robots.ts`
- Terapkan standar di sini:
  - Error: slug lama kategori → 301 via `category_redirects`; developer tak ada → `NOT_FOUND`; tanpa revenue developer.
  - Logging: `module:"developers|categories|seo"` sesuai area; sitemap hanya log `info` counts.
  - Validasi: Zod slug; robots blokir `/admin /dashboard /api internal`.
- Checklist:
  - [x] Metrik profil hanya products/verified/updated-recently; sitemap hanya public+published; robots benar
  - [x] Commit di `agent/profiles-categories-seo`
- Progres T09: developers repo/service + kategori resolve/redirect + halaman developers, kategori (301), how-it-works, sitemap dinamis published-only, robots blokir privat. QA: 37 test, typecheck, lint, build lolos.

---

## P1 — Developer

### T10 — Dashboard shell + profil + kontak developer
- Branch: `agent/dashboard-shell` | Dep: T04–T05 | PRD: §19, §54
- Tujuan: `/dashboard` (overview, products, profile, contacts, settings) + pengaturan kontak publik per-channel (WA/email/website/GitHub/Telegram).
- Layer: **L1 (dashboard layout/pages) → L2 (`features/developers/service.ts`) → L3**.
- File disentuh: `src/app/dashboard/**`, `src/features/developers/{schema,service,repository}.ts`
- Terapkan standar di sini:
  - Error: akses milik orang lain → `FORBIDDEN`; field kontak non-enabled tidak dirender/disimpan (validasi Zod + service).
  - Logging: `module:"developers"`, `info action:"profile_update"` (tanpa nilai kontak sensitif di log).
  - Validasi: Zod profil + kontak per-channel (format WA/telepon, email, https URL).
- Checklist:
  - [x] Guard server-side; hanya kontak enabled yang tampil
  - [x] Commit di `agent/dashboard-shell`
- Progres T10: developers schema/service/repo profil+kontak, actions guard, layout guard + force-dynamic, overview/products/profile/contacts. QA: 41 test, typecheck, lint, build lolos.

### T11 — Wizard create/edit produk + upload
- Branch: `agent/product-wizard` | Dep: T10 | PRD: §20–21, §53, §74
- Tujuan: wizard 5 langkah + simpan draft + upload screenshot (≤5×2MB) + video = URL YouTube.
- Layer: **L1 (wizard pages/actions) → L2 (products service) → L3 (products/product_images + Storage)**.
- File disentuh: `src/app/dashboard/products/**`, `src/features/products/{schema,service,repository}.ts`, `src/lib/files.ts, src/lib/urls.ts`
- Terapkan standar di sini:
  - Error: field wajib hilang → `VALIDATION_ERROR` + `details` per-field (accessible form errors); upload gagal → `UPSTREAM_ERROR` generik + pesan ID jelas.
  - Logging: `module:"products"`, `info action:"product_draft_save"` + `durationMs`; upload log tanpa filename mentah PII (sanitized name saja).
  - Validasi: Zod per-step + final; MIME allowlist jpg/png/webp, size, sanitasi filename; video allowlist youtube/youtu.be + https.
- Checklist:
  - [x] Required vs recommended sesuai §21; developer tidak bisa publish langsung (tombol hanya Save draft / Submit)
  - [x] Tidak ada binary di Postgres; Storage policy lolos
  - [x] Commit di `agent/product-wizard`
- Progres T11: urls/files L4, wizard schema draft+submit, repo tulis, service create/update draft, actions + upload, wizard 5 langkah + halaman new/edit. QA: 49 test, typecheck, lint, build lolos.

### T12 — Submit + state machine + skor verifikasi (deterministik)
- Branch: `agent/product-lifecycle` | Dep: T11 | PRD: §8, §9–10, §29, §55
- Tujuan: transisi `draft→submitted→under_review→approved→published (+rejected/suspended/archived)` + kalkulasi skor hybrid (keputusan #3).
- Layer: **L2 (`features/products/service.ts`: `submit/transition/computeScore/badges`) → L3**.
- File disentuh: `src/features/products/service.ts`, `src/features/verification/{score.ts,schema.ts}.ts` (atau di dalam products), `supabase/migrations/0005_status_checks.sql`, `tests/unit/verification.test.ts`
- Terapkan standar di sini:
  - Error: transisi ilegal → `CONFLICT` ("Status tidak dapat diubah dari X ke Y"); skor memakai input tervalidasi saja.
  - Logging: `module:"verification"`, `info action:"status_transition" + from→to + actorRole`; `warn` untuk transisi ditolak + `errorCode:CONFLICT`.
  - Validasi: Zod enum status + guard peran (developer hanya submit miliknya; VERIFIED hanya admin — ditegakkan di service + RLS).
- Checklist:
  - [x] Unit test: semua transisi legal/ilegal + bobot skor =100 + ambang NEW/UPDATED/POPULAR/LIVE DEMO
  - [x] Commit di `agent/product-lifecycle`
- Progres T12: verification score deterministik + schema, trigger 0006 (transisi+slug immutable+published_at), assertTransition + submitForReview + submit action + tombol kirim di edit page. QA: 55+ test, typecheck, build lolos.

---

## P1 — Admin & growth

### T13 — Admin review + aksi moderasi + audit trail
- Branch: `agent/admin-moderation` | Dep: T12 | PRD: §22, §56, §75
- Tujuan: `/admin` (overview, pending, creators, categories, reports) + approve/reject/suspend/feature/archive + verify/suspend creator + kelola kategori (display name saja).
- Layer: **L1 (admin pages/actions, guard admin) → L2 (`features/admin/service.ts`) → L3 (+ `audit_logs`)**.
- File disentuh: `src/app/admin/**`, `src/features/admin/{schema,service,repository}.ts`, `supabase/migrations/0006_audit.sql`
- Terapkan standar di sini:
  - Error: non-admin → `FORBIDDEN` + halaman unauthorized; aksi tanpa alasan (reject/suspend) → `VALIDATION_ERROR` (alasan wajib).
  - Logging: `module:"admin"`, tiap mutasi `info/error` + `actorId + targetId + action + reason + request-id`; audit_logs immutable (tanpa update/delete via RLS).
  - Validasi: Zod untuk tiap aksi + reason; rename kategori tidak boleh ubah slug.
- Checklist:
  - [x] Semua mutasi tercatat; test peran §75–76 lolos
  - [x] Commit di `agent/admin-moderation`
- Progres T13: audit_logs immutable (0007) + admin schema/service/repo/actions + halaman overview/pending/creators/categories + guard admin. QA: 61 test, typecheck, lint, build lolos.

### T14 — Contact flow + demo click (tanpa login, anti-spam)
- Branch: `agent/contact-flow` | Dep: T08, T10 | PRD: §16–17
- Tujuan: modal "Cara menghubungi developer" + tombol WA/Email/Website/GitHub + rate-limit + reveal-on-click + mask email.
- Layer: **L1 (modal/actions `trackContactClick/trackDemoClick`) → L2 (analytics service) → L3 (`contact_clicks`)**.
- File disentuh: `src/features/products/components/ContactModal.tsx`, `src/features/analytics/{schema,service,repository}.ts`, `src/lib/ratelimit.ts`, `src/app/api/contact-click/route.ts` (atau server action)
- Terapkan standar di sini:
  - Error: rate-limit → `RATE_LIMITED` ("Terlalu sering, coba lagi sebentar") bukan 500; kontak disabled → `NOT_FOUND` generik.
  - Logging: `module:"analytics"`, `info action:"contact_click|demo_click"` (tanpa nilai kontak/email di log) + `request-id`.
  - Validasi: Zod `{ productSlug, channel }`; channel harus salah satu yang enabled; URL tujuan lolos `lib/urls.ts`.
- Checklist:
  - [ ] Tanpa internal chat; deep-link WA/email benar; `rel=nofollow noopener` untuk eksternal
  - [ ] Commit di `agent/contact-flow`

### T15 — Analytics minimal + KPI
- Branch: `agent/analytics-kpi` | Dep: T14 | PRD: §27–28, §71, §88
- Tujuan: event `product_view/demo_click/developer_profile_view/contact_click/search/favorite` + query KPI (contact conversion primer).
- Layer: **L2–L3 (`features/analytics/*`) + L1 (dashboard admin reports read-only)**.
- File disentuh: `src/features/analytics/{schema,service,repository}.ts`, `supabase/migrations/0007_analytics.sql` (kolom `ip_hash` nullable, index waktu), `src/app/admin/reports/page.tsx`
- Terapkan standar di sini:
  - Error: tulis analytics tidak boleh menggagalkan halaman (fire-and-forget aman: gagal → log `warn UPSTREAM_ERROR`, bukan 500 ke user).
  - Logging: pisahkan log operasional vs event bisnis; tanpa IP mentah (hash+salt harian); retensi 12 bln.
  - Validasi: Zod event payload minimal; tolak PII berlebih.
- Checklist:
  - [ ] KPI §88 bisa dihitung (≥20 produk, ≥10 dev, views/demo/contact); tanpa tracking lintas situs
  - [ ] Commit di `agent/analytics-kpi`

### T16 — Favorites (login wajib)
- Branch: `agent/favorites` | Dep: T04, T08 | PRD: §26
- Tujuan: save/unsave + `/dashboard/favorites` sebagai signal demand.
- Layer: **L1 → L2 (`features/favorites/service.ts`) → L3**.
- File disentuh: `src/app/dashboard/favorites/page.tsx`, `src/features/favorites/{schema,service,repository}.ts`
- Terapkan standar di sini:
  - Error: anonim → `UNAUTHORIZED` + arahkan login; duplikat save → idempoten (bukan `CONFLICT` ke user).
  - Logging: `module:"favorites"`, `info action:"favorite_toggle"`.
  - Validasi: Zod `{ productSlug }`; pastikan produk published sebelum bisa difavoritkan.
- Checklist:
  - [ ] Idempoten + RLS user-kelola-miliknya
  - [ ] Commit di `agent/favorites`

---

## P2 — Siap-masa-depan + gate akhir

### T17 — Compare architecture-ready (tanpa UI publik)
- Branch: `agent/compare-ready` | Dep: T08 | PRD: §25 + keputusan #12
- Tujuan: kontrak + service + test untuk `/compare?a=&b=` (2–4 slug), tanpa link/nav/UI publik.
- Layer: **L2 (`features/compare/service.ts`) + L1 (kontrak URL, belum dipasang)**.
- File disentuh: `src/features/compare/{schema,service}.ts`, `tests/unit/compare.test.ts`
- Terapkan standar di sini:
  - Error: slug invalid/belum published → `VALIDATION_ERROR/NOT_FOUND` per-item (tanpa bocorkan data non-publik).
  - Logging: `module:"compare"`, `debug/info` saja; tanpa UI = tanpa log berlebih.
  - Validasi: Zod max 4 slug unik + published-only.
- Checklist:
  - [ ] Tidak ada nav/route publik compare; hanya service+test terreview
  - [ ] Commit di `agent/compare-ready`

### T18 — Quality gate: testing + RLS + SEO/a11y/perf + visual QA
- Branch: `agent/quality-gate` | Dep: semua di atas | PRD: §36–41, §61–62, §76–77, §81–82
- Tujuan: DoD §82 lolos sebelum klaim selesai; bukan sekadar `build`.
- Layer: **semua (verifikasi akhir)**.
- File disentuh: `tests/{unit,integration}/*`, `e2e/*.spec.ts` (Playwright: visitor→search→product; developer→create→submit; admin→approve; buyer→contact), `lighthouserc.*`, `README.md` (versi exact Next.js+Node, setup, env, migrasi, seed, admin bootstrap)
- Terapkan standar di sini:
  - Error: E2E negatif (anon edit, dev-A edit milik-B, non-admin ke admin) harus menghasilkan envelope error yang benar, bukan 500/stack.
  - Logging: audit tidak ada `console.*` lepas; sampling log prod valid JSON + `request-id` end-to-end.
  - Validasi: re-run Zod boundary + RLS allow/deny matrix §76 sebagai gate (gagal = tidak lolos DoD).
- Checklist:
  - [ ] build + typecheck + lint + unit/integration + E2E hijau
  - [ ] RLS + auth/peran teruji; service-role tak bocor; tidak ada secret terkomit
  - [ ] Lighthouse 90/90/90/95 (realistis per halaman/device), responsive mobile/tablet/desktop/large, SEO (metadata+sitemap+robots+schema), a11y praktis, tanpa console error/broken link, visual QA §61–62 (bukan clone referensi)
  - [ ] README final (overview, stack+versi exact, setup, env, Supabase, migrasi, seed, testing, deploy, admin) + laporan implementasi ringkas
  - [ ] Commit di `agent/quality-gate`

---

## Larangan yang tetap berlaku untuk semua task (ringkas dari ARCHITECTURE.md §2)

Dilarang: checkout/payment/QRIS/VA/e-wallet/escrow/payout/wallet/refund/order/invoice/komisi/tombol Beli Sekarang/tabel order-payment palsu; one-click deploy/hosting/eksekusi repo; microservices; internal chat; Elasticsearch; klaim Security Certified; revenue developer; publish tanpa approval; copy desain referensi; AI-slop UI; dependency baru tanpa alasan; placeholder bila data ada.
