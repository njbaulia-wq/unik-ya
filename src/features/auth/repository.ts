import { logger } from "@/lib/logger";

/** L3 auth repository — upsert profil + developer awal pasca-signup. */
type DbLike = {
  // Lihat lib/auth.ts: from diketik longgar untuk hindari deep-instantiation.
  from: (table: string) => unknown;
};

interface WriteResult {
  error: { message: string } | null;
}

async function write(
  q: unknown,
): Promise<WriteResult> {
  return (await (q as PromiseLike<WriteResult>)) as WriteResult;
}

type TableClient = {
  upsert: (row: Record<string, unknown>) => unknown;
  insert: (row: Record<string, unknown>) => unknown;
};

export async function ensureProfile(
  db: DbLike,
  ctx: { userId: string; email: string; requestId?: string },
): Promise<void> {
  const client = db.from as (table: string) => TableClient;
  const { error } = await write(client("profiles").upsert({ id: ctx.userId, email: ctx.email }));
  if (error) {
    logger.error("Gagal menyimpan profil.", {
      module: "auth",
      requestId: ctx.requestId,
      userId: ctx.userId,
      errorCode: "UPSTREAM_ERROR",
    });
    throw new Error("Gagal menyimpan profil.");
  }
  logger.info("Profil tersimpan.", { module: "auth", requestId: ctx.requestId, userId: ctx.userId });
}

export async function ensureDeveloper(
  db: DbLike,
  ctx: { userId: string; displayName: string; slug: string; requestId?: string },
): Promise<void> {
  const client = db.from as (table: string) => TableClient;
  const { error } = await write(
    client("developers").insert({
      profile_id: ctx.userId,
      display_name: ctx.displayName,
      slug: ctx.slug,
      bio: "",
    }),
  );
  // Duplikat (sudah pernah dibuat) bukan error fatal — idempoten.
  if (error && !/duplicate|conflict|unique/i.test(error.message)) {
    logger.error("Gagal membuat profil developer.", {
      module: "auth",
      requestId: ctx.requestId,
      userId: ctx.userId,
      errorCode: "UPSTREAM_ERROR",
    });
    throw new Error("Gagal membuat profil developer.");
  }
}
