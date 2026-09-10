# ARCHITECTURE — DevMarket (Marketplace Produk Digital & Software Developer)

> Status: Planning / Read-only. Dokumen ini turunan dari `README.md` (PRD v1.0, Sep 2026).
> Aturan: jangan tulis kode aplikasi sebelum dokumen ini disetujui. Perubahan requirement inti wajib diskusi dulu (PRD §83 RULE 1).

---

## 1. Ringkasan PRD

### 1.1 Tujuan Produk

Membangun **DevMarket**: marketplace web modern yang menjadi jembatan antara supply dan demand software siap pakai (PRD §1–§3, §87, §89).

Masalah inti yang diselesaikan (PRD §2):

- **Developer/creator** bisa membuat software cepat (website, SaaS, template, automation, dashboard, AI app, source code) tapi tidak punya distribution channel, positioning, dan cara mendapat customer pertama.
- **Buyer** butuh software siap pakai tapi sulit menemukan, membandingkan kualitas, dan menilai kepercayaan developer.

Lima goal primer (PRD §3):

| ID | Goal | Proxy sukses di v1 |
|----|------|--------------------|
| G1 | Product Discovery | Search + katalog + filter bekerja; search-to-product rate |
| G2 | Developer Distribution | Developer bisa publish listing via flow submit → review → published |
| G3 | Trust | Platform Verification + badge + quality score (bukan klaim security audit) |
| G4 | Lead Generation | CTA **Hubungi Developer** → contact clicks |
| G5 | Foundation for Future | Skema + modular monolith extensible ke payment/license/deploy tanpa rewrite |

Prinsip produk yang mengikat semua keputusan (PRD §89):

> **Marketplace first. Transaction later. Trust before checkout. Distribution is the product.**

KPI utama v1 adalah **Contact Conversion Rate = contact clicks / product views** (PRD §27–§28, §88). Payment bukan sinyal sukses di v1.

### 1.2 Target User

| Persona (PRD §5) | Contoh | Kebutuhan inti |
|------------------|--------|----------------|
| A — Developer / Creator | freelancer, indie hacker, AI builder, vibe coder, template creator | "Saya punya produk jadi, saya ingin ditemukan pembeli." Flow: register → profile → add product → submit → admin review → published |
| B — Business Buyer | UMKM, agency, perusahaan kecil, owner, marketing/ops, founder | "Saya butuh software jadi untuk kebutuhan bisnis." Flow: landing → search → filter → product → live demo → hubungi developer |
| C — Developer Buyer | developer pembeli starter kit/boilerplate/dashboard/SaaS/components/source code | Sama seperti B + perhatian ke stack, docs, version, license, repo |
| D — Admin / Curator | internal | review/approve/reject/suspend/feature/archive produk; verify/suspend creator; manage category; audit trail |

Satu akun dapat berperan ganda **buyer + developer** (PRD §49). Jangan merancang sistem akun yang rumit.

### 1.3 Scope MVP (v1)

**Model: Discovery + Contact Developer. Payment OUT OF SCOPE** (PRD header + §4, §16–§17).

Termasuk di MVP:

