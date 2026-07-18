import { expect, test } from "@playwright/test";

test("filters, sorts and clears the catalogue", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("searchbox", { name: "Tìm kiếm gợi ý quà" });

  await search.fill("hoa");
  await expect(page.locator('#discovery p[aria-live="polite"]')).toContainText(
    /\d+\/42/,
  );
  await expect(
    page.getByRole("button", { name: "Bỏ từ khóa tìm kiếm hoa" }),
  ).toBeVisible();

  await page.getByLabel("Sắp xếp").selectOption("price-ascending");
  await expect(page.getByLabel("Sắp xếp")).toHaveValue("price-ascending");
  await page.getByRole("button", { name: "Sinh nhật", exact: true }).click();

  await page.getByRole("button", { name: "Xóa tất cả" }).click();
  await expect(search).toHaveValue("");
  await expect(page.getByLabel("Sắp xếp")).toHaveValue("price-ascending");
});
