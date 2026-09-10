import { describe, expect, it } from "vitest";
import { getAuthUser, requireAdmin, requireDeveloper, requireUser } from "@/lib/auth";
import { AppError } from "@/lib/error";

function fakeSupabase(opts: {
  user?: { id: string; email?: string } | null;
  isAdmin?: boolean;
  developerId?: string | null;
}) {
  return {
    auth: { getUser: async () => ({ data: { user: opts.user ?? null } }) },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => (table === "profiles" ? { data: { is_admin: opts.isAdmin ?? false } } : { data: null }),
          limit: async () =>
            table === "developers" && opts.developerId
              ? { data: [{ id: opts.developerId }] }
              : { data: [] },
        }),
      }),
    }),
  };
}

describe("auth guards server-side", () => {
  it("anonim → null; requireUser → UNAUTHORIZED generik", async () => {
    const sb = fakeSupabase({ user: null });
    expect(await getAuthUser(sb)).toBeNull();
    await expect(requireUser(sb)).rejects.toMatchObject({ code: "UNAUTHORIZED" } satisfies Partial<AppError>);
  });

  it("non-admin ke requireAdmin → FORBIDDEN (tanpa bocor alasan policy)", async () => {
    const sb = fakeSupabase({ user: { id: "u1" }, isAdmin: false });
    await expect(requireAdmin(sb)).rejects.toMatchObject({ code: "FORBIDDEN" } satisfies Partial<AppError>);
  });

  it("developer tanpa developerId ditolak; admin lolos requireDeveloper", async () => {
    const buyer = fakeSupabase({ user: { id: "u2" }, developerId: null });
    await expect(requireDeveloper(buyer)).rejects.toMatchObject({ code: "FORBIDDEN" } satisfies Partial<AppError>);
    const admin = fakeSupabase({ user: { id: "u3" }, isAdmin: true, developerId: null });
    await expect(requireDeveloper(admin)).resolves.toMatchObject({ id: "u3" });
  });
});
