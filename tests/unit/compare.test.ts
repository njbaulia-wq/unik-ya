import { describe, expect, it } from "vitest";
import { resolveCompare } from "@/features/compare/service";
import type { ProductWithRelations } from "@/features/products/repository";

const pub = (slug: string): ProductWithRelations => ({ slug, status: "published" }) as ProductWithRelations;
const draft = (slug: string): ProductWithRelations => ({ slug, status: "draft" }) as ProductWithRelations;

describe("compare-ready (tanpa UI)", () => {
  const deps = {
    fetchBySlug: async (slug: string) => {
      if (slug === "x-draft") return draft(slug);
      if (slug === "hilang") return null;
      return pub(slug);
    },
  };

  it("2–4 slug unik published → ok", async () => {
    await expect(resolveCompare({ a: "p1", b: "p2" }, deps, {})).resolves.toHaveLength(2);
    await expect(resolveCompare({ a: "p1", b: "p2", c: "p3", d: "p4" }, deps, {})).resolves.toHaveLength(4);
  });

  it("duplikat / <2 / >4 implisit / slug buruk → VALIDATION_ERROR", async () => {
    await expect(resolveCompare({ a: "p1", b: "p1" }, deps, {})).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    await expect(resolveCompare({ a: "p1", b: undefined }, deps, {})).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    await expect(resolveCompare({ a: "SALAH!!", b: "p2" }, deps, {})).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("draft/hilang → NOT_FOUND generik (tanpa bocor data non-publik)", async () => {
    await expect(resolveCompare({ a: "p1", b: "x-draft" }, deps, {})).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(resolveCompare({ a: "p1", b: "hilang" }, deps, {})).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
