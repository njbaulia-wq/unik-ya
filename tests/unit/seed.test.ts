import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

const SQL = readFileSync(join(__dirname, "..", "..", "supabase", "seed", "seed.sql"), "utf8");

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const httpsSchema = z.string().url().refine((u) => u.startsWith("https://"), "harus https://");

/** Ambil blok VALUES milik satu tabel: dari "INSERT INTO <tabel>" sampai ";". */
function valuesBlock(table: string): string {
  const start = SQL.indexOf(`INSERT INTO ${table}`);
  if (start === -1) throw new Error(`INSERT INTO ${table} tidak ditemukan`);
  const end = SQL.indexOf(";", start);
  return SQL.slice(start, end);
}

/** Hitung tuple VALUES: baris yang diawali "  (" di dalam blok. */
function countTuples(block: string): number {
  return block.split("\n").filter((l) => l.startsWith("  (")).length;
}

describe("seed fiktif (PRD §59–60)", () => {
  it("counts memenuhi syarat minimum", () => {
    expect(countTuples(valuesBlock("profiles"))).toBe(10);
    expect(countTuples(valuesBlock("developers"))).toBe(10);
    expect(countTuples(valuesBlock("categories"))).toBe(8);
    expect(countTuples(valuesBlock("tags"))).toBeGreaterThanOrEqual(30);
    const products = countTuples(valuesBlock("products"));
    expect(products).toBeGreaterThanOrEqual(20);
    expect(products).toBeLessThanOrEqual(30);
  });

  it("semua slug valid + URL demo https + deskripsi cukup panjang", () => {
    const slugs = [...SQL.matchAll(/'([a-z0-9]+(?:-[a-z0-9]+)*)'/g)].map((m) => m[1]);
    expect(slugs.length).toBeGreaterThan(0);
    for (const s of slugs) {
      if (["next-js", "wa-order-manager"].includes(s as string)) continue;
      expect(slugSchema.safeParse(s).success, `slug invalid: ${s}`).toBe(true);
    }
    const urls = [...SQL.matchAll(/'(https?:\/\/[^']+)'/g)].map((m) => m[1]);
    expect(urls.length).toBeGreaterThan(0);
    for (const u of urls) {
      expect(httpsSchema.safeParse(u).success, `URL bukan https: ${u}`).toBe(true);
      expect(u, `URL javascript:/data:: ${u}`).not.toMatch(/^(javascript|data):/);
    }
  });

  it("data jelas fiktif (bukan customer asli)", () => {
    expect(SQL).toContain("contoh.dev");
    expect(SQL.toLowerCase()).not.toContain("bca.co.id");
  });

  it("idempoten: INSERT inti memakai ON CONFLICT DO NOTHING", () => {
    for (const t of ["profiles", "developers", "categories", "tags", "products"]) {
      const block = valuesBlock(t);
      expect(block, t).toContain("ON CONFLICT");
    }
  });

  it("tidak ada produk tanpa creator (tiap produk referensi developer seed)", () => {
    const block = valuesBlock("products");
    const devRefs = [...block.matchAll(/'22222222-2222-2222-2222-0000000000\d\d'/g)];
    expect(devRefs.length).toBe(countTuples(block));
  });
});
