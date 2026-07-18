# Section 01: Baseline và Core Codebase Implementation Plan

> **Cho Codex:** REQUIRED SUB-SKILL: dùng `superpowers:executing-plans` để thực thi
> từng task. Không dùng sub-agent nếu người dùng chưa yêu cầu rõ ràng.

**Mục tiêu:** Tạo test foundation và tách domain/data flow để các phase UI/UX sau
có thể thay đổi an toàn mà không phá JSON, `localStorage` hoặc hành vi hiện tại.

**Kiến trúc:** Giữ App Router và server loader hiện tại. Di chuyển logic lọc và
selection thành hàm thuần trong feature folders; hook chỉ quản lý lifecycle React.
Không thêm global state library.

**Tech stack:** Next.js, React, TypeScript strict, Vitest, React Testing Library,
`@testing-library/user-event`, jsdom.

## Global Constraints

- Nội dung tiếp tục nằm trong `public/data/*.json`.
- Storage key tiếp tục là `dieu-em-yeu:preferences:v1`.
- Không thay đổi UI có chủ đích trong section này.
- Không xóa module trước khi `rg` xác nhận không còn consumer và test liên quan pass.
- Mọi refactor hành vi dùng TDD và giữ compatibility với selection schema v1/v2.

---

## Target File Map

```text
src/
  features/
    catalogue/
      lib/catalogue-query.ts
      lib/catalogue-query.test.ts
      hooks/use-catalogue-discovery.ts
      hooks/use-catalogue-controller.ts
    selection/
      lib/selection-state.ts
      lib/selection-state.test.ts
      lib/selection-storage.ts
      lib/selection-storage.test.ts
      hooks/use-preference-selection.ts
      components/selection-summary.tsx
      components/selection-summary.test.tsx
  test/
    setup.ts
vitest.config.ts
```

Chỉ tạo file khi task tương ứng được thực thi. Component chưa cần sửa trong section
này vẫn giữ vị trí cũ để tránh một lần di chuyển lớn không tạo giá trị.

## Task 1: Khóa baseline hiện tại và thiết lập test runner

**Files:**

- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/lib/preference-validation.test.ts`
- Inspect: `src/hooks/use-preference-data.ts`
- Inspect: `src/components/product-pagination.tsx`

**Produces:** Lệnh `npm run test`, `npm run test:watch`, môi trường jsdom và danh
sách module active/dead đã được xác minh.

- [x] **Step 1: Chạy baseline trước khi thay đổi**

Run:

```bash
npm run lint
npm run build
```

Expected: ghi lại exit code và lỗi thực tế; không sửa lỗi bằng phỏng đoán.

- [x] **Step 2: Cài test dependencies sau khi người dùng cho phép network**

Run:

```bash
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Expected: dependency chỉ nằm trong `devDependencies`; không đổi runtime stack.

- [x] **Step 3: Thêm scripts kiểm thử**

`package.json` phải có:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [x] **Step 4: Tạo cấu hình Vitest**

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    restoreMocks: true,
  },
});
```

- [x] **Step 5: Tạo test setup**

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);
```

- [x] **Step 6: Viết test characterization cho JSON parser**

Test phải chứng minh parser:

```ts
it("rejects a catalogue item without message", () => {
  expect(() => parseCategory(invalidCategory)).toThrow(/message/i);
});

it("accepts every JSON file shipped in public/data", async () => {
  const data = await getPreferenceData();
  expect(data.categories.length).toBeGreaterThan(0);
});
```

- [x] **Step 7: Chạy test để xác minh cấu hình**

Run: `npm run test`

Expected: parser tests pass; lỗi import alias hoặc jsdom đều phải được xử lý trước
khi sang task tiếp theo.

- [x] **Step 8: Xác minh module có consumer**

Run:

```bash
rg -n "usePreferenceData|ProductPagination" src
```

Expected: ghi kết quả vào phần review của task. Chỉ lên danh sách xóa khi kết quả
cho thấy module không có consumer ngoài chính file khai báo.

