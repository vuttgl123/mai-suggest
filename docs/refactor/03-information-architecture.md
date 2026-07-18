# Section 03: Information Architecture Implementation Plan

> **Cho Codex:** REQUIRED SUB-SKILL: dùng `superpowers:executing-plans` và giữ mọi
> thay đổi trong luồng frontend-only đã duyệt.

**Mục tiêu:** Rút ngắn đường đi từ mở trang đến chọn quà, làm rõ vị trí hiện tại,
trạng thái đã lưu và bước tiếp theo trên mobile lẫn desktop.

**Kiến trúc:** Trang giữ một route nhưng được tổ chức thành các vùng điều hướng rõ:
hero ngắn, resume/discovery, sticky catalogue toolbar, catalogue và selection panel.

**Tech stack:** React, Next.js App Router, shared UI primitives từ Section 02.

## Global Constraints

- Không biến trang thành landing page marketing.
- Brand `Điều Em Yêu` vẫn là tín hiệu đầu viewport.
- Hero phải để lộ dấu hiệu của phần trải nghiệm tiếp theo trên mọi viewport.
- Không lặp cùng một primary action ở nhiều section liên tiếp.
- Điều hướng không phụ thuộc hover; keyboard và touch có luồng tương đương.

---

## User Journey Đích

```text
Mở trang
  -> tiếp tục lựa chọn cũ hoặc bắt đầu mới
  -> chọn bộ sưu tập / mở bộ lọc
  -> duyệt catalogue
  -> thích / so sánh / chọn số một
  -> xem tổng kết
  -> chỉnh sửa hoặc chia sẻ
```

## Task 1: Tạo page shell và landmarks rõ ràng

**Files:**

- Create: `src/features/catalogue/components/catalogue-page-shell.tsx`
- Create: `src/features/catalogue/components/site-header.tsx`
- Create: `src/features/catalogue/components/site-header.test.tsx`
- Modify: `src/components/preference-catalogue.tsx`
- Modify: `src/components/hero-section.tsx`

**Produces:** `header`, `nav`, `main`, section headings và footer có cấu trúc nhất
quán; skip link đưa focus đúng vào catalogue.

- [x] **Step 1: Viết failing landmark tests**

```tsx
it("has one main landmark and a working skip link", async () => {
  render(<PreferenceCatalogue initialData={data} />);
  expect(screen.getAllByRole("main")).toHaveLength(1);
  expect(screen.getByRole("link", { name: /bỏ qua/i })).toHaveAttribute(
    "href",
    "#catalogue-start",
  );
});
```

- [x] **Step 2: Chạy RED rồi implement shell**

Page shell chỉ tổ chức landmark và container width; không tạo page section thành
card. SiteHeader xuất hiện sau hero hoặc ở trạng thái compact theo scroll.

- [x] **Step 3: Rút gọn hero**

Hero giữ brand, một mô tả cụ thể và một primary CTA. Chuyển các thống kê phụ ra
khỏi hero nếu chúng không giúp ra quyết định đầu tiên.

- [ ] **Step 4: Chạy tests và browser check**

Expected: primary CTA thấy được mà không che brand; phần discovery lộ ra ở đáy
viewport 320, 390 và desktop wide.

## Task 2: Tạo resume state cho người dùng quay lại

**Files:**

- Create: `src/features/selection/components/resume-selection.tsx`
- Create: `src/features/selection/components/resume-selection.test.tsx`
- Modify: `src/features/catalogue/hooks/use-catalogue-controller.ts`
- Modify: `src/components/preference-catalogue.tsx`

**Behavior:** Chỉ hiện khi hydration hoàn tất và selection có like, favorite hoặc
note hợp lệ. Nội dung cho biết số mục đã chọn và lần cập nhật; có hai action:
`Tiếp tục chọn` và `Xem tổng kết`.

- [x] **Step 1: Viết failing tests**

Bao phủ no-flash trước hydration, selection rỗng, selection có dữ liệu và invalid
IDs bị bỏ qua.

- [x] **Step 2: Implement derived resume model trong controller**

```ts
export interface ResumeSelectionModel {
  selectedItemCount: number;
  selectedCategoryCount: number;
  updatedAt: string | null;
}
```

