import { logger } from "@/lib/logger";
import { conflict, forbidden, notFound, validationError } from "@/lib/error";
import { slugifyName } from "@/features/auth/service";
import { isAllowedVideoUrl } from "@/lib/urls";
import { slugSchema, productDraftSchema, type ProductDraftInput } from "./schema";
import type { Category, Developer } from "@/types/database";
import type { ProductWithRelations } from "./repository";

/**
 * L2 homepage service — orkestrasi read-model. Tiap section punya fallback
 * kosong + log, sehingga satu section gagal tidak menjatuhkan halaman (500).
 */
export interface HomepageDeps {
  fetchFeatured: () => Promise<ProductWithRelations[]>;
  fetchNew: () => Promise<ProductWithRelations[]>;
  fetchVerified: () => Promise<ProductWithRelations[]>;
  fetchCategories: () => Promise<Category[]>;
  fetchDevelopers: () => Promise<Developer[]>;
}

export interface HomepageSections {
  featured: ProductWithRelations[];
  newest: ProductWithRelations[];
  verified: ProductWithRelations[];
  categories: Category[];
  developers: Developer[];
}

async function safe<T>(label: string, fn: () => Promise<T[]>, ctx: { requestId?: string }): Promise<T[]> {
  try {
    return await fn();
  } catch (err) {
    logger.error(`Gagal memuat section ${label}.`, {
      module: "products",
      action: "homepage_section",
      requestId: ctx.requestId,
      errorCode: "UPSTREAM_ERROR",
    });
    return [];
  }
}

export async function getHomepageSections(
  deps: HomepageDeps,
  ctx: { requestId?: string },
): Promise<HomepageSections> {
  const [featured, newest, verified, categories, developers] = await Promise.all([
    safe("featured", deps.fetchFeatured, ctx),
    safe("new", deps.fetchNew, ctx),
    safe("verified", deps.fetchVerified, ctx),
    safe("categories", deps.fetchCategories, ctx),
    safe("developers", deps.fetchDevelopers, ctx),
  ]);
  logger.info("Homepage sections dimuat.", {
    module: "products",
    action: "homepage_section",
    requestId: ctx.requestId,
  });
  return { featured, newest, verified, categories, developers };
}

/**
 * Detail produk publik: hanya yang published yang boleh dibaca.
 * Draft/suspended/tak-ada → NOT_FOUND generik (tanpa bocorkan status internal).
 */
export async function getProductDetail(
  rawSlug: string,
  deps: { fetchBySlug: (slug: string) => Promise<ProductWithRelations | null> },
  ctx: { requestId?: string },
): Promise<ProductWithRelations> {
  const parsed = slugSchema.safeParse(rawSlug);
  if (!parsed.success) throw notFound();
  const product = await deps.fetchBySlug(parsed.data);
  if (!product || product.status !== "published") {
    logger.info("Produk tidak ditemukan / belum published.", { module: "products", action: "product_view", requestId: ctx.requestId });
    throw notFound();
  }
  logger.info("Detail produk dibaca.", {
    module: "products",
    action: "product_view",
    requestId: ctx.requestId,
  });
  return product;
}

/** Badge turunan waktu (keputusan #3): NEW ≤30 hari, UPDATED ≤14 hari. */
export function deriveBadges(
  product: Pick<ProductWithRelations, "verification_status" | "demo_url" | "published_at" | "updated_at" | "verification_score">,
  now: Date = new Date(),
): string[] {
  const badges: string[] = [];
  if (product.verification_status === "verified") badges.push("VERIFIED");
  if (product.demo_url) badges.push("LIVE DEMO");
  const nowMs = now.getTime();
  if (product.published_at && nowMs - new Date(product.published_at).getTime() <= 30 * 86400_000) badges.push("NEW");
  if (nowMs - new Date(product.updated_at).getTime() <= 14 * 86400_000) badges.push("UPDATED");
  if (product.verification_score >= 85) badges.push("POPULAR");
  return badges;
}

/** Bentuk baris tulis — dipakai create/update draft (status selalu draft di sini). */
export interface DraftRow {
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  product_type: string | null;
  pricing_model: string;
  price_text: string | null;
  demo_url: string | null;
  documentation_url: string | null;
  repository_url: string | null;
  video_url: string | null;
  tech_stack: string[];
  features: string[];
  version: string;
  license_type: string;
}

