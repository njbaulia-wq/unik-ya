import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError, SafeMessages } from "@/lib/error";
import type { Category, Developer } from "@/types/database";
import type { ProductWithRelations } from "@/features/products/repository";

function toUpstream(err: unknown): AppError {
  return new AppError("UPSTREAM_ERROR", SafeMessages.upstream, { cause: err });
}

export interface DeveloperProfile extends Developer {
  stats: { products: number; verified: number; updatedRecently: number };
}

/** L3 developers — profil publik + agregat tanpa kolom revenue (PRD §18). */
export async function getDeveloperBySlug(supabase: SupabaseClient, slug: string): Promise<Developer | null> {
  const { data, error } = await supabase.from("developers").select("*").eq("slug", slug).maybeSingle();
  if (error) throw toUpstream(error);
  return (data ?? null) as unknown as Developer | null;
}

export async function listDevelopersPage(supabase: SupabaseClient, limit = 24): Promise<Developer[]> {
  const { data, error } = await supabase.from("developers").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) throw toUpstream(error);
  return (data ?? []) as unknown as Developer[];
}

export async function listDeveloperProducts(supabase: SupabaseClient, developerId: string): Promise<ProductWithRelations[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, developers!inner(display_name,slug,verified), categories(name,slug), product_images(storage_path,alt_text)")
    .eq("developer_id", developerId)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw toUpstream(error);
  return (data ?? []) as unknown as ProductWithRelations[];
}

export function computeStats(products: Pick<ProductWithRelations, "verification_status" | "updated_at">[]): DeveloperProfile["stats"] {
  const twoWeeksAgo = Date.now() - 14 * 86400_000;
  return {
    products: products.length,
    verified: products.filter((p) => p.verification_status === "verified").length,
    updatedRecently: products.filter((p) => new Date(p.updated_at).getTime() >= twoWeeksAgo).length,
  };
}
