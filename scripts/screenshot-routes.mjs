// Captures one route at the five widths this project requires for visual QA.
import { existsSync, mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const STATE_PATH = "tests/e2e/.auth/state.json";
const WIDTHS = [320, 390, 768, 1024, 1440];

const [routeArg, labelArg] = process.argv.slice(2);
const route = routeArg ?? "/";
const label = labelArg ?? "shot";
const outDir = `tests/e2e/.screenshots/${label}`;

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext(
  existsSync(STATE_PATH) ? { storageState: STATE_PATH } : {},
);

for (const width of WIDTHS) {
  const page = await context.newPage();
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${outDir}/${width}.png`, fullPage: true });
  await page.close();
}

await browser.close();
console.log(`Đã lưu ảnh vào ${outDir}`);
