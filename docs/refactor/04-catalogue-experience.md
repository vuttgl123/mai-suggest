# Section 04: Catalogue Discovery và Product UX Implementation Plan

> **Cho Codex:** REQUIRED SUB-SKILL: dùng `superpowers:executing-plans`. Mọi thay
> đổi filter hoặc compare phải có domain test trước component code.

**Mục tiêu:** Giúp người dùng tìm, đánh giá và so sánh gợi ý nhanh hơn mà không bị
choáng bởi collection cards, filter panel và nhiều action trên mỗi product card.

**Kiến trúc:** Catalogue query là domain thuần; discovery UI chia thành collection
picker, active filters, filter drawer và sort menu. Compare là state tạm trong
session, không làm thay đổi JSON hoặc selection storage.

**Tech stack:** React, shared UI primitives, Motion chỉ cho state transition có ý
nghĩa, existing JSON taxonomy.

## Global Constraints

- Không thêm search service hoặc backend.
- Filter và sort chạy trên JSON đã load.
- Mobile dùng filter drawer; desktop dùng compact inline controls.
- Product card giữ một primary open action và các icon action dễ nhận biết.
- Compare giới hạn tối đa ba item trong cùng một category.
- Item đang compare không cần persist sau reload.

---

## Task 1: Mở rộng catalogue query với sort rõ ràng

**Files:**

- Modify: `src/features/catalogue/lib/catalogue-query.ts`
- Modify: `src/features/catalogue/lib/catalogue-query.test.ts`
- Modify: `src/features/catalogue/hooks/use-catalogue-discovery.ts`

**Interfaces:**

```ts
export type CatalogueSort =
  | "recommended"
  | "price-ascending"
  | "price-descending"
  | "name";

export interface CatalogueFilters {
  query: string;
  occasionIds: string[];
  styleId: string;
  budgetTier: BudgetTier | "";
  giftType: GiftType | "";
  collectionId: string;
  sort: CatalogueSort;
}
```

- [x] **Step 1: Viết failing sort tests**

Recommended giữ featured/editorial order. Price sort dùng budget rank định nghĩa
rõ, không parse chuỗi `referencePrice`. Name sort dùng `localeCompare("vi")`.

- [x] **Step 2: Chạy RED**

Run: `npm run test -- src/features/catalogue/lib/catalogue-query.test.ts`

Expected: FAIL do sort mới chưa tồn tại.

- [x] **Step 3: Implement sort không mutate JSON**

Tạo copy array trước sort. Collection/filter behavior cũ phải giữ nguyên.

- [ ] **Step 4: Chạy GREEN và full domain tests**

Run: `npm run test -- src/features/catalogue/lib`

Expected: PASS.

## Task 2: Chia `CatalogueDiscovery` thành các control có trách nhiệm rõ

**Files:**

- Create: `src/features/catalogue/components/collection-picker.tsx`
- Create: `src/features/catalogue/components/filter-controls.tsx`
- Create: `src/features/catalogue/components/active-filter-list.tsx`
- Create: `src/features/catalogue/components/filter-drawer.tsx`
- Create: `src/features/catalogue/components/catalogue-sort-menu.tsx`
- Create: `src/features/catalogue/components/catalogue-discovery.test.tsx`
- Move: `src/components/catalogue-discovery.tsx` ->
  `src/features/catalogue/components/catalogue-discovery.tsx`
- Modify: `src/components/preference-catalogue.tsx`

- [x] **Step 1: Viết characterization tests cho discovery hiện tại**

Kiểm tra search, occasion toggle, select values, collection, clear và result count.

- [x] **Step 2: Extract collection picker**

Desktop không để collection đầu chiếm diện tích quá lớn; mobile dùng horizontal
list với snap và label rõ. Mỗi collection button có selected state.

- [x] **Step 3: Extract active filter list**

Mỗi filter hiện thành chip có nút xóa riêng với accessible name như
`Bỏ bộ lọc ngân sách Dưới 500 nghìn`. Có `Xóa tất cả` khi từ hai filter trở lên.

- [x] **Step 4: Tạo mobile filter drawer**

Drawer dùng shared Dialog lifecycle, title rõ, result count cập nhật live và hai
action cố định: `Áp dụng` và `Xóa bộ lọc`. Thay đổi filter có thể preview nhưng
focus không rời dialog.

- [x] **Step 5: Tạo desktop compact controls và sort menu**

Control nằm trong full-width band, không trong nested card. Sort là native select
hoặc menu có keyboard support đầy đủ.

- [ ] **Step 6: Chạy component tests**

Run: `npm run test -- src/features/catalogue/components/catalogue-discovery.test.tsx`

Expected: PASS mobile/desktop behavior ở mức DOM.

## Task 3: Refactor product card hierarchy

**Files:**

- Modify: `src/components/preference-card.tsx`
- Create: `src/features/catalogue/components/preference-card.test.tsx`
- Modify: `src/components/preference-grid.tsx`

