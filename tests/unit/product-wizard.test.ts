import { describe, expect, it } from "vitest";
import { productDraftSchema, productSubmitSchema } from "@/features/products/schema";
import { createDraft, updateDraft } from "@/features/products/service";
import { isAllowedVideoUrl } from "@/lib/urls";
import { isAllowedImage, sanitizeFilename } from "@/lib/files";

describe("wizard schema (PRD §21)", () => {
  it("draft longgar: hanya nama wajib", () => {
    expect(productDraftSchema.safeParse({ name: "X" }).success).toBe(false);
    expect(productDraftSchema.safeParse({ name: "Produk Bagus" }).success).toBe(true);
  });

  it("submit ketat: required penuh + fitur min 1", () => {
    const full = {
      name: "Produk Bagus",
      shortDescription: "Deskripsi singkat yang cukup panjang.",
      categoryId: "123e4567-e89b-12d3-a456-426614174000",
      productType: "saas",
      description: "Deskripsi lengkap yang panjangnya lebih dari lima puluh karakter agar lolos validasi submit.",
      features: ["Fitur satu"],
    };
    expect(productSubmitSchema.safeParse(full).success).toBe(true);
    expect(productSubmitSchema.safeParse({ ...full, features: [] }).success).toBe(false);
    expect(productSubmitSchema.safeParse({ ...full, description: "pendek" }).success).toBe(false);
  });
});

describe("wizard service", () => {
  const deps = {
    categoryExists: async () => true,
    insert: async () => "new-id",
    persist: async () => {},
  };

  it("video non-youtube ditolak", async () => {
    await expect(
      createDraft("d1", { name: "Produk Bagus", videoUrl: "https://contoh.dev/v.mp4" }, deps, {}),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("kategori tak dikenal ditolak", async () => {
    await expect(
      createDraft("d1", { name: "Produk Bagus", categoryId: "00000000-0000-0000-0000-000000000000" }, { ...deps, categoryExists: async () => false }, {}),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("edit milik orang lain → FORBIDDEN; status published → CONFLICT", async () => {
    await expect(
      updateDraft("d1", null, { name: "Produk Bagus" }, deps, {}),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      updateDraft("d1", { id: "p1", developer_id: "d1", status: "published" }, { name: "Produk Bagus" }, deps, {}),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("slug konflik → CONFLICT generik", async () => {
    await expect(
      createDraft("d1", { name: "Produk Bagus" }, { ...deps, insert: async () => { throw new Error("duplicate key value"); } }, {}),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });
});

describe("urls & files", () => {
  it("youtube allowlist + tolak javascript:", () => {
    expect(isAllowedVideoUrl("https://www.youtube.com/watch?v=x")).toBe(true);
    expect(isAllowedVideoUrl("https://youtu.be/x")).toBe(true);
    expect(isAllowedVideoUrl("https://contoh.dev/v.mp4")).toBe(false);
    expect(isAllowedVideoUrl("javascript:alert(1)")).toBe(false);
  });

  it("MIME/size + sanitasi filename", () => {
    expect(isAllowedImage("image/png", 100)).toBe(true);
    expect(isAllowedImage("image/png", 3 * 1024 * 1024)).toBe(false);
    expect(isAllowedImage("application/pdf", 100)).toBe(false);
    expect(sanitizeFilename("../../etc/passwd")).toBe("passwd");
    expect(sanitizeFilename("Foto Produk (1).PNG")).toBe("foto-produk-1-.png");
  });
});
