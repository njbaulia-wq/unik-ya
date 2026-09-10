-- 0005_search_indexes.sql — full-text search Postgres (PRD §23, tanpa Elasticsearch).
-- search_vector dipelihara trigger; GIN index + btree untuk filter/sort umum.

ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION products_search_trigger_fn()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector := to_tsvector(
    'simple',
    coalesce(NEW.name, '') || ' ' ||
    coalesce(NEW.short_description, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(array_to_string(NEW.tech_stack, ' '), '') || ' ' ||
    coalesce(array_to_string(NEW.features, ' '), '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_search_trigger ON products;
CREATE TRIGGER products_search_trigger
  BEFORE INSERT OR UPDATE OF name, short_description, description, tech_stack, features
  ON products
  FOR EACH ROW EXECUTE FUNCTION products_search_trigger_fn();

-- Backfill untuk baris existing.
UPDATE products SET search_vector = to_tsvector(
  'simple',
  coalesce(name, '') || ' ' ||
  coalesce(short_description, '') || ' ' ||
  coalesce(description, '') || ' ' ||
  coalesce(array_to_string(tech_stack, ' '), '') || ' ' ||
  coalesce(array_to_string(features, ' '), '')
) WHERE search_vector IS NULL;

CREATE INDEX IF NOT EXISTS products_search_gin ON products USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS products_status_published_idx ON products (status, published_at DESC);
CREATE INDEX IF NOT EXISTS products_featured_idx ON products (featured) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS products_verification_idx ON products (verification_status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS products_type_idx ON products (product_type) WHERE status = 'published';
