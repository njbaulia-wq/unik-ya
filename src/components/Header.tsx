import Link from "next/link";
import { copy } from "@/lib/copy";

/** Header + navigasi mobile khusus (bukan desktop dikecilkan). */
export function Header() {
  return (
    <header className="border-b border-zinc-200">
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <Link href="/" className="font-semibold tracking-tight" aria-label={copy.siteName}>
          {copy.siteName}
        </Link>
        <nav aria-label="Utama" className="hidden items-center gap-5 text-sm md:flex">
          <Link href="/products">Marketplace</Link>
          <Link href="/categories/saas">Kategori</Link>
          <Link href="/developers">Developer</Link>
          <Link href="/how-it-works">Cara Kerja</Link>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className="text-sm">
            Masuk
          </Link>
          <Link href="/dashboard/products/new" className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm text-white">
            {copy.publishProduct}
          </Link>
        </div>
        <details className="md:hidden">
          <summary aria-label="Buka menu" className="cursor-pointer rounded-lg border border-zinc-300 px-3 py-1.5 text-sm">
            Menu
          </summary>
          <nav aria-label="Seluler" className="absolute inset-x-0 top-14 flex flex-col gap-1 border-b border-zinc-200 bg-white p-4 text-sm">
            <Link href="/products">Marketplace</Link>
            <Link href="/categories/saas">Kategori</Link>
            <Link href="/developers">Developer</Link>
            <Link href="/how-it-works">Cara Kerja</Link>
            <Link href="/login">Masuk</Link>
            <Link href="/dashboard/products/new">{copy.publishProduct}</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200">
      <div className="container-page flex flex-col gap-2 py-8 text-sm text-zinc-600 md:flex-row md:justify-between">
        <p>
          {copy.siteName} — {copy.tagline}
        </p>
        <nav aria-label="Bawah" className="flex gap-4">
          <Link href="/how-it-works">Cara Kerja</Link>
          <Link href="/products">Marketplace</Link>
          <Link href="/developers">Developer</Link>
        </nav>
      </div>
    </footer>
  );
}
