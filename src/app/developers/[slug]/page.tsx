import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/error";
import { getDeveloperProfile } from "@/features/developers/service";
import { logBusinessEvent } from "@/features/analytics/service";
import { getDeveloperBySlug, listDeveloperProducts } from "@/features/developers/repository";
import { ProductCard } from "@/features/products/components/ProductCard";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const supabase = await createServerSupabase();
    const { profile } = await getDeveloperProfile(
      slug,
      { fetchBySlug: (s) => getDeveloperBySlug(supabase, s), fetchProducts: (id) => listDeveloperProducts(supabase, id) },
      {},
    );
    return {
      title: `${profile.display_name} — DevMarket`,
      description: profile.bio || `Produk software oleh ${profile.display_name}.`,
      alternates: { canonical: `${getEnv().NEXT_PUBLIC_SITE_URL}/developers/${profile.slug}` },
    };
  } catch {
    return { title: "Developer — DevMarket" };
  }
}

export default async function DeveloperProfilePage({ params }: Props) {
  const { slug } = await params;
  const requestId = (await headers()).get("x-request-id") ?? undefined;

  let data: Awaited<ReturnType<typeof getDeveloperProfile>> | null = null;
  try {
    const supabase = await createServerSupabase();
    data = await getDeveloperProfile(
      slug,
      { fetchBySlug: (s) => getDeveloperBySlug(supabase, s), fetchProducts: (id) => listDeveloperProducts(supabase, id) },
      { requestId },
    );
  } catch (err) {
    if (err instanceof AppError && err.code === "NOT_FOUND") notFound();
    throw err;
  }
  if (!data) notFound();
  const { profile, products, stats } = data;
  logBusinessEvent({ type: "developer_profile_view", ref: profile.slug }, { requestId });

  return (
    <main className="container-page py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-zinc-600">
        <Link href="/developers">Developer</Link> / <span aria-current="page">{profile.display_name}</span>
      </nav>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">{profile.display_name}</h1>
      {profile.bio && <p className="mt-2 max-w-2xl text-zinc-600">{profile.bio}</p>}
      <dl className="mt-4 flex gap-6 text-sm">
        <div>
          <dt className="text-zinc-500">Produk</dt>
          <dd className="text-lg font-semibold">{stats.products}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Terverifikasi</dt>
          <dd className="text-lg font-semibold">{stats.verified}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Diperbarui recently</dt>
          <dd className="text-lg font-semibold">{stats.updatedRecently}</dd>
        </div>
      </dl>
      {(profile.website_url || profile.github_url) && (
        <p className="mt-3 flex gap-3 text-sm">
          {profile.website_url && (
            <a href={profile.website_url} target="_blank" rel="nofollow noopener" className="underline">
              Website
            </a>
          )}
          {profile.github_url && (
            <a href={profile.github_url} target="_blank" rel="nofollow noopener" className="underline">
              GitHub
            </a>
          )}
        </p>
      )}
      <h2 className="mt-8 text-lg font-semibold">Produk oleh {profile.display_name}</h2>
      {products.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-600">Belum ada produk yang dipublikasikan.</p>
      ) : (
        <div className="grid-products mt-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
