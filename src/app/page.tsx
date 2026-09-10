import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { createServerSupabase } from "@/lib/db";
import { logger } from "@/lib/logger";
import { copy } from "@/lib/copy";
import { EmptyState } from "@/components/States";
import { getHomepageSections } from "@/features/products/service";
import { listCategories, listDevelopers, listPublishedProducts } from "@/features/products/repository";
import { ProductCard } from "@/features/products/components/ProductCard";

export const metadata: Metadata = {
  title: "DevMarket — Temukan software yang sudah jadi",
  description:
    "Discover useful software, templates, SaaS and developer products made by independent builders. Temukan, bandingkan, hubungi pembuatnya.",
};

/** Homepage (PRD §12–13): hero + search + Featured/Kategori/New/Verified/Developers/HowItWorks/CTA. */
export default async function Home() {
  const requestId = (await headers()).get("x-request-id") ?? undefined;
  const sections = await getHomepageSections(
    {
      fetchFeatured: async () => {
        try {
          const supabase = await createServerSupabase();
          return await listPublishedProducts(supabase, { limit: 6, featuredOnly: true });
        } catch {
          return [];
        }
      },
      fetchNew: async () => {
        try {
          const supabase = await createServerSupabase();
          return await listPublishedProducts(supabase, { limit: 6, orderBy: "created_at" });
        } catch {
          return [];
        }
      },
      fetchVerified: async () => {
        try {
          const supabase = await createServerSupabase();
          return await listPublishedProducts(supabase, { limit: 6, verifiedOnly: true });
        } catch {
          return [];
        }
      },
      fetchCategories: async () => {
        try {
          const supabase = await createServerSupabase();
          return await listCategories(supabase);
        } catch {
          return [];
        }
      },
      fetchDevelopers: async () => {
        try {
          const supabase = await createServerSupabase();
          return await listDevelopers(supabase, 6);
        } catch {
          return [];
        }
      },
    },
    { requestId },
  );
  logger.info("Homepage dirender.", { module: "products", requestId, route: "/" });

  return (
    <main className="container-page">
      <section className="py-12 md:py-16">
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
          Software yang sudah jadi. Temukan. Bandingkan. Hubungi pembuatnya.
        </h1>
        <p className="mt-3 max-w-xl text-zinc-600">
          Discover useful software, templates, SaaS and developer products made by independent builders.
        </p>
        <form action="/products" method="get" role="search" className="mt-6 flex max-w-xl gap-2">
          <label htmlFor="q" className="sr-only">
            Cari produk
          </label>
          <input
            id="q"
            name="q"
            type="search"
            placeholder={copy.searchPlaceholder}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5"
          />
          <button type="submit" className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm text-white">
            Cari
          </button>
        </form>
        <p className="mt-4 flex gap-3 text-sm">
          <Link href="/products" className="rounded-lg bg-zinc-900 px-4 py-2 text-white">
            {copy.exploreProducts}
          </Link>
          <Link href="/dashboard/products/new" className="rounded-lg border border-zinc-300 px-4 py-2">
            {copy.publishProduct}
          </Link>
        </p>
      </section>

      <Section title="Produk Unggulan" href="/products">
        <ProductGrid slugs={sections.featured} />
      </Section>

      <section aria-label="Kategori populer" className="py-8">
        <h2 className="text-xl font-semibold">Kategori Populer</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {sections.categories.map((c) => (
            <li key={c.id}>
              <Link href={`/categories/${c.slug}`} className="inline-block rounded-lg border border-zinc-300 px-4 py-2 text-sm">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Section title="Produk Terbaru" href="/products?sort=newest">
        <ProductGrid slugs={sections.newest} />
      </Section>

      <Section title="Terverifikasi Platform" href="/products?verified=true">
        <ProductGrid slugs={sections.verified} />
      </Section>

      <section aria-label="Developer" className="py-8">
        <h2 className="text-xl font-semibold">Developer</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sections.developers.map((d) => (
            <li key={d.id} className="rounded-lg border border-zinc-200 p-4">
              <Link href={`/developers/${d.slug}`} className="font-medium">
                {d.display_name}
              </Link>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{d.bio}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Cara kerja" className="py-8">
        <h2 className="text-xl font-semibold">Cara Kerja</h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-3">
          <li className="rounded-lg border border-zinc-200 p-4">
            <strong>1. Temukan</strong>
            <p className="mt-1 text-sm text-zinc-600">Cari dan bandingkan software yang sudah jadi.</p>
          </li>
          <li className="rounded-lg border border-zinc-200 p-4">
            <strong>2. Cek</strong>
            <p className="mt-1 text-sm text-zinc-600">Periksa verifikasi platform, demo, dan dokumentasi.</p>
          </li>
          <li className="rounded-lg border border-zinc-200 p-4">
            <strong>3. Hubungi</strong>
            <p className="mt-1 text-sm text-zinc-600">Hubungi developer langsung via kontak pilihannya.</p>
          </li>
        </ol>
      </section>

      <section aria-label="Ajakan" className="rounded-lg border border-zinc-200 bg-zinc-50 px-6 py-10 text-center">
        <h2 className="text-xl font-semibold">Punya produk yang sudah jadi?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">Publikasikan produkmu. Biarkan calon pengguna menemukannya.</p>
        <p className="mt-4">
          <Link href="/dashboard/products/new" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">
            {copy.publishProduct}
          </Link>
        </p>
      </section>
    </main>
  );
}

function Section({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="py-8">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link href={href} className="text-sm text-zinc-600">
          Lihat semua →
        </Link>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ProductGrid({ slugs }: { slugs: Parameters<typeof ProductCard>[0]["product"][] }) {
  if (slugs.length === 0) {
    return (
      <EmptyState
        title={copy.emptyProducts.title}
        body={copy.emptyProducts.body}
        ctaHref="/dashboard/products/new"
        ctaLabel={copy.emptyProducts.cta}
      />
    );
  }
  return (
    <div className="grid-products">
      {slugs.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
