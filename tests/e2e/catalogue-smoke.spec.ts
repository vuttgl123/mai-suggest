import { expect, test } from "@playwright/test";

test("loads the catalogue and opens a product", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Điều Em Yêu" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Mở chi tiết/i }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
