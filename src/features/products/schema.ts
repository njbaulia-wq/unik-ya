import { z } from "zod";

/** Kontrak products — dipakai L1 boundary + seed/test. Wizard T11 menambah skema. */
export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya huruf kecil, angka, dan strip.");

export const httpsUrlSchema = z
  .string()
  .trim()
  .url("URL tidak valid.")
  .refine((u) => u.startsWith("https://"), "URL harus diawali https://.");

export const httpsUrlOptional = httpsUrlSchema.optional().or(z.literal("").transform(() => undefined));

export const productListParamsSchema = z.strictObject({
  q: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

/** Wizard produk (PRD §21): required vs recommended vs kontak. */
export const PRODUCT_TYPES = [
  "saas", "web_app", "ai_app", "business_tool", "internal_tool", "dashboard",
  "starter_kit", "boilerplate", "source_code", "ui_kit", "components",
  "automation", "template", "landing_page", "design_system",
] as const;

export const PRICING_MODELS = ["free", "paid_onetime", "subscription", "custom"] as const;

const techList = z.array(z.string().trim().min(1).max(40)).max(12).default([]);
const featureList = z.array(z.string().trim().min(2).max(200)).max(20);

/** Step 1–4 bisa disimpan sebagai draft (longgar); submit memakai skema penuh. */
export const productDraftSchema = z.strictObject({
  name: z.string().trim().min(3, "Nama minimal 3 karakter.").max(120),
  shortDescription: z.string().trim().max(200).optional().default(""),
  categoryId: z.string().uuid("Kategori tidak valid.").optional(),
  productType: z.enum(PRODUCT_TYPES).optional(),
  description: z.string().trim().max(8000).optional().default(""),
  features: featureList.optional().default([]),
  techStack: techList.optional().default([]),
  demoUrl: httpsUrlOptional,
  documentationUrl: httpsUrlOptional,
  repositoryUrl: httpsUrlOptional,
  videoUrl: httpsUrlOptional,
  version: z.string().trim().max(20).optional().default("0.1.0"),
  licenseType: z.string().trim().max(60).optional().default("custom"),
  pricingModel: z.enum(PRICING_MODELS).optional().default("custom"),
  priceText: z.string().trim().max(120).optional(),
});

/** Submit review: field required PRD §21 wajib penuh + valid. */
export const productSubmitSchema = productDraftSchema.extend({
  shortDescription: z.string().trim().min(10, "Deskripsi singkat 10–200 karakter.").max(200),
  categoryId: z.string().uuid("Kategori wajib dipilih."),
  productType: z.enum(PRODUCT_TYPES, { message: "Tipe produk wajib dipilih." }),
  description: z.string().trim().min(50, "Deskripsi minimal 50 karakter.").max(8000),
  features: z.array(z.string().trim().min(2).max(200)).min(1, "Minimal 1 fitur.").max(20),
}).refine((v) => !v.videoUrl || v.videoUrl.startsWith("https://"), {
  message: "Video demo harus URL https YouTube.",
  path: ["videoUrl"],
});

export type ProductDraftInput = z.infer<typeof productDraftSchema>;
export type ProductSubmitInput = z.infer<typeof productSubmitSchema>;
