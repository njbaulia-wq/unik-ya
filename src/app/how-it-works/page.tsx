import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cara Kerja — DevMarket",
  description: "Temukan, cek, dan hubungi pembuat software secara langsung.",
};

export default function HowItWorksPage() {
  return (
    <main className="container-page py-8">
      <h1 className="text-2xl font-bold tracking-tight">Cara Kerja</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section aria-label="Untuk pembeli" className="rounded-lg border border-zinc-200 p-5">
          <h2 className="text-lg font-semibold">Untuk pembeli</h2>
          <p className="mt-2 text-sm text-zinc-600">Temukan, cek, dan hubungi pembuat software secara langsung.</p>
          <ol className="mt-3 list-decimal pl-5 text-sm">
            <li>Cari produk di marketplace atau berdasarkan kategori.</li>
            <li>Cek verifikasi platform, demo, dan dokumentasi.</li>
            <li>Klik Hubungi Developer untuk terhubung langsung.</li>
          </ol>
        </section>
        <section aria-label="Untuk developer" className="rounded-lg border border-zinc-200 p-5">
          <h2 className="text-lg font-semibold">Untuk developer</h2>
          <p className="mt-2 text-sm text-zinc-600">Publikasikan produkmu. Biarkan calon pengguna menemukannya.</p>
          <ol className="mt-3 list-decimal pl-5 text-sm">
            <li>Daftar dan lengkapi profil developer.</li>
            <li>Tambahkan produk dan kirim untuk review.</li>
            <li>Setelah disetujui dan terverifikasi, produk tampil publik.</li>
          </ol>
        </section>
      </div>
      <p className="mt-6 text-sm">
        <Link href="/products" className="rounded-lg bg-zinc-900 px-4 py-2 text-white">
          Jelajahi Produk
        </Link>
      </p>
    </main>
  );
}
