import { expect, test } from "@playwright/test";

/** visitor → search → product (tanpa login, tanpa live DB: empty states valid). */
test("homepage menjawab 3 pertanyaan + search jalan", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Software yang sudah jadi");
  await expect(page.getByRole("search").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cara Kerja" })).toBeVisible();
  await page.getByRole("search").first().getByPlaceholder(/Cari software/).fill("saas");
  await page.getByRole("search").first().getByRole("button", { name: "Cari" }).click();
  await expect(page).toHaveURL(/\/products\?q=saas/);
  await expect(page.getByRole("heading", { name: "Marketplace" })).toBeVisible();
});

test("katalog: filter + graceful degradation tanpa DB", async ({ page }) => {
  await page.goto("/products?verified=true");
  // Tanpa live Supabase: halaman tetap render (bukan 500/stack trace).
  await expect(page.getByRole("heading", { name: "Marketplace" })).toBeVisible();
  const body = await page.textContent("main");
  expect(body).toMatch(/produk ditemukan|Terjadi kesalahan/);
  expect(body).not.toMatch(/ __NEXT_DATA__|at async|node_modules/);
});

test("produk tak dikenal → graceful 404/error jelas (bukan stack trace)", async ({ page }) => {
  await page.goto("/products/slug-yang-tak-ada-xyz");
  // Dengan live DB: 404 "Halaman tidak ditemukan". Tanpa DB: error boundary aman.
  await expect(page.locator("main")).toContainText(/Halaman tidak ditemukan|Terjadi kesalahan/);
  const body = await page.textContent("main");
  expect(body).not.toMatch(/__NEXT_DATA__|at async|node_modules/);
});
