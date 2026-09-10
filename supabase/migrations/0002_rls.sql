-- 0002_rls.sql — Row Level Security (PRD §51, ARCHITECTURE.md §3.2).
-- Prinsip: public baca published; developer kelola miliknya; user kelola
-- favorites-nya; admin full via cek server-side. Jangan andalkan frontend hiding.
-- Pelanggaran RLS di app layer dipetakan ke FORBIDDEN/UNAUTHORIZED generik.

-- Helper: cek admin dari profiles. SECURITY DEFINER agar bisa dibaca policy.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$;

-- Helper: id developer milik user login (NULL bila belum jadi developer).
CREATE OR REPLACE FUNCTION public.own_developer_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id FROM public.developers WHERE profile_id = auth.uid() LIMIT 1;
$$;

-- ============ ENABLE RLS ============
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE developers_socials ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_clicks ENABLE ROW LEVEL SECURITY;

-- ============ PROFILES ============
CREATE POLICY profiles_read_own ON profiles FOR SELECT USING (id = auth.uid() OR public.is_admin());
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (id = auth.uid());

-- ============ DEVELOPERS ============
CREATE POLICY developers_public_read ON developers FOR SELECT USING (TRUE);
CREATE POLICY developers_insert_own ON developers FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY developers_update_own ON developers FOR UPDATE
  USING (profile_id = auth.uid() OR public.is_admin());
CREATE POLICY developers_delete_admin ON developers FOR DELETE USING (public.is_admin());

-- ============ DEVELOPERS SOCIALS ============
CREATE POLICY socials_public_read ON developers_socials FOR SELECT USING (TRUE);
CREATE POLICY socials_manage_own ON developers_socials FOR ALL
  USING (developer_id = public.own_developer_id() OR public.is_admin())
  WITH CHECK (developer_id = public.own_developer_id() OR public.is_admin());

-- ============ CATEGORIES / REDIRECTS / TAGS (publik baca; tulis admin) ============
CREATE POLICY categories_public_read ON categories FOR SELECT USING (TRUE);
CREATE POLICY categories_admin_write ON categories FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY redirects_public_read ON category_redirects FOR SELECT USING (TRUE);
CREATE POLICY redirects_admin_write ON category_redirects FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY tags_public_read ON tags FOR SELECT USING (TRUE);
CREATE POLICY tags_admin_write ON tags FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY product_tags_public_read ON product_tags FOR SELECT USING (TRUE);
CREATE POLICY product_tags_manage ON product_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN developers d ON d.id = p.developer_id
      WHERE p.id = product_tags.product_id
        AND (d.profile_id = auth.uid() OR public.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products p
      JOIN developers d ON d.id = p.developer_id
      WHERE p.id = product_tags.product_id
        AND (d.profile_id = auth.uid() OR public.is_admin())
    )
  );

-- ============ PRODUCTS ============
-- Publik hanya boleh baca yang published.
CREATE POLICY products_public_read ON products FOR SELECT
  USING (status = 'published' OR public.is_admin() OR EXISTS (
    SELECT 1 FROM developers d
    WHERE d.id = products.developer_id AND d.profile_id = auth.uid()
  ));
-- Developer membuat produk miliknya sendiri (developer_id = miliknya).
CREATE POLICY products_insert_own ON products FOR INSERT
  WITH CHECK (developer_id = public.own_developer_id());
-- Developer edit miliknya; admin edit semua. Status published hanya via admin
-- (ditegakkan juga di service layer; policy ini jaring terakhir).
CREATE POLICY products_update_own ON products FOR UPDATE
  USING (developer_id = public.own_developer_id() OR public.is_admin())
  WITH CHECK (developer_id = public.own_developer_id() OR public.is_admin());
CREATE POLICY products_delete ON products FOR DELETE
  USING (developer_id = public.own_developer_id() OR public.is_admin());

-- ============ PRODUCT VERSIONS / IMAGES ============
CREATE POLICY versions_read ON product_versions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM products p WHERE p.id = product_versions.product_id AND p.status = 'published')
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM products p JOIN developers d ON d.id = p.developer_id
      WHERE p.id = product_versions.product_id AND d.profile_id = auth.uid()
    )
  );
CREATE POLICY versions_manage ON product_versions FOR ALL
  USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM products p JOIN developers d ON d.id = p.developer_id
      WHERE p.id = product_versions.product_id AND d.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM products p JOIN developers d ON d.id = p.developer_id
      WHERE p.id = product_versions.product_id AND d.profile_id = auth.uid()
    )
  );

CREATE POLICY images_read ON product_images FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM products p WHERE p.id = product_images.product_id AND p.status = 'published')
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM products p JOIN developers d ON d.id = p.developer_id
      WHERE p.id = product_images.product_id AND d.profile_id = auth.uid()
    )
  );
CREATE POLICY images_manage ON product_images FOR ALL
  USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM products p JOIN developers d ON d.id = p.developer_id
      WHERE p.id = product_images.product_id AND d.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM products p JOIN developers d ON d.id = p.developer_id
      WHERE p.id = product_images.product_id AND d.profile_id = auth.uid()
    )
  );

-- ============ FAVORITES (user kelola miliknya) ============
CREATE POLICY favorites_read_own ON favorites FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY favorites_manage_own ON favorites FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============ ANALYTICS (publik insert; baca admin) ============
CREATE POLICY views_insert ON product_views FOR INSERT WITH CHECK (TRUE);
CREATE POLICY views_read_admin ON product_views FOR SELECT USING (public.is_admin());

CREATE POLICY clicks_insert ON contact_clicks FOR INSERT WITH CHECK (TRUE);
CREATE POLICY clicks_read_admin ON contact_clicks FOR SELECT USING (public.is_admin());

-- ============ DOWN ============
-- (Hapus policy bila rollback — sesuaikan nama policy di atas.)
