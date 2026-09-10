import { logger } from "@/lib/logger";
import { notFound, validationError } from "@/lib/error";
import { compareParamsSchema, compareSlugs } from "./schema";
import type { ProductWithRelations } from "@/features/products/repository";

/**
 * L2 compare-ready (P2, tanpa UI publik di v1): validasi kontrak URL +
 * ambil produk published saja. Non-published → NOT_FOUND per-item generik.
 */
export async function resolveCompare(
  raw: Record<string, string | undefined>,
  deps: { fetchBySlug: (slug: string) => Promise<ProductWithRelations | null> },
  ctx: { requestId?: string },
): Promise<ProductWithRelations[]> {
  const parsed = compareParamsSchema.safeParse({ a: raw.a, b: raw.b, c: raw.c, d: raw.d });
  if (!parsed.success) {
    throw validationError(parsed.error.issues.map((i) => ({ field: String(i.path[0] ?? "compare"), message: i.message })));
  }
  const slugs = compareSlugs(parsed.data);
  const products = await Promise.all(slugs.map((s) => deps.fetchBySlug(s)));
  const missing = slugs.filter((_, i) => !products[i] || products[i]?.status !== "published");
  if (missing.length > 0) {
    logger.info("Compare: produk tidak tersedia.", { module: "compare", requestId: ctx.requestId });
    throw notFound("Satu atau beberapa produk tidak tersedia untuk dibandingkan.");
  }
  logger.info("Kontrak compare divalidasi.", { module: "compare", requestId: ctx.requestId });
  return products as ProductWithRelations[];
}
