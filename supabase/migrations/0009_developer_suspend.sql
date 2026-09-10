-- 0009_developer_suspend.sql — suspend creator bermasalah (PRD §22).
-- Publik (anon) tidak melihat developer suspended beserta produknya;
-- admin tetap bisa (via is_admin()).

ALTER TABLE developers ADD COLUMN IF NOT EXISTS suspended BOOLEAN NOT NULL DEFAULT FALSE;

DROP POLICY IF EXISTS developers_public_read ON developers;
CREATE POLICY developers_public_read ON developers FOR SELECT
  USING (suspended = FALSE OR public.is_admin());

DROP POLICY IF EXISTS products_public_read ON products;
CREATE POLICY products_public_read ON products FOR SELECT
  USING (
    (
      status = 'published'
      AND EXISTS (SELECT 1 FROM developers d WHERE d.id = products.developer_id AND d.suspended = FALSE)
    )
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM developers d
      WHERE d.id = products.developer_id AND d.profile_id = auth.uid()
    )
  );