1. **Foundation (P0):** Next.js 16 + TS + App Router + Tailwind + shadcn/ui + Supabase (Postgres/Auth/Storage), RLS, design system (PRD §42–§44, §85).
2. **Public marketplace (P1):** Homepage (hero, search besar, featured/popular/new/verified, categories, developers, how-it-works), katalog `/products`, detail `/products/[slug]`, developer profile `/developers/[slug]`, kategori `/categories/[slug]`, halaman statis `/how-it-works` (PRD §12–§15, §18, §65).
3. **Search & filter (P1):** full-text Postgres + indexed fields atas name/description/category/technology/features/use-cases/developer/tags; filter category/product-type/technology/verified/has-demo/recently-updated; sort relevance/newest/recently-updated/popular. Belum perlu Elasticsearch (PRD §23–§24).
4. **Developer dashboard (P1):** `/dashboard` (overview, products, create, profile, contacts, settings); wizard 5 langkah (basic → details → media → contact → review & submit); status draft → submitted → under_review → approved → published (PRD §8, §19–§21, §55).
5. **Admin (P1):** `/admin` (overview, products, pending reviews, creators, categories, reports, settings); aksi approve/reject/suspend/feature/archive + verify/suspend creator; semua mutasi dicatat (PRD §22, §55–§56).
6. **Trust & verification (P1):** quality score + checklist (build/demo/docs/mobile/SEO/repo/license); badge VERIFIED / LIVE DEMO / UPDATED / POPULAR / NEW; pisahkan **Platform Verified** vs **Developer Claimed**; istilah wajib "Platform Verification", haram "Security Certified" (PRD §9–§10, §29).
7. **Contact flow (P1):** tombol utama **Hubungi Developer**, sekunder **Live Demo**; modal daftar kontak sesuai pilihan developer (WA/email/website/GitHub/Telegram/LinkedIn); tanpa internal chat di v1 (PRD §16–§17).
8. **Analytics minimal (P1):** event `product_view, demo_click, developer_profile_view, contact_click, search, favorite` sebagai tabel (`product_views`, `contact_clicks`); jangan hanya pageview (PRD §27).
9. **Favorites (P2 dalam MVP):** save product + `/dashboard/favorites`; jadi signal demand (PRD §26, §85).
10. **Cross-cutting wajib:** SEO metadata dinamis + structured data jujur + sitemap + robots; responsive mobile/tablet/desktop/large; a11y WCAG 2.2 AA praktis; performance target Lighthouse 90/90/90/95; loading/empty/error/not-found/unauthorized states di semua halaman; seed data (10 dev, 20–30 produk, 8 kategori, 30+ tags, produk fiktif) (PRD §36–§41, §57–§60).
11. **Security & data:** Supabase RLS di semua tabel exposed + server-side authorization + validasi server-side + sanitasi URL (hanya `https://`, tolak `javascript:`/`data:`) + validasi upload + audit trail admin (PRD §49–§51, §53–§54, §69–§70).

Rute kanonis (PRD §65): `/`, `/products`, `/products/[slug]`, `/categories/[slug]`, `/developers`, `/developers/[slug]`, `/how-it-works`, `/login`, `/dashboard`, `/admin`. Jangan pakai `/product?id=123` untuk halaman publik SEO.

---

## 2. NON-GOALS Eksplisit (Dilarang di v1)

Diambil verbatim dari PRD §4 + §66–§68 + §83, dipertegas sebagai larangan eksekusi:

### 2.1 Commerce / Transaksi — DILARANG KERAS

Jangan buat, jangan stub, jangan "fake", jangan tabel palsu:

- checkout, payment gateway, QRIS, virtual account, e-wallet
- escrow, automatic payout, platform wallet, refund
- order system, invoice payment, commission calculation, seller payout
- tombol **Beli Sekarang** dalam bentuk apa pun; CTA komersial satu-satunya adalah **Hubungi Developer** (PRD §83 RULE 2–4)
- monetisasi: transaction fee, featured listing berbayar, developer subscription, lead fee, premium verification, enterprise listing, acquisition fee (PRD §68 — future only)
- **Jangan membuat tabel `orders / payments / transactions / licenses / subscriptions` "untuk future-proofing"** (PRD §66). Extensible lewat desain, bukan tabel palsu.

### 2.2 Hosting / Eksekusi — DILARANG

- one-click deploy, automatic hosting, managed hosting, automatic updates
- arbitrary repository execution, marketplace transaction processing (PRD §4)

### 2.3 Scope creep lain — DILARANG

- Microservices dalam bentuk apa pun; wajib **modular monolith** (PRD §43, §83 RULE 5)
- Internal chat/messaging buyer↔developer di v1 — cukup deep-link WA/email/website/GitHub (PRD §17)
- Elasticsearch — cukup Postgres FTS (PRD §23)
- Product comparison sebagai requirement MVP — boleh disiapkan arsitekturnya, tapi bukan gate MVP (PRD §25)
- Klaim "Security Certified / audit profesional"; hanya "Platform Verification" (PRD §9)
- Menampilkan revenue developer di v1 (PRD §18)
- Publisher langsung publish tanpa admin approval — alur wajib `draft → submitted → under_review → approved → published` (PRD §55)
- Copy desain `panendekat.my.id` atau Linear/Vercel/Stripe/Raycast/Arc/Notion; hanya referensi konteks/karakter (PRD §30, §84)
- AI-slop UI: gradient berlebihan, glassmorphism, blob glowing, 3D floating, pill di mana-mana, shadow tebal, emoji sebagai ikon, ilustrasi acak, hero raksasa kosong, 20 warna, animasi berlebihan (PRD §31)
- Dependencies baru tanpa alasan teknis kuat (PRD §83 RULE 6)
- Placeholder UI jika data asli tersedia (PRD §83 RULE 7)

