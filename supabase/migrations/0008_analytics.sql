-- 0008_analytics.sql — index waktu untuk KPI + retensi (keputusan #8: mentah 12 bulan).
-- Tanpa IP mentah: kolom ip_hash nullable, diisi hash+salt harian dari app layer.
-- Tanpa tracking lintas situs; tanpa PII.

CREATE INDEX IF NOT EXISTS product_views_time_idx ON product_views(created_at DESC);
CREATE INDEX IF NOT EXISTS contact_clicks_time_idx ON contact_clicks(created_at DESC);
CREATE INDEX IF NOT EXISTS contact_clicks_channel_idx ON contact_clicks(channel);

COMMENT ON TABLE product_views IS 'Event view. Retensi mentah 12 bulan, lalu agregat. Tanpa IP mentah.';
COMMENT ON TABLE contact_clicks IS 'Event klik kontak/demo (channel=demo untuk demo_click). Retensi mentah 12 bulan.';
