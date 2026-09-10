import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError, SafeMessages } from "@/lib/error";

function toUpstream(err: unknown): AppError {
  return new AppError("UPSTREAM_ERROR", SafeMessages.upstream, { cause: err });
}

export interface PendingProduct {
  id: string;
  name: string;
  slug: string;
  status: string;
  verification_score: number;
  updated_at: string;
  developers: { display_name: string; slug: string } | null;
}

/** L3 admin — antrian review + tulis audit + aksi kurasi. */
export async function listReviewQueue(supabase: SupabaseClient): Promise<PendingProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id,name,slug,status,verification_score,updated_at,developers!inner(display_name,slug)")
    .in("status", ["submitted", "under_review"])
    .order("updated_at", { ascending: true })
    .limit(50);
  if (error) throw toUpstream(error);
  return (data ?? []) as unknown as PendingProduct[];
}

export async function getProductStatus(
  supabase: SupabaseClient,
  productId: string,
): Promise<{ id: string; status: string } | null> {
  const { data, error } = await supabase.from("products").select("id,status").eq("id", productId).maybeSingle();
  if (error) throw toUpstream(error);
  return (data ?? null) as unknown as { id: string; status: string } | null;
}

export async function applyProductAction(
  supabase: SupabaseClient,
  productId: string,
  patch: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase.from("products").update(patch).eq("id", productId);
  if (error) throw toUpstream(error);
}

export async function writeAudit(
  supabase: SupabaseClient,
  row: { actor_id: string; action: string; target_type: string; target_id: string; reason?: string | null },
): Promise<void> {
  const { error } = await supabase.from("audit_logs").insert(row);
  if (error) throw toUpstream(error);
}

export async function setDeveloperVerified(supabase: SupabaseClient, developerId: string, verified: boolean): Promise<void> {
  const { error } = await supabase.from("developers").update({ verified }).eq("id", developerId);
  if (error) throw toUpstream(error);
}

export async function renameCategory(supabase: SupabaseClient, categoryId: string, name: string): Promise<void> {
  // Hanya display name — slug immutable (keputusan #4).
  const { error } = await supabase.from("categories").update({ name }).eq("id", categoryId);
  if (error) throw toUpstream(error);
}

export async function adminOverview(supabase: SupabaseClient): Promise<{ pending: number; published: number; developers: number }> {
  const [pending, published, developers] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).in("status", ["submitted", "under_review"]),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("developers").select("id", { count: "exact", head: true }),
  ]);
  if (pending.error ?? published.error ?? developers.error) {
    throw toUpstream(pending.error ?? published.error ?? developers.error);
  }
  return { pending: pending.count ?? 0, published: published.count ?? 0, developers: developers.count ?? 0 };
}
