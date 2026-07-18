# Section 07: Accessibility, Performance và Release QA Implementation Plan

> **Cho Codex:** REQUIRED SUB-SKILL: dùng `superpowers:executing-plans`. Không báo
> hoàn tất nếu chưa có test, lint, build và browser evidence mới.

**Mục tiêu:** Xác minh toàn bộ chương trình refactor đạt UI/UX quality gate,
accessibility, responsive, performance và production behavior trước khi release.

**Kiến trúc:** Unit/component tests bảo vệ domain và interaction; Playwright kiểm
tra journey, viewport và screenshot; axe hỗ trợ accessibility scan; manual QA xử
lý các tiêu chí không thể tự động hóa.

**Tech stack:** Vitest, React Testing Library, Playwright, axe-core, Next production
build, browser DevTools/Lighthouse.

## Global Constraints

- Automated accessibility scan không thay thế keyboard/screen-reader review.
- Screenshot không thay thế interaction tests.
- Lighthouse lab data không được trình bày như production field data.
- Remote image lỗi phải có fallback ổn định và không làm browser suite flaky.
- Production URL phải trả app thực, không chấp nhận Vercel Edge `404_NOT_FOUND`.

---

## Target File Map

```text
playwright.config.ts
tests/e2e/
  catalogue-smoke.spec.ts
  catalogue-filters.spec.ts
  selection.spec.ts
  accessibility.spec.ts
  responsive.spec.ts
  visual.spec.ts
```

## Task 1: Thiết lập Playwright và axe

**Files:**

- Modify: `package.json`
- Create: `playwright.config.ts`
- Create: `tests/e2e/catalogue-smoke.spec.ts`

- [ ] **Step 1: Cài dependencies sau khi người dùng cho phép network**

Run:

```bash
npm install --save-dev @playwright/test @axe-core/playwright
npx playwright install chromium
```

Expected: chỉ devDependencies; Chromium cài thành công.

- [ ] **Step 2: Thêm scripts**

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

- [ ] **Step 3: Tạo Playwright config**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

- [ ] **Step 4: Viết smoke test đầu tiên**

```ts
test("loads the catalogue and opens a product", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Điều Em Yêu");
  await page.getByRole("button", { name: /xem chi tiết|mở chi tiết/i }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
```

- [ ] **Step 5: Chạy smoke test**

Run: `npm run test:e2e -- tests/e2e/catalogue-smoke.spec.ts`

Expected: PASS trên Chromium.

## Task 2: Tạo journey tests cho catalogue

**Files:**

- Create: `tests/e2e/catalogue-filters.spec.ts`
- Extend: `tests/e2e/catalogue-smoke.spec.ts`

- [ ] **Step 1: Test search tiếng Việt không dấu**

Nhập query không dấu; xác minh result count và item phù hợp.

- [ ] **Step 2: Test filter/sort/clear**

Chọn occasion, style, budget, gift type, sort; xóa một chip rồi xóa tất cả.

- [ ] **Step 3: Test category và load more**

Arrow-key category navigation, load more, focus/scroll preservation và empty state.

- [ ] **Step 4: Test compare**

Chọn hai item, mở compare, remove item, close bằng Escape và restore focus.

## Task 3: Tạo journey tests cho selection

**Files:**

- Create: `tests/e2e/selection.spec.ts`

- [ ] **Step 1: Seed localStorage schema v1 và reload**

Xác minh migration không mất likes/favorites/notes và resume state xuất hiện.

- [ ] **Step 2: Test like/favorite/note**

Like từ card, favorite từ detail, nhập note, reload và xác minh persistence.

- [ ] **Step 3: Test selected-only và summary editing**

Chuyển selected-only, mở panel, remove, undo, đổi favorite và sửa note.

- [ ] **Step 4: Test export fallbacks**

Mock Clipboard/Web Share; xác minh copy/share fallback và email link encoded.
Download test kiểm tra suggested filename và Blob creation path.

- [ ] **Step 5: Test reset**

Cancel confirm không đổi state; confirm reset xóa persisted selection; undo behavior
phù hợp contract Section 05.

## Task 4: Accessibility automation và manual audit

**Files:**

- Create: `tests/e2e/accessibility.spec.ts`

- [ ] **Step 1: Chạy axe trên các state chính**

States: initial page, filtered catalogue, product dialog, compare dialog, selection
panel và empty results.

```ts
const results = await new AxeBuilder({ page })
  .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
  .analyze();
expect(results.violations).toEqual([]);
```

- [ ] **Step 2: Keyboard-only audit**

