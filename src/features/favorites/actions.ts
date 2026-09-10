"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { runAction } from "@/lib/action";
import { findPublishedId } from "@/features/analytics/repository";
import { addFavorite, isFavorited, removeFavorite } from "@/features/favorites/repository";
import { toggleFavorite } from "@/features/favorites/service";
import { logBusinessEvent } from "@/features/analytics/service";

/** L1 toggle favorit — guard login server-side. */
export async function toggleFavoriteAction(productSlug: string) {
  const requestId = (await headers()).get("x-request-id") ?? undefined;
  const result = await runAction(
    async () => {
      const supabase = await createServerSupabase();
      const user = await getAuthUser(supabase);
      const out = await toggleFavorite(user?.id ?? null, { productSlug }, {
        findPublishedId: (slug) => findPublishedId(supabase, slug),
        isFavorited: (uid, pid) => isFavorited(supabase, uid, pid),
        add: (uid, pid) => addFavorite(supabase, uid, pid),
        remove: (uid, pid) => removeFavorite(supabase, uid, pid),
      }, { requestId });
      if (out.saved) logBusinessEvent({ type: "favorite", ref: productSlug }, { requestId });
      revalidatePath("/dashboard/favorites");
      return out;
    },
    { module: "favorites", action: "favorite_toggle", requestId },
  );
  return result;
}
