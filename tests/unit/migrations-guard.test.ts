import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_DIR = join(__dirname, "..", "..", "supabase", "migrations");

function readMigrations(): string {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => readFileSync(join(MIGRATIONS_DIR, f), "utf8"))
    .join("\n");
}

describe("guard migrasi SQL (non-goals + RLS)", () => {
  const sql = readMigrations();

  it("tidak membuat tabel payment/order palsu (PRD §66)", () => {
    for (const t of ["orders", "payments", "transactions", "licenses", "subscriptions", "payouts", "invoices"]) {
      expect(sql).not.toMatch(new RegExp(`CREATE TABLE[^;]*\\b${t}\\b`, "i"));
    }
  });

  it("semua tabel inti ada", () => {
    for (const t of [
      "profiles", "developers", "developers_socials", "categories", "category_redirects",
      "tags", "product_tags", "products", "product_versions", "product_images",
      "favorites", "product_views", "contact_clicks",
    ]) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${t}`);
    }
  });

  it("RLS diaktifkan di semua tabel terpapar", () => {
    for (const t of ["profiles", "developers", "products", "favorites", "product_views", "contact_clicks"]) {
      expect(sql).toContain(`ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY`);
    }
  });

  it("publik hanya baca produk published (bukan semua status)", () => {
    expect(sql).toMatch(/products_public_read[\s\S]*?status = 'published'/);
  });

  it("bucket storage benar + tanpa bucket video", () => {
    expect(sql).toContain("product-images");
    expect(sql).toContain("avatars");
    expect(sql.toLowerCase()).not.toContain("videos");
  });

  it("URL eksternal dibatasi https:// di CHECK constraint", () => {
    expect(sql).toContain("LIKE 'https://%'");
    expect(sql).not.toContain("javascript:");
  });
});
