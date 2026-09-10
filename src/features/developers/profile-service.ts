import { forbidden, validationError } from "@/lib/error";
import { logger } from "@/lib/logger";
import {
  profileSchema,
  socialsSchema,
  validateChannelValue,
  type ProfileInput,
  type SocialsInput,
} from "./schema";
import type { OwnDeveloper } from "./repository";

/**
 * L2 — update profil/kontak milik sendiri. userId dari session server-side;
 * target yang bukan miliknya → FORBIDDEN (jangan andalkan frontend hiding).
 */
export async function updateOwnProfile(
  user: { id: string },
  developer: OwnDeveloper | null,
  raw: unknown,
  deps: { persist: (id: string, patch: Record<string, unknown>) => Promise<void> },
  ctx: { requestId?: string },
): Promise<void> {
  if (!developer || developer.profile_id !== user.id) throw forbidden();
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    throw validationError(parsed.error.issues.map((i) => ({ field: String(i.path[0]), message: i.message })));
  }
  const input: ProfileInput = parsed.data;
  await deps.persist(developer.id, {
    display_name: input.displayName,
    bio: input.bio,
    website_url: input.websiteUrl ?? null,
    github_url: input.githubUrl ?? null,
  });
  logger.info("Profil developer diperbarui.", { module: "developers", action: "profile_update", requestId: ctx.requestId, userId: user.id });
}

export async function updateOwnSocials(
  user: { id: string },
  developer: OwnDeveloper | null,
  raw: unknown,
  deps: { persist: (id: string, socials: { channel: string; value: string; enabled: boolean }[]) => Promise<void> },
  ctx: { requestId?: string },
): Promise<void> {
  if (!developer || developer.profile_id !== user.id) throw forbidden();
  const parsed = socialsSchema.safeParse(raw);
  if (!parsed.success) {
    throw validationError(parsed.error.issues.map((i) => ({ field: "socials", message: i.message })));
  }
  const input: SocialsInput = parsed.data;
  const bad = input.socials.find((s) => s.enabled && !validateChannelValue(s.channel, s.value));
  if (bad) {
    throw validationError([{ field: bad.channel, message: `Nilai kanal ${bad.channel} tidak valid.` }]);
  }
  // Simpan hanya yang ada nilainya; render publik hanya enabled (T08/T14).
  await deps.persist(
    developer.id,
    input.socials.filter((s) => s.value.length > 0),
  );
  logger.info("Kontak developer diperbarui.", { module: "developers", action: "contacts_update", requestId: ctx.requestId, userId: user.id });
}
