import { expect, test } from "@playwright/test";

test("renders visible hero content without waiting for animation", async ({ page }) => {
  await page.goto("/");
  const title = page.getByRole("heading", { level: 1, name: "Điều Em Yêu" });

  await expect(title).toBeVisible();
  const box = await title.boundingBox();
  expect(box?.height).toBeGreaterThan(0);

  const screenshot = await page.screenshot();
  expect(screenshot.byteLength).toBeGreaterThan(10_000);
});
