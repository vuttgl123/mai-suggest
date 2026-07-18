import { expect, test } from "@playwright/test";

const STORAGE_KEY = "dieu-em-yeu:preferences:v1";

async function addFirstChoice(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: /^Thích / }).first().click();
  await page
    .getByRole("button", { name: "Xem 1 lựa chọn" })
    .first()
    .click();
  return page.getByRole("dialog", { name: "Những điều em yêu" });
}

test("persists a choice and edits it in the selection panel", async ({ page }) => {
  const panel = await addFirstChoice(page);
  await expect(panel).toBeVisible();

  const note = panel.getByRole("textbox", { name: "Lời nhắn của em" }).first();
  await note.fill("Ưu tiên phiên bản màu sáng");
  await expect(note).toHaveValue("Ưu tiên phiên bản màu sáng");

  await page.getByRole("button", { name: "Đóng phần tổng kết" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Xem 1 lựa chọn" }).first(),
  ).toBeVisible();
});

test("migrates a v1 selection from local storage", async ({ page }) => {
  await page.addInitScript((storageKey) => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        schemaVersion: 1,
        likedItemIds: ["gift-jo-malone-peony"],
        favoriteByCategory: { "gift-ideas": "gift-jo-malone-peony" },
        notesByCategory: { "gift-ideas": "Ưu tiên quà dùng hằng ngày" },
        updatedAt: null,
      }),
    );
  }, STORAGE_KEY);

  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Xem 1 lựa chọn" }).first(),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate((storageKey) => {
        return JSON.parse(window.localStorage.getItem(storageKey) ?? "{}");
      }, STORAGE_KEY),
    )
    .toMatchObject({ schemaVersion: 2, lastViewedCategoryId: null });
});

test("restores a confirmed reset from the undo toast", async ({ page }) => {
  const panel = await addFirstChoice(page);
  await panel.locator("summary").click();
  await panel.getByRole("button", { name: "Làm lại từ đầu" }).click();
  await page
    .getByRole("alertdialog", { name: "Mình bắt đầu lại nhé?" })
    .getByRole("button", { name: "Làm lại từ đầu" })
    .click();

  await expect(page.getByRole("button", { name: "Hoàn tác" })).toBeVisible();
  await page.getByRole("button", { name: "Hoàn tác" }).click();
  await page
    .getByRole("button", { name: "Xem 1 lựa chọn" })
    .first()
    .click();
  await expect(panel.getByRole("listitem").first()).toBeVisible();
});

test("falls back from Web Share, keeps email encoded and downloads text", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window.navigator, "share", {
      configurable: true,
      value: async () => {
        throw new DOMException("Not allowed", "NotAllowedError");
      },
    });
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          window.sessionStorage.setItem("copied-selection", value);
        },
      },
    });
  });

  const panel = await addFirstChoice(page);
  await panel.getByRole("button", { name: "Chia sẻ" }).click();
  await expect
    .poll(() => page.evaluate(() => window.sessionStorage.getItem("copied-selection")))
    .toContain("NHỮNG ĐIỀU EM YÊU");

  await panel.locator("summary").click();
  const email = panel.getByRole("link", { name: "Gửi qua email" });
  await expect(email).toHaveAttribute("href", /mailto:.*subject=.*body=/);
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    panel.getByRole("button", { name: "Tải file văn bản" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("dieu-em-yeu.txt");
});
