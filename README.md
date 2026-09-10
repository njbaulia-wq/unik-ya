

# PRD — Marketplace Produk Digital & Software Developer

**Document Status:** Ready for Development
**Version:** 1.0
**Date:** September 2026
**Product Type:** Web Marketplace / Product Discovery Platform
**Primary Market:** Indonesia
**Initial Model:** Discovery + Contact Developer
**Payment:** OUT OF SCOPE untuk v1
**Deployment:** Production-ready MVP
**Architecture:** Modular Monolith

---

# 1. Product Overview

## 1.1 Product Name

Nama kerja:

**DevMarket**

Nama dapat diganti kemudian.

## 1.2 Product Vision

Membangun marketplace modern yang mempertemukan:

**developer / creator yang memiliki produk digital**

dengan:

**orang, bisnis, founder, dan developer yang membutuhkan produk tersebut.**

Masalah yang ingin diselesaikan:

> Banyak developer sekarang dapat membuat website, SaaS, template, automation, dashboard, AI app, dan source code dengan sangat cepat menggunakan AI coding/vibe coding, tetapi mereka tidak tahu bagaimana mendistribusikan dan menjual produk tersebut.

Di sisi lain:

> Banyak calon pembeli membutuhkan software siap pakai tetapi tidak tahu harus mencari di mana, sulit membandingkan kualitas, dan tidak tahu apakah produk yang ditemukan benar-benar dapat dipercaya.

Platform ini menjadi **jembatan antara supply dan demand**.

---

# 2. Problem Statement

## 2.1 Masalah Developer

Developer sering memiliki:

* website yang sudah jadi
* template
* SaaS starter
* micro-SaaS
* dashboard
* internal tools
* AI apps
* automation
* source code
* business tools

tetapi:

* tidak punya distribution channel
* tidak mengerti marketing
* tidak bisa membuat product listing yang bagus
* tidak tahu positioning
* tidak tahu target pasar
* produknya hanya berada di GitHub
* proyek berhenti setelah selesai dibuat
* sulit mendapatkan customer pertama

## 2.2 Masalah Buyer

Buyer sering:

* tidak tahu software apa yang cocok
* tidak tahu kualitas produknya
* sulit mencari software niche
* harus mencari melalui Google/GitHub/social media
* tidak tahu siapa developernya
* takut membeli produk yang tidak terawat
* sulit membandingkan beberapa produk

## 2.3 Opportunity

AI-assisted development membuat software semakin cepat dibuat. Stack Overflow 2025 mencatat 84% developer menggunakan atau berencana menggunakan AI dalam development, sementara kepercayaan terhadap output AI masih menjadi masalah. ([Next.js][2])

Artinya semakin banyak software dapat dibuat.

Problem baru:

> **distribution, trust, discoverability, dan validation.**

Platform ini harus menyelesaikan empat hal tersebut.

---

# 3. Product Goal

## Primary Goals

### G1 — Product Discovery

Memudahkan buyer menemukan produk software yang relevan.

### G2 — Developer Distribution

Memberikan channel bagi developer untuk mempublikasikan dan mempromosikan produknya.

### G3 — Trust

Membantu buyer mengetahui kualitas dasar sebuah produk.

### G4 — Lead Generation

Menghubungkan buyer secara langsung dengan developer.

### G5 — Foundation for Future Marketplace

Arsitektur harus memungkinkan tahap berikutnya:

* payment
* escrow
* license
* deployment
* subscription
* hosting
* acquisition

tanpa perlu rewrite total.

---

# 4. Non-Goals — WAJIB

Fitur berikut **JANGAN dibuat pada versi 1**:

* checkout
* payment gateway
* QRIS
* virtual account
* e-wallet
* escrow
* automatic payout
* platform wallet
* refund
* order system
* invoice payment
* commission calculation
* seller payout
* one-click deploy
* automatic hosting
* arbitrary repository execution
* marketplace transaction processing

Pada v1:

> **Platform hanya mempertemukan buyer dan developer.**

CTA utama:

**Hubungi Developer**

bukan:

**Beli Sekarang**

---

# 5. Target Users

## Persona A — Developer / Creator

Contoh:

* freelancer
* indie hacker
* AI builder
* vibe coder
* web developer
* startup founder
* template creator

Tujuan:

> “Saya punya produk yang sudah jadi. Saya ingin mendapatkan pembeli.”

---

## Persona B — Business Buyer

Contoh:

* UMKM
* agency
* perusahaan kecil
* owner
* marketing
* operations
* founder

Tujuan:

> “Saya membutuhkan software yang sudah jadi untuk menyelesaikan kebutuhan bisnis.”

