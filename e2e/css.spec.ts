import { expect, test } from "@playwright/test";

/** Smoke test CSS: cegah regresi "halaman tanpa styling" (insiden globals.css tak ter-import). */
test("stylesheet termuat + utility Tailwind berefek", async ({ page }) => {
  await page.goto("/");
  const sheets = await page.evaluate(() => document.styleSheets.length);
  expect(sheets).toBeGreaterThan(0);
  const maxWidth = await page.evaluate(() => {
    const el = document.querySelector(".container-page");
    return el ? getComputedStyle(el).maxWidth : "none";
  });
  expect(maxWidth).not.toBe("none");
  // 80rem = 1280px pada font root 16px
  expect(maxWidth).toBe("1280px");
});
