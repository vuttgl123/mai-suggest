import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("has no WCAG A/AA violations on the initial catalogue", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Điều Em Yêu" }),
  ).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});
