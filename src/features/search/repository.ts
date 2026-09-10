import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError, SafeMessages } from "@/lib/error";
import type { ProductWithRelations } from "@/features/products/repository";
import { PER_PAGE, type SearchParams } from "./schema";

/**
 * L3 search repository — Postgres FTS (search_vector) + filter + sort.
 * Tanpa Elasticsearch (PRD §23). Input sudah lolos Zod di service.
 */
export interface SearchResult {
  items: ProductWithRelations[];
  total: number;
  page: number;
  perPage: number;
}

/** Sanitasi query FTS: kata alfanumerik digabung AND; tolak operator mentah. */
export function toTsQuery(q: string): string {
  const words = q
    .toLowerCase()
    .split(/[^a-z0-9\u00C0-\u024F]+/u)
    .map((w) => w.trim())
    .filter((w) => w.length > 1)
    .slice(0, 10);
  return words.join(" & ");
}

const SELECT = "*, developers!inner(display_name,slug,verified), categories!inner(name,slug), product_images(storage_path,alt_text)";

export async function searchProducts(
  supabase: SupabaseClient,
  params: SearchParams,
): Promise<SearchResult> {
  try {
    let query = supabase.from("products").select(SELECT, { count: "exact" }).eq("status", "published");

    const ts = params.q ? toTsQuery(params.q) : "";
    if (ts) query = query.textSearch("search_vector", ts, { type: "plain", config: "simple" });
    if (params.category) query = query.eq("categories.slug", params.category);
    if (params.productType) query = query.eq("product_type", params.productType);
    if (params.technology) query = query.contains("tech_stack", [params.technology]);
    if (params.verified === "true") query = query.eq("verification_status", "verified");
    if (params.hasDemo === "true") query = query.not("demo_url", "is", null);

    switch (params.sort) {
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "updated":
        query = query.order("updated_at", { ascending: false });
        break;
      case "popular":
      case "relevance":
        query = query.order("verification_score", { ascending: false }).order("published_at", { ascending: false });
        break;
    }

    const from = (params.page - 1) * PER_PAGE;
    const { data, error, count } = await query.range(from, from + PER_PAGE - 1);
    if (error) throw error;
    return { items: (data ?? []) as unknown as ProductWithRelations[], total: count ?? 0, page: params.page, perPage: PER_PAGE };
  } catch (err) {
    throw new AppError("UPSTREAM_ERROR", SafeMessages.upstream, { cause: err });
  }
}
