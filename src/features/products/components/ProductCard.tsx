import Link from "next/link";
import { Badge } from "@/components/ui/primitives";
import type { ProductWithRelations } from "../repository";
import { coverUrl } from "../repository";

/** Product card sederhana (PRD §14) — tanpa info berlebihan. */
export function ProductCard({ product }: { product: ProductWithRelations }) {
  const cover = product.product_images?.[0];
  const updated = new Date(product.updated_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  return (
    <article className="overflow-hidden rounded-lg border border-zinc-200 bg-white transition-colors duration-150 hover:border-zinc-400">
      <Link href={`/products/${product.slug}`} aria-label={`Lihat ${product.name}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl(cover?.storage_path)}
          alt={cover?.alt_text || `${product.name} — tampilan utama`}
          loading="lazy"
          className="aspect-[16/9] w-full object-cover"
        />
      </Link>
      <div className="p-4">
        {product.verification_status === "verified" && <Badge tone="verified">Verified</Badge>}
        <h3 className="mt-2 font-semibold">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{product.short_description}</p>
        <p className="mt-2 text-xs text-zinc-500">{product.tech_stack.join(" · ")}</p>
        <p className="mt-2 flex items-center justify-between text-xs text-zinc-500">
          <span>Diperbarui {updated}</span>
          <Link href={`/products/${product.slug}`} className="font-medium text-zinc-900">
            Explore →
          </Link>
        </p>
      </div>
    </article>
  );
}
