import { z } from "zod";

/** Simpan produk — login wajib (keputusan #2). */
export const favoriteSchema = z.strictObject({
  productSlug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Produk tidak dikenal."),
});

export type FavoriteInput = z.infer<typeof favoriteSchema>;