Setiap usulan di luar daftar PRD di atas = **tolak default**, catat sebagai roadmap Phase 2–5 (PRD §67), bukan kerjakan diam-diam.

---

## 3. Arsitektur

### 3.1 Gaya & Stack (mengikat, dari PRD §42–§43, §78–§79)

- **Gaya:** Modular Monolith. Tanpa microservices.
- **Stack:** Next.js 16 (patch terbaru saat dev dimulai) + TypeScript strict + App Router + Tailwind CSS + shadcn/ui + Supabase (Postgres + Auth + Storage).
- **Struktur repo:**

```text
src/
  app/            # routes (App Router): (marketing)/, products/, developers/, categories/, dashboard/, admin/
  components/     # UI generik (design system, shadcn wrapper) — tanpa business logic
  features/       # modul vertikal: auth, products, developers, categories, search, favorites, analytics, admin
  lib/            # cross-cutting: db client, auth helpers, error, logger, validation, env, constants
  types/          # tipe global + Database generated dari Supabase
supabase/
  migrations/     # satu migrasi = satu perubahan skema/RLS, reversible, tidak edit migrasi yang sudah merge
  seed/           # seed fiktif (bukan customer asli)
public/
```

- **Modul (PRD §43):** `auth, products, developers, categories, search, favorites, analytics, admin`. Setiap modul `features/<nama>/` berisi: `schema.ts` (Zod), `service.ts` (business logic), `repository.ts`/`queries.ts` (data access), `components/` (UI spesifik modul). Tidak ada import silang business logic antar-modul kecuali lewat `service` publik modul tersebut.

### 3.2 Layer & Arah Dependensi

Aturan arah: **`routes → services → data access → DB`. Tidak boleh melompat atau memutar.**

```text
┌──────────────────────────────────────────────┐
│ L1 ROUTES (boundary I/O)                     │
│  app/*: pages, layouts, Server Components,   │
│  Route Handlers, Server Actions              │
│  Tugas: parse input → validate (Zod) →       │
│  authN/authZ → panggil service → map ke      │
│  HTTP/UI response via AppError envelope.     │
│  LARANGAN: query SQL langsung, logic bisnis, │
│  akses service-role, bocorkan error internal.│
├──────────────────────────────────────────────┤
│ L2 SERVICES (business logic murni)           │
│  features/<mod>/service.ts                   │
│  Tugas: state machine status produk,         │
│  verification scoring, authorization rules,  │
│  orkestrasi repo + analytics events.         │
│  Murni, testable tanpa HTTP/DB (mock repo).  │
│  Error hanya via AppError / Result.          │
├──────────────────────────────────────────────┤
│ L3 DATA ACCESS (satu-satunya bicara ke DB)   │
│  features/<mod>/repository.ts + lib/db.ts    │
│  Tugas: query Supabase/Postgres ber-RLS,     │
│  FTS + index, pagination, mapping row→domain.│
│  LARANGAN: validasi bisnis, format response. │
├──────────────────────────────────────────────┤
│ L4 SHARED KERNEL (lib/)                      │
│  error.ts, logger.ts, validate.ts, env.ts,   │
│  auth.ts, ratelimit.ts, urls.ts, files.ts    │
└──────────────────────────────────────────────┘
```

- **Server Actions / Route Handlers** (PRD §52: `createProduct, updateProduct, submitProduct, approveProduct, rejectProduct, saveFavorite, trackProductView, trackContactClick`): tipis, hanya orkestrasi L1. Jangan bangun "API layer berlebihan".
- **Komponen UI:** Server Components default; Client Components hanya bila perlu interaktivitas (PRD §78). Logic bisnis tidak boleh tinggal di komponen.
- **AuthN/AuthZ:** Supabase Auth; peran `visitor, buyer, developer, admin` (satu akun bisa buyer+developer). Otorisasi **selalu server-side** (RLS + cek service): developer hanya miliknya sendiri, admin untuk moderasi; jangan andalkan frontend hiding (PRD §50–§51, §83 RULE 10–11).
- **File/media:** hanya via Supabase Storage bucket `product-images`, `avatars`; tidak pernah binary di Postgres (PRD §48, §53).

### 3.3 Standar Wajib #1 — Error Handling (terpusat)

Satu pattern untuk seluruh eksekusi berikutnya:

