import { headers } from "next/headers";
import { createServerSupabase } from "@/lib/db";
import { toErrorResponse, ok } from "@/lib/http";
import { findPublishedId, insertClick } from "@/features/analytics/repository";
import { trackClick } from "@/features/analytics/service";

/** L1 POST /api/contact-click — validasi Zod + rate-limit + tulis event. */
export async function POST(request: Request) {
  const headersList = await headers();
  const requestId = headersList.get("x-request-id") ?? undefined;
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
