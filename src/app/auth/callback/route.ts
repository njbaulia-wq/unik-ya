import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { ensureDeveloper, ensureProfile } from "@/features/auth/repository";
import { postLoginRedirect, slugifyName } from "@/features/auth/service";
import { logger } from "@/lib/logger";

/** L1 — callback OAuth: tukar code → session, pastikan profil, redirect per peran. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestId = request.headers.get("x-request-id") ?? undefined;
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const supabase = await createServerSupabase();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      logger.warn("OAuth callback gagal.", { module: "auth", requestId, errorCode: "UNAUTHORIZED" });
      return NextResponse.redirect(new URL("/login?error=oauth", url.origin));
    }
    const { data } = await supabase.auth.getUser();
    if (data.user?.email) {
      const meta = data.user.user_metadata as { full_name?: string } | null;
      const rawName: string = meta?.full_name ?? data.user.email.split("@")[0] ?? "developer";
      await ensureProfile(supabase, { userId: data.user.id, email: data.user.email, requestId });
      await ensureDeveloper(supabase, {
        userId: data.user.id,
        displayName: rawName,
        slug: `${slugifyName(rawName)}-${data.user.id.slice(0, 6)}`,
        requestId,
      });
    }
    const user = await getAuthUser(supabase);
    const to = postLoginRedirect(
      { isAdmin: user?.isAdmin ?? false, developerId: user?.developerId ?? null },
      next,
    );
    return NextResponse.redirect(new URL(to, url.origin));
  }
  return NextResponse.redirect(new URL("/", url.origin));
}
