import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { createServerSupabase } from "@/lib/db";
import { logger } from "@/lib/logger";
import { copy } from "@/lib/copy";
import { ErrorState } from "@/components/States";
import { ProductCard } from "@/features/products/components/ProductCard";
import { runSearch } from "@/features/search/service";
import { searchProducts } from "@/features/search/repository";
import { EmptyResults } from "@/features/search/components/EmptyResults";

export const metadata: Metadata = {
  title: "Marketplace — DevMarket",
  description: "Jelajahi software, SaaS, template, dan AI app dari developer independen.",
};

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** L1 katalog + search (PRD §23–24): FTS + filter + sort + pagination. */
export default async function ProductsPage({ searchParams }: Props) {
  const requestId = (await headers()).get("x-request-id") ?? undefined;
  const raw = await searchParams;

  let result: Awaited<ReturnType<typeof runSearch>> | null = null;
  try {
    result = await runSearch(
      raw,
      {
        search: async (params) => {
          const supabase = await createServerSupabase();
          return searchProducts(supabase, params);
        },
      },
      { requestId },
    );
  } catch {
    logger.error("Halaman katalog gagal.", { module: "search", requestId, route: "/products", errorCode: "UPSTREAM_ERROR" });
  }
  if (!result) {
    return (
      <main className="container-page py-8">
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <div className="mt-4">
          <ErrorState />
        </div>
      </main>
    );
  }
  return <Catalog result={result} />;
}

function Catalog({ result }: { result: Awaited<ReturnType<typeof runSearch>> }) {
  const totalPages = Math.max(1, Math.ceil(result.total / result.perPage));
  return (
    <main className="container-page py-8">
      <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
      <form action="/products" method="get" role="search" className="mt-4 flex max-w-xl gap-2">
        <label htmlFor="q" className="sr-only">
          Cari produk
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={result.applied.q ?? ""}
          placeholder={copy.searchPlaceholder}
          className="w-full rounded-lg border border-zinc-300 px-4 py-2"
        />
        <button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">
          Cari
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2 text-sm" aria-label="Filter">
        <FilterLink href="/products" active={!result.applied.verified && !result.applied.hasDemo} label="Semua" />
        <FilterLink href="/products?verified=true" active={result.applied.verified === "true"} label="Terverifikasi" />
        <FilterLink href="/products?hasDemo=true" active={result.applied.hasDemo === "true"} label="Ada Demo" />
      </div>

      <div className="mt-2 flex flex-wrap gap-2 text-sm" aria-label="Urutkan">
        <span className="text-zinc-600">Urutkan:</span>
        <SortLink base={result.applied} value="relevance" label="Relevansi" />
        <SortLink base={result.applied} value="newest" label="Terbaru" />
        <SortLink base={result.applied} value="updated" label="Baru diperbarui" />
        <SortLink base={result.applied} value="popular" label="Populer" />
      </div>

      <p className="mt-4 text-sm text-zinc-600" role="status">
        {result.total} produk ditemukan
        {result.applied.q ? ` untuk "${result.applied.q}"` : ""}.
      </p>

      {result.items.length === 0 ? (
        <div className="mt-4">
          <EmptyResults q={result.applied.q} />
        </div>
      ) : (
        <div className="grid-products mt-4">
          {result.items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="Halaman" className="mt-8 flex gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/products?${new URLSearchParams({ ...toQuery(result.applied), page: String(p) })}`}
              aria-current={p === result.page ? "page" : undefined}
              className={`rounded-lg border px-3 py-1.5 ${p === result.page ? "border-zinc-900 font-medium" : "border-zinc-300"}`}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </main>
  );
}

function FilterLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-pressed={active}
      className={`rounded-lg border px-3 py-1.5 ${active ? "border-zinc-900 font-medium" : "border-zinc-300"}`}
    >
      {label}
    </Link>
  );
}

function SortLink({ base, value, label }: { base: Record<string, unknown>; value: string; label: string }) {
  const active = (base.sort as string | undefined) === value || (!base.sort && value === "relevance");
  return (
    <Link
      href={`/products?${new URLSearchParams({ ...toQuery(base), sort: value })}`}
      aria-pressed={active}
      className={`rounded-lg border px-3 py-1.5 ${active ? "border-zinc-900 font-medium" : "border-zinc-300"}`}
    >
      {label}
    </Link>
  );
}

function toQuery(applied: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(applied)) {
    if (typeof v === "string" && v !== "") out[k] = v;
  }
  return out;
}
