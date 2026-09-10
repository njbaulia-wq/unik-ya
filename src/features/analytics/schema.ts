import { z } from "zod";

/** Event klik kontak/demo (PRD §27). Demo disimpan sebagai channel 'demo'. */
export const CLICK_CHANNELS = [
  "whatsapp",
  "email",
  "website",
  "github",
  "telegram",
  "linkedin",
  "demo",
] as const;

export const clickEventSchema = z.strictObject({
  productSlug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Produk tidak dikenal."),
  channel: z.enum(CLICK_CHANNELS),
});

export type ClickEvent = z.infer<typeof clickEventSchema>;

/**
 * Event non-DB (keputusan #8, privasi minimal): developer_profile_view,
 * search, favorite dicatat sebagai structured log operasional (bukan tabel),
 * dengan payload minimal tanpa PII. product_view/demo/contact masuk DB.
 */
export const logEventSchema = z.strictObject({
  type: z.enum(["developer_profile_view", "search", "favorite"]),
  ref: z.string().trim().max(120),
});

export type LogEvent = z.infer<typeof logEventSchema>;
