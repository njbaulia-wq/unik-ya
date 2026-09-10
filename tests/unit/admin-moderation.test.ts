import { describe, expect, it } from "vitest";
import { moderateProduct, renameCategory, verifyDeveloper } from "@/features/admin/service";

const auditRows: { action: string; target_type: string; target_id: string; reason?: string | null }[] = [];
const deps = {
  getStatus: async () => ({ status: "submitted" }),
  apply: async () => {},
  audit: async (row: { action: string; target_type: string; target_id: string; reason?: string | null }) => {
    auditRows.push(row);
  },
};

describe("admin moderation", () => {
  it("non-admin → FORBIDDEN", async () => {
    await expect(moderateProduct(false, "u1", { productId: "123e4567-e89b-12d3-a456-426614174000", action: "approve" }, deps, {})).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("approve under_review→approved + audit tercatat", async () => {
    auditRows.length = 0;
    const out = await moderateProduct(true, "admin1", { productId: "123e4567-e89b-12d3-a456-426614174000", action: "approve" }, {
      ...deps,
      getStatus: async () => ({ status: "under_review" }),
    }, {});
    expect(out.status).toBe("approved");
    expect(auditRows).toHaveLength(1);
    expect(auditRows[0]).toMatchObject({ action: "approve", target_type: "product" });
  });

  it("reject tanpa alasan → VALIDATION_ERROR; dengan alasan → ok", async () => {
    const id = "123e4567-e89b-12d3-a456-426614174000";
    await expect(moderateProduct(true, "a", { productId: id, action: "reject" }, deps, {})).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
    await expect(
      moderateProduct(true, "a", { productId: id, action: "reject", reason: "Demo mati." }, {
        ...deps,
        getStatus: async () => ({ status: "under_review" }),
      }, {}),
    ).resolves.toMatchObject({ status: "rejected" });
  });

  it("transisi ilegal (draft→publish) → CONFLICT via assertTransition", async () => {
    await expect(
      moderateProduct(true, "a", { productId: "123e4567-e89b-12d3-a456-426614174000", action: "publish" }, {
        ...deps,
        getStatus: async () => ({ status: "draft" }),
      }, {}),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("feature hanya untuk published", async () => {
    await expect(
      moderateProduct(true, "a", { productId: "123e4567-e89b-12d3-a456-426614174000", action: "feature" }, {
        ...deps,
        getStatus: async () => ({ status: "under_review" }),
      }, {}),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("verify developer + rename kategori teraudit", async () => {
    const calls: string[] = [];
    const d = {
      persist: async () => { calls.push("persist"); },
      audit: async () => { calls.push("audit"); },
    };
    await verifyDeveloper(true, "a", { developerId: "123e4567-e89b-12d3-a456-426614174000", verified: true }, d, {});
    await renameCategory(true, "a", { categoryId: "123e4567-e89b-12d3-a456-426614174000", name: "SaaS Baru" }, d, {});
    expect(calls).toEqual(["persist", "audit", "persist", "audit"]);
    await expect(verifyDeveloper(false, "a", { developerId: "123e4567-e89b-12d3-a456-426614174000", verified: true }, d, {})).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});
