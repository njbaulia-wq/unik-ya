import { z } from "zod";
import { httpsUrlOptional } from "@/features/products/schema";

/** Kontrak profil + kontak developer (PRD §54: hanya channel enabled yang publik). */
export const CHANNELS = ["whatsapp", "email", "website", "github", "telegram", "linkedin"] as const;
export type Channel = (typeof CHANNELS)[number];

const channelValueSchema = z.string().trim().max(300);

export const profileSchema = z.strictObject({
  displayName: z.string().trim().min(2, "Nama minimal 2 karakter.").max(80),
  bio: z.string().trim().max(500, "Bio maksimal 500 karakter."),
  websiteUrl: httpsUrlOptional,
  githubUrl: httpsUrlOptional,
});

export const socialSchema = z.strictObject({
  channel: z.enum(CHANNELS),
  value: channelValueSchema,
  enabled: z.boolean(),
});

export const socialsSchema = z.strictObject({
  socials: z.array(socialSchema).max(6),
}).refine((v) => new Set(v.socials.map((s) => s.channel)).size === v.socials.length, {
  message: "Kanal tidak boleh duplikat.",
});

/** Validasi nilai per kanal: email harus email; URL-kanal harus https; WA boleh nomor. */
export function validateChannelValue(channel: Channel, value: string): boolean {
  if (!value) return true;
  if (channel === "email") return z.string().email().safeParse(value).success;
  if (channel === "whatsapp") {
    return /^\+?[0-9\s\-()]{8,20}$/.test(value) || value.startsWith("https://");
  }
  return value.startsWith("https://");
}

export type ProfileInput = z.infer<typeof profileSchema>;
export type SocialsInput = z.infer<typeof socialsSchema>;
