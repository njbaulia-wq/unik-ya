# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visitor.spec.ts >> produk tak dikenal → graceful 404/error jelas (bukan stack trace)
- Location: e2e/visitor.spec.ts:24:5

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('main')
Expected pattern: /Halaman tidak ditemukan|Terjadi kesalahan/
Received string:  "Memuat…"
Timeout: 5000ms

Call log:
  - Expect "toContainText" locator('main') with timeout 5000ms
  - waiting for locator('main')
    14 × locator resolved to <main aria-busy="true" aria-label="Memuat" class="container-page py-12">…</main>
       - unexpected value "Memuat…"

```

```yaml
- main "Memuat":
  - paragraph: Memuat…
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | /** visitor → search → product (tanpa login, tanpa live DB: empty states valid). */
  4  | test("homepage menjawab 3 pertanyaan + search jalan", async ({ page }) => {
  5  |   await page.goto("/");
  6  |   await expect(page.getByRole("heading", { level: 1 })).toContainText("Software yang sudah jadi");
  7  |   await expect(page.getByRole("search").first()).toBeVisible();
  8  |   await expect(page.getByRole("heading", { name: "Cara Kerja" })).toBeVisible();
  9  |   await page.getByRole("search").first().getByPlaceholder(/Cari software/).fill("saas");
  10 |   await page.getByRole("search").first().getByRole("button", { name: "Cari" }).click();
  11 |   await expect(page).toHaveURL(/\/products\?q=saas/);
  12 |   await expect(page.getByRole("heading", { name: "Marketplace" })).toBeVisible();
  13 | });
  14 | 
  15 | test("katalog: filter + graceful degradation tanpa DB", async ({ page }) => {
  16 |   await page.goto("/products?verified=true");
  17 |   // Tanpa live Supabase: halaman tetap render (bukan 500/stack trace).
  18 |   await expect(page.getByRole("heading", { name: "Marketplace" })).toBeVisible();
  19 |   const body = await page.textContent("main");
  20 |   expect(body).toMatch(/produk ditemukan|Terjadi kesalahan/);
  21 |   expect(body).not.toMatch(/ __NEXT_DATA__|at async|node_modules/);
  22 | });
  23 | 
  24 | test("produk tak dikenal → graceful 404/error jelas (bukan stack trace)", async ({ page }) => {
  25 |   await page.goto("/products/slug-yang-tak-ada-xyz");
  26 |   // Dengan live DB: 404 "Halaman tidak ditemukan". Tanpa DB: error boundary aman.
> 27 |   await expect(page.locator("main")).toContainText(/Halaman tidak ditemukan|Terjadi kesalahan/);
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  28 |   const body = await page.textContent("main");
  29 |   expect(body).not.toMatch(/__NEXT_DATA__|at async|node_modules/);
  30 | });
  31 | 
```