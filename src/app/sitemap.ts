import type { MetadataRoute } from "next";
import { getEnv } from "@/lib/env";

/** Sitemap otomatis: hanya public + published (PRD §39). Tanpa env → sitemap minimal. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getEnv().NEXT_PUBLIC_SITE_URL;
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site}/`, changeFrequency: "daily", priority: 1 },
    { url: `${site}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${site}/developers`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${site}/how-it-works`, changeFrequency: "monthly", priority: 0.5 },
  ];
  try {
    const { createServerSupabase } = await import("@/lib/db");
    const supabase = await createServerSupabase();
    const [products, developers, categories] = await Promise.all([
      supabase.from("products").select("slug,updated_at").eq("status", "published").limit(1000),
      supabase.from("developers").select("slug").limit(500),
      supabase.from("categories").select("slug").limit(100),
    ]);
    const dynamic: MetadataRoute.Sitemap = [
      ...((products.data ?? []) as { slug: string; updated_at: string }[]).map((p) => ({
        url: `${site}/products/${p.slug}`,
        lastModified: p.updated_at,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...((developers.data ?? []) as { slug: string }[]).map((d) => ({
        url: `${site}/developers/${d.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...((categories.data ?? []) as { slug: string }[]).map((c) => ({
        url: `${site}/categories/${c.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
    return [...staticRoutes, ...dynamic];
  } catch {
    return staticRoutes;
  }
}
