import Link from "next/link";
import { createServerSupabase } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { getOwnDeveloper } from "@/features/developers/repository";
import { listOwnProducts } from "@/features/products/repository";

/** Overview dashboard: ringkasan produk per status milik sendiri. */
export default async function DashboardPage() {
  let counts = { total: 0, published: 0, draft: 0, inReview: 0 };
  try {
    const supabase = await createServerSupabase();
    const user = await getAuthUser(supabase);
    if (user?.developerId) {
      const products = await listOwnProducts(supabase, user.developerId);
      counts = {
        total: products.length,
        published: products.filter((p) => p.status === "published").length,
        draft: products.filter((p) => p.status === "draft").length,
        inReview: products.filter((p) => ["submitted", "under_review"].includes(p.status)).length,
      };
    } else if (user) {
      const dev = await getOwnDeveloper(supabase, user.id);
      if (dev) {
        const products = await listOwnProducts(supabase, dev.id);
        counts = {
          total: products.length,
          published: products.filter((p) => p.status === "published").length,
          draft: products.filter((p) => p.status === "draft").length,
          inReview: products.filter((p) => ["submitted", "under_review"].includes(p.status)).length,
        };
      }
    }
  } catch {
    counts = { total: 0, published: 0, draft: 0, inReview: 0 };
  }

  return (
    <main>
      <h1 className="text-xl font-bold">Overview</h1>
      <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[["Total produk", counts.total], ["Published", counts.published], ["Draft", counts.draft], ["Dalam review", counts.inReview]].map(
          ([label, v]) => (
            <div key={label as string} className="rounded-lg border border-zinc-200 p-4">
              <dt className="text-sm text-zinc-600">{label}</dt>
              <dd className="text-2xl font-semibold">{v}</dd>
            </div>
          ),
        )}
      </dl>
      <p className="mt-6">
        <Link href="/dashboard/products/new" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">
          Buat Produk
        </Link>
      </p>
    </main>
  );
}