- [x] **Step 3: Implement unframed resume band**

Không dùng nested card. Action dùng shared Button; timestamp có fallback khi dữ
liệu cũ không có `updatedAt`.

- [ ] **Step 4: Verify hydration và focus**

Reload với storage có dữ liệu; click continue phải scroll và focus đúng heading.

## Task 3: Chuẩn hóa sticky navigation và catalogue toolbar

**Files:**

- Create: `src/features/catalogue/components/catalogue-toolbar.tsx`
- Create: `src/features/catalogue/components/catalogue-toolbar.test.tsx`
- Modify: `src/components/category-tabs.tsx`
- Modify: `src/components/mobile-selection-bar.tsx`
- Modify: `src/components/preference-catalogue.tsx`

**Interfaces:**

```ts
interface CatalogueToolbarProps {
  activeCategoryName: string;
  resultCount: number;
  activeFilterCount: number;
  selectedItemCount: number;
  onOpenFilters(): void;
  onOpenSelection(): void;
}
```

- [x] **Step 1: Viết interaction tests**

Kiểm tra accessible name, filter count, selected count và focus sau đổi category.

- [x] **Step 2: Implement desktop toolbar**

Toolbar hiển thị category/result state và command chính. Category tabs vẫn là một
tab-like navigation có ArrowLeft/ArrowRight.

- [x] **Step 3: Implement mobile bottom action bar**

Bar chỉ chứa hai command quan trọng: mở filters và xem selection. Không lặp copy
giải thích hoặc tiến độ dài trong vùng cố định.

- [ ] **Step 4: Kiểm tra sticky collision**

Ở 320/390 px, toolbar, bottom bar, browser safe area và dialog không được che nội
dung/action cuối trang.

## Task 4: Làm rõ progress và completion state

**Files:**

- Modify: `src/components/selection-progress.tsx`
- Create: `src/features/selection/lib/selection-progress.ts`
- Create: `src/features/selection/lib/selection-progress.test.ts`

**Behavior:** Progress phản ánh việc người dùng đã chọn ở bao nhiêu category, không
ép họ phải hoàn thành toàn bộ category. Trạng thái dùng copy trực tiếp và không tạo
cảm giác form bắt buộc.

- [x] **Step 1: Viết tests cho progress model**

```ts
it("does not report completion when selected categories are zero", () => {});
it("reports a useful next category without requiring all categories", () => {});
```

- [x] **Step 2: Implement pure progress selector**

Selector nhận valid category IDs và selection; không đọc UI state.

- [x] **Step 3: Refactor progress UI**

Giữ một status line và một action. Không đặt progress component trong card riêng
nếu section đã có surface.

## Task 5: Browser QA cho information architecture

- [ ] **Step 1: Chạy component suite**

Run: `npm run test`

- [ ] **Step 2: Kiểm tra keyboard flow**

Tab từ skip link qua hero CTA, resume, discovery, tabs, card và selection action.
Focus không nhảy ngược hoặc mắc kẹt ngoài dialog.

- [ ] **Step 3: Kiểm tra responsive flow**

Tại 320, 390, 768, 1024 và 1440 px, xác minh primary action, sticky controls,
scroll targets và footer không bị che.

- [ ] **Step 4: Chạy lint và build**

Run in order:

```bash
npm run lint
npm run build
```

Expected: exit 0.

## Acceptance Checklist

- [ ] Người dùng nhìn thấy brand và hành động đầu tiên trong viewport đầu.
- [ ] Người quay lại có đường tiếp tục hoặc xem tổng kết rõ ràng.
- [ ] Sticky controls không che nội dung và không lặp action.
- [ ] Landmarks, heading hierarchy, skip link và focus order hợp lệ.
- [ ] Mobile và desktop có cùng khả năng hoàn thành luồng chính.
- [ ] Test, lint, build và browser QA có bằng chứng mới.

## Skill Routing

- Thực thi/TDD: `superpowers:executing-plans`, `superpowers:test-driven-development`.
- React: `vercel-react-best-practices`.
- Audit UI/UX: `web-design-guidelines`.
- Hoàn tất: `superpowers:verification-before-completion`.
