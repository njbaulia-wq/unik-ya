import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-page py-12 text-center">
      <h1 className="text-lg font-semibold">Halaman tidak ditemukan.</h1>
      <p className="mt-2 text-sm text-zinc-600">Alamat yang Anda tuju tidak tersedia atau sudah dipindah.</p>
      <p className="mt-4">
        <Link href="/" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">
          Kembali ke beranda
        </Link>
      </p>
    </main>
  );
}
