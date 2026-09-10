import { logger } from "@/lib/logger";
import { notFound } from "@/lib/error";
import { slugSchema } from "@/features/products/schema";
import { computeStats, type DeveloperProfile } from "./repository";
import type { ProductWithRelations } from "@/features/products/repository";
import type { Developer } from "@/types/database";

/** L2 developers — profil publik + metrik (tanpa revenue, PRD §18). */
export async function getDeveloperProfile(
  rawSlug: string,
  deps: {
    fetchBySlug: (slug: string) => Promise<Developer | null>;
    fetchProducts: (developerId: string) => Promise<ProductWithRelations[]>;
  },
  ctx: { requestId?: string },
): Promise<{ profile: Developer; products: ProductWithRelations[]; stats: DeveloperProfile["stats"] }> {
  const parsed = slugSchema.safeParse(rawSlug);
  if (!parsed.success) throw notFound("Developer belum ditemukan.");
  const profile = await deps.fetchBySlug(parsed.data);
  if (!profile) {
    logger.info("Developer tidak ditemukan.", { module: "developers", action: "developer_profile_view", requestId: ctx.requestId });
    throw notFound("Developer belum ditemukan.");
  }
  const products = await deps.fetchProducts(profile.id);
  logger.info("Profil developer dibaca.", { module: "developers", action: "developer_profile_view", requestId: ctx.requestId });
  return { profile, products, stats: computeStats(products) };
}
