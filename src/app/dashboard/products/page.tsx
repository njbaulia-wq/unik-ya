import { createServerSupabase } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { getOwnDeveloper } from "@/features/developers/repository";
import { listOwnProducts } from "@/features/products/repository";
import Link from "next/link";

/** Daftar produk milik sendiri (T11 menambah aksi create/edit). */
export default async function DashboardProductsPage() {
  let products: Awaited<ReturnType<typeof listOwnProducts>> = [];
  try {
    const supabase = await createServerSupabase();
    const user = await getAuthUser(supabase);
    const devId = user?.developerId ?? (user ? (await getOwnDeveloper(supabase, user.id))?.id : undefined);
    if (devId) products = await listOwnProducts(supabase, devId);
  } catch {
    products = [];
  }
  return (
    <main>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Produk Saya</h1>
        <Link href="/dashboard/products/new" className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm text-white">
          Buat Produk
        </Link>
      </div>
      {products.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-600">Belum ada produk. Buat produk pertama Anda.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {products.map((p) => (
            <li key={p.id} className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-zinc-500">{p.slug}</p>
              </div>
              <span className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs">{p.status}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
