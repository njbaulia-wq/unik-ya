import { describe, expect, it } from "vitest";
import { computeStats } from "@/features/developers/repository";
import { getDeveloperProfile } from "@/features/developers/service";
import { getCategoryPage } from "@/features/categories/service";

describe("developers service", () => {
  it("slug tak-ada → NOT_FOUND; stats tanpa revenue", async () => {
    await expect(
      getDeveloperProfile("tak-ada", { fetchBySlug: async () => null, fetchProducts: async () => [] }, {}),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("computeStats: products/verified/updatedRecently saja", () => {
    const stats = computeStats([
      { verification_status: "verified", updated_at: new Date().toISOString() },
      { verification_status: "pending", updated_at: new Date(Date.now() - 60 * 86400_000).toISOString() },
    ]);
    expect(stats).toEqual({ products: 2, verified: 1, updatedRecently: 1 });
    expect(stats).not.toHaveProperty("revenue");
  });
});

describe("categories service", () => {
  it("slug lama → redirectTo; slug tak dikenal → NOT_FOUND", async () => {
    const bySlug = await getCategoryPage(
      "saas-lama",
      {
        resolve: async () => ({ kind: "redirect", to: "saas" }),
        fetchProducts: async () => [],
        fetchCategories: async () => [],
      },
      {},
    );
    expect(bySlug.redirectTo).toBe("saas");

    await expect(
      getCategoryPage(
        "tak-ada",
        {
          resolve: async () => ({ kind: "missing" }),
          fetchProducts: async () => [],
          fetchCategories: async () => [],
        },
        {},
      ),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