1. **Satu tipe sentral** di `lib/error.ts`, mis. `AppError { code, message (aman untuk user), httpStatus, details? (field errors), cause? (internal, tidak diserialisasi ke client) }` + kode tertutup: `NOT_FOUND, UNAUTHORIZED, FORBIDDEN, VALIDATION_ERROR, CONFLICT, RATE_LIMITED, UPSTREAM_ERROR, INTERNAL`.
2. **Service melempar / mengembalikan hanya `AppError`.** Dilarang `throw new Error("...mentah...")`, `throw string`, atau error ORM/DB mentah ke atas.
3. **Satu boundary mapper** (`lib/http.ts` / `lib/action.ts`): menangkap `AppError` → envelope response `{ ok:false, error:{ code, message } }` + status HTTP yang tepat; menangkap unknown → `INTERNAL` generik ("Terjadi kesalahan. Coba lagi."). Pesan user berbahasa jelas ala PRD §57 ("Produk belum ditemukan…"), bukan "Oops something went wrong!!!" dan bukan stack trace.
4. **Tidak ada try-catch liar:** `try/catch` hanya di (a) boundary L1 mapper, (b) tempat yang benar-benar bisa pulih (retry/fallback). Dilarang `catch {}` kosong, `console.log(err)` lalu lanjut, atau menelan error demi "build lolos".
5. **Tidak ada error internal bocor:** `cause`, query SQL, nama tabel/kolom, secret, stack trace tidak pernah ke client/logs publik. Masukkan ke log server terstruktur saja.
6. Setiap fitur wajib punya **loading / empty / error / not-found / unauthorized states** (PRD §57, §83 RULE 12).

### 3.4 Standar Wajib #2 — Logging (structured JSON)

1. **Satu logger terpusat** `lib/logger.ts`; seluruh kode memakai ini. Dilarang `console.log` lepas di kode produksi.
2. **Format JSON satu baris** dengan field wajib: `timestamp (ISO-8601 UTC), level (debug|info|warn|error), module (nama modul/feature), request-id, message`. Field opsional: `userId, route, action, durationMs, errorCode`.
3. **`request-id`**: dibuat di middleware/L1 per request (propagasi via header `x-request-id` / AsyncLocalStorage), diteruskan ke service → repository → log. Tanpa request-id = log tidak valid untuk debugging lintas layer.
4. **Level discipline:** `error` hanya untuk butuh aksi manusia + sertakan `errorCode` dari `AppError`; tidak ada PII/secret/token/kontak developer di log; log analytics event (`product_view` dkk.) terpisah dari log operasional.
5. Di dev boleh pretty-print, di prod wajib JSON agar bisa di-ingest log aggregator.

### 3.5 Standar Wajib #3 — Validasi Input di Tiap Boundary (Zod)

1. **Setiap boundary I/O divalidasi dengan skema Zod** (`features/<mod>/schema.ts`): Server Actions args, Route Handler body/query/params, form wizard 5 langkah, upload metadata, admin mutations, slug/params SEO routes.
2. **Jangan percaya input client** (PRD §83 RULE 11): validasi ulang server-side walau UI sudah validasi; strip/escape; tolak tipe tak dikenal (`z.strictObject` / `.strip()` eksplisit).
3. **Aturan turunan PRD yang jadi skema:** URL eksternal hanya `https://` (tolak `javascript:`, `data:`) (PRD §70); upload: MIME allowlist + size limit + sanitasi filename (PRD §53); kontak developer: hanya field yang di-enable yang boleh tersimpan/dirender (PRD §54); enum status produk & transisi state machine hanya via service (PRD §8).
4. **Error validasi** dikembalikan sebagai `AppError(VALIDATION_ERROR, 400/422)` dengan `details` per-field agar form bisa render accessible errors (PRD §36).
5. Skema adalah **kontrak versi**: perubahan breaking butuh migrasi skema + update seed/test, bukan edit diam-diam.

---

## 4. Safety Rules (mengikat semua eksekusi berikutnya)

