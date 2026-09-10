import { forbidden, validationError } from "@/lib/error";
import { logger } from "@/lib/logger";
import { assertTransition, type ProductStatus } from "@/features/products/service";
import { adminActionSchema, renameCategorySchema, verifyDeveloperSchema } from "./schema";
import type { AdminActionInput } from "./schema";

/** Petakan aksi admin → (status tujuan, patch tambahan). */
const ACTION_MAP: Record<AdminActionInput["action"], { status: ProductStatus; extra?: Record<string, unknown> }> = {
  to_under_review: { status: "under_review" },
  approve: { status: "approved" },
  reject: { status: "rejected" },
  publish: { status: "published", extra: { verification_status: "verified" } },
  suspend: { status: "suspended" },
  unsuspend: { status: "published" },
  archive: { status: "archived" },
  feature: { status: "published", extra: { featured: true } },
  unfeature: { status: "published", extra: { featured: false } },
};

export interface AdminDeps {
  getStatus: (productId: string) => Promise<{ status: string } | null>;
  apply: (productId: string, patch: Record<string, unknown>) => Promise<void>;
  audit: (row: { action: string; target_type: string; target_id: string; reason?: string | null }) => Promise<void>;
}

/**
 * L2 moderasi — guard admin + transisi legal + patch + audit wajib.
 * Feature/unfeature bukan transisi status: hanya untuk produk published.
 */
export async function moderateProduct(
  isAdmin: boolean,
  actorId: string,
  raw: unknown,
  deps: AdminDeps,
  ctx: { requestId?: string },
): Promise<{ status: string }> {
  if (!isAdmin) throw forbidden();
  const parsed = adminActionSchema.safeParse(raw);
  if (!parsed.success) {
    throw validationError(parsed.error.issues.map((i) => ({ field: String(i.path[0] ?? "form"), message: i.message })));
  }
  const current = await deps.getStatus(parsed.data.productId);
  if (!current) throw validationError([{ field: "productId", message: "Produk tidak dikenal." }]);
  const from = current.status as ProductStatus;
  const { status: to, extra } = ACTION_MAP[parsed.data.action];
  if (parsed.data.action === "feature" || parsed.data.action === "unfeature") {
    if (from !== "published") {
      throw validationError([{ field: "action", message: "Hanya produk published yang bisa di-feature." }]);
    }
  } else {
    assertTransition(from, to, "admin");
  }
  await deps.apply(parsed.data.productId, { status: to, ...(extra ?? {}) });
  await deps.audit({
    action: parsed.data.action,
    target_type: "product",
    target_id: parsed.data.productId,
    reason: parsed.data.reason ?? null,
  });
  logger.info("Aksi moderasi admin.", {
    module: "admin",
    action: parsed.data.action,
    requestId: ctx.requestId,
    userId: actorId,
  });
  return { status: to };
}

export async function verifyDeveloper(
  isAdmin: boolean,
  actorId: string,
  raw: unknown,
  deps: { persist: (developerId: string, verified: boolean) => Promise<void>; audit: AdminDeps["audit"] },
  ctx: { requestId?: string },
): Promise<void> {
  if (!isAdmin) throw forbidden();
  const parsed = verifyDeveloperSchema.safeParse(raw);
  if (!parsed.success) {
    throw validationError(parsed.error.issues.map((i) => ({ field: String(i.path[0]), message: i.message })));
  }
  await deps.persist(parsed.data.developerId, parsed.data.verified);
  await deps.audit({
    action: parsed.data.verified ? "verify_developer" : "unverify_developer",
    target_type: "developer",
    target_id: parsed.data.developerId,
  });
  logger.info("Verifikasi developer diubah.", { module: "admin", requestId: ctx.requestId, userId: actorId });
}

export async function renameCategory(
  isAdmin: boolean,
  actorId: string,
  raw: unknown,
  deps: { persist: (categoryId: string, name: string) => Promise<void>; audit: AdminDeps["audit"] },
  ctx: { requestId?: string },
): Promise<void> {
  if (!isAdmin) throw forbidden();
  const parsed = renameCategorySchema.safeParse(raw);
  if (!parsed.success) {
    throw validationError(parsed.error.issues.map((i) => ({ field: String(i.path[0]), message: i.message })));
  }
  await deps.persist(parsed.data.categoryId, parsed.data.name);
  await deps.audit({ action: "rename_category", target_type: "category", target_id: parsed.data.categoryId });
  logger.info("Kategori diganti nama.", { module: "admin", requestId: ctx.requestId, userId: actorId });
}
