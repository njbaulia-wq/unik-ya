import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError, SafeMessages } from "@/lib/error";

function toUpstream(err: unknown): AppError {
  return new AppError("UPSTREAM_ERROR", SafeMessages.upstream, { cause: err });
}

/** L3 analytics — tulis klik (publik insert via RLS). Tanpa IP mentah. */
export async function insertClick(
  supabase: SupabaseClient,
  row: { product_id: string; channel: string },
): Promise<void> {
  const { error } = await supabase.from("contact_clicks").insert(row);
  if (error) throw toUpstream(error);
}

export async function findPublishedId(supabase: SupabaseClient, slug: string): Promise<string | null> {
  const { data, error } = await supabase.from("products").select("id").eq("slug", slug).eq("status", "published").maybeSingle();
  if (error) throw toUpstream(error);
  return (data as unknown as { id: string } | null)?.id ?? null;
}

/** Tulis view — gagal tulis tidak boleh melempar ke halaman (caller abaikan). */
export async function insertView(
  supabase: SupabaseClient,
  row: { product_id: string; ip_hash: string | null },
): Promise<void> {
  const { error } = await supabase.from("product_views").insert(row);
  if (error) throw toUpstream(error);
}

export interface KpiCounts {
  views: number;
  demoClicks: number;
  contactClicks: number;
  publishedProducts: number;
  developers: number;
}

/** Agregat KPI untuk admin reports (contact conversion = primer, PRD §28). */
export async function fetchKpiCounts(supabase: SupabaseClient): Promise<KpiCounts> {
  const [views, demos, contacts, products, developers] = await Promise.all([
    supabase.from("product_views").select("id", { count: "exact", head: true }),
    supabase.from("contact_clicks").select("id", { count: "exact", head: true }).eq("channel", "demo"),
    supabase.from("contact_clicks").select("id", { count: "exact", head: true }).neq("channel", "demo"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("developers").select("id", { count: "exact", head: true }),
  ]);
  const err = views.error ?? demos.error ?? contacts.error ?? products.error ?? developers.error;
  if (err) throw toUpstream(err);
  return {
    views: views.count ?? 0,
    demoClicks: demos.count ?? 0,
    contactClicks: contacts.count ?? 0,
    publishedProducts: products.count ?? 0,
    developers: developers.count ?? 0,
  };
}