---

## Persona C — Developer Buyer

Developer yang ingin membeli:

* starter kit
* boilerplate
* dashboard
* SaaS
* components
* automation
* source code

---

## Persona D — Admin / Curator

Bertugas:

* review produk
* validasi listing
* moderation
* feature product
* manage category
* manage creator
* menghapus produk bermasalah

---

# 6. Core Product Model

Produk dibagi menjadi beberapa kategori.

## Category

### Software

* SaaS
* Web App
* AI App
* Business Tool
* Internal Tool
* Dashboard

### Developer

* Starter Kit
* Boilerplate
* Source Code
* UI Kit
* Components

### Business

* Automation
* CRM
* Accounting
* Inventory
* Booking
* Marketing
* Productivity

### Digital

* Template
* Website Template
* Landing Page
* Design System

---

# 7. Product Listing

Setiap developer dapat membuat listing.

Field minimum:

```text
Product Name
Slug
Short Description
Long Description
Category
Subcategory
Product Type
Pricing Information
Demo URL
Repository / Documentation URL
Technology Stack
Features
Screenshots
Video Demo
Developer
Contact Information
Support Information
Version
Last Updated
License Type
Status
```

---

# 8. Product Status

Gunakan state machine:

```text
draft
↓
submitted
↓
under_review
↓
approved
↓
published
```

Rejection:

```text
under_review
↓
rejected
```

Published product dapat:

```text
published
↓
suspended
```

atau:

```text
published
↓
archived
```

---

# 9. Verification System

Ini merupakan salah satu fitur utama.

Setiap produk memiliki:

## Product Trust / Quality Score

Contoh:

```text
Product Quality

Build              ✓
Live Demo          ✓
Documentation      ✓
Mobile             ✓
SEO                ✓
Repository         ✓
License            ✓

Quality Score
92 / 100
```

Untuk v1 **jangan mengklaim security audit profesional**.

Gunakan istilah:

**Platform Verification**

bukan:

**Security Certified**

---

# 10. Verification Badge

Badge:

### VERIFIED

Artinya platform sudah memeriksa listing berdasarkan checklist yang ditentukan admin.

### LIVE DEMO

Produk mempunyai demo aktif.

### UPDATED

Produk baru diperbarui.

### POPULAR

Berdasarkan metrik internal.

### NEW

Produk baru.

Jangan menggunakan terlalu banyak badge.

---

# 11. Buyer Experience

Homepage harus menjawab tiga pertanyaan dalam beberapa detik:

### Apa yang bisa saya temukan?

### Apakah produk tersebut bagus?

### Bagaimana saya menghubungi developernya?

---

# 12. Homepage

Struktur:

```text
HEADER
│
├── Logo
├── Marketplace
├── Categories
├── Developers
├── How It Works
├── Search
└── Login / Join
```

Hero:

```text
Software yang sudah jadi.
Temukan. Bandingkan. Hubungi pembuatnya.

Discover useful software, templates,
SaaS and developer products made by independent builders.
```

Search besar:

```text
Cari software, SaaS, template, AI app...
```

CTA:

**Jelajahi Produk**

Secondary:

**Publikasikan Produk**

---

# 13. Homepage Sections

Urutan:

### Hero

### Featured Products

### Popular Categories

### New Products

### Verified Products

### Developers

### How It Works

### Why This Marketplace

### CTA

Jangan membuat homepage penuh section hanya demi terlihat “modern”.

Whitespace harus cukup.

---

# 14. Product Card

Card harus sederhana.

Contoh:

```text
┌──────────────────────────────┐
│       PRODUCT IMAGE          │
│                              │
│  VERIFIED                    │
├──────────────────────────────┤
│ InvoiceFlow                  │
│ Invoice & payment management │
│                              │
│ Next.js · Supabase           │
│                              │
│ ★ 4.8       Updated 2d ago  │
│                              │
│ Explore →                    │
└──────────────────────────────┘
```

Jangan menaruh terlalu banyak informasi.

---

# 15. Product Detail Page

URL:

```text
/products/[slug]
```

Layout:

```text
Breadcrumb

Product title
Short description
Verification
Creator

[Live Demo]
[Hubungi Developer]

Screenshots / Preview

Overview

Features

Use Cases

Technology

Requirements

Documentation

Version

Changelog

Developer

Similar Products
```

---

# 16. CTA Developer

Karena pembayaran belum ada:

### Tombol utama:

**Hubungi Developer**

### Tombol sekunder:

**Live Demo**

Kontak dapat berupa:

* WhatsApp
* Email
* Telegram
* Website
* GitHub
* LinkedIn

