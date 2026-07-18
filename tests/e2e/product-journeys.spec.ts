import { expect, test } from "@playwright/test";

test("compares two catalogue items and closes the comparison with Escape", async ({
  page,
}) => {
  await page.goto("/");
  const detailButtons = page.getByRole("button", { name: /Mở chi tiết / });
  const firstDetailButton = detailButtons.first();

  await firstDetailButton.click();
  let productDialog = page.getByRole("dialog");
  await productDialog
    .getByRole("button", { name: "Thêm vào so sánh" })
    .click();
  await productDialog.getByRole("button", { name: "Đóng lời nhắn" }).click();

  await detailButtons.nth(1).click();
  productDialog = page.getByRole("dialog");
  await productDialog
    .getByRole("button", { name: "Thêm vào so sánh" })
    .click();
  await productDialog.getByRole("button", { name: "Đóng lời nhắn" }).click();

  const tray = page.getByLabel("Danh sách so sánh");
  await tray.getByRole("button", { name: "So sánh 2 món" }).click();

  const compareDialog = page.getByRole("dialog", { name: "So sánh gợi ý" });
  await expect(compareDialog).toBeVisible();
  await expect(compareDialog.locator("article")).toHaveCount(2);

  await page.keyboard.press("Escape");
  await expect(compareDialog).toBeHidden();
  await expect(tray.getByRole("button", { name: "So sánh 2 món" })).toBeFocused();
});
