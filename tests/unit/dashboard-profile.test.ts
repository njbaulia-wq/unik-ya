import { describe, expect, it } from "vitest";
import { profileSchema, socialsSchema, validateChannelValue } from "@/features/developers/schema";
import { updateOwnProfile, updateOwnSocials } from "@/features/developers/profile-service";
import type { OwnDeveloper } from "@/features/developers/repository";

const dev = { id: "d1", profile_id: "u1" } as OwnDeveloper;

describe("developers profile service", () => {
  it("milik orang lain → FORBIDDEN", async () => {
    const other = { id: "d9", profile_id: "u9" } as OwnDeveloper;
    await expect(updateOwnProfile({ id: "u1" }, other, {}, { persist: async () => {} }, {})).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    await expect(
      updateOwnSocials({ id: "u1" }, null, { socials: [] }, { persist: async () => {} }, {}),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("bio terlalu panjang → VALIDATION_ERROR per-field", async () => {
    await expect(
      updateOwnProfile({ id: "u1" }, dev, { displayName: "OK", bio: "x".repeat(501) }, { persist: async () => {} }, {}),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("kanal: email invalid / URL non-https ditolak bila enabled", () => {
    expect(validateChannelValue("email", "bukan-email")).toBe(false);
    expect(validateChannelValue("website", "http://tak-aman.dev")).toBe(false);
    expect(validateChannelValue("whatsapp", "+628123456789")).toBe(true);
    expect(profileSchema.safeParse({ displayName: "A", bio: "", websiteUrl: "https://ok.dev" }).success).toBe(false);
    expect(socialsSchema.safeParse({ socials: [{ channel: "email", value: "a@b.co", enabled: true }] }).success).toBe(true);
  });

  it("socials duplikat → ditolak", async () => {
    await expect(
      updateOwnSocials(
        { id: "u1" },
        dev,
        { socials: [{ channel: "email", value: "a@b.co", enabled: true }, { channel: "email", value: "b@c.co", enabled: false }] },
        { persist: async () => {} },
        {},
      ),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
});
