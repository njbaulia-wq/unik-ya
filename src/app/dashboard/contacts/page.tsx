import { createServerSupabase } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { getOwnDeveloper } from "@/features/developers/repository";
import { ContactsForm } from "@/features/developers/components/ContactsForm";
import { CHANNELS, type Channel } from "@/features/developers/schema";

export default async function DashboardContactsPage() {
  const supabase = await createServerSupabase();
  const user = await getAuthUser(supabase);
  const developer = user ? await getOwnDeveloper(supabase, user.id) : null;
  const initial = (developer?.developers_socials ?? []).map((s) => ({
    channel: (CHANNELS as readonly string[]).includes(s.channel) ? (s.channel as Channel) : ("website" as Channel),
    value: s.value,
    enabled: s.enabled,
  }));
  return (
    <main>
      <h1 className="text-xl font-bold">Kontak</h1>
      <p className="mt-2 text-sm text-zinc-600">Hanya kanal yang ditandai Tampil yang terlihat publik.</p>
      <ContactsForm initial={initial} />
    </main>
  );
}
