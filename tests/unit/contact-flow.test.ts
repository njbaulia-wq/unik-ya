import { describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimits } from "@/lib/ratelimit";
import { trackClick } from "@/features/analytics/service";

describe("rate limit", () => {
  it("10x lolos, ke-11 ditolak dalam window", () => {
    resetRateLimits();
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit("k1", { limit: 10, now: 1000 + i }).allowed).toBe(true);
    }
    expect(checkRateLimit("k1", { limit: 10, now: 1010 }).allowed).toBe(false);
    expect(checkRateLimit("k1", { limit: 10, now: 1000 + 10 * 60_000 + 1 }).allowed).toBe(true);
  });
});

describe("trackClick", () => {
  const deps = {
    findPublishedId: async (slug: string) => (slug === "invoiceflow" ? "p1" : null),
    insertClick: async () => {},
  };

  it("klik valid tercatat; channel demo boleh", async () => {
    resetRateLimits();
    await expect(trackClick({ productSlug: "invoiceflow", channel: "whatsapp" }, "ip-a", deps, {})).resolves.toEqual({ tracked: true });
    await expect(trackClick({ productSlug: "invoiceflow", channel: "demo" }, "ip-b", deps, {})).resolves.toEqual({ tracked: true });
  });

  it("slug tak dikenal → VALIDATION_ERROR; channel aneh → VALIDATION_ERROR", async () => {
    await expect(trackClick({ productSlug: "tak-ada", channel: "email" }, "ip-c", deps, {})).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
    await expect(trackClick({ productSlug: "invoiceflow", channel: "sms" }, "ip-d", deps, {})).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });

  it("spam cepat → RATE_LIMITED (bukan 500)", async () => {
    resetRateLimits();
    for (let i = 0; i < 10; i++) {
      await trackClick({ productSlug: "invoiceflow", channel: "email" }, "spammer", deps, {});
    }
    await expect(trackClick({ productSlug: "invoiceflow", channel: "email" }, "spammer", deps, {})).rejects.toMatchObject({
      code: "RATE_LIMITED",
    });
  });

  it("DB gagal tulis → tracked:false, bukan throw (UX tetap jalan)", async () => {
    resetRateLimits();
    await expect(
      trackClick({ productSlug: "invoiceflow", channel: "email" }, "ip-e", { ...deps, insertClick: async () => { throw new Error("db down"); } }, {}),
    ).resolves.toEqual({ tracked: false });
  });
});
