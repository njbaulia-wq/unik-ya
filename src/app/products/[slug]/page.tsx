import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/db";
import { logger } from "@/lib/logger";
import { AppError } from "@/lib/error";
import { getEnv } from "@/lib/env";
import { getProductDetail } from "@/features/products/service";
import { hashIp, recordView } from "@/features/analytics/service";
import { insertView } from "@/features/analytics/repository";
import {
  coverUrl,
  getDeveloperSocials,
  getProductBySlug,
  getProductVersions,
  listSimilarProducts,
} from "@/features/products/repository";
import { VerificationBadges } from "@/features/products/components/VerificationBadges";
import { ContactChannels } from "@/features/products/components/ContactCTA";
import { ContactFlow } from "@/features/products/components/ContactModal";
import { FavoriteButton } from "@/features/favorites/components/FavoriteButton";
import { isFavorited } from "@/features/favorites/repository";
import { getAuthUser } from "@/lib/auth";
import { ProductCard } from "@/features/products/components/ProductCard";

interface Props {
  params: Promise<{ slug: string }>;
}

async function loadSlug(slug: string, requestId?: string) {
  const supabase = await createServerSupabase();
  const product = await getProductDetail(slug, { fetchBySlug: (s) => getProductBySlug(supabase, s) }, { requestId });
  const [socials, similar, versions] = await Promise.all([
    getDeveloperSocials(supabase, product.developer_id),
    listSimilarProducts(supabase, { categoryId: product.category_id, excludeId: product.id }),
    getProductVersions(supabase, product.id),
  ]);
  return { product, socials, similar, versions };
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
  const headerList = await headers();
  const requestId = headerList.get("x-request-id") ?? undefined;
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  let loaded: Awaited<ReturnType<typeof loadSlug>> | null = null;
  try {
    loaded = await loadSlug(slug, requestId);
  } catch (err) {
    if (err instanceof AppError && err.code === "NOT_FOUND") notFound();
    logger.error("Halaman detail produk gagal.", { module: "products", requestId, route: `/products/${slug}`, errorCode: "UPSTREAM_ERROR" });
    throw err;
  }
  if (!loaded) notFound();
  const { product, socials, similar, versions } = loaded;
  // Best-effort: view tercatat tanpa IP mentah; gagal → halaman tetap jalan.
  let initialSaved = false;
  try {
    const supabase = await createServerSupabase();
    await recordView(product.id, hashIp(ip), { insertView: (row) => insertView(supabase, row) }, { requestId });
    const user = await getAuthUser(supabase);
    if (user) initialSaved = await isFavorited(supabase, user.id, product.id);
  } catch {
    // Diabaikan — recordView tidak pernah throw; jaring terakhir.
  }
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

  // Escape `<` agar string DB tak bisa breakout dari <script> (XSS).
  const jsonLdSafe = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <main className="container-page py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSafe }} />
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
          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="text-zinc-500">Harga</dt>
              <dd className="font-medium">{product.price_text || "Hubungi developer"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-zinc-500">Skor kualitas</dt>
              <dd className="font-medium">{product.verification_score} / 100</dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-zinc-600">
            oleh{" "}
            <Link href={`/developers/${product.developers?.slug ?? ""}`} className="font-medium text-zinc-900">
              {product.developers?.display_name ?? "Developer"}
            </Link>
            {product.verification_status === "verified" && <span> · ✓ Platform Verified</span>}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ContactFlow demoUrl={product.demo_url} socials={socials} productSlug={product.slug} />
            <FavoriteButton productSlug={product.slug} initialSaved={initialSaved} />
          </div>

          <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-lg border border-zinc-200">
            <Image
              src={coverUrl(product.product_images?.[0]?.storage_path)}
              alt={product.product_images?.[0]?.alt_text || `${product.name} — tampilan utama`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
            />
          </div>

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
            {versions.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1 text-sm">
                {versions.map((v) => (
                  <li key={v.version} className="rounded-lg border border-zinc-200 px-3 py-2">
                    <strong>{v.version}</strong>
                    {v.changelog && <span className="text-zinc-600"> — {v.changelog}</span>}
                  </li>
                ))}
              </ul>
            )}
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
