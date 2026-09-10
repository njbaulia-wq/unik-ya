import { describe, expect, it } from "vitest";
import { SCORE_WEIGHTS, computeVerificationScore } from "@/features/verification/score";
import { assertTransition, submitForReview } from "@/features/products/service";

describe("skor verifikasi deterministik (keputusan #3)", () => {
  it("bobot berjumlah 100", () => {
    const total =
      SCORE_WEIGHTS.demo +
      SCORE_WEIGHTS.docs +
      SCORE_WEIGHTS.screenshotsFull +
      SCORE_WEIGHTS.repo +
      SCORE_WEIGHTS.license +
      SCORE_WEIGHTS.version +
      SCORE_WEIGHTS.description +
      SCORE_WEIGHTS.techStack;
    expect(total).toBe(100);
  });

  it("produk lengkap → 100; kosong → 0; screenshot parsial → 7", () => {
    expect(
      computeVerificationScore({
        hasDemo: true,
        hasDocs: true,
        screenshotCount: 4,
        hasRepo: true,
        licenseType: "commercial",
        version: "1.2.0",
        descriptionLength: 500,
        techStackCount: 3,
      }),
    ).toBe(100);
    expect(
      computeVerificationScore({
        hasDemo: false,
        hasDocs: false,
        screenshotCount: 0,
        hasRepo: false,
        licenseType: "custom",
        version: "draft",
        descriptionLength: 10,
        techStackCount: 0,
      }),
    ).toBe(0);
    expect(
      computeVerificationScore({
        hasDemo: false,
        hasDocs: false,
        screenshotCount: 2,
        hasRepo: false,
        licenseType: "custom",
        version: "x",
        descriptionLength: 0,
        techStackCount: 0,
      }),
    ).toBe(SCORE_WEIGHTS.screenshotsPartial);
  });
});

describe("state machine (PRD §8)", () => {
  it("alur normal legal", () => {
    expect(() => assertTransition("draft", "submitted", "developer")).not.toThrow();
    expect(() => assertTransition("submitted", "under_review", "admin")).not.toThrow();
    expect(() => assertTransition("under_review", "approved", "admin")).not.toThrow();
    expect(() => assertTransition("approved", "published", "admin")).not.toThrow();
    expect(() => assertTransition("published", "suspended", "admin")).not.toThrow();
    expect(() => assertTransition("rejected", "draft", "developer")).not.toThrow();
  });

  it("ilegal → CONFLICT; peran salah → FORBIDDEN", () => {
    expect(() => assertTransition("draft", "published", "developer")).toThrowError(/tidak dapat diubah/);
    expect(() => assertTransition("published", "draft", "admin")).toThrowError(/tidak dapat diubah/);
    expect(() => assertTransition("submitted", "under_review", "developer")).toThrowError(/Hanya admin/);
    expect(() => assertTransition("under_review", "published", "admin")).toThrowError(/tidak dapat diubah/);
  });
});

describe("submitForReview", () => {
  const full = {
    name: "Produk Bagus",
    short_description: "Deskripsi singkat yang cukup panjang untuk lolos.",
    category_id: "123e4567-e89b-12d3-a456-426614174000",
    product_type: "saas",
    description: "Deskripsi lengkap yang panjangnya lebih dari lima puluh karakter agar lolos validasi submit penuh.",
    features: ["Fitur satu"],
    tech_stack: ["Next.js", "Supabase"],
    demo_url: "https://demo.devmarket.id/x",
    documentation_url: "https://docs.devmarket.id/x",
    repository_url: "https://github.com/x/y",
    video_url: null,
    version: "1.0.0",
    license_type: "commercial",
    pricing_model: "subscription",
    price_text: null,
  };
  const deps = {
    getOwnProduct: async () => ({ id: "p1", status: "draft", developer_id: "d1" }),
    getFullProduct: async () => full,
    setStatus: async () => {},
    countImages: async () => 3,
  };

  it("draft lengkap → submitted + skor + pending", async () => {
    let saved: { status: string; extra?: Record<string, unknown> } | null = null;
    const out = await submitForReview("d1", "p1", {
      ...deps,
      setStatus: async (_id, status, extra) => {
        saved = { status, extra };
      },
    }, {});
    expect(out.score).toBeGreaterThan(0);
    const got = saved as { status: string; extra?: Record<string, unknown> } | null;
    expect(got?.status).toBe("submitted");
    expect(got?.extra?.["verification_status"]).toBe("pending");
  });

  it("milik orang lain → FORBIDDEN; published → CONFLICT; tak lengkap → VALIDATION_ERROR", async () => {
    await expect(submitForReview("d2", "p1", deps, {})).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      submitForReview("d1", "p1", { ...deps, getOwnProduct: async () => ({ id: "p1", status: "published", developer_id: "d1" }) }, {}),
    ).rejects.toMatchObject({ code: "CONFLICT" });
    await expect(
      submitForReview("d1", "p1", { ...deps, getFullProduct: async () => ({ ...full, description: "pendek" }) }, {}),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
});