Kontak hanya tampil sesuai yang dipilih developer.

Jangan memaksa developer memberikan seluruh kontak.

---

# 17. Contact Flow

Saat buyer klik:

**Hubungi Developer**

tampilkan:

```text
Cara menghubungi developer

WhatsApp
Email
Website
GitHub
```

Kemudian:

**Buka WhatsApp**

atau

**Kirim Email**

Platform belum perlu membuat internal chat.

---

# 18. Developer Profile

URL:

```text
/developers/[slug]
```

Tampilkan:

```text
Avatar
Name
Bio
Location optional
Website
GitHub
Products
Verified products
Joined date
```

Metrics:

```text
Products
12

Verified
8

Updated recently
5
```

Jangan menampilkan revenue developer pada v1.

---

# 19. Developer Dashboard

Route:

```text
/dashboard
```

Menu:

```text
Overview
Products
Create Product
Profile
Contacts
Settings
```

Dashboard tidak perlu terlalu kompleks.

---

# 20. Create Product

Wizard sederhana.

## Step 1

Basic Information

## Step 2

Product Details

## Step 3

Media

## Step 4

Contact

## Step 5

Review & Submit

---

# 21. Product Form

Required:

```text
Name *
Short description *
Category *
Product type *
Description *
Features *
```

Recommended:

```text
Demo URL
Documentation
Technology
Version
License
Screenshots
Video
```

Contact:

```text
WhatsApp
Email
Website
GitHub
Telegram
```

---

# 22. Admin Dashboard

Route:

```text
/admin
```

Sections:

```text
Overview
Products
Pending Reviews
Creators
Categories
Reports
Settings
```

Admin dapat:

### Product

* approve
* reject
* suspend
* feature
* archive
* edit metadata

### Creator

* verify
* suspend
* edit profile

---

# 23. Search

Search harus menjadi fitur inti.

Search across:

```text
Product name
Description
Category
Technology
Features
Use cases
Developer
Tags
```

MVP:

**PostgreSQL full-text search + indexed fields.**

Belum perlu Elasticsearch.

---

# 24. Filters

Filter:

```text
Category
Product Type
Technology
Verified
Has Demo
Recently Updated
```

Sorting:

```text
Relevance
Newest
Recently Updated
Popular
```

---

# 25. Product Comparison

Boleh disiapkan arsitekturnya, tetapi **jangan wajib untuk MVP**.

Roadmap:

```text
Compare 2–4 products
```

---

# 26. Favorites

User login dapat:

**Save Product**

Route:

```text
/dashboard/favorites
```

Ini menjadi salah satu signal demand produk.

---

# 27. Analytics

Platform internal harus mencatat:

```text
product_view
demo_click
developer_profile_view
contact_click
search
favorite
```

Jangan hanya mengandalkan pageview.

KPI penting:

### Product Views

### Demo Click Rate

### Contact Developer Rate

### Favorite Rate

### Search-to-Product Rate

---

# 28. Marketplace KPI

Primary KPI:

## Contact Conversion Rate

```text
Contact clicks
÷
Product views
```

Secondary:

```text
Product activation
Creator activation
Published products
Verified products
Returning buyers
Search success rate
```

Karena v1 belum mempunyai pembayaran, **contact conversion adalah proxy utama commercial intent**.

---

# 29. Trust Model

Platform harus memisahkan:

### Platform Verified

dari:

### Developer Claimed

Contoh:

```text
✓ Platform Verified
```

berarti admin/platform telah memeriksa.

Sedangkan:

```text
Developer provided:
Next.js
Supabase
TypeScript
```

tetap dianggap informasi dari developer.

Jangan mengklaim informasi sebagai fakta terverifikasi kalau belum diperiksa.

---

# 30. Design Direction

Ini bagian **WAJIB DIPATUHI**.

Referensi visual dari `panendekat.my.id` hanya digunakan untuk memahami konteks marketplace digital, **bukan untuk dicopy**. Situs tersebut saat ini memakai katalog dengan card produk, pencarian, kategori, dan elemen kurasi. ([Panendekat][1])

Target visual:

# Professional Product Marketplace

Referensi karakter:

**Linear**

**Vercel**

**Stripe**

**Raycast**

**Arc**

**Notion**

tetapi jangan menyalin desain mereka.

---

# 31. Anti AI-Slop Design Rules

JANGAN:

* gradient berlebihan
* purple/blue AI gradient everywhere
* glassmorphism berlebihan
* giant glowing blob
* floating 3D objects
* terlalu banyak rounded pill
* semua elemen dibungkus card
* excessive shadows
* emoji sebagai UI icon
* random illustrations
* huge hero kosong
* typography terlalu besar
* border radius ekstrem
* dashboard yang terlihat seperti template AI
* 20 warna berbeda
* animation berlebihan

