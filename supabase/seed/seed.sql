-- seed.sql — data demo fiktif DevMarket (PRD §59–60). JELAS FIKTIF, bukan customer asli.
-- Idempoten: semua INSERT memakai ON CONFLICT DO NOTHING / guard anti-duplikat → aman dijalankan ulang.
-- Urutan: auth.users → profiles → developers → socials → categories → tags → products → versions/images/tags.
-- Cukup jalankan file ini sekali di Supabase SQL editor (service role / bypass RLS).

-- ============ AUTH USERS (10, UUID tetap, DEMO ONLY) ============
-- profiles.id adalah FK ke auth.users(id), jadi user auth harus ada dulu.
-- Password demo: devmarket-demo-123 (bcrypt). Email langsung terkonfirmasi.
-- JANGAN pakai pola ini untuk user asli — hanya untuk seed fiktif.
INSERT INTO auth.users
  (id, aud, role, email, encrypted_password, email_confirmed_at,
   raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at)
SELECT
  ('11111111-1111-1111-1111-0000000000' || lpad(e.n::text, 2, '0'))::uuid,
  'authenticated', 'authenticated',
  e.email,
  '$2b$12$ENfzF0h57Ve7JAT8HNEOkuyRkLcMbYuGW9zneRhwteGkTfH6PSStW',
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE, now(), now()
FROM (VALUES
  (1,'rizky@contoh.dev'),(2,'sinta@contoh.dev'),(3,'andi@contoh.dev'),
  (4,'maya@contoh.dev'),(5,'budi@contoh.dev'),(6,'dewi@contoh.dev'),
  (7,'fajar@contoh.dev'),(8,'intan@contoh.dev'),(9,'yoga@contoh.dev'),
  (10,'ratna@contoh.dev')
) AS e(n, email)
LEFT JOIN auth.users u ON u.id = ('11111111-1111-1111-1111-0000000000' || lpad(e.n::text, 2, '0'))::uuid
WHERE u.id IS NULL;

-- ============ PROFILES (10, UUID tetap) ============
INSERT INTO profiles (id, email, is_admin) VALUES
  ('11111111-1111-1111-1111-000000000001', 'rizky@contoh.dev', FALSE),
  ('11111111-1111-1111-1111-000000000002', 'sinta@contoh.dev', FALSE),
  ('11111111-1111-1111-1111-000000000003', 'andi@contoh.dev', FALSE),
  ('11111111-1111-1111-1111-000000000004', 'maya@contoh.dev', FALSE),
  ('11111111-1111-1111-1111-000000000005', 'budi@contoh.dev', FALSE),
  ('11111111-1111-1111-1111-000000000006', 'dewi@contoh.dev', FALSE),
  ('11111111-1111-1111-1111-000000000007', 'fajar@contoh.dev', FALSE),
  ('11111111-1111-1111-1111-000000000008', 'intan@contoh.dev', FALSE),
  ('11111111-1111-1111-1111-000000000009', 'yoga@contoh.dev', FALSE),
  ('11111111-1111-1111-1111-000000000010', 'ratna@contoh.dev', FALSE)
ON CONFLICT (id) DO NOTHING;

