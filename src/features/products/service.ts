import { logger } from "@/lib/logger";
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
