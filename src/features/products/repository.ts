import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError, SafeMessages } from "@/lib/error";
import type { Category, Developer, Product } from "@/types/database";

/**
 * L3 products repository — satu-satunya yang query tabel products.
 * Error DB → AppError UPSTREAM_ERROR generik (tanpa bocor SQL/nama kolom).
 */
export interface ProductWithRelations extends Product {
  developers?: Pick<Developer, "display_name" | "slug" | "verified"> | null;
  categories?: Pick<Category, "name" | "slug"> | null;
  product_images?: { storage_path: string; alt_text: string }[] | null;
}

function toUpstream(err: unknown): AppError {
  return new AppError("UPSTREAM_ERROR", SafeMessages.upstream, { cause: err });
}

/** URL publik cover: Storage bila env ada, fallback aset lokal (tanpa broken image). */
export function coverUrl(storagePath: string | undefined | null): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (storagePath && base) return `${base}/storage/v1/object/public/product-images/${storagePath}`;
  return "/seed/cover.svg";
}

const SELECT = "*, developers!inner(display_name,slug,verified), categories(name,slug), product_images(storage_path,alt_text)";

export async function listPublishedProducts(
  supabase: SupabaseClient,
  opts: { limit?: number; featuredOnly?: boolean; verifiedOnly?: boolean; orderBy?: "published_at" | "updated_at" | "created_at" } = {},
): Promise<ProductWithRelations[]> {
  let query = supabase.from("products").select(SELECT).eq("status", "published");
  if (opts.featuredOnly) query = query.eq("featured", true);
  if (opts.verifiedOnly) query = query.eq("verification_status", "verified");
  query = query.order(opts.orderBy ?? "published_at", { ascending: false }).limit(opts.limit ?? 12);
  const { data, error } = await query;
  if (error) throw toUpstream(error);
  return (data ?? []) as unknown as ProductWithRelations[];
}

export async function listCategories(supabase: SupabaseClient): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw toUpstream(error);
  return (data ?? []) as unknown as Category[];
}

export async function listDevelopers(supabase: SupabaseClient, limit = 6): Promise<Developer[]> {
  const { data, error } = await supabase.from("developers").select("*").eq("suspended", false).order("created_at", { ascending: false }).limit(limit);
  if (error) throw toUpstream(error);
  return (data ?? []) as unknown as Developer[];
}

export async function listOwnProducts(supabase: SupabaseClient, developerId: string): Promise<ProductWithRelations[]> {
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("developer_id", developerId)
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error) throw toUpstream(error);
  return (data ?? []) as unknown as ProductWithRelations[];
}

export async function getProductBySlug(supabase: SupabaseClient, slug: string): Promise<ProductWithRelations | null> {
  const { data, error } = await supabase.from("products").select(SELECT).eq("slug", slug).maybeSingle();
  if (error) throw toUpstream(error);
  return (data ?? null) as unknown as ProductWithRelations | null;
}

export async function listCategoryProducts(
  supabase: SupabaseClient,
  categoryId: string,
  limit = 24,
): Promise<ProductWithRelations[]> {
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("status", "published")
    .eq("category_id", categoryId)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw toUpstream(error);
  return (data ?? []) as unknown as ProductWithRelations[];
}

export async function listSimilarProducts(
  supabase: SupabaseClient,
  opts: { categoryId: string | null; excludeId: string; limit?: number },
): Promise<ProductWithRelations[]> {
  let query = supabase
    .from("products")
    .select(SELECT)
    .eq("status", "published")
    .neq("id", opts.excludeId);
  if (opts.categoryId) query = query.eq("category_id", opts.categoryId);
  const { data, error } = await query.order("verification_score", { ascending: false }).limit(opts.limit ?? 4);
  if (error) throw toUpstream(error);
  return (data ?? []) as unknown as ProductWithRelations[];
}

export interface DeveloperSocial {
  channel: string;
  value: string;
  enabled: boolean;
}

export async function getDeveloperSocials(supabase: SupabaseClient, developerId: string): Promise<DeveloperSocial[]> {
  const { data, error } = await supabase
    .from("developers_socials")
    .select("channel,value,enabled")
    .eq("developer_id", developerId)
    .eq("enabled", true);
  if (error) throw toUpstream(error);
  return (data ?? []) as unknown as DeveloperSocial[];
}

export interface ProductWriteRow {
  developer_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  product_type: string | null;
  pricing_model: string;
  price_text: string | null;
  demo_url: string | null;
  documentation_url: string | null;
  repository_url: string | null;
  video_url: string | null;
  tech_stack: string[];
  features: string[];
  version: string;
  license_type: string;
}

/** Produk milik developer (untuk guard kepemilikan di service). */
export async function getOwnProduct(
  supabase: SupabaseClient,
  productId: string,
  developerId: string,
): Promise<ProductWithRelations | null> {
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("id", productId)
    .eq("developer_id", developerId)
    .maybeSingle();
  if (error) throw toUpstream(error);
  return (data ?? null) as unknown as ProductWithRelations | null;
}

export async function insertProduct(supabase: SupabaseClient, row: ProductWriteRow): Promise<string> {
  const { data, error } = await supabase.from("products").insert(row).select("id").single();
  if (error) throw toUpstream(error);
  return (data as unknown as { id: string }).id;
}

export async function updateProductRow(
  supabase: SupabaseClient,
  productId: string,
  developerId: string,
  patch: Partial<ProductWriteRow>,
): Promise<void> {
  const { error } = await supabase.from("products").update(patch).eq("id", productId).eq("developer_id", developerId);
  if (error) throw toUpstream(error);
}

export async function insertProductImage(
  supabase: SupabaseClient,
  row: { product_id: string; storage_path: string; alt_text: string; sort_order: number },
): Promise<void> {
  const { error } = await supabase.from("product_images").insert(row);
  if (error) throw toUpstream(error);
}

export async function countProductImages(supabase: SupabaseClient, productId: string): Promise<number> {
  const { count, error } = await supabase.from("product_images").select("id", { count: "exact", head: true }).eq("product_id", productId);
  if (error) throw toUpstream(error);
  return count ?? 0;
}

export async function categoryExists(supabase: SupabaseClient, categoryId: string): Promise<boolean> {
  const { data, error } = await supabase.from("categories").select("id").eq("id", categoryId).maybeSingle();
  if (error) throw toUpstream(error);
  return data !== null;
}

/** Riwayat versi untuk section Version & Changelog (PRD §15). */
export async function getProductVersions(
  supabase: SupabaseClient,
  productId: string,
): Promise<{ version: string; changelog: string; created_at: string }[]> {
  const { data, error } = await supabase
    .from("product_versions")
    .select("version,changelog,created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw toUpstream(error);
  return (data ?? []) as unknown as { version: string; changelog: string; created_at: string }[];
}

/** Ubah status + kolom verifikasi (dipakai submit developer & aksi admin). */
export async function setProductStatus(
  supabase: SupabaseClient,
  productId: string,
  status: string,
  extra: Record<string, unknown> = {},
): Promise<void> {
  const { error } = await supabase.from("products").update({ status, ...extra }).eq("id", productId);
  if (error) throw toUpstream(error);
}
