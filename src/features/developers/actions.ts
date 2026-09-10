"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { runAction } from "@/lib/action";
import { validationError } from "@/lib/error";
import { getOwnDeveloper, replaceSocials, updateDeveloper } from "@/features/developers/repository";
import { updateOwnProfile, updateOwnSocials } from "@/features/developers/profile-service";

/** L1 actions dashboard — guard server-side, validate Zod, map via runAction. */
export async function updateProfileAction(form: Record<string, string>) {
  const requestId = (await headers()).get("x-request-id") ?? undefined;
  return runAction(
    async () => {
      const supabase = await createServerSupabase();
      const user = await getAuthUser(supabase);
      if (!user) throw validationError([{ field: "form", message: "Anda perlu masuk." }]);
      const developer = await getOwnDeveloper(supabase, user.id);
      await updateOwnProfile(
        user,
        developer,
        { displayName: form.displayName, bio: form.bio, websiteUrl: form.websiteUrl || undefined, githubUrl: form.githubUrl || undefined },
        { persist: (id, patch) => updateDeveloper(supabase, id, patch as never) },
        { requestId },
      );
      revalidatePath("/dashboard");
      return { saved: true };
    },
    { module: "developers", action: "profile_update", requestId },
  );
}

export async function updateSocialsAction(socials: { channel: string; value: string; enabled: boolean }[]) {
  const requestId = (await headers()).get("x-request-id") ?? undefined;
  return runAction(
    async () => {
      const supabase = await createServerSupabase();
      const user = await getAuthUser(supabase);
      if (!user) throw validationError([{ field: "form", message: "Anda perlu masuk." }]);
      const developer = await getOwnDeveloper(supabase, user.id);
      await updateOwnSocials(user, developer, { socials }, { persist: (id, s) => replaceSocials(supabase, id, s) }, { requestId });
      revalidatePath("/dashboard");
      return { saved: true };
    },
    { module: "developers", action: "contacts_update", requestId },
  );
}
