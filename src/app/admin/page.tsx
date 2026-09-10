import { createServerSupabase } from "@/lib/db";
import { adminOverview } from "@/features/admin/repository";

export default async function AdminPage() {
  let stats = { pending: 0, published: 0, developers: 0 };
  try {
    const supabase = await createServerSupabase();
    stats = await adminOverview(supabase);
  } catch {
    stats = { pending: 0, published: 0, developers: 0 };
  }
  return (
    <main>
      <h1 className="text-xl font-bold">Admin Overview</h1>
      <dl className="mt-4 grid grid-cols-3 gap-3">
        {[
          ["Menunggu review", stats.pending],
          ["Published", stats.published],
          ["Developer", stats.developers],
        ].map(([label, v]) => (
          <div key={label as string} className="rounded-lg border border-zinc-200 p-4">
            <dt className="text-sm text-zinc-600">{label}</dt>
            <dd className="text-2xl font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
