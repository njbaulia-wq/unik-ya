import { headers } from "next/headers";
import { createServerSupabase } from "@/lib/db";
import { toErrorResponse, ok } from "@/lib/http";
import { forbidden } from "@/lib/error";
import { findPublishedId, insertClick } from "@/features/analytics/repository";
import { trackClick } from "@/features/analytics/service";

/** L1 POST /api/contact-click — validasi Zod + CSRF origin check + rate-limit + tulis event. */
export async function POST(request: Request) {
  const headersList = await headers();
  const requestId = headersList.get("x-request-id") ?? undefined;
  // CSRF: tolak bila Origin/Referer ada dan bukan same-origin (PRD §69).
  const origin = headersList.get("origin");
  const referer = headersList.get("referer");
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const sameSite = (u: string | null): boolean => {
    if (!u || !site) return true; // tanpa header/env: izinkan (client non-browser)
    try {
      return new URL(u, site).origin === new URL(site).origin;
    } catch {
      return false;
    }
  };
  if (!sameSite(origin) || !sameSite(referer)) {
    return toErrorResponse(forbidden(), { module: "analytics", requestId, route: "/api/contact-click" });
  }
  const forwarded = headersList.get("x-forwarded-for");
  const clientKey = forwarded?.split(",")[0]?.trim() || "unknown";
  try {
    const body: unknown = await request.json();
    const out = await trackClick(
      body,
      clientKey,
      {
        findPublishedId: async (slug) => {
          const supabase = await createServerSupabase();
          return findPublishedId(supabase, slug);
        },
        insertClick: async (row) => {
          const supabase = await createServerSupabase();
          return insertClick(supabase, row);
        },
      },
      { requestId },
    );
    return ok(out);
  } catch (err) {
    return toErrorResponse(err, { module: "analytics", requestId, route: "/api/contact-click" });
  }
}
