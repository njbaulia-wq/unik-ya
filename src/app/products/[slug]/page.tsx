import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/db";
import { logger } from "@/lib/logger";
import { AppError } from "@/lib/error";
import { getEnv } from "@/lib/env";
import { getProductDetail } from "@/features/products/service";
import {
  coverUrl,
  getDeveloperSocials,
  getProductBySlug,
  listSimilarProducts,
} from "@/features/products/repository";
import { VerificationBadges } from "@/features/products/components/VerificationBadges";
import { ContactChannels } from "@/features/products/components/ContactCTA";
import { ContactFlow } from "@/features/products/components/ContactModal";
import { ProductCard } from "@/features/products/components/ProductCard";

interface Props {
  params: Promise<{ slug: string }>;
}

async function loadSlug(slug: string, requestId?: string) {
  const supabase = await createServerSupabase();
  const product = await getProductDetail(slug, { fetchBySlug: (s) => getProductBySlug(supabase, s) }, { requestId });
  const [socials, similar] = await Promise.all([
    getDeveloperSocials(supabase, product.developer_id),
    listSimilarProducts(supabase, { categoryId: product.category_id, excludeId: product.id }),
  ]);
  return { product, socials, similar };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const supabase = await createServerSupabase();
    const product = await getProductDetail(slug, { fetchBySlug: (s) => getProductBySlug(supabase, s) }, {});
    const site = getEnv().NEXT_PUBLIC_SITE_URL;
    const url = `${site}/products/${product.slug}`;
    return {
      title: `${product.name} — DevMarket`,
      description: product.short_description,
      alternates: { canonical: url },
      openGraph: { title: product.name, description: product.short_description, url, type: "article" },
      twitter: { card: "summary_large_image", title: product.name, description: product.short_description },
    };
  } catch {
    return { title: "Produk — DevMarket" };
  }
}

/** L1 product detail (PRD §15): SEO dinamis + schema jujur + similar products. */
export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const requestId = (await headers()).get("x-request-id") ?? undefined;

  let loaded: Awaited<ReturnType<typeof loadSlug>> | null = null;
  try {
    loaded = await loadSlug(slug, requestId);
  } catch (err) {
    if (err instanceof AppError && err.code === "NOT_FOUND") notFound();
    logger.error("Halaman detail produk gagal.", { module: "products", requestId, route: `/products/${slug}`, errorCode: "UPSTREAM_ERROR" });
    throw err;
  }
  if (!loaded) notFound();
  const { product, socials, similar } = loaded;
  const site = getEnv().NEXT_PUBLIC_SITE_URL;

  // Structured data jujur: tanpa klaim rating/review palsu; verifikasi
  // ditampilkan sebagai teks di halaman (✓ Platform Verified), bukan schema.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: product.name,
        description: product.short_description,
        url: `${site}/products/${product.slug}`,
        applicationCategory: product.product_type,
        operatingSystem: "Web",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Marketplace", item: `${site}/products` },
          { "@type": "ListItem", position: 2, name: product.name, item: `${site}/products/${product.slug}` },
        ],
      },
    ],
  };

  return (
    <main className="container-page py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="text-sm text-zinc-600">
        <Link href="/products">Marketplace</Link> / <span aria-current="page">{product.name}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
          <p className="mt-2 text-zinc-600">{product.short_description}</p>
          <div className="mt-3">
            <VerificationBadges product={product} />
          </div>
          <p className="mt-3 text-sm text-zinc-600">
            oleh{" "}
            <Link href={`/developers/${product.developers?.slug ?? ""}`} className="font-medium text-zinc-900">
              {product.developers?.display_name ?? "Developer"}
            </Link>
            {product.verification_status === "verified" && <span> · ✓ Platform Verified</span>}
          </p>
          <div className="mt-4">
            <ContactFlow demoUrl={product.demo_url} socials={socials} productSlug={product.slug} />
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl(product.product_images?.[0]?.storage_path)}
            alt={product.product_images?.[0]?.alt_text || `${product.name} — tampilan utama`}
            className="mt-6 aspect-[16/9] w-full rounded-lg border border-zinc-200 object-cover"
          />

          <section aria-label="Overview" className="mt-8">
            <h2 className="text-lg font-semibold">Overview</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{product.description}</p>
          </section>

          <section aria-label="Fitur" className="mt-6">
            <h2 className="text-lg font-semibold">Fitur</h2>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {product.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </section>

          <section aria-label="Teknologi" className="mt-6">
            <h2 className="text-lg font-semibold">Teknologi</h2>
            <p className="mt-2 text-sm text-zinc-600">
              <span className="text-zinc-500">Developer provided: </span>
              {product.tech_stack.join(", ")}
            </p>
          </section>

          <section aria-label="Versi" className="mt-6">
            <h2 className="text-lg font-semibold">Versi</h2>
            <p className="mt-2 text-sm text-zinc-600">
              {product.version} · Lisensi: {product.license_type}
            </p>
            {product.documentation_url && (
              <p className="mt-1 text-sm">
                <a href={product.documentation_url} target="_blank" rel="nofollow noopener" className="underline">
                  Dokumentasi
                </a>
              </p>
            )}
          </section>

          <section aria-label="Developer" className="mt-6 rounded-lg border border-zinc-200 p-4">
            <h2 className="text-lg font-semibold">Developer</h2>
            <p className="mt-2 text-sm">
              <Link href={`/developers/${product.developers?.slug ?? ""}`} className="font-medium">
                {product.developers?.display_name}
              </Link>
            </p>
            <div id="kontak-developer" className="mt-3">
              <h3 className="text-sm font-medium">Cara menghubungi developer</h3>
              <div className="mt-2">
                <ContactChannels socials={socials} />
              </div>
            </div>
          </section>
        </div>

        <aside aria-label="Produk serupa" className="lg:col-span-1">
          <h2 className="text-lg font-semibold">Produk Serupa</h2>
          <div className="mt-3 flex flex-col gap-4">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
            {similar.length === 0 && <p className="text-sm text-zinc-600">Belum ada produk serupa.</p>}
          </div>
        </aside>
      </div>
    </main>
  );
}