function toDraftRow(input: ProductDraftInput, developerId: string): DraftRow {
  return {
    category_id: input.categoryId ?? null,
    name: input.name.trim(),
    slug: slugifyName(input.name.trim()),
    short_description: input.shortDescription?.trim() ?? "",
    description: input.description?.trim() ?? "",
    product_type: input.productType ?? null,
    pricing_model: input.pricingModel ?? "custom",
    price_text: input.priceText?.trim() || null,
    demo_url: input.demoUrl || null,
    documentation_url: input.documentationUrl || null,
    repository_url: input.repositoryUrl || null,
    video_url: input.videoUrl || null,
    tech_stack: input.techStack ?? [],
    features: input.features ?? [],
    version: input.version?.trim() || "0.1.0",
    license_type: input.licenseType?.trim() || "custom",
  };
}

/** L2 create draft — validasi Zod + cek kategori + slug unik per developer. */
export async function createDraft(
  developerId: string,
  raw: unknown,
  deps: {
    categoryExists: (id: string) => Promise<boolean>;
    insert: (row: DraftRow & { developer_id: string }) => Promise<string>;
  },
  ctx: { requestId?: string },
): Promise<{ id: string }> {
  const parsed = productDraftSchema.safeParse(raw);
  if (!parsed.success) {
    throw validationError(parsed.error.issues.map((i) => ({ field: String(i.path[0] ?? "form"), message: i.message })));
  }
  if (parsed.data.videoUrl && !isAllowedVideoUrl(parsed.data.videoUrl)) {
    throw validationError([{ field: "videoUrl", message: "Video demo harus URL YouTube https." }]);
  }
  if (parsed.data.categoryId) {
    const exists = await deps.categoryExists(parsed.data.categoryId);
    if (!exists) throw validationError([{ field: "categoryId", message: "Kategori tidak dikenal." }]);
  }
  try {
    const id = await deps.insert({ ...toDraftRow(parsed.data, developerId), developer_id: developerId });
    logger.info("Draft produk dibuat.", { module: "products", action: "product_draft_save", requestId: ctx.requestId });
    return { id };
  } catch (err) {
    if (err instanceof Error && /duplicate|unique|conflict/i.test(err.message)) {
      throw conflict("Nama produk sudah dipakai. Ubah sedikit namanya.");
    }
    throw err;
  }
}

/** L2 update draft milik sendiri — hanya status draft/submitted yang bisa diubah. */
export async function updateDraft(
  developerId: string,
  product: { id: string; developer_id: string; status: string } | null,
  raw: unknown,
  deps: {
    categoryExists: (id: string) => Promise<boolean>;
    persist: (id: string, patch: Partial<DraftRow>) => Promise<void>;
  },
  ctx: { requestId?: string },
): Promise<void> {
  if (!product || product.developer_id !== developerId) throw forbidden("Anda tidak memiliki akses untuk tindakan ini.");
  if (!["draft", "submitted"].includes(product.status)) {
    throw conflict("Produk yang sedang/telah published tidak bisa diubah lewat draft.");
  }
  const parsed = productDraftSchema.safeParse(raw);
  if (!parsed.success) {
    throw validationError(parsed.error.issues.map((i) => ({ field: String(i.path[0] ?? "form"), message: i.message })));
  }
  if (parsed.data.videoUrl && !isAllowedVideoUrl(parsed.data.videoUrl)) {
    throw validationError([{ field: "videoUrl", message: "Video demo harus URL YouTube https." }]);
  }
  if (parsed.data.categoryId) {
    const exists = await deps.categoryExists(parsed.data.categoryId);
    if (!exists) throw validationError([{ field: "categoryId", message: "Kategori tidak dikenal." }]);
  }
  const { slug: _slug, ...patch } = toDraftRow(parsed.data, developerId);
  void _slug;
  await deps.persist(product.id, patch);
  logger.info("Draft produk diperbarui.", { module: "products", action: "product_draft_save", requestId: ctx.requestId });
}

function toFieldErrors(issues: { path: readonly unknown[]; message: string }[]): { field: string; message: string }[] {
  return issues.map((i) => ({ field: String(i.path[0] ?? "form"), message: i.message }));
}

// ================= LIFECYCLE (submit + transisi, T12) =================

export type ProductStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "published"
  | "rejected"
  | "suspended"
  | "archived";

