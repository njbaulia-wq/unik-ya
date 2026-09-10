import { logger } from "@/lib/logger";
import { notFound, unauthorized, validationError } from "@/lib/error";
import { favoriteSchema } from "./schema";

export interface FavoriteDeps {
  findPublishedId: (slug: string) => Promise<string | null>;
  isFavorited: (userId: string, productId: string) => Promise<boolean>;
  add: (userId: string, productId: string) => Promise<void>;
  remove: (userId: string, productId: string) => Promise<void>;
}

/**
 * L2 toggle favorit — anonim → UNAUTHORIZED (arahkan login);
 * hanya produk published; simpan idempoten.
 */
export async function toggleFavorite(
  userId: string | null,
  raw: unknown,
  deps: FavoriteDeps,
  ctx: { requestId?: string },
): Promise<{ saved: boolean }> {
  if (!userId) throw unauthorized("Masuk untuk menyimpan produk favorit.");
  const parsed = favoriteSchema.safeParse(raw);
  if (!parsed.success) {
    throw validationError(parsed.error.issues.map((i) => ({ field: "productSlug", message: i.message })));
  }
  const productId = await deps.findPublishedId(parsed.data.productSlug);
  if (!productId) throw notFound("Produk belum ditemukan.");
  const currently = await deps.isFavorited(userId, productId);
  if (currently) {
    await deps.remove(userId, productId);
  } else {
    await deps.add(userId, productId);
  }
  logger.info("Favorit diubah.", { module: "favorites", action: "favorite_toggle", requestId: ctx.requestId, userId });
  return { saved: !currently };
}