---

# 32. Visual Language

Gunakan:

### Typography

Modern sans-serif untuk interface.

Heading memiliki karakter kuat tetapi tidak berlebihan.

### Colors

Base:

```text
Neutral / white / off-white
Dark text
Subtle gray
```

Accent hanya satu.

Jangan membuat rainbow UI.

### Border

Halus.

### Shadow

Sangat ringan atau gunakan border.

### Radius

Moderate.

Jangan semua menjadi pill.

---

# 33. Layout

Desktop:

```text
max-width: 1200–1280px
```

Gunakan grid yang konsisten.

Product grid:

```text
3 columns desktop
2 tablet
1 mobile
```

Jangan membuat card terlalu sempit.

---

# 34. Responsive

Harus benar-benar responsive.

Breakpoint minimum:

```text
mobile
tablet
desktop
large desktop
```

Mobile navigation harus dirancang khusus.

**Jangan sekadar mengecilkan desktop.**

---

# 35. Mobile UX

Prioritas:

```text
Search
Categories
Product
CTA
Contact
```

Product card harus tetap terbaca.

CTA:

**Hubungi Developer**

harus mudah diakses tanpa mengganggu layar.

---

# 36. Accessibility

Minimum:

* semantic HTML
* keyboard navigation
* visible focus state
* proper labels
* alt text
* contrast
* button semantics
* form errors
* accessible dialogs

Target:

**WCAG 2.2 AA secara praktis pada komponen utama.**

---

# 37. SEO

Setiap produk harus memiliki SEO metadata.

Dynamic:

```text
title
description
canonical
Open Graph
Twitter card
```

Product:

```text
/products/invoiceflow
```

harus dapat di-index.

Creator:

```text
/developers/name
```

juga.

Category:

```text
/categories/saas
/categories/ai
/categories/templates
```

---

# 38. Structured Data

Gunakan structured data yang relevan, misalnya:

```text
SoftwareApplication
Product
BreadcrumbList
Organization / Person
```

Jangan membuat schema markup palsu.

---

# 39. Sitemap

Automatic:

```text
/sitemap.xml
```

Harus memasukkan:

```text
products
categories
developers
```

yang public dan published.

---

# 40. robots.txt

Buat:

```text
/robots.txt
```

Jangan index:

```text
/admin
/dashboard
/authenticated pages
internal APIs
```

---

# 41. Performance

Target:

### Lighthouse

```text
Performance >= 90
Accessibility >= 90
Best Practices >= 90
SEO >= 95
```

Target harus realistis berdasarkan halaman, device, dan third-party scripts.

Optimalkan:

* image sizes
* lazy loading
* font loading
* server rendering
* caching
* database indexes
* unnecessary JavaScript

Next.js memiliki App Router, Server Components, caching, image optimization, metadata, route handlers dan tooling terkait production yang cocok untuk pola ini. ([Next.js][2])

---

# 42. Technical Architecture

## Required Stack

```text
Next.js 16
TypeScript
App Router
Tailwind CSS
shadcn/ui
Supabase
PostgreSQL
```

Next.js saat ini mendokumentasikan 16.3.4 sebagai latest version; gunakan patch terbaru yang tersedia saat development dimulai, bukan memaksakan patch lama. ([Next.js][2])

---

# 43. Architecture Style

Gunakan:

# Modular Monolith

Jangan membuat microservices.

Struktur:

```text
app/
components/
features/
lib/
supabase/
types/
```

Modul:

```text
auth
products
developers
categories
search
favorites
analytics
admin
```

---

# 44. Database

PostgreSQL melalui Supabase.

Supabase menggunakan PostgreSQL dan menyediakan Auth yang terintegrasi dengan database; RLS dapat digunakan sebagai authorization layer. ([Supabase][3])

---

# 45. Database Tables

Minimum:

```text
profiles
developers
products
product_versions
categories
tags
product_tags
product_images
favorites
product_views
contact_clicks
developers_socials
```

Optional:

```text
reports
audit_logs
featured_products
```

---

# 46. Product Table

```text
id
developer_id
category_id
name
slug
short_description
description
product_type
status
demo_url
documentation_url
version
license_type
verification_status
verification_score
featured
published_at
created_at
updated_at
```

---

# 47. Developer Table

```text
id
profile_id
display_name
slug
bio
avatar_url
website_url
github_url
verified
created_at
updated_at
```

---

# 48. Product Image