/** Transisi legal (cermin trigger 0006_status_checks.sql + peran). */
const TRANSITIONS: Record<ProductStatus, { to: ProductStatus; by: "developer" | "admin" }[]> = {
  draft: [{ to: "submitted", by: "developer" }],
  submitted: [
    { to: "under_review", by: "admin" },
    { to: "draft", by: "admin" },
  ],
  under_review: [
    { to: "approved", by: "admin" },
    { to: "rejected", by: "admin" },
    { to: "draft", by: "admin" },
  ],
  approved: [{ to: "published", by: "admin" }],
  published: [
    { to: "suspended", by: "admin" },
    { to: "archived", by: "admin" },
  ],
  rejected: [{ to: "draft", by: "developer" }],
  suspended: [
    { to: "published", by: "admin" },
    { to: "archived", by: "admin" },
  ],
  archived: [],
};

/** Ilegal → CONFLICT dengan pesan jelas; peran tak cukup → FORBIDDEN. */
export function assertTransition(from: ProductStatus, to: ProductStatus, actor: "developer" | "admin"): void {
  const rule = (TRANSITIONS[from] ?? []).find((r) => r.to === to);
  if (!rule) {
    throw conflict(`Status tidak dapat diubah dari ${from} ke ${to}.`);
  }
  if (rule.by === "admin" && actor !== "admin") {
    throw forbidden("Hanya admin yang dapat melakukan tindakan ini.");
  }
}

export interface LifecycleDeps {
  getOwnProduct: (productId: string) => Promise<{ id: string; status: string; developer_id: string } | null>;
  getFullProduct: (productId: string) => Promise<Record<string, unknown> | null>;
  setStatus: (productId: string, status: ProductStatus, extra?: Record<string, unknown>) => Promise<void>;
  countImages: (productId: string) => Promise<number>;
}

/**
 * Developer kirim draft/rejected → submitted. Validasi penuh submit-schema
 * (PRD §21) + hitung skor awal + verification_status pending.
 */
export async function submitForReview(
  developerId: string,
  productId: string,
  deps: LifecycleDeps,
  ctx: { requestId?: string },
): Promise<{ score: number }> {
  const own = await deps.getOwnProduct(productId);
  if (!own || own.developer_id !== developerId) {
    throw forbidden("Anda tidak memiliki akses untuk tindakan ini.");
  }
  if (!["draft", "rejected"].includes(own.status)) {
    throw conflict(`Produk berstatus ${own.status} tidak dapat dikirim ulang.`);
  }
  const full = await deps.getFullProduct(productId);
  const { productSubmitSchema } = await import("./schema");
  const parsed = productSubmitSchema.safeParse({
    name: full?.["name"],
    shortDescription: full?.["short_description"],
    categoryId: full?.["category_id"] ?? undefined,
    productType: full?.["product_type"] ?? undefined,
    description: full?.["description"],
    features: full?.["features"] ?? [],
    techStack: full?.["tech_stack"] ?? [],
    demoUrl: full?.["demo_url"] ?? undefined,
    documentationUrl: full?.["documentation_url"] ?? undefined,
    repositoryUrl: full?.["repository_url"] ?? undefined,
    videoUrl: full?.["video_url"] ?? undefined,
    version: full?.["version"] ?? undefined,
    licenseType: full?.["license_type"] ?? undefined,
    pricingModel: full?.["pricing_model"] ?? undefined,
    priceText: full?.["price_text"] ?? undefined,
  });
  if (!parsed.success) {
    throw validationError(toFieldErrors(parsed.error.issues));
  }
  const { computeVerificationScore } = await import("@/features/verification/score");
  const score = computeVerificationScore({
    hasDemo: !!parsed.data.demoUrl,
    hasDocs: !!parsed.data.documentationUrl,
    screenshotCount: await deps.countImages(productId),
    hasRepo: !!parsed.data.repositoryUrl,
    licenseType: parsed.data.licenseType ?? "custom",
    version: parsed.data.version ?? "0.1.0",
    descriptionLength: (parsed.data.description ?? "").length,
    techStackCount: (parsed.data.techStack ?? []).length,
  });
  await deps.setStatus(productId, "submitted", { verification_status: "pending", verification_score: score });
  logger.info("Produk dikirim untuk review.", {
    module: "products",
    action: "product_submit",
    requestId: ctx.requestId,
  });
  return { score };
}
