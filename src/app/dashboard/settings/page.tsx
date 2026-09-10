import { createServerSupabase } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { logoutAction } from "@/features/auth/actions";

/** Pengaturan akun (PRD §19): info + keluar. */
export default async function SettingsPage() {
  let email = "";
  try {
    const supabase = await createServerSupabase();
    email = (await getAuthUser(supabase))?.email ?? "";
  } catch {
    email = "";
  }
  return (
    <main>
      <h1 className="text-xl font-bold">Pengaturan</h1>
      {email && <p className="mt-2 text-sm text-zinc-600">Masuk sebagai {email}.</p>}
      <form action={logoutAction} className="mt-4">
        <button type="submit" className="rounded-lg border border-zinc-300 px-4 py-2 text-sm">
          Keluar
        </button>
      </form>
    </main>
  );
}
