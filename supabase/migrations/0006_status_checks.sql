-- 0006_status_checks.sql — jaring kedua state machine di DB (PRD §8).
-- Service layer menegakkan hal yang sama; trigger ini mencegah update liar
-- yang lolos dari client ber-RLS. Slug immutable demi stabilitas SEO.

CREATE OR REPLACE FUNCTION products_status_guard()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  pair TEXT := OLD.status::TEXT || '>' || NEW.status::TEXT;
BEGIN
  IF OLD.slug <> NEW.slug THEN
    RAISE EXCEPTION 'Slug produk tidak boleh diubah.';
  END IF;
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  IF pair NOT IN (
    'draft>submitted',
    'submitted>under_review',
    'submitted>draft',
    'under_review>approved',
    'under_review>rejected',
    'under_review>draft',
    'approved>published',
    'rejected>draft',
    'published>suspended',
    'published>archived',
    'suspended>published',
    'suspended>archived'
  ) THEN
    RAISE EXCEPTION 'Transisi status % tidak diizinkan.', pair;
  END IF;
  IF NEW.status = 'published' AND OLD.status <> 'published' THEN
    NEW.published_at := COALESCE(NEW.published_at, now());
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_status_guard_trigger ON products;
CREATE TRIGGER products_status_guard_trigger
  BEFORE UPDATE OF status, slug ON products
  FOR EACH ROW EXECUTE FUNCTION products_status_guard();