1. **Branch + commit per task:** setiap task selesai dikomit ke git di branch terpisah `agent/<nama-task>` (kebab-case, mis. `agent/product-detail-page`), pesan commit deskriptif (format: `<scope>: <perubahan> — <hasil QA>`; cth. `products: tambah halaman detail slug + SEO metadata — typecheck+lint lolos`). Satu task = satu branch = satu/serangkaian commit atomik. Jangan commit langsung ke `main`, jangan campur dua task dalam satu commit, jangan commit secret/`.env.local`.
2. **Sebelum delete/rewrite kode existing: grep semua pemakaiannya dulu.** Wajib cari referensi (import, route, action, RLS policy, test, seed) sebelum hapus/rename/pindah; cantumkan hasil grep di laporan task. Jika dipakai >1 tempat, migrasi pemakai dulu atau batalkan rewrite.
3. **Stop rule 3x gagal:** jika 1 task gagal fix **3x berturut-turut** (build/typecheck/lint/test/RLS yang sama tidak lolos setelah 3 percobaan perbaikan), **STOP total — jangan lanjut ke task lain**, lalu laporkan: (a) nama task + branch, (b) error terakhir lengkap (log + perintah reproduksi), (c) 3 hal yang sudah dicoba, (d) hipotesis penyebab, (e) file/line terduga, (f) apa yang dibutuhkan dari user (env, keputusan, akses). Dilarang "coba task lain dulu" atau force-push menutupi kegagalan.
4. Tambahan pengaman PRD §83 yang ikut mengikat: tidak ada payment/fake-checkout; tidak ada microservices; tidak ada dependency baru tanpa alasan; QA bukan sekadar `build` — wajib typecheck + lint + test + RLS/auth test + responsive + SEO + visual QA sebelum klaim selesai.

---

## 5. Keputusan Final (mengikat — dipilih sebagai opsi terbaik & future-proof)

> Semua ambiguitas §5 lama kini **dikunci**. Agent berikutnya wajib ikut keputusan ini. Jika ingin menyimpang, buat ADR baru + minta persetujuan, jangan diam-diam.