```text
id
product_id
storage_path
alt_text
sort_order
created_at
```

Gunakan Supabase Storage untuk media. Storage Supabase terintegrasi dengan Postgres/RLS sehingga access policy dapat dibatasi sesuai kebutuhan. ([Supabase][4])

---

# 49. Auth

MVP:

```text
Email/password
Magic link optional
Google login optional
```

Role:

```text
visitor
buyer
developer
admin
```

Satu account dapat:

```text
buyer + developer
```

Jangan membuat sistem akun yang rumit.

---

# 50. Authorization

WAJIB menggunakan server-side authorization.

Developer:

```text
can create own products
can edit own products
can submit own products
can manage own profile
```

Tidak boleh:

```text
edit another developer product
access admin
modify verification
```

Admin:

```text
moderation
categories
developers
products
```

---

# 51. Supabase RLS

Semua tabel public yang terpapar API harus memiliki RLS dan policy yang sesuai. Dokumentasi Supabase saat ini secara eksplisit menyarankan RLS pada setiap tabel dalam exposed schema dan pengujian allow/deny policy. ([Supabase][5])

Implementasikan:

```text
public can read published products
developer can manage own products
developer can manage own profile
user can manage own favorites
admin can manage everything
```

Jangan mengandalkan frontend hiding untuk security.

---

# 52. API / Server Actions

Gunakan server actions atau route handlers sesuai kebutuhan.

Contoh:

```text
createProduct
updateProduct
submitProduct
approveProduct
rejectProduct
saveFavorite
trackProductView
trackContactClick
```

Jangan membuat API layer berlebihan.

---

# 53. File Upload

Image upload:

```text
product-images
avatars
```

Rules:

* MIME validation
* size limits
* filename sanitization
* authorization
* image optimization

Jangan menyimpan binary image di PostgreSQL.

---

# 54. Contact Privacy

Developer menentukan sendiri kontak publik.

Contoh:

```text
WhatsApp: enabled
Email: enabled
GitHub: enabled
Telegram: disabled
```

Jangan expose data sensitif.

---

# 55. Moderation

Product yang baru dibuat:

```text
draft
```

Setelah submit:

```text
under_review
```

Admin harus approve sebelum:

```text
published
```

Tidak boleh creator langsung mem-publish.

---

# 56. Broken Product Handling

Admin bisa:

```text
Suspend
```

Jika:

* demo mati
* malware suspicion
* misleading description
* copyright complaint
* broken product
* prohibited content

---

# 57. Error States

Semua halaman harus mempunyai:

### Loading

### Empty

### Error

### Not Found

### Unauthorized

Contoh:

```text
Produk belum ditemukan.

Produk mungkin telah dihapus atau belum dipublikasikan.
```

Bukan:

```text
Oops something went wrong!!!
```

---

# 58. Empty State

Contoh:

```text
Belum ada produk.

Jadilah developer pertama yang mempublikasikan
software di kategori ini.

[Publikasikan Produk]
```

---

# 59. Seed Data

Development harus memiliki seed data realistis.

Minimal:

```text
10 developers
20–30 products
8 categories
30+ tags
```

Gunakan produk demo fiktif.

Jangan memakai data palsu yang terlihat seperti customer asli.

---

# 60. Demo Product Data

Produk contoh:

```text
InvoiceFlow
StockPilot
BookingOS
LeadDesk
FormCraft
SupportHub
AI Knowledge Base
Analytics Pro
CRM Starter
WhatsApp Order Manager
```

Setiap product harus mempunyai:

* thumbnail
* description
* stack
* features
* demo link dummy yang valid secara routing
* creator

---

# 61. Design QA

Setelah coding selesai:

## Jangan hanya menjalankan build.

Agent wajib melakukan visual review.

Periksa:

```text
homepage
catalog
product detail
developer profile
dashboard
create product
admin
mobile
tablet
desktop
```

Cari:

* alignment
* spacing
* typography
* overflow
* inconsistent component
* excessive cards
* poor hierarchy
* awkward empty space
* broken responsive state

---

# 62. Design Quality Gate

Sebelum dianggap selesai:

### Tidak boleh terlihat seperti:

* AI-generated dashboard
* generic SaaS boilerplate
* template marketplace clone
* Bootstrap default
* shadcn demo site

Harus terasa seperti:

> **produk startup yang benar-benar dirancang.**

---

# 63. Interaction Design

Gunakan animasi kecil.

Contoh:

* hover card
* button transition
* navigation transition
* modal transition

Durasi kira-kira:

```text
150–250ms
```

Hindari:

* parallax berat
* infinite animation
* bouncing
* flashy background

---

# 64. Search UX

