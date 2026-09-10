import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/db";
import { AppError } from "@/lib/error";
import { getCategoryPage, resolveCategory } from "@/features/categories/service";
import { listCategories } from "@/features/products/repository";
import { listCategoryProducts } from "@/features/products/repository";
import { ProductCard } from "@/features/products/components/ProductCard";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Kategori ${slug} — DevMarket` };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const requestId = (await headers()).get("x-request-id") ?? undefined;

  let data: Awaited<ReturnType<typeof getCategoryPage>> | null = null;
  try {
    const supabase = await createServerSupabase();
    data = await getCategoryPage(
      slug,
      {
        resolve: (s) => resolveCategory(supabase, s),
        fetchProducts: (id) => listCategoryProducts(supabase, id),
        fetchCategories: () => listCategories(supabase),
      },
      { requestId },
    );
  } catch (err) {
    if (err instanceof AppError && err.code === "NOT_FOUND") notFound();
    throw err;
  }
  if (!data) notFound();
  if (data.redirectTo) redirect(`/categories/${data.redirectTo}`);
  const { category, products, categories } = data;

  return (
    <main className="container-page py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-zinc-600">
        <Link href="/products">Marketplace</Link> / <span aria-current="page">{category.name}</span>
      </nav>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">{category.name}</h1>
      {category.description && <p className="mt-2 max-w-2xl text-zinc-600">{category.description}</p>}
      <ul className="mt-4 flex flex-wrap gap-2 text-sm" aria-label="Kategori lain">
        {categories.map((c) => (
          <li key={c.id}>
            <Link
              href={`/categories/${c.slug}`}
              aria-current={c.slug === category.slug ? "page" : undefined}
              className={`inline-block rounded-lg border px-3 py-1.5 ${c.slug === category.slug ? "border-zinc-900 font-medium" : "border-zinc-300"}`}
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
      {products.length === 0 ? (
        <div className="mt-6 rounded-lg border border-zinc-200 px-6 py-12 text-center">
          <h2 className="text-lg font-semibold">Belum ada produk.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">
            Jadilah developer pertama yang mempublikasikan software di kategori ini.
          </p>
          <p className="mt-4">
            <Link href="/dashboard/products/new" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">
              Publikasikan Produk
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid-products mt-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
