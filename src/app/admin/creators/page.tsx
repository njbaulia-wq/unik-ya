import { createServerSupabase } from "@/lib/db";
import { listDevelopersPage } from "@/features/developers/repository";
import { suspendDeveloperAction, verifyDeveloperAction } from "@/features/admin/actions";

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
          <li key={d.id} className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 px-4 py-3 text-sm">
            <span>
              <strong>{d.display_name}</strong> · {d.verified ? "terverifikasi" : "belum verifikasi"}
              {d.suspended ? " · SUSPENDED" : ""}
            </span>
            <span className="flex gap-2">
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
              <form
                action={async () => {
                  "use server";
                  await suspendDeveloperAction({ developerId: d.id, suspended: !d.suspended });
                }}
              >
                <button type="submit" className="rounded-lg border border-zinc-300 px-3 py-1.5">
                  {d.suspended ? "Unsuspend" : "Suspend"}
                </button>
              </form>
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