Search harus:

```text
fast
forgiving
clear
```

Empty result:

```text
Tidak menemukan "x".

Coba:
"SaaS"
"inventory"
"AI"
"Next.js"
```

---

# 65. URL Structure

Gunakan clean URLs:

```text
/
 /products
 /products/[slug]
 /categories/[slug]
 /developers
 /developers/[slug]
 /how-it-works
 /login
 /dashboard
 /admin
```

Jangan menggunakan:

```text
/product?id=123
```

untuk public SEO pages.

---

# 66. Future Architecture Compatibility

Walaupun payment tidak dibuat sekarang, data model harus memungkinkan:

```text
product
license
transaction
subscription
deployment
order
```

ditambahkan nanti.

**Tetapi jangan membuat tabel payment/order palsu hanya untuk future-proofing.**

Buat architecture extensible, bukan over-engineered.

---

# 67. Future Roadmap

## Phase 1

Discovery:

```text
Marketplace
Search
Categories
Product listing
Developer profiles
Contact developer
Verification
Admin
Analytics
```

## Phase 2

Commerce:

```text
Payment
License
Checkout
Platform commission
Payout
```

## Phase 3

Deployment:

```text
One-click deploy
Managed hosting
Automatic updates
```

## Phase 4

AI:

```text
AI product matching
AI listing generation
AI product evaluation
AI buyer assistant
```

## Phase 5

Business acquisition:

```text
Micro-SaaS marketplace
Revenue verification
SaaS acquisition
```

---

# 68. Monetization — FUTURE ONLY

Jangan implementasikan sekarang.

Potensi:

```text
Transaction fee
Featured listing
Developer subscription
Managed hosting
Deployment
Lead fee
Premium verification
Enterprise listing
Acquisition fee
```

---

# 69. Security Requirements

Minimum:

* secure auth
* server-side validation
* RLS
* role authorization
* CSRF-safe mutation strategy
* rate limiting untuk public endpoints
* input sanitization
* file validation
* safe external links
* no secret exposure
* no service-role key in browser
* audit trail admin actions

---

# 70. External URL Security

Developer dapat memasukkan:

```text
demo_url
website_url
github_url
```

URL harus divalidasi.

Allowed protocols:

```text
https://
```

Jangan menerima arbitrary:

```text
javascript:
data:
```

---

# 71. Analytics Privacy

Gunakan analytics secara minimal.

Jangan mengumpulkan data pribadi berlebihan.

Event cukup:

```text
view
search
favorite
demo_click
contact_click
```

---

# 72. Acceptance Criteria — Homepage

Homepage dianggap selesai apabila:

* dapat dibuka tanpa login
* responsive
* hero jelas
* search berfungsi
* categories berfungsi
* featured products tampil
* product card konsisten
* navigation berfungsi
* SEO metadata ada
* tidak ada broken image
* tidak ada layout overflow

---

# 73. Acceptance Criteria — Product

Product page dianggap selesai apabila:

* slug bekerja
* informasi produk lengkap
* screenshot tampil
* stack tampil
* creator tampil
* verified status benar
* Live Demo bekerja
* Contact Developer bekerja
* similar products tampil
* mobile layout baik
* metadata SEO benar

---

# 74. Acceptance Criteria — Developer

Developer dapat:

```text
register
login
create profile
create product
save draft
submit product
edit product
manage contacts
```

Developer **tidak dapat** publish langsung.

---

# 75. Acceptance Criteria — Admin

Admin dapat:

```text
login
view pending products
approve
reject
suspend
feature
manage categories
manage developers
```

Semua admin mutation dicatat.

---

# 76. Acceptance Criteria — Security

Test:

```text
anonymous cannot edit product
developer A cannot edit product B
buyer A cannot access private buyer data
non-admin cannot access admin
service credentials never sent to browser
RLS policies tested
```

Supabase sendiri merekomendasikan pengujian allow/deny untuk operasi RLS; jadikan ini bagian dari acceptance gate. ([Supabase][5])

---

# 77. Acceptance Criteria — Performance

Target:

```text
Fast initial load
No unnecessary client components
Optimized images
Indexed database search fields
No N+1 queries
Responsive on mid-range mobile
```

---

# 78. Coding Standards

WAJIB:

```text
TypeScript strict
Reusable components
No duplicated business logic
No giant components
No inline secret
No hard-coded user-specific data
Clear naming
Small focused modules
```

Prefer:

```text
server components by default
client components only when necessary
```

---

# 79. Repository Standards

Structure:

```text
src/
  app/
  components/
  features/
  lib/
  types/

supabase/
  migrations/
  seed/

public/
```

