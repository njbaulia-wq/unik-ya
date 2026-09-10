import { describe, expect, it } from "vitest";
import { toTsQuery } from "@/features/search/repository";
import { runSearch } from "@/features/search/service";
import { searchParamsSchema } from "@/features/search/schema";

describe("search", () => {
  it("sanitasi tsquery: buang operator + kata 1 huruf, batasi 10 kata", () => {
    expect(toTsQuery("SaaS inventory!")).toBe("saas & inventory");
    expect(toTsQuery("a b:c | d")).toBe("");
    expect(toTsQuery("  Next.js   AI-app  ")).toBe("next & js & ai & app");
  });

  it("skema menolak page 0 dan sort tak dikenal", () => {
    expect(searchParamsSchema.safeParse({ page: "0" }).success).toBe(false);
    expect(searchParamsSchema.safeParse({ sort: "murah" }).success).toBe(false);
    expect(searchParamsSchema.safeParse({ sort: "newest", page: "2" }).success).toBe(true);
  });

  it("service meneruskan hasil repo + log; invalid → VALIDATION_ERROR", async () => {
    const fake = { items: [], total: 0, page: 1, perPage: 12 };
    const res = await runSearch({ q: "saas" }, { search: async () => fake }, { requestId: "r1" });
    expect(res.total).toBe(0);
    expect(res.applied.q).toBe("saas");
    await expect(runSearch({ sort: "murah" }, { search: async () => fake }, {})).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });
});
