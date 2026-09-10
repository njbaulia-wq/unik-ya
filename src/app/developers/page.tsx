import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabase } from "@/lib/db";
import { listDevelopersPage } from "@/features/developers/repository";

export const metadata: Metadata = {
  title: "Developer — DevMarket",
  description: "Temukan developer independen dan produk software mereka.",
};

export default async function DevelopersPage() {
  let developers: Awaited<ReturnType<typeof listDevelopersPage>> = [];
  try {
    const supabase = await createServerSupabase();
    developers = await listDevelopersPage(supabase);
  } catch {
    developers = [];
  }
  return (
    <main className="container-page py-8">
      <h1 className="text-2xl font-bold tracking-tight">Developer</h1>
      <p className="mt-2 text-sm text-zinc-600">Builder independen di balik produk-produk marketplace.</p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {developers.map((d) => (
          <li key={d.id} className="rounded-lg border border-zinc-200 p-4">
            <Link href={`/developers/${d.slug}`} className="font-medium">
              {d.display_name}
            </Link>
            <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{d.bio}</p>
          </li>
        ))}
      </ul>
      {developers.length === 0 && <p className="mt-6 text-sm text-zinc-600">Belum ada developer.</p>}
    </main>
  );
}
