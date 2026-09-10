import { createServerSupabase } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { getOwnDeveloper } from "@/features/developers/repository";
import { ProfileForm } from "@/features/developers/components/ProfileForm";

export default async function DashboardProfilePage() {
  const supabase = await createServerSupabase();
  const user = await getAuthUser(supabase);
  const developer = user ? await getOwnDeveloper(supabase, user.id) : null;
  if (!developer) {
    return (
      <main>
        <h1 className="text-xl font-bold">Profil</h1>
        <p className="mt-2 text-sm text-zinc-600">Profil developer belum tersedia.</p>
      </main>
    );
  }
  return (
    <main>
      <h1 className="text-xl font-bold">Profil</h1>
      <ProfileForm developer={developer} />
    </main>
  );
}
