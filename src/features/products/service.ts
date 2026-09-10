import { logger } from "@/lib/logger";
import { notFound } from "@/lib/error";
import { slugSchema } from "./schema";
import type { Category, Developer } from "@/types/database";
import type { ProductWithRelations } from "./repository";

/**
 * L2 homepage service — orkestrasi read-model. Tiap section punya fallback
 * kosong + log, sehingga satu section gagal tidak menjatuhkan halaman (500).
 */
export interface HomepageDeps {
  fetchFeatured: () => Promise<ProductWithRelations[]>;
  fetchNew: () => Promise<ProductWithRelations[]>;
  fetchVerified: () => Promise<ProductWithRelations[]>;
  fetchCategories: () => Promise<Category[]>;
  fetchDevelopers: () => Promise<Developer[]>;
}

export interface HomepageSections {
  featured: ProductWithRelations[];
  newest: ProductWithRelations[];
  verified: ProductWithRelations[];
  categories: Category[];
  developers: Developer[];
}

async function safe<T>(label: string, fn: () => Promise<T[]>, ctx: { requestId?: string }): Promise<T[]> {
  try {
    return await fn();
  } catch (err) {
    logger.error(`Gagal memuat section ${label}.`, {
      module: "products",
      action: "homepage_section",
      requestId: ctx.requestId,
      errorCode: "UPSTREAM_ERROR",
    });
    return [];
  }
}

export async function getHomepageSections(
  deps: HomepageDeps,
  ctx: { requestId?: string },
): Promise<HomepageSections> {
  const [featured, newest, verified, categories, developers] = await Promise.all([
    safe("featured", deps.fetchFeatured, ctx),
    safe("new", deps.fetchNew, ctx),
    safe("verified", deps.fetchVerified, ctx),
    safe("categories", deps.fetchCategories, ctx),
    safe("developers", deps.fetchDevelopers, ctx),
  ]);
  logger.info("Homepage sections dimuat.", {
    module: "products",
    action: "homepage_section",
    requestId: ctx.requestId,
  });
  return { featured, newest, verified, categories, developers };
}

/**
 * Detail produk publik: hanya yang published yang boleh dibaca.
 * Draft/suspended/tak-ada → NOT_FOUND generik (tanpa bocorkan status internal).
 */
export async function getProductDetail(
  rawSlug: string,
  deps: { fetchBySlug: (slug: string) => Promise<ProductWithRelations | null> },
  ctx: { requestId?: string },
): Promise<ProductWithRelations> {
  const parsed = slugSchema.safeParse(rawSlug);
  if (!parsed.success) throw notFound();
  const product = await deps.fetchBySlug(parsed.data);
  if (!product || product.status !== "published") {
    logger.info("Produk tidak ditemukan / belum published.", { module: "products", action: "product_view", requestId: ctx.requestId });
    throw notFound();
  }
  logger.info("Detail produk dibaca.", {
    module: "products",
    action: "product_view",
    requestId: ctx.requestId,
  });
  return product;
}

/** Badge turunan waktu (keputusan #3): NEW ≤30 hari, UPDATED ≤14 hari. */
export function deriveBadges(
  product: Pick<ProductWithRelations, "verification_status" | "demo_url" | "published_at" | "updated_at" | "verification_score">,
  now: Date = new Date(),
): string[] {
  const badges: string[] = [];
  if (product.verification_status === "verified") badges.push("VERIFIED");
  if (product.demo_url) badges.push("LIVE DEMO");
  const nowMs = now.getTime();
  if (product.published_at && nowMs - new Date(product.published_at).getTime() <= 30 * 86400_000) badges.push("NEW");
  if (nowMs - new Date(product.updated_at).getTime() <= 14 * 86400_000) badges.push("UPDATED");
  if (product.verification_score >= 85) badges.push("POPULAR");
  return badges;
}
