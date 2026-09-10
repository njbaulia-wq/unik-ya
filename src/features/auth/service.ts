import { unauthorized } from "@/lib/error";
import type { AuthUser } from "@/lib/auth";

/**
 * L2 auth service — murni, tanpa HTTP/DB. Semua error via AppError.
 * Mapping error Supabase → pesan generik (jangan bocorkan "user tidak ada").
 */
export function mapSupabaseAuthError(err: unknown): never {
  throw unauthorized("Email atau kata sandi salah.", err);
}

export function isAuthFailure(message: string): boolean {
  return /invalid login credentials|invalid_grant|user not found|email not confirmed/i.test(message);
}

/** Redirect pasca-login berdasar peran (admin → /admin, developer → /dashboard). */
export function postLoginRedirect(user: Pick<AuthUser, "isAdmin" | "developerId">, next?: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  if (user.isAdmin) return "/admin";
  return "/dashboard";
}

/** Slug developer dari display name — dipakai saat pembuatan profil awal. */
export function slugifyName(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
  return base || "developer";
}
