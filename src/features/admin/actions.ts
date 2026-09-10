"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { runAction } from "@/lib/action";
import {
  applyProductAction,
  getProductStatus,
  renameCategory as renameCategoryRepo,
  setDeveloperVerified,
  writeAudit,
} from "@/features/admin/repository";
import { moderateProduct, renameCategory, verifyDeveloper } from "@/features/admin/service";

async function reqId(): Promise<string | undefined> {
  return (await headers()).get("x-request-id") ?? undefined;
}

async function adminContext(requestId?: string) {
  const supabase = await createServerSupabase();
  const admin = await requireAdmin(supabase);
  const audit = (row: { action: string; target_type: string; target_id: string; reason?: string | null }) =>
    writeAudit(supabase, { actor_id: admin.id, ...row });
  return { supabase, admin, audit };
}

/** L1 aksi moderasi — guard admin server-side, audit otomatis. */
export async function moderateAction(form: { productId: string; action: string; reason?: string }) {
  const requestId = await reqId();
  return runAction(
    async () => {
      const { supabase, admin, audit } = await adminContext(requestId);
      const out = await moderateProduct(admin.isAdmin, admin.id, form, {
        getStatus: (id) => getProductStatus(supabase, id),
        apply: (id, patch) => applyProductAction(supabase, id, patch),
        audit,
      }, { requestId });
      revalidatePath("/admin");
      return out;
    },
    { module: "admin", action: "moderate", requestId },
  );
}

export async function verifyDeveloperAction(form: { developerId: string; verified: boolean }) {
  const requestId = await reqId();
  return runAction(
    async () => {
      const { supabase, admin, audit } = await adminContext(requestId);
      await verifyDeveloper(admin.isAdmin, admin.id, form, {
        persist: (id, v) => setDeveloperVerified(supabase, id, v),
        audit,
      }, { requestId });
      revalidatePath("/admin");
      return { saved: true };
    },
    { module: "admin", action: "verify_developer", requestId },
  );
}

export async function renameCategoryAction(form: { categoryId: string; name: string }) {
  const requestId = await reqId();
  return runAction(
    async () => {
      const { supabase, admin, audit } = await adminContext(requestId);
      await renameCategory(admin.isAdmin, admin.id, form, {
        persist: (id, name) => renameCategoryRepo(supabase, id, name),
        audit,
      }, { requestId });
      revalidatePath("/admin");
      return { saved: true };
    },
    { module: "admin", action: "rename_category", requestId },
  );
}
