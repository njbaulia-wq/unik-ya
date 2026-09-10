-- 0001_core.sql — tabel inti DevMarket (PRD §44–48, keputusan ARCHITECTURE.md §5).
-- NON-GOALS: tidak ada tabel orders/payments/transactions/licenses/subscriptions (PRD §66).
-- Reversible: down script di bawah (komentar). Jalankan dengan Supabase SQL editor / CLI.

-- ============ ENUMS ============
DO $$ BEGIN CREATE TYPE product_status AS ENUM (
  'draft','submitted','under_review','approved','published','rejected','suspended','archived'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE pricing_model AS ENUM (
  'free','paid_onetime','subscription','custom'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE verification_state AS ENUM (
  'unverified','pending','verified'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ PROFILES (1:1 dengan auth.users) ============
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ DEVELOPERS ============
CREATE TABLE IF NOT EXISTS developers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 80),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  bio TEXT NOT NULL DEFAULT '',
  avatar_url TEXT CHECK (avatar_url IS NULL OR avatar_url LIKE 'https://%'),
  website_url TEXT CHECK (website_url IS NULL OR website_url LIKE 'https://%'),
  github_url TEXT CHECK (github_url IS NULL OR github_url LIKE 'https://%'),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_id)
);
CREATE INDEX IF NOT EXISTS developers_profile_idx ON developers(profile_id);
CREATE INDEX IF NOT EXISTS developers_slug_idx ON developers(slug);

-- ============ DEVELOPER SOCIALS / CONTACT CHANNELS ============
CREATE TABLE IF NOT EXISTS developers_socials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp','email','website','github','telegram','linkedin')),
  value TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(developer_id, channel)
);

-- ============ CATEGORIES (slug immutable; rename via category_redirects) ============
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS category_redirects (
  old_slug TEXT PRIMARY KEY,
  new_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ TAGS ============
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

-- ============ PRODUCTS ============
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 3 AND 120),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  short_description TEXT NOT NULL CHECK (char_length(short_description) BETWEEN 10 AND 200),
  description TEXT NOT NULL CHECK (char_length(description) >= 50),
  product_type TEXT NOT NULL CHECK (product_type IN (
    'saas','web_app','ai_app','business_tool','internal_tool','dashboard',
    'starter_kit','boilerplate','source_code','ui_kit','components',
    'automation','template','landing_page','design_system')),
  status product_status NOT NULL DEFAULT 'draft',
  pricing_model pricing_model NOT NULL DEFAULT 'custom',
  price_text TEXT,
  demo_url TEXT CHECK (demo_url IS NULL OR demo_url LIKE 'https://%'),
  documentation_url TEXT CHECK (documentation_url IS NULL OR documentation_url LIKE 'https://%'),
  repository_url TEXT CHECK (repository_url IS NULL OR repository_url LIKE 'https://%'),
  video_url TEXT CHECK (video_url IS NULL OR video_url LIKE 'https://%'),
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  features TEXT[] NOT NULL DEFAULT '{}',
  version TEXT NOT NULL DEFAULT '0.1.0',
  license_type TEXT NOT NULL DEFAULT 'custom',
  verification_status verification_state NOT NULL DEFAULT 'unverified',
  verification_score INT NOT NULL DEFAULT 0 CHECK (verification_score BETWEEN 0 AND 100),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS products_slug_idx ON products(slug);
CREATE INDEX IF NOT EXISTS products_status_idx ON products(status);
CREATE INDEX IF NOT EXISTS products_developer_idx ON products(developer_id);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_published_idx ON products(published_at DESC) WHERE status = 'published';

-- ============ PRODUCT TAGS (dibuat setelah products agar FK valid) ============
CREATE TABLE IF NOT EXISTS product_tags (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

-- ============ PRODUCT VERSIONS ============
CREATE TABLE IF NOT EXISTS product_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  changelog TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, version)
);

-- ============ PRODUCT IMAGES (metadata saja; binary di Storage) ============
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS product_images_product_idx ON product_images(product_id);

-- ============ FAVORITES ============
CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

-- ============ ANALYTICS (tanpa IP mentah — kolom ip_hash nullable, T15) ============
CREATE TABLE IF NOT EXISTS product_views (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS product_views_product_time_idx ON product_views(product_id, created_at DESC);

CREATE TABLE IF NOT EXISTS contact_clicks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_clicks_product_time_idx ON contact_clicks(product_id, created_at DESC);

-- ============ DOWN (rollback, jalankan manual bila perlu) ============
-- DROP TABLE IF EXISTS contact_clicks, product_views, favorites, product_images,
--   product_versions, products, product_tags, tags, category_redirects,
--   categories, developers_socials, developers, profiles;
-- DROP TYPE IF EXISTS verification_state, pricing_model, product_status;
