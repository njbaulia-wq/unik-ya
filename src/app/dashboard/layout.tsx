import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Layout guard server-side: anonim → /login (middleware juga menjaga). */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let authed = false;
  try {
    const supabase = await createServerSupabase();
    authed = (await getAuthUser(supabase)) !== null;
  } catch {
    authed = false;
  }
  if (!authed) redirect("/login?next=/dashboard");
  return (
    <div className="container-page flex gap-8 py-8">
      <nav aria-label="Dashboard" className="hidden w-48 shrink-0 flex-col gap-1 text-sm md:flex">
        <Link href="/dashboard" className="rounded-lg px-3 py-2 hover:bg-zinc-100">Overview</Link>
        <Link href="/dashboard/products" className="rounded-lg px-3 py-2 hover:bg-zinc-100">Produk</Link>
        <Link href="/dashboard/products/new" className="rounded-lg px-3 py-2 hover:bg-zinc-100">Buat Produk</Link>
        <Link href="/dashboard/profile" className="rounded-lg px-3 py-2 hover:bg-zinc-100">Profil</Link>
        <Link href="/dashboard/contacts" className="rounded-lg px-3 py-2 hover:bg-zinc-100">Kontak</Link>
        <Link href="/dashboard/favorites" className="rounded-lg px-3 py-2 hover:bg-zinc-100">Favorit</Link>
      </nav>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
