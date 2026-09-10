import { forbidden, unauthorized } from "./error";

/** Bentuk minimal user dari Supabase Auth — cukup untuk guard peran. */
export interface AuthUser {
  id: string;
  email?: string;
  isAdmin: boolean;
  developerId?: string | null;
}

type SupabaseLike = {
  auth: { getUser: () => Promise<{ data: { user: { id: string; email?: string } | null } }> };
  from: (table: string) => {
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        maybeSingle: () => Promise<{ data: { is_admin?: boolean } | null }>;
        limit: (n: number) => Promise<{ data: { id: string }[] | null }>;
      };
    };
  };
};

/**
 * L4 auth helper (server-side only). Baca profil + developer milik user.
 * Dipakai L1 guards dan L2 services. Error: UNAUTHORIZED bila anonim,
 * FORBIDDEN generik bila peran tak cukup (tanpa bocorkan detail policy).
 */
export async function getAuthUser(supabase: SupabaseLike): Promise<AuthUser | null> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const profile = await supabase.from("profiles").select("is_admin").eq("id", data.user.id).maybeSingle();
  const dev = await supabase.from("developers").select("id").eq("profile_id", data.user.id).limit(1);
  return {
    id: data.user.id,
    email: data.user.email ?? undefined,
    isAdmin: profile.data?.is_admin === true,
    developerId: dev.data?.[0]?.id ?? null,
  };
}

export async function requireUser(supabase: SupabaseLike): Promise<AuthUser> {
  const user = await getAuthUser(supabase);
  if (!user) throw unauthorized();
  return user;
}

export async function requireAdmin(supabase: SupabaseLike): Promise<AuthUser> {
  const user = await requireUser(supabase);
  if (!user.isAdmin) throw forbidden();
  return user;
}

export async function requireDeveloper(supabase: SupabaseLike): Promise<AuthUser> {
  const user = await requireUser(supabase);
  if (!user.developerId && !user.isAdmin) throw forbidden("Anda perlu menjadi developer untuk tindakan ini.");
  return user;
}