**Card hierarchy:**

1. Ảnh thật của item.
2. Tên item.
3. Brand và mức ngân sách.
4. Một lý do phù hợp ngắn.
5. Open detail là primary click target.
6. Like là icon action.
7. Favorite chuyển vào detail hoặc selected action menu nếu card quá tải.

- [x] **Step 1: Viết tests cho action independence**

Click like không mở detail; click card mở detail; selected/favorite labels có
accessible name và không làm card thay đổi height.

- [x] **Step 2: Thay visual hierarchy bằng shared primitives/tokens**

Card radius <= 8 px, metadata không truncate mức ngân sách quan trọng, title tối
đa hai dòng và action area có chiều cao ổn định.

- [x] **Step 3: Giảm action cạnh tranh**

Giữ Like trên card. Favorite vẫn truy cập được trong detail và selection panel;
nếu giữ ở card thì dùng icon button với tooltip thay vì một footer button dài.

- [ ] **Step 4: Chạy grid tại mọi breakpoint**

Xác minh card cùng hàng không nhảy khi liked/favorite; text dài tiếng Việt không
tràn ở 320 px.

## Task 4: Thêm compare tray thuần FE

**Files:**

- Create: `src/features/catalogue/hooks/use-product-comparison.ts`
- Create: `src/features/catalogue/hooks/use-product-comparison.test.tsx`
- Create: `src/features/catalogue/components/compare-tray.tsx`
- Create: `src/features/catalogue/components/compare-dialog.tsx`
- Create: `src/features/catalogue/components/compare-dialog.test.tsx`
- Modify: `src/components/preference-grid.tsx`
- Modify: `src/components/product-message-dialog.tsx`

**Interfaces:**

```ts
export interface ProductComparison {
  itemIds: string[];
  canAdd(itemId: string): boolean;
  toggle(itemId: string): void;
  clear(): void;
}
```

- [x] **Step 1: Viết failing hook tests**

Bao phủ toggle, duplicate, limit ba item, clear khi category đổi và không thêm item
không còn trong filtered result.

- [x] **Step 2: Implement transient comparison state**

Không ghi compare IDs vào `localStorage`. State reset khi active category đổi.

- [x] **Step 3: Tạo compare tray**

Tray chỉ hiện khi có từ hai item; hiển thị thumbnail/name ngắn, remove action và
command `So sánh`. Không che mobile selection bar.

- [x] **Step 4: Tạo compare dialog**

So sánh các trường có thật trong JSON: ảnh, brand, budget tier, reference price,
tags, whyItFits và source. Không tạo score hoặc dữ liệu AI suy diễn.

- [ ] **Step 5: Chạy tests và keyboard QA**

Dialog dùng shared lifecycle; table/list reflow trên 320 px và không scroll ngang
toàn trang.

## Task 5: Giữ vị trí khi load more và đổi filter

**Files:**

- Modify: `src/components/preference-grid.tsx`
- Create: `src/features/catalogue/components/preference-grid.test.tsx`

- [x] **Step 1: Viết tests cho visible count reset**

Visible count reset hợp lý khi category hoặc filter result thay đổi; không giữ con
số lớn làm empty khoảng trống.

- [x] **Step 2: Implement focus/scroll restoration**

Sau `Xem thêm`, focus không nhảy lên đầu. Sau xóa filter, heading result được
announce qua `aria-live` nhưng không cưỡng ép focus nếu user đang nhập.

- [ ] **Step 3: Verify stable layout**

Grid track và image aspect ratio cố định; loading/error image không đổi card size.

## Task 6: Verification toàn catalogue

- [ ] **Step 1: Chạy test, lint, build**

Run in order:

```bash
npm run test
npm run lint
npm run build
```

- [ ] **Step 2: Browser QA**

Kiểm tra collection, search không dấu, multi-occasion, select filters, active chips,
sort, clear, load more, detail, like, favorite và compare tại năm viewport.

- [ ] **Step 3: Accessibility audit**

Kiểm tra accessible name, live result count, filter drawer, card action order,
compare dialog và touch target.

## Acceptance Checklist

- [ ] Filter trên mobile không chiếm toàn bộ trang khi chưa cần.
- [ ] Active filters nhìn thấy và xóa độc lập được.
- [ ] Sort deterministic và có domain tests.
- [ ] Card có hierarchy rõ, ít action cạnh tranh và height ổn định.
- [ ] Compare tối đa ba item, không sinh dữ liệu ngoài JSON.
- [ ] Keyboard, touch và responsive QA đều qua.
- [ ] Test, lint và build có bằng chứng mới.

## Skill Routing

- Thực thi/TDD: `superpowers:executing-plans`, `superpowers:test-driven-development`.
- React: `vercel-react-best-practices`.
- Audit: `web-design-guidelines`.
- Hoàn tất: `superpowers:verification-before-completion`.
