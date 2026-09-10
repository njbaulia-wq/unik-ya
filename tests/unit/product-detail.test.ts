import { describe, expect, it } from "vitest";
import { deriveBadges, getProductDetail } from "@/features/products/service";
import { channelHref } from "@/features/products/components/ContactCTA";
import type { ProductWithRelations } from "@/features/products/repository";

const base = {
  status: "published",
  verification_status: "verified",
  demo_url: "https://demo.devmarket.id/x",
  published_at: new Date(Date.now() - 2 * 86400_000).toISOString(),
  updated_at: new Date(Date.now() - 2 * 86400_000).toISOString(),
  verification_score: 90,
} as unknown as ProductWithRelations;

describe("product detail service", () => {
  it("draft/suspended/tak-ada → NOT_FOUND generik", async () => {
    await expect(getProductDetail("x", { fetchBySlug: async () => null }, {})).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(
      getProductDetail("x", { fetchBySlug: async () => ({ ...base, status: "draft" }) }, {}),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(
      getProductDetail("x", { fetchBySlug: async () => ({ ...base, status: "suspended" }) }, {}),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("slug invalid → NOT_FOUND (tanpa bocor validasi)", async () => {
    await expect(getProductDetail("SLUG_BURUK!!", { fetchBySlug: async () => base }, {})).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("published → ok", async () => {
    await expect(getProductDetail("invoiceflow", { fetchBySlug: async () => base }, {})).resolves.toMatchObject({
      status: "published",
    });
  });
});

describe("deriveBadges (keputusan #3)", () => {
  it("VERIFIED + LIVE DEMO + NEW + UPDATED + POPULAR", () => {
    expect(deriveBadges(base)).toEqual(["VERIFIED", "LIVE DEMO", "NEW", "UPDATED", "POPULAR"]);
  });

  it("produk lama tanpa demo → tanpa badge waktu/demo", () => {
    const old = {
      ...base,
      verification_status: "unverified",
      demo_url: null,
      published_at: new Date(Date.now() - 90 * 86400_000).toISOString(),
      updated_at: new Date(Date.now() - 60 * 86400_000).toISOString(),
      verification_score: 40,
    } as unknown as ProductWithRelations;
    expect(deriveBadges(old)).toEqual([]);
  });
});

describe("channelHref", () => {
  it("email → mailto; WA angka → wa.me; https terus", () => {
    expect(channelHref("email", "a@b.co")).toBe("mailto:a@b.co");
    expect(channelHref("whatsapp", "+62 812-3456")).toBe("https://wa.me/628123456");
    expect(channelHref("github", "https://github.com/x")).toBe("https://github.com/x");
  });
});
