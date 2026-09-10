import { createServerSupabase } from "@/lib/db";
import { listCategories } from "@/features/products/repository";
import { renameCategoryAction } from "@/features/admin/actions";

/** Kelola kategori — hanya display name (slug immutable, keputusan #4). */
export default async function CategoriesPage() {
  let categories: Awaited<ReturnType<typeof listCategories>> = [];
  try {
    const supabase = await createServerSupabase();
    categories = await listCategories(supabase);
  } catch {
    categories = [];
  }
  return (
    <main>
      <h1 className="text-xl font-bold">Kategori</h1>
      <p className="mt-1 text-sm text-zinc-600">Slug tidak bisa diubah ( immutable demi SEO ).</p>
      <ul className="mt-4 flex flex-col gap-2">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 px-4 py-3 text-sm">
            <span>
              <strong>{c.name}</strong> · <code>{c.slug}</code>
            </span>
            <form
              className="flex gap-2"
              action={async (fd: FormData) => {
                "use server";
                await renameCategoryAction({ categoryId: String(fd.get("categoryId")), name: String(fd.get("name")) });
              }}
            >
              <input type="hidden" name="categoryId" value={c.id} />
              <input name="name" defaultValue={c.name} aria-label={`Nama baru untuk ${c.slug}`} className="rounded-lg border border-zinc-300 px-2 py-1.5" />
              <button type="submit" className="rounded-lg border border-zinc-300 px-3 py-1.5">
                Ganti nama
              </button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
