import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError, SafeMessages } from "@/lib/error";
import { logger } from "@/lib/logger";
import { notFound } from "@/lib/error";
import { slugSchema } from "@/features/products/schema";
import type { Category } from "@/types/database";
import type { ProductWithRelations } from "@/features/products/repository";

function toUpstream(err: unknown): AppError {
  return new AppError("UPSTREAM_ERROR", SafeMessages.upstream, { cause: err });
}

export type CategoryResolution =
  | { kind: "found"; category: Category }
  | { kind: "redirect"; to: string }
  | { kind: "missing" };

/** L3 categories — slug immutable; slug lama → 301 via category_redirects. */
export async function resolveCategory(supabase: SupabaseClient, slug: string): Promise<CategoryResolution> {
  const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
  if (error) throw toUpstream(error);
  if (data) return { kind: "found", category: data as unknown as Category };
  const redir = await supabase.from("category_redirects").select("new_slug").eq("old_slug", slug).maybeSingle();
  if (redir.error) throw toUpstream(redir.error);
  if (redir.data) return { kind: "redirect", to: (redir.data as unknown as { new_slug: string }).new_slug };
  return { kind: "missing" };
}

/** L2 — validasi slug + log; missing → NOT_FOUND. */
export async function getCategoryPage(
  rawSlug: string,
  deps: {
    resolve: (slug: string) => Promise<CategoryResolution>;
    fetchProducts: (categoryId: string) => Promise<ProductWithRelations[]>;
    fetchCategories: () => Promise<Category[]>;
  },
  ctx: { requestId?: string },
): Promise<{ category: Category; products: ProductWithRelations[]; categories: Category[]; redirectTo?: string }> {
  const parsed = slugSchema.safeParse(rawSlug);
  if (!parsed.success) throw notFound("Kategori belum ditemukan.");
  const resolution = await deps.resolve(parsed.data);
  if (resolution.kind === "redirect") return { redirectTo: resolution.to } as never;
  if (resolution.kind === "missing") {
    logger.info("Kategori tidak ditemukan.", { module: "categories", requestId: ctx.requestId });
    throw notFound("Kategori belum ditemukan.");
  }
  const category = (resolution as { kind: "found"; category: Category }).category;
  const [products, categories] = await Promise.all([deps.fetchProducts(category.id), deps.fetchCategories()]);
  return { category, products, categories };
}