## Task 2: Tách catalogue query thành domain functions

**Files:**

- Create: `src/features/catalogue/lib/catalogue-query.ts`
- Create: `src/features/catalogue/lib/catalogue-query.test.ts`
- Create: `src/features/catalogue/hooks/use-catalogue-discovery.ts`
- Modify: `src/components/preference-catalogue.tsx`
- Modify: `src/components/catalogue-discovery.tsx`
- Delete after migration: `src/hooks/use-catalogue-discovery.ts`

**Interfaces:**

```ts
export interface CatalogueFilters {
  query: string;
  occasionIds: string[];
  styleId: string;
  budgetTier: BudgetTier | "";
  giftType: GiftType | "";
  collectionId: string;
}

export const EMPTY_CATALOGUE_FILTERS: CatalogueFilters;
export function normalizeVietnameseSearch(value: string): string;
export function filterCatalogue(
  data: PreferenceData,
  filters: CatalogueFilters,
): PreferenceCategory[];
export function countActiveFilters(filters: CatalogueFilters): number;
```

- [x] **Step 1: Viết failing tests cho search và filter**

Bao phủ tối thiểu:

```ts
it("matches Vietnamese text without accents", () => {
  expect(normalizeVietnameseSearch("Điều Em Yêu")).toBe("dieu em yeu");
});

it("clears manual occasions when a collection is active", () => {
  expect(filterCatalogue(data, collectionFilters)).toEqual(expectedCategories);
});

it("sorts featured items before editorial order", () => {
  expect(result[0].items.map((item) => item.id)).toEqual(["featured", "first"]);
});
```

- [x] **Step 2: Chạy test và xác minh RED**

Run: `npm run test -- src/features/catalogue/lib/catalogue-query.test.ts`

Expected: FAIL do module/function chưa tồn tại.

- [x] **Step 3: Di chuyển logic hiện tại vào hàm thuần**

Implementation không gọi React hook, DOM, `window` hoặc storage. Dữ liệu đầu vào
không bị mutate; kết quả category chứa mảng item đã lọc và sort.

- [x] **Step 4: Chạy test và xác minh GREEN**

Run: `npm run test -- src/features/catalogue/lib/catalogue-query.test.ts`

Expected: PASS cho search, filter, collection, sort và active count.

- [x] **Step 5: Tạo hook mỏng sử dụng domain functions**

Hook mới chỉ chịu trách nhiệm `useState`, setters và `useMemo`. Public API giữ
nguyên tên đang được `PreferenceCatalogue` sử dụng để migration không đổi behavior.

- [x] **Step 6: Chuyển import và xóa hook cũ**

Run: `rg -n "@/hooks/use-catalogue-discovery" src`

Expected: không còn consumer trước khi xóa file cũ.

- [x] **Step 7: Chạy verification của task**

Run:

```bash
npm run test
npm run lint
```

Expected: tất cả pass và catalogue render cùng số item như baseline.

## Task 3: Tách selection reducer và storage adapter

**Files:**

- Create: `src/features/selection/lib/selection-state.ts`
- Create: `src/features/selection/lib/selection-state.test.ts`
- Create: `src/features/selection/lib/selection-storage.ts`
- Create: `src/features/selection/lib/selection-storage.test.ts`
- Create: `src/features/selection/hooks/use-preference-selection.ts`
- Modify: `src/components/preference-catalogue.tsx`
- Delete after migration: `src/hooks/use-preference-storage.ts`

**Interfaces:**

```ts
export type SelectionAction =
  | { type: "toggle-liked"; itemId: string; categoryId: string }
  | { type: "toggle-favorite"; itemId: string; categoryId: string }
  | { type: "set-note"; categoryId: string; note: string }
  | { type: "set-last-viewed"; categoryId: string }
  | { type: "reset" };

export const DEFAULT_SELECTION_STATE: PreferenceSelectionState;
export function selectionReducer(
  state: PreferenceSelectionState,
  action: SelectionAction,
): PreferenceSelectionState;
export function parseStoredSelection(value: unknown): PreferenceSelectionState;
export function readSelection(storage: Storage): PreferenceSelectionState;
export function writeSelection(
  storage: Storage,
  selection: PreferenceSelectionState,
): void;
```

