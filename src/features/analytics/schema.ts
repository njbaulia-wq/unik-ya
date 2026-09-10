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
