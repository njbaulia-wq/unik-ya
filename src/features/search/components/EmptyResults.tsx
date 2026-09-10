import Link from "next/link";
import { copy } from "@/lib/copy";

/** Saran saat hasil kosong (PRD §64) — membantu, bukan dead-end. */
export function EmptyResults({ q }: { q?: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 px-6 py-12 text-center">
      <h2 className="text-lg font-semibold">{q ? `Tidak menemukan "${q}".` : "Belum ada produk."}</h2>
      <p className="mt-2 text-sm text-zinc-600">Coba kata kunci lain:</p>
      <ul className="mt-3 flex flex-wrap justify-center gap-2 text-sm">
        {["SaaS", "inventory", "AI", "Next.js"].map((s) => (
          <li key={s}>
            <Link href={`/products?q=${encodeURIComponent(s)}`} className="rounded-lg border border-zinc-300 px-3 py-1.5">
              {s}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-zinc-600">
        {copy.emptyProducts.body}{" "}
        <Link href="/dashboard/products/new" className="font-medium text-zinc-900">
          {copy.emptyProducts.cta}
        </Link>
      </p>
    </div>
  );
}