- [x] **Step 1: Viết failing reducer tests**

```ts
it("liking a favorite removal also removes the favorite", () => {
  const next = selectionReducer(favoriteState, {
    type: "toggle-liked",
    itemId: "item-1",
    categoryId: "gifts",
  });
  expect(next.likedItemIds).not.toContain("item-1");
  expect(next.favoriteByCategory.gifts).toBeUndefined();
});

it("making an item favorite also likes it", () => {
  const next = selectionReducer(DEFAULT_SELECTION_STATE, favoriteAction);
  expect(next.likedItemIds).toContain(favoriteAction.itemId);
});
```

- [x] **Step 2: Viết failing storage tests**

Bao phủ schema v1, schema v2, JSON hỏng, storage throw, note dài hơn 500 ký tự và
ID like trùng lặp.

- [x] **Step 3: Chạy test và xác minh RED**

Run: `npm run test -- src/features/selection/lib`

Expected: FAIL do các module mới chưa tồn tại.

- [x] **Step 4: Implement reducer không phụ thuộc React**

Mỗi action trả object mới, giữ `schemaVersion: 2` và cập nhật `updatedAt` cho thay
đổi nội dung. `set-last-viewed` không làm mất state khác.

- [x] **Step 5: Implement storage adapter có fallback**

Adapter nhận `Storage` từ bên ngoài để test được. Read/write catch lỗi quota,
privacy mode và JSON parse; fallback về default state thay vì làm crash UI.

- [x] **Step 6: Chạy test và xác minh GREEN**

Run: `npm run test -- src/features/selection/lib`

Expected: PASS toàn bộ reducer, migration và storage tests.

- [x] **Step 7: Tạo React hook mỏng**

`usePreferenceSelection` dùng reducer, hydrate sau mount và persist sau hydration.
Public actions giữ signature hiện tại để component migration không đổi behavior.

- [x] **Step 8: Chuyển consumer và xóa hook cũ**

Run: `rg -n "@/hooks/use-preference-storage" src`

Expected: không còn consumer trước khi xóa file.

## Task 4: Tách controller khỏi `PreferenceCatalogue`

**Files:**

- Create: `src/features/catalogue/hooks/use-catalogue-controller.ts`
- Create: `src/features/catalogue/hooks/use-catalogue-controller.test.tsx`
- Modify: `src/components/preference-catalogue.tsx`

**Produces:** Một controller chứa active category, derived selection, scroll actions
và summary visibility; page component tập trung vào composition.

- [x] **Step 1: Viết failing hook tests**

Kiểm tra:

```ts
it("restores the last viewed category when it is still visible", () => {});
it("falls back to the first filtered category", () => {});
it("disables summary when there are no valid likes or notes", () => {});
it("ignores ids that no longer exist in JSON", () => {});
```

- [x] **Step 2: Chạy test và xác minh RED**

Run: `npm run test -- src/features/catalogue/hooks/use-catalogue-controller.test.tsx`

Expected: FAIL do controller chưa tồn tại.

- [x] **Step 3: Tạo controller với interface rõ ràng**

```ts
export interface CatalogueController {
  activeCategory: PreferenceCategory | null;
  activeCategoryIndex: number;
  selectedItemIds: string[];
  selectedCategoryCount: number;
  canViewSummary: boolean;
  summaryOpen: boolean;
  selectCategory(categoryId: string): void;
  openSummary(): void;
  closeSummary(): void;
  resetSelection(): void;
}
```

DOM scroll helpers được giữ trong controller hoặc hook nhỏ có tên phản ánh side
effect. Không đặt query/filter business rules trở lại controller.

- [x] **Step 4: Migrate `PreferenceCatalogue` theo từng block JSX**

