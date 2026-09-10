import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError, SafeMessages } from "@/lib/error";
import type { ProductWithRelations } from "@/features/products/repository";

function toUpstream(err: unknown): AppError {
  return new AppError("UPSTREAM_ERROR", SafeMessages.upstream, { cause: err });
}

/** L3 favorites — RLS: user kelola miliknya (0002_rls.sql). */
export async function isFavorited(supabase: SupabaseClient, userId: string, productId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("favorites")
    .select("product_id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();
  if (error) throw toUpstream(error);
  return data !== null;
}

export async function addFavorite(supabase: SupabaseClient, userId: string, productId: string): Promise<void> {
  // Idempoten: upsert abaikan duplikat (bukan CONFLICT ke user).
  const { error } = await supabase.from("favorites").upsert({ user_id: userId, product_id: productId }, { onConflict: "user_id,product_id" });
  if (error) throw toUpstream(error);
}

export async function removeFavorite(supabase: SupabaseClient, userId: string, productId: string): Promise<void> {
  const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("product_id", productId);
  if (error) throw toUpstream(error);
}

export async function listFavorites(supabase: SupabaseClient, userId: string): Promise<ProductWithRelations[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select("products!inner(*, developers!inner(display_name,slug,verified), categories(name,slug), product_images(storage_path,alt_text))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw toUpstream(error);
  const rows = (data ?? []) as unknown as { products: ProductWithRelations }[];
  return rows.map((r) => r.products).filter((p) => p.status === "published");
}
