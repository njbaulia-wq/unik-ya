"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/db";
import { requireDeveloper } from "@/lib/auth";
import { runAction } from "@/lib/action";
import { logger } from "@/lib/logger";
import { validationError } from "@/lib/error";
import { IMAGES_MAX_COUNT, isAllowedImage, sanitizeFilename } from "@/lib/files";
import {
  categoryExists,
  countProductImages,
  getOwnProduct,
  insertProduct,
  insertProductImage,
  updateProductRow,
  type ProductWriteRow,
} from "@/features/products/repository";
import { createDraft, updateDraft, type DraftRow } from "@/features/products/service";
import { getOwnDeveloper } from "@/features/developers/repository";

async function reqId(): Promise<string | undefined> {
  return (await headers()).get("x-request-id") ?? undefined;
}

async function developerIdForCurrentUser(): Promise<{
  supabase: Awaited<ReturnType<typeof createServerSupabase>>;
  developerId: string;
}> {
  const supabase = await createServerSupabase();
  const user = await requireDeveloper(supabase);
  const developerId = user.developerId ?? (await getOwnDeveloper(supabase, user.id))?.id;
  if (!developerId) throw validationError([{ field: "form", message: "Akun Anda belum memiliki profil developer." }]);
  return { supabase, developerId };
}

/** L1 — simpan draft baru. Tombol: "Simpan draft" (bukan publish). */
export async function createDraftAction(form: Record<string, unknown>) {
  const requestId = await reqId();
  const result = await runAction(
    async () => {
      const { supabase, developerId } = await developerIdForCurrentUser();
      return createDraft(
        developerId,
        form,
        {
          categoryExists: (id) => categoryExists(supabase, id),
          insert: (row) => insertProduct(supabase, row as ProductWriteRow),
        },
        { requestId },
      );
    },
    { module: "products", action: "product_draft_save", requestId },
  );
  if (result.ok) {
    revalidatePath("/dashboard/products");
    redirect(`/dashboard/products/${result.data.id}/edit`);
  }
  return result;
}

/** L1 — simpan perubahan draft milik sendiri. */
export async function updateDraftAction(productId: string, form: Record<string, unknown>) {
  const requestId = await reqId();
  return runAction(
    async () => {
      const { supabase, developerId } = await developerIdForCurrentUser();
      const existing = await getOwnProduct(supabase, productId, developerId);
      await updateDraft(
        developerId,
        existing ? { id: existing.id, developer_id: existing.developer_id, status: existing.status } : null,
        form,
        {
          categoryExists: (id) => categoryExists(supabase, id),
          persist: (id, patch: Partial<DraftRow>) =>
            updateProductRow(supabase, id, developerId, patch as Partial<ProductWriteRow>),
        },
        { requestId },
      );
      revalidatePath("/dashboard/products");
      return { saved: true };
    },
    { module: "products", action: "product_draft_save", requestId },
  );
}

/** L1 — upload screenshot (≤5, @2MB, jpg/png/webp, nama disanitasi). */
export async function uploadImageAction(formData: FormData) {
  const requestId = await reqId();
  return runAction(
    async () => {
      const { supabase, developerId } = await developerIdForCurrentUser();
      const productId = String(formData.get("productId") ?? "");
      const file = formData.get("file");
      const altText = String(formData.get("altText") ?? "").slice(0, 200);
      if (!productId) throw validationError([{ field: "productId", message: "Produk tidak dikenal." }]);
      if (!(file instanceof File)) throw validationError([{ field: "file", message: "File gambar wajib dipilih." }]);
      const existing = await getOwnProduct(supabase, productId, developerId);
      if (!existing) throw validationError([{ field: "productId", message: "Produk tidak dikenal." }]);
      if (!isAllowedImage(file.type, file.size)) {
        throw validationError([{ field: "file", message: "Gambar harus JPG/PNG/WebP maksimal 2 MB." }]);
      }
      const count = await countProductImages(supabase, productId);
      if (count >= IMAGES_MAX_COUNT) {
        throw validationError([{ field: "file", message: "Maksimal 5 gambar per produk." }]);
      }
      const path = `${developerId}/${productId}/${Date.now()}-${sanitizeFilename(file.name)}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
      if (error) {
        logger.error("Upload gambar gagal.", { module: "products", action: "product_image_upload", requestId, errorCode: "UPSTREAM_ERROR" });
        throw validationError([{ field: "file", message: "Upload gagal. Coba lagi." }]);
      }
      await insertProductImage(supabase, { product_id: productId, storage_path: path, alt_text: altText, sort_order: count });
      logger.info("Gambar produk diunggah.", { module: "products", action: "product_image_upload", requestId });
      revalidatePath("/dashboard/products");
      return { path };
    },
    { module: "products", action: "product_image_upload", requestId },
  );
}
