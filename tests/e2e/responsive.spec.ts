import { expect, test } from "@playwright/test";

const viewports = [
  { name: "mobile-320", width: 320, height: 720 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1024", width: 1024, height: 768 },
  { name: "wide-1440", width: 1440, height: 1000 },
];

for (const viewport of viewports) {
  test(`keeps the initial page inside ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: "Điều Em Yêu" }),
    ).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

    await expect(page.locator("header").first()).toBeVisible();
    await page.screenshot({ path: test.info().outputPath(`${viewport.name}.png`) });
  });
}
