import { z } from "zod";

/** Aksi moderasi admin — alasan wajib untuk reject/suspend (T13). */
export const ADMIN_ACTIONS = [
  "to_under_review",
  "approve",
  "reject",
  "publish",
  "suspend",
  "unsuspend",
  "archive",
  "feature",
  "unfeature",
] as const;

export const adminActionSchema = z
  .strictObject({
    productId: z.string().uuid("Produk tidak dikenal."),
    action: z.enum(ADMIN_ACTIONS),
    reason: z.string().trim().max(500).optional(),
  })
  .refine((v) => (v.action === "reject" || v.action === "suspend" ? !!v.reason?.trim() : true), {
    message: "Alasan wajib diisi untuk reject/suspend.",
    path: ["reason"],
  });

export const verifyDeveloperSchema = z.strictObject({
  developerId: z.string().uuid("Developer tidak dikenal."),
  verified: z.boolean(),
});

export const renameCategorySchema = z.strictObject({
  categoryId: z.string().uuid("Kategori tidak dikenal."),
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(60),
});

export type AdminActionInput = z.infer<typeof adminActionSchema>;
