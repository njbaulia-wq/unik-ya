import { logger } from "@/lib/logger";
import { rateLimited, validationError } from "@/lib/error";
import { checkRateLimit } from "@/lib/ratelimit";
import { clickEventSchema, type ClickEvent } from "./schema";

export interface ClickDeps {
  findPublishedId: (slug: string) => Promise<string | null>;
  insertClick: (row: { product_id: string; channel: string }) => Promise<void>;
}

/**
 * L2 track klik — tanpa login (keputusan #2). Rate-limit per IP+produk agar
 * tahan spam/scrape; kegagalan tulis tidak boleh menggagalkan navigasi user
 * (caller fire-and-forget; error hanya dilog warn).
 */
export async function trackClick(
  raw: unknown,
  clientKey: string,
  deps: ClickDeps,
  ctx: { requestId?: string },
): Promise<{ tracked: boolean }> {
  const parsed = clickEventSchema.safeParse(raw);
  if (!parsed.success) {
    throw validationError(parsed.error.issues.map((i) => ({ field: String(i.path[0] ?? "form"), message: i.message })));
  }
  const event: ClickEvent = parsed.data;
  const limit = checkRateLimit(`click:${clientKey}:${event.productSlug}`, { limit: 10 });
  if (!limit.allowed) throw rateLimited();
  const productId = await deps.findPublishedId(event.productSlug);
  if (!productId) {
    throw validationError([{ field: "productSlug", message: "Produk tidak dikenal." }]);
  }
  try {
    await deps.insertClick({ product_id: productId, channel: event.channel });
  } catch (err) {
    logger.warn("Gagal mencatat klik (diabaikan untuk UX).", {
      module: "analytics",
      action: event.channel === "demo" ? "demo_click" : "contact_click",
      requestId: ctx.requestId,
      errorCode: "UPSTREAM_ERROR",
    });
    return { tracked: false };
  }
  logger.info("Klik tercatat.", {
    module: "analytics",
    action: event.channel === "demo" ? "demo_click" : "contact_click",
    requestId: ctx.requestId,
  });
  return { tracked: true };
}