-- ============ DEVELOPERS (10) ============
INSERT INTO developers (id, profile_id, display_name, slug, bio, website_url, github_url, verified) VALUES
  ('22222222-2222-2222-2222-000000000001', '11111111-1111-1111-1111-000000000001', 'Rizky Pratama', 'rizky-pratama', 'Indie hacker fokus ke tools invoicing dan keuangan UMKM.', 'https://rizkypratama.contoh.dev', 'https://github.com/rizkypratama', TRUE),
  ('22222222-2222-2222-2222-000000000002', '11111111-1111-1111-1111-000000000002', 'Sinta Dewi', 'sinta-dewi', 'Frontend developer, pembuat template landing page dan design system.', 'https://sintadewi.contoh.dev', 'https://github.com/sintadewi', TRUE),
  ('22222222-2222-2222-2222-000000000003', '11111111-1111-1111-1111-000000000003', 'Andi Nugraha', 'andi-nugraha', 'Fullstack developer, spesialis inventory dan operasional gudang.', 'https://andinugraha.contoh.dev', 'https://github.com/andinugraha', TRUE),
  ('22222222-2222-2222-2222-000000000004', '11111111-1111-1111-1111-000000000004', 'Maya Putri', 'maya-putri', 'Builder AI apps dan knowledge base untuk tim support.', 'https://mayaputri.contoh.dev', 'https://github.com/mayaputri', TRUE),
  ('22222222-2222-2222-2222-000000000005', '11111111-1111-1111-1111-000000000005', 'Budi Santoso', 'budi-santoso', 'Backend developer, pembuat starter kit dan boilerplate SaaS.', 'https://budisantoso.contoh.dev', 'https://github.com/budisantoso', TRUE),
  ('22222222-2222-2222-2222-000000000006', '11111111-1111-1111-1111-000000000006', 'Dewi Lestari', 'dewi-lestari', 'Productivity hacker, automasi marketing dan operasional.', 'https://dewilestari.contoh.dev', 'https://github.com/dewilestari', FALSE),
  ('22222222-2222-2222-2222-000000000007', '11111111-1111-1111-1111-000000000007', 'Fajar Ramadhan', 'fajar-ramadhan', 'Freelancer booking system dan aplikasi reservasi.', 'https://fajarramadhan.contoh.dev', 'https://github.com/fajarramadhan', TRUE),
  ('22222222-2222-2222-2222-000000000008', '11111111-1111-1111-1111-000000000008', 'Intan Permata', 'intan-permata', 'Data enthusiast, pembuat dashboard analytics siap pakai.', 'https://intanpermata.contoh.dev', 'https://github.com/intanpermata', TRUE),
  ('22222222-2222-2222-2222-000000000009', '11111111-1111-1111-1111-000000000009', 'Yoga Saputra', 'yoga-saputra', 'Vibe coder, form builder dan internal tools cepat jadi.', 'https://yogasaputra.contoh.dev', 'https://github.com/yogasaputra', FALSE),
  ('22222222-2222-2222-2222-000000000010', '11111111-1111-1111-1111-000000000010', 'Ratna Sari', 'ratna-sari', 'CRM dan sales tools untuk agency dan tim kecil.', 'https://ratnasari.contoh.dev', 'https://github.com/ratnasari', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============ DEVELOPER SOCIALS (2 per developer) ============
INSERT INTO developers_socials (developer_id, channel, value, enabled) VALUES
  ('22222222-2222-2222-2222-000000000001', 'email', 'halo@rizkypratama.contoh.dev', TRUE),
  ('22222222-2222-2222-2222-000000000001', 'github', 'https://github.com/rizkypratama', TRUE),
  ('22222222-2222-2222-2222-000000000002', 'email', 'halo@sintadewi.contoh.dev', TRUE),
  ('22222222-2222-2222-2222-000000000002', 'website', 'https://sintadewi.contoh.dev', TRUE),
  ('22222222-2222-2222-2222-000000000003', 'email', 'halo@andinugraha.contoh.dev', TRUE),
  ('22222222-2222-2222-2222-000000000003', 'github', 'https://github.com/andinugraha', TRUE),
  ('22222222-2222-2222-2222-000000000004', 'email', 'halo@mayaputri.contoh.dev', TRUE),
  ('22222222-2222-2222-2222-000000000004', 'website', 'https://mayaputri.contoh.dev', TRUE),
  ('22222222-2222-2222-2222-000000000005', 'email', 'halo@budisantoso.contoh.dev', TRUE),
  ('22222222-2222-2222-2222-000000000005', 'github', 'https://github.com/budisantoso', TRUE),
  ('22222222-2222-2222-2222-000000000006', 'email', 'halo@dewilestari.contoh.dev', TRUE),
  ('22222222-2222-2222-2222-000000000006', 'telegram', 'https://t.me/dewilestari', FALSE),
  ('22222222-2222-2222-2222-000000000007', 'email', 'halo@fajarramadhan.contoh.dev', TRUE),
  ('22222222-2222-2222-2222-000000000007', 'website', 'https://fajarramadhan.contoh.dev', TRUE),
  ('22222222-2222-2222-2222-000000000008', 'email', 'halo@intanpermata.contoh.dev', TRUE),
  ('22222222-2222-2222-2222-000000000008', 'github', 'https://github.com/intanpermata', TRUE),
  ('22222222-2222-2222-2222-000000000009', 'email', 'halo@yogasaputra.contoh.dev', TRUE),
  ('22222222-2222-2222-2222-000000000009', 'github', 'https://github.com/yogasaputra', TRUE),
  ('22222222-2222-2222-2222-000000000010', 'email', 'halo@ratnasari.contoh.dev', TRUE),
  ('22222222-2222-2222-2222-000000000010', 'website', 'https://ratnasari.contoh.dev', TRUE)
ON CONFLICT (developer_id, channel) DO NOTHING;

-- ============ CATEGORIES (8, slug immutable — ARCHITECTURE.md §5 #4) ============
INSERT INTO categories (id, name, slug, description, sort_order) VALUES
  ('33333333-3333-3333-3333-000000000001', 'SaaS', 'saas', 'Software siap pakai model langganan untuk bisnis.', 1),
  ('33333333-3333-3333-3333-000000000002', 'AI App', 'ai-app', 'Aplikasi berbasis AI: chatbot, knowledge base, asisten.', 2),
  ('33333333-3333-3333-3333-000000000003', 'Web App', 'web-app', 'Aplikasi web siap deploy untuk kebutuhan operasional.', 3),
  ('33333333-3333-3333-3333-000000000004', 'Automation', 'automation', 'Automasi marketing, order, dan alur kerja bisnis.', 4),
  ('33333333-3333-3333-3333-000000000005', 'Template', 'template', 'Template website, landing page, dan design system.', 5),
  ('33333333-3333-3333-3333-000000000006', 'Starter Kit', 'starter-kit', 'Boilerplate, source code, dan fondasi project developer.', 6),
  ('33333333-3333-3333-3333-000000000007', 'Dashboard', 'dashboard', 'Dashboard admin, analytics, dan monitoring.', 7),
  ('33333333-3333-3333-3333-000000000008', 'Business Tool', 'business-tool', 'Kasir, CRM, booking, inventori, dan tools operasional.', 8)
ON CONFLICT (id) DO NOTHING;

-- ============ TAGS (32) ============
INSERT INTO tags (name, slug) VALUES
  ('Next.js', 'next-js'),
  ('Supabase', 'supabase'),
  ('TypeScript', 'typescript'),
  ('Tailwind', 'tailwind'),
  ('PostgreSQL', 'postgresql'),
  ('SaaS', 'saas-tag'),
  ('AI', 'ai'),
  ('Chatbot', 'chatbot'),
  ('WhatsApp', 'whatsapp'),
  ('POS', 'pos'),
  ('Inventory', 'inventory'),
  ('CRM', 'crm'),
  ('Booking', 'booking'),
  ('Analytics', 'analytics'),
  ('Dashboard', 'dashboard-tag'),
  ('Template', 'template-tag'),
  ('Landing Page', 'landing-page'),
  ('Boilerplate', 'boilerplate'),
  ('Starter Kit', 'starter-kit-tag'),
  ('Automation', 'automation-tag'),
  ('Marketing', 'marketing'),
  ('Accounting', 'accounting'),
  ('Form Builder', 'form-builder'),
  ('Helpdesk', 'helpdesk'),
  ('HR', 'hr'),
  ('E-commerce', 'e-commerce'),
  ('Reservasi', 'reservasi'),
  ('Keuangan', 'keuangan'),
  ('Gudang', 'gudang'),
  ('Klinik', 'klinik'),
  ('Sekolah', 'sekolah'),
  ('UMKM', 'umkm')
ON CONFLICT (slug) DO NOTHING;

-- ============ PRODUCTS (24, published 22 + draft 2) ============
-- Kolom: developer_id, category_id, name, slug, short_description, description,
-- product_type, status, pricing_model, price_text, demo_url, documentation_url,
-- repository_url, tech_stack, features, version, license_type,
-- verification_status, verification_score, featured, published_at
INSERT INTO products (
  developer_id, category_id, name, slug, short_description, description,
  product_type, status, pricing_model, price_text, demo_url, documentation_url,
  repository_url, tech_stack, features, version, license_type,
  verification_status, verification_score, featured, published_at
) VALUES
  ('22222222-2222-2222-2222-000000000001', '33333333-3333-3333-3333-000000000001', 'InvoiceFlow', 'invoiceflow', 'Invoice dan manajemen pembayaran untuk freelancer dan UMKM.', 'InvoiceFlow adalah aplikasi SaaS untuk membuat invoice profesional, melacak status pembayaran, dan mengingatkan klien yang telat bayar. Dibuat untuk freelancer dan UMKM Indonesia yang butuh pencatatan rapi tanpa software akuntansi yang berat. Mendukung multi-usaha, pajak, dan ekspor PDF.', 'saas', 'published', 'subscription', 'Mulai Rp49rb/bulan', 'https://demo.devmarket.id/invoiceflow', 'https://docs.devmarket.id/invoiceflow', 'https://github.com/rizkypratama/invoiceflow', '{Next.js,Supabase,TypeScript}', '{Buat invoice PDF, Pengingat otomatis, Multi-usaha, Laporan bulanan}', '1.4.0', 'commercial', 'verified', 92, TRUE, now() - INTERVAL '20 days'),
  ('22222222-2222-2222-2222-000000000003', '33333333-3333-3333-3333-000000000008', 'StockPilot', 'stockpilot', 'Stok dan inventori gudang dengan barcode scanner.', 'StockPilot membantu toko dan gudang kecil melacak stok masuk-keluar, stok minimum, dan mutasi antar lokasi. Dilengkapi pemindai barcode via kamera HP dan laporan stok opname. Cocok untuk UMKM retail dan distributor.', 'business_tool', 'published', 'paid_onetime', 'Rp499rb sekali bayar', 'https://demo.devmarket.id/stockpilot', 'https://docs.devmarket.id/stockpilot', 'https://github.com/andinugraha/stockpilot', '{Next.js,PostgreSQL,TypeScript}', '{Barcode scanner, Stok minimum alert, Mutasi lokasi, Stok opname}', '2.1.0', 'commercial', 'verified', 88, TRUE, now() - INTERVAL '18 days'),
  ('22222222-2222-2222-2222-000000000007', '33333333-3333-3333-3333-000000000008', 'BookingOS', 'bookingos', 'Sistem reservasi online untuk klinik, salon, dan studio.', 'BookingOS adalah sistem booking online lengkap dengan kalender slot, pengingat WhatsApp otomatis, dan halaman booking publik per cabang. Mengurangi no-show dan telepon manual. Termasuk panel admin dan peran staf.', 'saas', 'published', 'subscription', 'Mulai Rp79rb/bulan', 'https://demo.devmarket.id/bookingos', 'https://docs.devmarket.id/bookingos', 'https://github.com/fajarramadhan/bookingos', '{Next.js,Supabase,Tailwind}', '{Kalender slot, Pengingat WhatsApp, Multi-cabang, Peran staf}', '1.2.0', 'commercial', 'verified', 90, TRUE, now() - INTERVAL '15 days'),
  ('22222222-2222-2222-2222-000000000010', '33333333-3333-3333-3333-000000000001', 'LeadDesk', 'leaddesk', 'CRM sederhana untuk agency dan tim sales kecil.', 'LeadDesk merapikan pipeline penjualan: kanban deal, riwayat kontak, pengingat follow-up, dan laporan konversi. Tanpa kompleksitas CRM enterprise. Impor CSV dan multi-pipeline untuk beberapa layanan agency.', 'saas', 'published', 'subscription', 'Mulai Rp59rb/bulan', 'https://demo.devmarket.id/leaddesk', 'https://docs.devmarket.id/leaddesk', 'https://github.com/ratnasari/leaddesk', '{Next.js,Supabase,TypeScript}', '{Kanban pipeline, Follow-up reminder, Impor CSV, Laporan konversi}', '1.0.0', 'commercial', 'verified', 85, FALSE, now() - INTERVAL '12 days'),
  ('22222222-2222-2222-2222-000000000009', '33333333-3333-3333-3333-000000000003', 'FormCraft', 'formcraft', 'Form builder dengan notifikasi WhatsApp dan spreadsheet.', 'FormCraft membuat formulir pendaftaran, order, dan survei dalam hitungan menit. Setiap respons masuk ke dashboard dan diteruskan ke WhatsApp atau email. Mendukung upload file, logika tampil-sembunyi, dan ekspor CSV.', 'web_app', 'published', 'free', 'Gratis untuk 3 form', 'https://demo.devmarket.id/formcraft', 'https://docs.devmarket.id/formcraft', 'https://github.com/yogasaputra/formcraft', '{Next.js,Tailwind}', '{Drag-drop builder, Notifikasi WhatsApp, Ekspor CSV, Upload file}', '0.9.0', 'mit', 'pending', 72, FALSE, now() - INTERVAL '10 days'),
  ('22222222-2222-2222-2222-000000000004', '33333333-3333-3333-3333-000000000003', 'SupportHub', 'supporthub', 'Helpdesk dan tiket support dengan basis pengetahuan.', 'SupportHub menggabungkan tiket support, artikel bantuan, dan widget chat situs dalam satu aplikasi. SLA per prioritas, assignment agen, dan laporan waktu respons membantu tim kecil terlihat profesional.', 'web_app', 'published', 'paid_onetime', 'Rp749rb sekali bayar', 'https://demo.devmarket.id/supporthub', 'https://docs.devmarket.id/supporthub', 'https://github.com/mayaputri/supporthub', '{Next.js,PostgreSQL}', '{Tiket + SLA, Basis pengetahuan, Widget chat, Laporan respons}', '1.1.0', 'commercial', 'verified', 84, FALSE, now() - INTERVAL '9 days'),
  ('22222222-2222-2222-2222-000000000004', '33333333-3333-3333-3333-000000000002', 'PustakaAI Knowledge Base', 'pustaka-ai', 'Basis pengetahuan AI untuk dokumen tim support.', 'PustakaAI mengubah dokumen PDF dan halaman bantuan menjadi chatbot yang bisa ditanya karyawan maupun pelanggan. Retrieval dengan sitasi sumber sehingga jawaban bisa diverifikasi. Deploy sebagai widget atau halaman mandiri.', 'ai_app', 'published', 'subscription', 'Mulai Rp99rb/bulan', 'https://demo.devmarket.id/pustaka-ai', 'https://docs.devmarket.id/pustaka-ai', 'https://github.com/mayaputri/pustaka-ai', '{Next.js,TypeScript,AI}', '{Ingest PDF, Chat dengan sitasi, Widget embed, Multi-bahasa}', '0.8.0', 'commercial', 'pending', 78, FALSE, now() - INTERVAL '8 days'),
  ('22222222-2222-2222-2222-000000000008', '33333333-3333-3333-3333-000000000007', 'Analytics Pro', 'analytics-pro', 'Dashboard analytics dengan grafik dan ekspor laporan.', 'Analytics Pro adalah template dashboard analytics dengan grafik interaktif, filter tanggal, perbandingan periode, dan ekspor PDF. Tinggal sambungkan ke database Supabase/Postgres Anda dan sesuaikan query.', 'dashboard', 'published', 'paid_onetime', 'Rp349rb sekali bayar', 'https://demo.devmarket.id/analytics-pro', 'https://docs.devmarket.id/analytics-pro', 'https://github.com/intanpermata/analytics-pro', '{Next.js,TypeScript,Tailwind}', '{12 jenis grafik, Filter tanggal, Ekspor PDF, Mode gelap}', '1.3.0', 'commercial', 'verified', 87, FALSE, now() - INTERVAL '7 days'),
  ('22222222-2222-2222-2222-000000000005', '33333333-3333-3333-3333-000000000006', 'CRM Starter', 'crm-starter', 'Boilerplate CRM Next.js + Supabase siap kembangkan.', 'CRM Starter adalah fondasi kode untuk membangun CRM: auth, manajemen kontak, pipeline kanban, dan audit log sudah jadi. Struktur modular monolith yang rapi dengan RLS bawaan. Hemat 4-6 minggu development awal.', 'starter_kit', 'published', 'paid_onetime', 'Rp299rb sekali bayar', 'https://demo.devmarket.id/crm-starter', 'https://docs.devmarket.id/crm-starter', 'https://github.com/budisantoso/crm-starter', '{Next.js,Supabase,TypeScript}', '{Auth + RLS, Kanban pipeline, Audit log, Seed data}', '2.0.0', 'commercial', 'verified', 91, TRUE, now() - INTERVAL '6 days'),
  ('22222222-2222-2222-2222-000000000006', '33333333-3333-3333-3333-000000000004', 'WhatsApp Order Manager', 'wa-order-manager', 'Terima order via WhatsApp, kelola di satu dashboard.', 'WA Order Manager membuat link katalog yang bisa di-share, pelanggan memesan lewat WhatsApp dengan format otomatis. Semua order tercatat di dashboard dengan status proses-kirim-selesai. Ideal untuk kuliner dan fashion online.', 'automation', 'published', 'subscription', 'Mulai Rp39rb/bulan', 'https://demo.devmarket.id/wa-order-manager', 'https://docs.devmarket.id/wa-order-manager', 'https://github.com/dewilestari/wa-order-manager', '{Next.js,WhatsApp}', '{Katalog share-link, Format order otomatis, Status order, Rekap harian}', '1.0.0', 'commercial', 'pending', 75, FALSE, now() - INTERVAL '5 days'),
  ('22222222-2222-2222-2222-000000000001', '33333333-3333-3333-3333-000000000008', 'KasirKu POS', 'kasirku-pos', 'Point of sales offline-first untuk warung dan toko.', 'KasirKu adalah aplikasi kasir yang tetap jalan tanpa internet dan sinkron saat online kembali. Mendukung printer thermal, multi-kasir, diskon, dan laporan harian. Data tersimpan lokal dulu lalu sinkron ke cloud.', 'business_tool', 'published', 'paid_onetime', 'Rp399rb sekali bayar', 'https://demo.devmarket.id/kasirku-pos', 'https://docs.devmarket.id/kasirku-pos', 'https://github.com/rizkypratama/kasirku-pos', '{Next.js,PostgreSQL}', '{Offline-first, Printer thermal, Multi-kasir, Laporan harian}', '1.5.0', 'commercial', 'verified', 89, FALSE, now() - INTERVAL '22 days'),
  ('22222222-2222-2222-2222-000000000008', '33333333-3333-3333-3333-000000000007', 'AbsensiHub', 'absensi-hub', 'Absensi GPS + foto untuk tim lapangan.', 'AbsensiHub mencatat kehadiran berbasis lokasi GPS dengan verifikasi foto selfie. Mendukung multi-shift, lembur, dan rekap payroll. Panel HR bisa approve pengajuan izin dan cuti dalam satu tempat.', 'dashboard', 'published', 'subscription', 'Mulai Rp25rb/user/bulan', 'https://demo.devmarket.id/absensi-hub', 'https://docs.devmarket.id/absensi-hub', 'https://github.com/intanpermata/absensi-hub', '{Next.js,Supabase}', '{Absensi GPS, Verifikasi foto, Multi-shift, Rekap payroll}', '1.1.0', 'commercial', 'verified', 83, FALSE, now() - INTERVAL '21 days'),
  ('22222222-2222-2222-2222-000000000001', '33333333-3333-3333-3333-000000000003', 'SuratFlow', 'suratflow', 'Pembuat surat resmi dengan nomor otomatis dan arsip.', 'SuratFlow mempercepat administrasi: template kop surat, penomoran otomatis per jenis surat, tanda tangan digital, dan arsip pencarian cepat. Cocok untuk RT/RW, sekolah, dan kantor desa.', 'web_app', 'published', 'free', 'Gratis untuk 50 surat/bulan', 'https://demo.devmarket.id/suratflow', 'https://docs.devmarket.id/suratflow', 'https://github.com/rizkypratama/suratflow', '{Next.js,Tailwind}', '{Template kop, Nomor otomatis, Arsip cari, Ekspor PDF}', '1.0.0', 'mit', 'pending', 70, FALSE, now() - INTERVAL '4 days'),
  ('22222222-2222-2222-2222-000000000007', '33333333-3333-3333-3333-000000000003', 'ParkirOS', 'parkiros', 'Karcis parkir digital dengan QR dan laporan shift.', 'ParkirOS menggantikan karcis kertas: QR per kendaraan, tarif per jam dinamis, dan laporan per shift operator. Berjalan di HP Android biasa dengan printer bluetooth. Sudah dipakai di 12 titik parkir simulasi.', 'web_app', 'published', 'paid_onetime', 'Rp599rb sekali bayar', 'https://demo.devmarket.id/parkiros', 'https://docs.devmarket.id/parkiros', 'https://github.com/fajarramadhan/parkiros', '{Next.js,PostgreSQL}', '{QR karcis, Tarif dinamis, Laporan shift, Printer bluetooth}', '1.2.0', 'commercial', 'verified', 86, FALSE, now() - INTERVAL '25 days'),
  ('22222222-2222-2222-2222-000000000007', '33333333-3333-3333-3333-000000000008', 'KlinikQueue', 'klinik-queue', 'Antrian klinik dengan display nomor dan estimasi tunggu.', 'KlinikQueue mengatur antrian poli: pendaftaran online, display nomor real-time, dan estimasi waktu tunggu per pasien. Mengurangi kerumunan loket dan telepon konfirmasi. Termasuk rekam kunjungan dasar.', 'business_tool', 'published', 'subscription', 'Mulai Rp69rb/bulan', 'https://demo.devmarket.id/klinik-queue', 'https://docs.devmarket.id/klinik-queue', 'https://github.com/fajarramadhan/klinik-queue', '{Next.js,Supabase}', '{Display real-time, Estimasi tunggu, Multi-poli, Rekam kunjungan}', '1.0.0', 'commercial', 'pending', 74, FALSE, now() - INTERVAL '3 days'),
  ('22222222-2222-2222-2222-000000000005', '33333333-3333-3333-3333-000000000006', 'PPDB Online Kit', 'ppdb-kit', 'Source code sistem PPDB sekolah siap deploy.', 'PPDB Kit adalah paket source code lengkap untuk penerimaan siswa baru: formulir bertahap, upload berkas, verifikasi admin, pengumuman kelulusan, dan dashboard kuota. Sudah dipakai pola ini di 3 sekolah percontohan.', 'starter_kit', 'published', 'paid_onetime', 'Rp449rb sekali bayar', 'https://demo.devmarket.id/ppdb-kit', 'https://docs.devmarket.id/ppdb-kit', 'https://github.com/budisantoso/ppdb-kit', '{Next.js,Supabase,TypeScript}', '{Formulir bertahap, Verifikasi berkas, Pengumuman, Dashboard kuota}', '1.6.0', 'commercial', 'verified', 90, FALSE, now() - INTERVAL '28 days'),
  ('22222222-2222-2222-2222-000000000003', '33333333-3333-3333-3333-000000000008', 'WarungPOS Lite', 'warungpos-lite', 'Kasir super ringan untuk warung kelontong.', 'WarungPOS Lite hanya butuh HP kentang: tambah barang, jual, dan lihat untung hari ini. Tanpa login rumit, tanpa printer wajib. Upgrade ke StockPilot saat usaha membesar dengan impor data satu klik.', 'business_tool', 'published', 'free', 'Gratis selamanya', 'https://demo.devmarket.id/warungpos-lite', 'https://docs.devmarket.id/warungpos-lite', 'https://github.com/andinugraha/warungpos-lite', '{Next.js,Tailwind}', '{Mode offline, Super ringan, Laporan untung, Impor ke StockPilot}', '1.0.0', 'mit', 'verified', 81, FALSE, now() - INTERVAL '30 days'),
  ('22222222-2222-2222-2222-000000000010', '33333333-3333-3333-3333-000000000003', 'KontrakKerja', 'kontrakkerja', 'Template dan tracking kontrak kerja freelancer.', 'KontrakKerja menyediakan template kontrak Indonesia-Inggris, tanda tangan digital, dan pengingat milestone pembayaran. Setiap kontrak punya link verifikasi agar klien bisa cek keaslian dokumen.', 'web_app', 'published', 'paid_onetime', 'Rp149rb sekali bayar', 'https://demo.devmarket.id/kontrakkerja', 'https://docs.devmarket.id/kontrakkerja', 'https://github.com/ratnasari/kontrakkerja', '{Next.js,Tailwind}', '{Template bilingual, Tanda tangan digital, Link verifikasi, Reminder milestone}', '1.0.0', 'commercial', 'pending', 73, FALSE, now() - INTERVAL '2 days'),
  ('22222222-2222-2222-2222-000000000007', '33333333-3333-3333-3333-000000000003', 'EventTix', 'eventtix', 'Ticketing acara dengan scan QR dan multi-tier.', 'EventTix menjual tiket acara: multi-tier harga, kode promo, scan QR di pintu via HP, dan laporan penjualan real-time. Tanpa antre cetak gelang. Refund manual via kontak penyelenggara di v1.', 'web_app', 'published', 'custom', 'Hubungi developer untuk harga', 'https://demo.devmarket.id/eventtix', 'https://docs.devmarket.id/eventtix', 'https://github.com/fajarramadhan/eventtix', '{Next.js,Supabase}', '{Multi-tier, Kode promo, Scan QR, Laporan real-time}', '1.3.0', 'commercial', 'verified', 88, FALSE, now() - INTERVAL '32 days'),
  ('22222222-2222-2222-2222-000000000001', '33333333-3333-3333-3333-000000000008', 'SekolahPay', 'sekolahpay', 'Rekap SPP dan tagihan sekolah anti ribet.', 'SekolahPay mencatat tagihan SPP per siswa, status lunas-menunggak, dan kuitansi otomatis. Bendahara bisa broadcast pengingat via template WhatsApp. Laporan tunggakan per kelas dalam satu klik.', 'business_tool', 'published', 'subscription', 'Mulai Rp45rb/bulan', 'https://demo.devmarket.id/sekolahpay', 'https://docs.devmarket.id/sekolahpay', 'https://github.com/rizkypratama/sekolahpay', '{Next.js,PostgreSQL}', '{Tagihan per siswa, Kuitansi otomatis, Broadcast WA, Laporan tunggakan}', '1.1.0', 'commercial', 'verified', 82, FALSE, now() - INTERVAL '35 days'),
  ('22222222-2222-2222-2222-000000000006', '33333333-3333-3333-3333-000000000003', 'LaundryTrack', 'laundrytrack', 'Tracking laundry kiloan dengan nota digital.', 'LaundryTrack memberi nota digital per pelanggan dengan estimasi selesai dan status cuci-setrika-siap. Pelanggan cek status via link tanpa install aplikasi. Rekap omzet harian untuk owner.', 'web_app', 'published', 'paid_onetime', 'Rp249rb sekali bayar', 'https://demo.devmarket.id/laundrytrack', 'https://docs.devmarket.id/laundrytrack', 'https://github.com/dewilestari/laundrytrack', '{Next.js,Tailwind}', '{Nota digital, Tracking link, Estimasi selesai, Rekap omzet}', '1.0.0', 'commercial', 'pending', 71, FALSE, now() - INTERVAL '1 day'),
  ('22222222-2222-2222-2222-000000000009', '33333333-3333-3333-3333-000000000003', 'RentalArmada', 'rentalarmada', 'Jadwal sewa mobil dengan kalender ketersediaan.', 'RentalArmada mengatur kalender ketersediaan unit, hitung harga harian-mingguan, dan catat denda keterlambatan. Supir dan pelanggan dapat link jadwal masing-masing. Termasuk checklist kondisi unit.', 'web_app', 'draft', 'custom', 'Hubungi developer untuk harga', 'https://demo.devmarket.id/rentalarmada', 'https://docs.devmarket.id/rentalarmada', 'https://github.com/yogasaputra/rentalarmada', '{Next.js,Tailwind}', '{Kalender unit, Hitung harga, Denda otomatis, Checklist unit}', '0.5.0', 'commercial', 'unverified', 0, FALSE, NULL),
  ('22222222-2222-2222-2222-000000000003', '33333333-3333-3333-3333-000000000008', 'ApotekStok', 'apotekstok', 'Stok obat dengan pengingat kedaluwarsa.', 'ApotekStok melacak batch dan tanggal kedaluwarsa tiap obat, memberi peringatan 90-30-7 hari sebelum expired. FIFO otomatis saat penjualan dan laporan mutasi untuk audit. Dibuat bersama masukan asisten apoteker.', 'business_tool', 'published', 'paid_onetime', 'Rp549rb sekali bayar', 'https://demo.devmarket.id/apotekstok', 'https://docs.devmarket.id/apotekstok', 'https://github.com/andinugraha/apotekstok', '{Next.js,PostgreSQL,TypeScript}', '{Expired alert, FIFO otomatis, Batch tracking, Laporan audit}', '1.4.0', 'commercial', 'verified', 93, FALSE, now() - INTERVAL '40 days'),
  ('22222222-2222-2222-2222-000000000002', '33333333-3333-3333-3333-000000000005', 'PortoKit Designer', 'portokit', 'Template portofolio untuk desainer dan developer.', 'PortoKit adalah template portofolio satu halaman dengan studi kasus, galeri, testimoni, dan formulir kontak. Skor Lighthouse 95+ out of the box. Ganti konten via satu file config tanpa sentuh komponen.', 'template', 'draft', 'free', 'Gratis', 'https://demo.devmarket.id/portokit', 'https://docs.devmarket.id/portokit', 'https://github.com/sintadewi/portokit', '{Next.js,Tailwind}', '{Studi kasus, Galeri, Testimoni, Satu-file config}', '1.0.0', 'mit', 'unverified', 0, FALSE, NULL)
ON CONFLICT (slug) DO NOTHING;

-- ============ PRODUCT VERSIONS (1 per produk, 24) ============
INSERT INTO product_versions (product_id, version, changelog)
SELECT id, version, 'Rilis awal seed demo.' FROM products
ON CONFLICT (product_id, version) DO NOTHING;

-- ============ PRODUCT IMAGES (1 cover per produk, 24; idempoten via hapus seed lama) ============
DELETE FROM product_images WHERE storage_path LIKE 'seed/%';
INSERT INTO product_images (product_id, storage_path, alt_text, sort_order)
SELECT id, 'seed/' || slug || '/cover.svg', name || ' — tampilan utama', 0 FROM products;

-- ============ PRODUCT TAGS (2 per produk) ============
INSERT INTO product_tags (product_id, tag_id)
SELECT p.id, t.id FROM products p
JOIN tags t ON t.slug IN ('next-js', 'supabase')
ON CONFLICT DO NOTHING;
INSERT INTO product_tags (product_id, tag_id)
SELECT p.id, t.id FROM products p
JOIN tags t ON t.slug = 'umkm'
WHERE p.slug IN ('invoiceflow', 'kasirku-pos', 'warungpos-lite', 'wa-order-manager', 'stockpilot')
ON CONFLICT DO NOTHING;
INSERT INTO product_tags (product_id, tag_id)
SELECT p.id, t.id FROM products p
JOIN tags t ON t.slug = 'ai'
WHERE p.slug IN ('pustaka-ai')
ON CONFLICT DO NOTHING;
