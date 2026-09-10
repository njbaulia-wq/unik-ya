import { describe, expect, it } from "vitest";
import { toggleFavorite } from "@/features/favorites/service";

const published = { findPublishedId: async (s: string) => (s === "invoiceflow" ? "p1" : null) };

describe("favorites service", () => {
  it("anonim → UNAUTHORIZED", async () => {
    await expect(
      toggleFavorite(null, { productSlug: "invoiceflow" }, { ...published, isFavorited: async () => false, add: async () => {}, remove: async () => {} }, {}),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("toggle: belum → simpan; sudah → hapus (idempoten)", async () => {
    const calls: string[] = [];
    const deps = {
      ...published,
      isFavorited: async () => calls.includes("add"),
      add: async () => { calls.push("add"); },
      remove: async () => { calls.push("remove"); },
    };
    await expect(toggleFavorite("u1", { productSlug: "invoiceflow" }, deps, {})).resolves.toEqual({ saved: true });
    await expect(toggleFavorite("u1", { productSlug: "invoiceflow" }, deps, {})).resolves.toEqual({ saved: false });
    expect(calls).toEqual(["add", "remove"]);
  });

  it("produk tak published → NOT_FOUND; slug aneh → VALIDATION_ERROR", async () => {
    const deps = { ...published, isFavorited: async () => false, add: async () => {}, remove: async () => {} };
    await expect(toggleFavorite("u1", { productSlug: "tak-ada" }, deps, {})).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(toggleFavorite("u1", { productSlug: "SALAH!!" }, deps, {})).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
});
