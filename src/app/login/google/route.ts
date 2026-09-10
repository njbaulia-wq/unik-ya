import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/db";
import { toErrorResponse } from "@/lib/http";

/** L1 — mulai OAuth Google via Supabase Auth. */
export async function GET(request: Request) {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  try {
    const supabase = await createServerSupabase();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${siteUrl}/auth/callback` },
    });
    if (error || !data.url) throw error ?? new Error("OAuth gagal dimulai.");
    return NextResponse.redirect(data.url);
  } catch (err) {
    return toErrorResponse(err, { module: "auth", requestId, route: "/login/google" });
  }
}
