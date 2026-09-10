import { createServerSupabase } from "@/lib/db";
import { listDevelopersPage } from "@/features/developers/repository";
import { verifyDeveloperAction } from "@/features/admin/actions";

export default async function CreatorsPage() {
  let developers: Awaited<ReturnType<typeof listDevelopersPage>> = [];
  try {
    const supabase = await createServerSupabase();
    developers = await listDevelopersPage(supabase, 50);
  } catch {
    developers = [];
  }
  return (
    <main>
      <h1 className="text-xl font-bold">Kreator</h1>
      <ul className="mt-4 flex flex-col gap-2">
        {developers.map((d) => (
          <li key={d.id} className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 text-sm">
            <span>
              <strong>{d.display_name}</strong> · {d.verified ? "terverifikasi" : "belum verifikasi"}
            </span>
            <form
              action={async () => {
                "use server";
                await verifyDeveloperAction({ developerId: d.id, verified: !d.verified });
              }}
            >
              <button type="submit" className="rounded-lg border border-zinc-300 px-3 py-1.5">
                {d.verified ? "Cabut verifikasi" : "Verifikasi"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