Kiểm tra skip link, tabs, filters, product actions, load more, compare, dialogs,
summary, menus và reset. Không có keyboard trap ngoài dialog focus trap.

- [ ] **Step 3: Screen-reader semantics review**

Kiểm tra landmarks, headings, live regions, button names, pressed/selected states,
form labels, dialog title/description và image alt.

- [ ] **Step 4: Contrast và target review**

Đo text/control contrast trên mọi surface. Control chính đạt 44 x 44 px; control
nhỏ hơn phải thỏa spacing exception và có equivalent action rõ.

## Task 5: Responsive và visual regression suite

**Files:**

- Create: `tests/e2e/responsive.spec.ts`
- Create: `tests/e2e/visual.spec.ts`

**Viewports:**

```ts
const viewports = [
  { name: "mobile-320", width: 320, height: 720 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1024", width: 1024, height: 768 },
  { name: "wide-1440", width: 1440, height: 1000 },
];
```

- [ ] **Step 1: Assert không overflow ngang**

Ở mỗi viewport, `document.documentElement.scrollWidth` không lớn hơn clientWidth do
layout. Horizontal scroller chủ đích phải nằm trong container riêng.

- [ ] **Step 2: Assert stable fixed/sticky controls**

Toolbar, mobile bottom bar, compare tray và dialog actions không overlap nhau hoặc
che item cuối.

- [ ] **Step 3: Chụp screenshot state ổn định**

Chờ fonts và ảnh cần thiết; tắt motion trong visual test. Chụp hero/discovery,
catalogue, product dialog và selection panel. Không dùng screenshot để bỏ qua DOM
assertions.

- [ ] **Step 4: Canvas/pixel sanity**

Kiểm tra screenshot không blank, ảnh có pixel variance và primary content nằm trong
viewport. Không chấp nhận snapshot chỉ có loading placeholder.

## Task 6: Performance verification

**Files:**

- Modify only when evidence requires: React components, image config, data loader.
- Record: `docs/refactor/performance-report.md`

- [ ] **Step 1: Build production bundle**

Run: `npm run build`

Ghi route output, bundle warnings và image/font warnings.

- [ ] **Step 2: Kiểm tra render/client boundaries**

Xác minh component chỉ cần server không có `use client`; heavy dialog/compare code
được load khi hợp lý; không thêm barrel import làm bundle rộng.

- [ ] **Step 3: Chạy Lighthouse lab measurement**

Đo mobile và desktop trên production build. Ghi LCP, INP proxy/TBT, CLS, image
issues và accessibility findings. Không gọi lab number là field performance.

- [ ] **Step 4: Fix chỉ regression có bằng chứng**

Dùng `vercel-react-best-practices` cho waterfall, bundle, rerender hoặc image issue.
Mỗi fix có test hoặc measurement trước/sau.

## Task 7: Production release QA

**Files:**

- Modify: `README.md`
- Modify: `docs/IMPLEMENTATION_PLAN.md`
- Update: `docs/refactor/README.md`

- [ ] **Step 1: Chạy full local gate**

Run:

```bash
npm run test
npm run test:e2e
npm run lint
npm run build
```

Expected: tất cả exit 0, không có skipped critical journey.

- [ ] **Step 2: Xác minh Vercel deployment URL**

Generated deployment và production alias phải trả app. Nếu có `404_NOT_FOUND`, xử
lý deployment/alias trước khi coi release hoàn tất.

- [ ] **Step 3: Chạy production browser smoke**

Trên URL thật: load, filter, like, favorite, note, reload, compare, summary, copy,
mailto, download và reset.

- [ ] **Step 4: Cập nhật tài liệu trạng thái**

Đánh dấu từng section đã duyệt/thực thi, bằng chứng test, URL production và rủi ro
còn lại. Không ghi thành công nếu browser QA chưa chạy.

## Acceptance Checklist

- [ ] Unit/component/E2E tests bảo vệ toàn bộ luồng chính.
- [ ] Axe không có WCAG A/AA violations trong state được test.
- [ ] Keyboard, focus, screen-reader semantics và target size đã review thủ công.
- [ ] Năm viewport không overflow, overlap hoặc blank screenshot.
- [ ] Production build không có regression nghiêm trọng về LCP/INP/CLS.
- [ ] Generated deployment và production URL đều hoạt động.
- [ ] Full local gate và production smoke có bằng chứng mới.

## Skill Routing

- Lỗi/test failure: `superpowers:systematic-debugging`.
- React/performance: `vercel-react-best-practices`.
- UI/accessibility audit: `web-design-guidelines`.
- Hoàn tất: `superpowers:verification-before-completion`.