Gunakan:

```text
.env.local
.env.example
```

Jangan commit secret.

---

# 80. Documentation

README harus menjelaskan:

```text
Project overview
Tech stack
Local setup
Environment variables
Supabase setup
Database migration
Seed data
Development
Testing
Build
Deployment
Admin setup
```

---

# 81. Testing

Minimum:

### Unit

Business logic.

### Integration

Database/auth flows.

### E2E

Critical paths:

```text
visitor → search → product
developer → create product → submit
admin → approve
buyer → contact developer
```

Gunakan Playwright untuk E2E.

---

# 82. Definition of Done

Project **belum selesai** hanya karena:

```text
npm run build
```

berhasil.

Definition of Done:

```text
✓ build passes
✓ typecheck passes
✓ lint passes
✓ tests pass
✓ database migrations work
✓ RLS tested
✓ auth tested
✓ responsive tested
✓ SEO checked
✓ accessibility checked
✓ no console errors
✓ no broken links
✓ no secret exposed
✓ visual QA completed
```

---

# 83. Agent Development Rules

Ini bagian yang sangat penting untuk AI coding agent.

## RULE 1

**Jangan mengubah requirement inti tanpa alasan teknis kuat.**

## RULE 2

**Jangan membuat payment pada phase 1.**

## RULE 3

**Jangan membuat fake checkout.**

## RULE 4

**CTA commercial utama adalah Contact Developer.**

## RULE 5

**Jangan membuat microservices.**

## RULE 6

**Jangan menambahkan dependencies tanpa alasan.**

## RULE 7

**Jangan menggunakan placeholder UI jika data sebenarnya tersedia.**

## RULE 8

**Jangan membuat design generik AI.**

## RULE 9

**Prioritaskan accessibility, performance, SEO dan responsive.**

## RULE 10

**Gunakan server-side authorization.**

## RULE 11

**Jangan percaya input dari client.**

## RULE 12

**Setiap fitur harus mempunyai loading/error/empty state.**

## RULE 13

**Jangan berhenti pada build success; lakukan functional + visual QA.**

---

# 84. Design Instruction Untuk Agent

Gunakan instruksi berikut secara eksplisit:

> Design this as a premium, editorial-style software marketplace rather than a generic AI-generated SaaS dashboard.
>
> Prioritize typography, whitespace, alignment, grid discipline, visual hierarchy, product screenshots, and content quality.
>
> Avoid excessive rounded cards, excessive gradients, glassmorphism, giant hero sections, decorative blobs, meaningless animations, neon accents, excessive shadows, and AI-slop visual patterns.
>
> Every visual element must have a clear UX purpose.
>
> Use restrained color, strong typography, subtle borders, consistent spacing, and precise alignment.
>
> The interface should feel trustworthy enough for a professional software marketplace and simple enough for non-technical business buyers.
>
> Do not clone Panendekat. Use it only as a contextual reference for the marketplace concept.
>
> The final result should look intentionally designed by a professional product designer, not generated from a generic dashboard template.

---

# 85. Prioritas Implementasi

AI agent harus mengerjakan dalam urutan:

### P0 — Foundation

```text
Next.js
Supabase
Auth
Database
RLS
Design system
```

### P1 — Public Marketplace

```text
Homepage
Catalog
Search
Categories
Product Detail
Developer Profile
```

### P1 — Developer

```text
Dashboard
Create Product
Edit Product
Submit
Profile
Contacts
```

### P1 — Admin

```text
Review
Approve
Reject
Suspend
Feature
```

### P1 — Analytics

```text
Product view
Demo click
Contact click
```

### P2

```text
Favorites
Advanced filtering
Better discovery
```

Payment tetap:

# P3 / FUTURE

---

# 86. Final Product Flow

## Developer

```text
Register
   ↓
Create profile
   ↓
Add product
   ↓
Upload screenshots
   ↓
Add demo
   ↓
Add contact
   ↓
Submit
   ↓
Admin review
   ↓
Verified
   ↓
Published
   ↓
Buyer discovers product
   ↓
Buyer contacts developer
```

## Buyer

```text
Landing
 ↓
Search
 ↓
Filter
 ↓
Product
 ↓
Compare / explore
 ↓
Live Demo
 ↓
Developer
 ↓
Hubungi Developer
```

---

# 87. Core Value Proposition

Website harus dapat menjelaskan produk dengan sangat sederhana:

> **Temukan software yang sudah jadi dari developer independen.**

Untuk developer:

> **Publikasikan produkmu. Biarkan calon pengguna menemukannya.**

Untuk buyer:

> **Temukan, cek, dan hubungi pembuat software secara langsung.**

