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
  // Query builder Supabase bersifat thenable dengan generic dalam — ketik longgar
  // agar tidak memicu deep-instantiation; kontrak kolom dijaga di repository.
  from: (table: string) => unknown;
};

interface ProfileRow {
  is_admin?: boolean;
}

interface DeveloperRow {
  id: string;
}

async function queryMaybeSingle(q: unknown): Promise<{ data: ProfileRow | null }> {
  const res = (await (q as PromiseLike<{ data: ProfileRow | null }>)) as { data: ProfileRow | null };
  return res;
}

async function queryLimit(q: unknown): Promise<{ data: DeveloperRow[] | null }> {
  const res = (await (q as PromiseLike<{ data: DeveloperRow[] | null }>)) as { data: DeveloperRow[] | null };
  return res;
}

/**
 * L4 auth helper (server-side only). Baca profil + developer milik user.
 * Dipakai L1 guards dan L2 services. Error: UNAUTHORIZED bila anonim,
 * FORBIDDEN generik bila peran tak cukup (tanpa bocorkan detail policy).
 */
export async function getAuthUser(supabase: SupabaseLike): Promise<AuthUser | null> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const client = supabase.from as (table: string) => {
    select: (cols: string) => { eq: (col: string, val: string) => unknown };
  };
  const profile = await queryMaybeSingle(client("profiles").select("is_admin").eq("id", data.user.id));
  const dev = await queryLimit(client("developers").select("id").eq("profile_id", data.user.id));
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
