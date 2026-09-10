import { createHash } from "node:crypto";
import { logger } from "@/lib/logger";
import { rateLimited, validationError } from "@/lib/error";
import { checkRateLimit } from "@/lib/ratelimit";
import { clickEventSchema, logEventSchema, type ClickEvent } from "./schema";

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

/** Hash IP+salt harian — tanpa IP mentah di DB (keputusan #8). */
export function hashIp(ip: string, salt: string = new Date().toISOString().slice(0, 10)): string {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/** Rekam view best-effort: gagal → warn, tidak pernah throw ke halaman. */
export async function recordView(
  productId: string,
  ipHash: string | null,
  deps: { insertView: (row: { product_id: string; ip_hash: string | null }) => Promise<void> },
  ctx: { requestId?: string },
): Promise<void> {
  try {
    await deps.insertView({ product_id: productId, ip_hash: ipHash });
  } catch {
    logger.warn("Gagal mencatat view (diabaikan).", { module: "analytics", action: "product_view", requestId: ctx.requestId, errorCode: "UPSTREAM_ERROR" });
  }
}

/** Event non-DB → structured log minimal (tanpa PII). */
export function logBusinessEvent(
  raw: unknown,
  ctx: { requestId?: string },
): void {
  const parsed = logEventSchema.safeParse(raw);
  if (!parsed.success) return;
  logger.info("Event bisnis.", {
    module: "analytics",
    action: parsed.data.type,
    ref: parsed.data.ref,
    requestId: ctx.requestId,
  });
}

export interface Kpi {
  views: number;
  demoClicks: number;
  contactClicks: number;
  publishedProducts: number;
  developers: number;
  /** Primer PRD §28: contact clicks / product views. */
  contactConversion: number;
  demoRate: number;
}

/** KPI murni dari counts — teruji unit. */
export function computeKpi(c: { views: number; demoClicks: number; contactClicks: number; publishedProducts: number; developers: number }): Kpi {
  const contactConversion = c.views > 0 ? c.contactClicks / c.views : 0;
  const demoRate = c.views > 0 ? c.demoClicks / c.views : 0;
  return { ...c, contactConversion, demoRate };
}
