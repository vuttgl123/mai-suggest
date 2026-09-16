import { test, expect } from "@playwright/test";

test.describe("Future Letters Cohesion", () => {
  test("guest sees login prompt or blocked access on thu-hen-ngay-mo", async ({ page }) => {
    // Attempt to visit directly
    await page.goto("/thu-hen-ngay-mo");
    
    // In our app, it redirects to / hoc /?sign-in=true, hoc show "Please login"
    // Just verify we don"t crash and we are not seeing the mailbox
    // By convention, we either get redirected or see a sign-in button
    const url = page.url();
    if (url.includes("/thu-hen-ngay-mo")) {
      await expect(page.locator("text=/Đăng nhập|Bắt đầu|sign in/i").first()).toBeVisible();
    }
  });
});
