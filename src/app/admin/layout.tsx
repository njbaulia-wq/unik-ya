import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Layout guard: hanya admin (cek server-side, bukan sekadar middleware). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let isAdmin = false;
  try {
    const supabase = await createServerSupabase();
    isAdmin = (await getAuthUser(supabase))?.isAdmin === true;
  } catch {
    isAdmin = false;
  }
  if (!isAdmin) redirect("/login?next=/admin");
  return (
    <div className="container-page flex gap-8 py-8">
      <nav aria-label="Admin" className="hidden w-48 shrink-0 flex-col gap-1 text-sm md:flex">
        <Link href="/admin" className="rounded-lg px-3 py-2 hover:bg-zinc-100">Overview</Link>
        <Link href="/admin/pending" className="rounded-lg px-3 py-2 hover:bg-zinc-100">Antrian Review</Link>
        <Link href="/admin/creators" className="rounded-lg px-3 py-2 hover:bg-zinc-100">Kreator</Link>
        <Link href="/admin/categories" className="rounded-lg px-3 py-2 hover:bg-zinc-100">Kategori</Link>
      </nav>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