Component vẫn render cùng thứ tự section và truyền cùng props. Không đổi className
hoặc copy trong task này.

- [x] **Step 5: Chạy component và full tests**

Run:

```bash
npm run test
npm run lint
```

Expected: PASS; `PreferenceCatalogue` không còn tự tính selection selectors.

## Task 5: Chia `SelectionSummary` theo trách nhiệm

**Files:**

- Create: `src/features/selection/components/selection-summary-header.tsx`
- Create: `src/features/selection/components/selected-category-list.tsx`
- Create: `src/features/selection/components/selection-summary-actions.tsx`
- Create: `src/features/selection/components/selection-summary.test.tsx`
- Move: `src/components/selection-summary.tsx` ->
  `src/features/selection/components/selection-summary.tsx`
- Modify: `src/components/preference-catalogue.tsx`

**Produces:** Summary container quản lý open/close và confirm reset; component con
render từng vùng nội dung và action.

- [x] **Step 1: Viết characterization component tests**

Kiểm tra dialog name, item đã chọn, favorite marker, note, copy action, mail link,
close và reset confirmation.

- [x] **Step 2: Chạy test và xác minh baseline pass**

Run: `npm run test -- src/features/selection/components/selection-summary.test.tsx`

Expected: PASS trên component hiện tại trước khi tách.

- [x] **Step 3: Extract header và list**

Component con chỉ nhận data đã derive. Không đọc `localStorage`, không tạo email URL
và không quản lý dialog lifecycle.

- [x] **Step 4: Extract action footer**

```ts
interface SelectionSummaryActionsProps {
  hasContent: boolean;
  emailUrl: string;
  onCopy(): void;
  onContinue(): void;
  onRequestReset(): void;
}
```

- [x] **Step 5: Chạy test sau mỗi extraction**

Run: `npm run test -- src/features/selection/components/selection-summary.test.tsx`

Expected: PASS và accessibility roles/names không đổi.

## Task 6: Xóa duplication và code chết đã xác minh

**Files:**

- Possible delete: `src/hooks/use-preference-data.ts`
- Possible delete: `src/components/product-pagination.tsx`
- Modify only if needed: `src/lib/get-preference-data.ts`
- Modify: `README.md`

- [x] **Step 1: Chạy consumer scan lần cuối**

Run:

```bash
rg -n "usePreferenceData|ProductPagination" src
```

Expected: chỉ xóa file nếu không có consumer thực tế.

- [x] **Step 2: Giữ một data-loading path cho production page**

`src/app/page.tsx` tiếp tục gọi `getPreferenceData()` ở server. Validation functions
tiếp tục dùng chung; không tạo fetch client song song nếu page không cần runtime reload.

- [x] **Step 3: Cập nhật tài liệu kiến trúc**

README mô tả JSON server loading, feature folders, versioned selection storage và
lệnh test mới.

- [x] **Step 4: Chạy verification toàn section**

Run:

```bash
npm run test
npm run lint
npm run build
```

Expected: mọi lệnh exit 0.

- [ ] **Step 5: Browser smoke**

Kiểm tra thủ công: load trang, filter, đổi category, like, favorite, note, reload,
summary, copy, `mailto`, reset và dữ liệu v1 được migrate.

## Acceptance Checklist

- [x] JSON và storage key không đổi.
- [x] Selection schema v1/v2 đều hydrate thành schema v2 hợp lệ.
- [x] Domain query và selection không phụ thuộc React/DOM.
- [x] `PreferenceCatalogue` và `SelectionSummary` có trách nhiệm rõ ràng hơn.
- [x] Không còn loader hoặc component chết đã được xác minh.
- [x] Không có thay đổi UI có chủ đích.
- [ ] Test, lint, build và browser smoke có bằng chứng mới.

## Skill Routing

- Bắt buộc: `superpowers:executing-plans`.
- Bắt buộc cho behavior: `superpowers:test-driven-development`.
- React refactor: `vercel-react-best-practices`.
- Trước khi báo xong: `superpowers:verification-before-completion`.
