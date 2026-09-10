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
