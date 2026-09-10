import { describe, expect, it, vi } from "vitest";
import { getHomepageSections } from "@/features/products/service";

describe("homepage service fallback per-section", () => {
  it("satu section gagal → section lain tetap tampil, gagal jadi []", async () => {
    const ok = [{ id: "1" }];
    const sections = await getHomepageSections(
      {
        fetchFeatured: async () => { throw new Error("DB down"); },
        fetchNew: async () => ok as never,
        fetchVerified: async () => [],
        fetchCategories: async () => [],
        fetchDevelopers: async () => [],
      },
      { requestId: "test-rid" },
    );
    expect(sections.featured).toEqual([]);
    expect(sections.newest).toEqual(ok);
  });

  it("semua gagal → semua [] (halaman tetap 200, bukan 500)", async () => {
    const fail = async (): Promise<never> => { throw new Error("down"); };
    const sections = await getHomepageSections(
      { fetchFeatured: fail, fetchNew: fail, fetchVerified: fail, fetchCategories: fail, fetchDevelopers: fail },
      {},
    );
    expect(Object.values(sections).every((s) => Array.isArray(s) && s.length === 0)).toBe(true);
    expect(vi.fn().mock.calls.length).toBe(0);
  });
});
