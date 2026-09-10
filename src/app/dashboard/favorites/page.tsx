import { createServerSupabase } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { listFavorites } from "@/features/favorites/repository";
import { ProductCard } from "@/features/products/components/ProductCard";

/** Daftar favorit milik sendiri — signal demand produk (PRD §26). */
export default async function FavoritesPage() {
  let items: Awaited<ReturnType<typeof listFavorites>> = [];
  try {
    const supabase = await createServerSupabase();
    const user = await getAuthUser(supabase);
    if (user) items = await listFavorites(supabase, user.id);
  } catch {
    items = [];
  }
  return (
    <main>
      <h1 className="text-xl font-bold">Favorit Saya</h1>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-600">Belum ada produk tersimpan. Jelajahi marketplace dan simpan yang menarik.</p>
      ) : (
        <div className="grid-products mt-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
