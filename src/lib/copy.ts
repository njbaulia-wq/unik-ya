/**
 * L4 — abstraksi copy Bahasa Indonesia (keputusan #11: default ID, slug EN).
 * Full i18n (next-intl) ditunda ke Phase 2; semua string UI lewat sini agar
 * migrasi bilingual murah.
 */
export const copy = {
  siteName: "DevMarket",
  tagline: "Temukan software yang sudah jadi dari developer independen.",
  searchPlaceholder: "Cari software, SaaS, template, AI app…",
  exploreProducts: "Jelajahi Produk",
  publishProduct: "Publikasikan Produk",
  contactDeveloper: "Hubungi Developer",
  liveDemo: "Live Demo",
  emptyProducts: {
    title: "Belum ada produk.",
    body: "Jadilah developer pertama yang mempublikasikan software di kategori ini.",
    cta: "Publikasikan Produk",
  },
  notFoundProduct: {
    title: "Produk belum ditemukan.",
    body: "Produk mungkin telah dihapus atau belum dipublikasikan.",
  },
  errorGeneric: {
    title: "Terjadi kesalahan.",
    body: "Coba muat ulang halaman. Jika berlanjut, hubungi kami.",
    cta: "Muat ulang",
  },
  unauthorized: {
    title: "Anda perlu masuk.",
    body: "Halaman ini hanya untuk pengguna yang sudah masuk.",
    cta: "Masuk",
  },
} as const;
