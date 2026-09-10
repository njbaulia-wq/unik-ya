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