| # | Topik | Keputusan terbaik | Alasan + future-proof |
|---|-------|-------------------|----------------------|
| 1 | Auth provider v1 | **Email/password + Google OAuth sejak hari-1. Magic link ditunda ke P2.** | Konversi onboarding creator/buyer di Indonesia sangat terbantu Google one-tap; cost implementasi di Supabase Auth ~nol (satu provider OAuth). Magic link menambah surface spam email + support burden, tidak sebanding untuk v1. Service `auth` diabstraksi agar tambah provider = config, bukan rewrite. |
| 2 | Buyer vs visitor | **Kontak developer publik tanpa login. Login wajib hanya untuk favorites / dashboard / submit produk.** | KPI v1 = contact conversion; setiap dinding login memangkas funnel. Lindungi dari scraping/spam dengan rate-limit + reveal-on-click + `rel=nofollow` + mask email (tampilkan setelah klik), bukan dengan login wall. Bila spam naik, tinggal aktifkan `requireLoginForContact` flag tanpa ubah skema. |
| 3 | Verifikasi & skor | **Hybrid: skor otomatis deterministik + badge VERIFIED manual oleh admin.** Skor = bobot transparan: Live Demo 20 + Docs 15 + ≥3 screenshots 15 + repo/dokumen 10 + license jelas 10 + mobile OK 10 + SEO/canonical 10 + version+changelog 10 = 100. Badge: `NEW` ≤30 hari publish; `UPDATED` ≤14 hari update; `POPULAR` top-10% views+favorites 30 hari; `LIVE DEMO` lolos cek HTTP 200 terjadwal; `VERIFIED` hanya via aksi admin (tidak pernah otomatis). | Deterministik = bisa di-test + diaudit, tidak ada klaim "AI audit". Siap diupgrade ke AI evaluation Phase 4 (tinggal tambah bobot, bukan ganti model). Pisah tegas `platform_verified` vs `developer_claimed` sesuai PRD §29. |
| 4 | Taksonomi kategori | **Kunci 8 kategori + slug immutable.** `saas, ai-app, web-app, automation, template, starter-kit, dashboard, business-tool`. Display name boleh diganti admin; **slug tidak boleh diganti** — bila harus ganti, wajib baris di tabel `category_redirects` (old_slug → new_slug, 301). | Slug stabil = SEO tidak pecah. 8 kategori memetakan 1:1 ke PRD §6 dan seed data. Redirect table disiapkan sekarang (murah) agar rename masa depan aman. |
| 5 | Pricing info | **Display-only, tanpa logika transaksi.** Field: `pricing_model: free \| paid-onetime \| subscription \| custom` + `price_text: string bebas (mis. "Mulai Rp150rb sekali bayar")`. Dilarang field `price_amount/currency/checkout_url`. | Buyer butuh ekspektasi harga, tapi angka terstruktur memancing scope creep checkout. Enum + teks bebas memberi sinyal cukup dan migrasi mulus ke tabel `licenses/transactions` Phase 2 (tinggal tambah relasi, bukan ubah field). |
| 6 | Moderasi & notifikasi | **In-app status di dashboard + email transaksional bawaan Supabase saja. SLA 2×24 jam. Tanpa SMTP custom / template email di v1.** | Status `draft/submitted/under_review/approved/published/rejected/suspended` selalu terbaca di dashboard = single source of truth. Email custom = beban deliverability; tunda ke P2 setelah funnel terbukti. Semua aksi admin tetap masuk `audit_logs`. |
| 7 | Media | **Screenshot = upload Storage (maks 5, @maks 2 MB, jpg/png/webp, optimasi Next Image). Video = embed URL YouTube saja (validasi https + allowlist domain youtube/youtu.be), tanpa upload video.** | Upload video mahal (storage + transcoding) dan tidak perlu untuk validasi discovery. Batas 5×2 MB menjaga Lighthouse ≥90. Nanti tambah provider video = tambah domain allowlist, bukan ubah pipeline. |
| 8 | Analytics & privasi | **First-party minimal, tanpa simpan IP mentah (hash + salt harian atau buang oktet terakhir), retensi event mentah 12 bulan lalu agregat, tanpa banner cookie consent di v1 (UU PDP: tidak ada PII/tracking lintas situs).** | Cukup untuk hitung 5 KPI PRD §27 tanpa risiko privasi. Desain tabel `product_views/contact_clicks` dengan kolom `ip_hash` nullable agar kebijakan pengetatan tinggal ubah writer, bukan skema. |
| 9 | Env & secret | **`.env.example` dikomit, `.env.local` gitignored; `NEXT_PUBLIC_SITE_URL` kanonisal wajib; bootstrap admin via script sekali pakai (`ADMIN_BOOTSTRAP_TOKEN`), bukan akun hardcode; service-role key hanya di server.** Owner menyediakan: Supabase URL + anon key + service-role (via secret manager, bukan chat), project ID, bucket `product-images/avatars`, domain kanonisal. | Pola 12-factor standar; mencegah kebocoran kredensial paling umum (service-role di browser). Script bootstrap terdokumentasi di README agar setup admin reproducible. |
| 10 | Versi Next.js/shadcn | **Pakai patch terbaru 16.x saat kickoff, lalu kunci exact di `package-lock.json` + catat di README + pin Node di Dockerfile. Patch = auto, minor/major = keputusan sadar + QA penuh.** | Menghormati PRD ("patch terbaru") sambil menjaga reproducible build. Tanpa pin, deploy prod tidak deterministik. |
| 11 | Bahasa UI | **Default Bahasa Indonesia; slug/URL/SEO metadata EN-friendly; istilah teknis (dashboard, deploy, starter kit) tetap EN.** Siapkan abstraksi copy (`lib/copy.ts` / dictionary) tapi **tanpa full i18n (next-intl) di v1**. | Pasar primer Indonesia (PRD header) → ID memaksimalkan trust buyer non-teknis. Abstraksi dini membuat bilingual Phase 2 murah tanpa membayar cost i18n-routing sekarang. |
| 12 | Comparison | **Architecture-ready saja di v1: desain `compare` service + state via URL (`/compare?a=slug1&b=slug2`), tanpa UI compare di navbar/catalog. UI compare 2–4 produk masuk P2 yang di-gate metrik.** | Mencegah scope creep (PRD §25 eksplisit non-gate) sambil menjaga URL-shareable design yang SEO-friendly untuk Phase 2. Tidak ada kode mati: hanya kontrak + test service, bukan halaman setengah jadi. |

### Urutan eksekusi yang disarankan (berdasar keputusan di atas)

P0 Foundation (auth email+Google, DB+RLS, design system, env/bootstrap) → P1 public (home, katalog, search FTS, detail, developer, kategori) → P1 developer+admin+verifikasi hybrid → P1 analytics minimal → P2 favorites + compare UI. Payment tetap P3/FUTURE.

---

## 6. Referensi PRD

- PRD lengkap: `README.md` (90 seksi). Sumber binding utama: §4 Non-Goals, §8 Status state machine, §42–§43 stack/arsitektur, §49–§52 auth/RLS/API, §65 URL, §69–§70 security, §78–§79 coding/repo standards, §81–§82 testing/DoD, §83 agent rules, §85 prioritas P0→P2.
- Dokumen ini tidak menambah fitur — hanya merumuskan arsitektur + standar + safety rules agar eksekusi berikutnya konsisten.
