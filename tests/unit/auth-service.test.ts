import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/features/auth/schema";
import { isAuthFailure, postLoginRedirect, slugifyName } from "@/features/auth/service";

describe("auth service (tanpa DB)", () => {
  it("login schema menolak email invalid / password kosong", () => {
    expect(loginSchema.safeParse({ email: "bukan-email", password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "A@B.CO", password: "x" }).success).toBe(true);
  });

  it("register schema menolak password pendek / nama pendek", () => {
    expect(
      registerSchema.safeParse({ email: "a@b.co", password: "pendek", displayName: "OK Name" }).success,
    ).toBe(false);
    expect(registerSchema.safeParse({ email: "a@b.co", password: "cukup-panjang-123", displayName: "X" }).success).toBe(false);
  });

  it("mengenali pesan gagal auth Supabase", () => {
    expect(isAuthFailure("Invalid login credentials")).toBe(true);
    expect(isAuthFailure("Database error saving new user")).toBe(false);
  });

  it("redirect pasca-login per peran + hormati ?next= yang aman", () => {
    expect(postLoginRedirect({ isAdmin: true, developerId: null })).toBe("/admin");
    expect(postLoginRedirect({ isAdmin: false, developerId: "d1" })).toBe("/dashboard");
    expect(postLoginRedirect({ isAdmin: true, developerId: null }, "/products")).toBe("/products");
    expect(postLoginRedirect({ isAdmin: false, developerId: null }, "https://jahat.dev")).toBe("/dashboard");
  });

  it("slugify aman untuk slug developer", () => {
    expect(slugifyName("Rizky Pratama!")).toBe("rizky-pratama");
    expect(slugifyName("  ")).toBe("developer");
  });
});
