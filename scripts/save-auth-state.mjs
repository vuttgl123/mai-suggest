// Opens a real browser so a human can complete Google OAuth once, then stores
// the resulting session for later screenshot runs. Never prints the session.
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { chromium } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const STATE_PATH = "tests/e2e/.auth/state.json";
const TIMEOUT_MS = 5 * 60 * 1000;

const browser = await chromium.launch({
  headless: false,
  channel: "chrome",
  args: ["--disable-blink-features=AutomationControlled"],
  ignoreDefaultArgs: ["--enable-automation"],
});
const context = await browser.newContext();
const page = await context.newPage();

await page.goto(`${BASE_URL}/login`);
console.log("Đăng nhập Google trong cửa sổ vừa mở. Script tự lưu khi vào được trang chủ.");

try {
  await page.waitForURL(
    (url) => new URL(url).pathname === "/",
    { timeout: TIMEOUT_MS, waitUntil: "domcontentloaded" },
  );
  mkdirSync(dirname(STATE_PATH), { recursive: true });
  await context.storageState({ path: STATE_PATH });
  console.log(`Đã lưu phiên vào ${STATE_PATH}`);
} catch {
  console.error("Hết thời gian chờ đăng nhập. Chưa lưu gì cả.");
  process.exitCode = 1;
} finally {
  await browser.close();
}