---

# 88. Success Criteria MVP

MVP dianggap berhasil ketika:

```text
≥ 20 published products
≥ 10 developers
≥ 100 product views
≥ 20 demo clicks
≥ 10 contact clicks
```

Ini bukan target bisnis final, hanya validasi awal.

Metric terpenting:

# **Apakah product discovery menghasilkan hubungan nyata antara buyer dan developer?**

---

# 89. Prinsip Produk

Pegang prinsip:

> **Marketplace first. Transaction later.**

dan:

> **Trust before checkout.**

serta:

> **Distribution is the product.**

---

# 90. Instruksi Akhir Untuk AI Agent

Berikan prompt berikut setelah PRD:

```text
Implement this PRD as a production-quality MVP.

Do not start coding immediately.

First:
1. Inspect the repository.
2. Inspect the current architecture.
3. Identify what already exists.
4. Create an implementation plan mapped to the PRD.
5. Identify ambiguities, technical risks, and missing environment variables.
6. Then implement incrementally.

Important constraints:

- Next.js 16 App Router
- TypeScript
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Tailwind CSS
- shadcn/ui
- Modular monolith
- No microservices
- No payment system
- No checkout
- No escrow
- No order/payment workflow
- Main commercial CTA = Contact Developer
- Product publishing requires admin approval
- Implement RLS and server-side authorization
- Do not expose service-role credentials
- Use SEO-friendly public routes
- Build responsive mobile/tablet/desktop layouts
- Perform functional, security, accessibility, performance and visual QA

DO NOT produce generic AI-slop UI.

The product must feel like a serious professional software marketplace.

Do not blindly copy any reference website.
Use references only for contextual inspiration.
Create an original design system with disciplined typography, spacing, hierarchy and layout.

Before declaring the task complete:

1. Run typecheck.
2. Run lint.
3. Run unit/integration tests.
4. Run E2E tests.
5. Test Supabase RLS.
6. Test authentication and role permissions.
7. Test all critical user journeys.
8. Check every public page for SEO metadata.
9. Check responsive layouts.
10. Check console errors.
11. Check broken links.
12. Perform visual QA at desktop/tablet/mobile widths.
13. Fix all discovered issues.
14. Provide a concise final implementation report.

Do not declare success merely because the build passes.
```

---

## Keputusan desain yang saya rekomendasikan dari screenshot kamu

Screenshot Panendekat yang kamu kirim **sudah mempunyai dasar yang benar**: katalog, kategori, search, product cards, dan struktur marketplace. Namun untuk platform baru saya akan **menaikkan levelnya**, bukan sekadar mempercantik CSS. Situs referensinya sendiri sekarang masih berfokus pada katalog digital dan proses toko/manual order. ([Panendekat][1])

Saya akan mengubah mental model menjadi:

```text
PANENDEKAT STYLE
catalog
   ↓
product
   ↓
buy
```

menjadi:

```text
PLATFORM BARU

DISCOVER
   ↓
SEARCH
   ↓
COMPARE
   ↓
TRUST / VERIFIED
   ↓
LIVE DEMO
   ↓
DEVELOPER
   ↓
CONTACT
```

**Itulah MVP yang menurut saya paling tepat.**

Pembayaran sengaja kita tunda. Ini membuat tahap pertama **jauh lebih sederhana dan cepat diluncurkan**, tetapi database dan arsitekturnya tetap siap ditambahkan commerce nantinya. Bahkan fitur Supabase Auth, RLS, Storage, dan PostgreSQL yang kita pakai sekarang sudah cocok untuk fondasi tersebut. ([Supabase][5])

Yang paling penting, jangan mengejar “website marketplace yang kelihatan keren”. Kita mengejar:

> **tempat pertama yang dicari orang ketika mereka punya kebutuhan software dan ingin menemukan produk yang sudah dibuat developer lain.**

Itulah yang nantinya bisa berkembang dari **catalog → marketplace → deployment platform → software distribution platform → SaaS acquisition platform**.

[1]: https://panendekat.my.id/ "Panendekat Store — Marketplace Digital Kurasi"
[2]: https://nextjs.org/docs?utm_source=chatgpt.com "Next.js Docs | Next.js"
[3]: https://supabase.com/docs/guides/auth?utm_source=chatgpt.com "Auth | Supabase Docs"
[4]: https://supabase.com/docs/guides/storage/security/access-control?utm_source=chatgpt.com "Storage Access Control | Supabase Docs"
[5]: https://supabase.com/docs/guides/database/postgres/row-level-security?utm_source=chatgpt.com "Row Level Security | Supabase Docs"
