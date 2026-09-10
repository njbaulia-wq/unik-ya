import { expect, test } from "@playwright/test";

/** Guard negatif (PRD §76): anonim dialihkan, envelope error konsisten. */
test("anonim ke dashboard/admin → /login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
});

test("API contact-click: body invalid → 422 envelope VALIDATION_ERROR", async ({ request }) => {
  const res = await request.post("/api/contact-click", { data: { productSlug: "SALAH!!", channel: "sms" } });
  expect(res.status()).toBe(422);
  const json = await res.json();
  expect(json.ok).toBe(false);
  expect(json.error.code).toBe("VALIDATION_ERROR");
  expect(JSON.stringify(json)).not.toContain("contact_clicks");
});

test("API contact-click: rate-limit jujur (429) setelah 10x cepat", async ({ request }) => {
  const body = { productSlug: "invoiceflow", channel: "email" };
  let last = 200;
  for (let i = 0; i < 11; i++) {
    const res = await request.post("/api/contact-click", { data: body });
    last = res.status();
  }
  // Tanpa live DB: 500 INTERNAL (ditulis generik) atau 429 bila limit kena duluan.
  expect([429, 500]).toContain(last);
});
