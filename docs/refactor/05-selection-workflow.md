# Section 05: Selection, Summary và Sharing Implementation Plan

> **Cho Codex:** REQUIRED SUB-SKILL: dùng `superpowers:executing-plans`. Mọi thay
> đổi schema selection phải có migration test trước khi sửa hook/component.

**Mục tiêu:** Biến selection thành một luồng dễ xem lại, chỉnh sửa và chia sẻ mà
vẫn hoạt động hoàn toàn trên trình duyệt, không cần tài khoản hoặc backend.

**Kiến trúc:** Selection reducer/storage từ Section 01 là nguồn state. UI gồm
selected-only view, responsive summary panel, undo state trong memory và các export
adapter thuần cho clipboard, mailto, Web Share và file text.

**Tech stack:** React reducer, localStorage, Clipboard API, Web Share API, Blob URL,
mailto, shared Dialog/Button primitives.

## Global Constraints

- Không tự gửi email.
- Không upload selection hoặc note ra server.
- Không đưa note cá nhân vào URL.
- Storage key hiện tại được giữ; migration chỉ tăng schema khi thật sự cần field
  persisted mới.
- Web Share và Clipboard luôn có fallback.
- Destructive reset phải qua confirm dialog.

---

## Task 1: Tạo selection selectors và selected-only view

**Files:**

- Create: `src/features/selection/lib/selection-selectors.ts`
- Create: `src/features/selection/lib/selection-selectors.test.ts`
- Create: `src/features/selection/components/selected-items-view.tsx`
- Create: `src/features/selection/components/selected-items-view.test.tsx`
- Modify: `src/features/catalogue/components/catalogue-toolbar.tsx`
- Modify: `src/components/preference-catalogue.tsx`

**Interfaces:**

```ts
export interface SelectedCategory {
  category: PreferenceCategory;
  items: PreferenceItem[];
  favoriteItemId?: string;
  note: string;
}

export function selectValidSelection(
  data: PreferenceData,
  state: PreferenceSelectionState,
): SelectedCategory[];
```

- [x] **Step 1: Viết failing selector tests**

Bao phủ invalid item/category IDs, item liked ở nhiều nơi không bị duplicate,
favorite không còn trong JSON và note-only category.

- [x] **Step 2: Chạy RED**

Run: `npm run test -- src/features/selection/lib/selection-selectors.test.ts`

Expected: FAIL vì selector chưa tồn tại.

- [x] **Step 3: Implement selectors không mutate input**

Selector là nguồn derive dùng chung cho progress, resume, summary và export. Không
component nào tự lọc valid IDs theo cách riêng sau task này.

- [x] **Step 4: Tạo selected-only view**

Toolbar có segmented control `Tất cả` / `Đã chọn`. Empty state của `Đã chọn` có
một action quay lại catalogue, không có marketing copy.

- [x] **Step 5: Chạy component tests**

Kiểm tra selected-only mode, empty state, favorite marker và chuyển về all view.

## Task 2: Refactor summary thành responsive selection panel

**Files:**

- Modify: `src/features/selection/components/selection-summary.tsx`
- Create: `src/features/selection/components/selection-panel.tsx`
- Create: `src/features/selection/components/selection-panel.test.tsx`
- Modify: `src/features/selection/components/selected-category-list.tsx`
- Modify: `src/features/selection/components/selection-summary-actions.tsx`

**Behavior:** Mobile là full-screen dialog; desktop là panel rộng đủ để scan nhưng
vẫn dùng modal semantics. Header/action footer cố định trong panel, content scroll
độc lập và không tạo card lồng card.

- [ ] **Step 1: Viết failing responsive behavior tests**

DOM semantics không phụ thuộc viewport: một dialog, một accessible title, một close
action. Layout differences được xử lý bằng CSS media queries.

- [ ] **Step 2: Implement panel shell từ shared Dialog**

Panel nhận `open`, `onClose`, title và children. Không copy focus lifecycle.

- [ ] **Step 3: Tối ưu information hierarchy**

Thứ tự: tổng số đã chọn, category sections, favorite, liked items, note, actions.
Không đặt từng category trong một card nếu panel đã là framed tool.

- [ ] **Step 4: Thêm chỉnh sửa trực tiếp**

Mỗi item có remove và set favorite action. Note có edit control rõ; thay đổi gọi
selection actions hiện tại và cập nhật summary ngay.

- [ ] **Step 5: Chạy keyboard/focus tests**

Open, Tab wrap, close, restore focus, remove item, empty transition và reset confirm
đều phải pass.

## Task 3: Thêm undo cho thay đổi selection gần nhất

**Files:**

- Create: `src/features/selection/hooks/use-undoable-selection.ts`
- Create: `src/features/selection/hooks/use-undoable-selection.test.tsx`
- Modify: `src/components/toast.tsx`
- Modify: `src/features/selection/hooks/use-preference-selection.ts`

**Interfaces:**

```ts
export interface UndoableSelection {
  dispatch(action: SelectionAction): void;
  canUndo: boolean;
  undo(): void;
  clearUndo(): void;
}
```

- [ ] **Step 1: Viết failing undo tests**

Bao phủ remove like, change favorite, reset, one-level undo, timeout và action mới
thay thế snapshot cũ.

- [ ] **Step 2: Implement one-level in-memory history**

Undo snapshot không persist. Reload xóa history nhưng không xóa selection.

- [ ] **Step 3: Nâng Toast thành action toast**

```ts
interface ToastAction {
  label: string;
  onClick(): void;
}
```

Toast có status message, action tùy chọn, timeout cleanup và không chiếm focus.

- [ ] **Step 4: Verify undo flows**

Remove từ card/summary và reset có đường phục hồi phù hợp. Destructive reset vẫn
cần confirm trước khi tạo undo snapshot.

## Task 4: Chuẩn hóa note autosave feedback

**Files:**

- Modify: `src/components/category-note.tsx`
- Create: `src/features/selection/components/category-note.test.tsx`
- Modify: `src/features/selection/hooks/use-preference-selection.ts`

- [ ] **Step 1: Viết tests cho note length và saved state**

Kiểm tra giới hạn 500 ký tự, label, count và status `Đã lưu trên thiết bị này` chỉ
hiện sau khi persistence thành công.

- [ ] **Step 2: Expose persistence status từ hook**

```ts
export type PersistenceStatus = "idle" | "saving" | "saved" | "unavailable";
```

Storage write failure không làm mất note trong memory; UI báo lưu cục bộ không khả
dụng bằng câu trực tiếp.

- [ ] **Step 3: Refactor note UI**

Textarea không nằm trong nested card. Counter và save status có `aria-live` mức
polite, không announce mỗi keystroke.

## Task 5: Tạo export adapters thuần FE

**Files:**

- Modify: `src/lib/selection-text.ts`
- Modify: `src/lib/selection-email.ts`
- Create: `src/features/selection/lib/selection-share.ts`
- Create: `src/features/selection/lib/selection-share.test.ts`
- Modify: `src/features/selection/components/selection-summary-actions.tsx`

**Interfaces:**

```ts
export function createSelectionText(
  data: PreferenceData,
  selection: PreferenceSelectionState,
): string;
export function createSelectionEmailUrl(
  data: PreferenceData,
  selection: PreferenceSelectionState,
): string;
export function createSelectionFile(
  text: string,
): { blob: Blob; filename: string };
export async function shareSelection(options: {
  text: string;
  title: string;
  navigator: Pick<Navigator, "share" | "clipboard">;
}): Promise<"shared" | "copied">;
```

- [ ] **Step 1: Viết failing export tests**

Snapshot nội dung text theo category order, favorite, likes, note, source và không
chèn `undefined`. Email URL phải encode Unicode đúng.

- [ ] **Step 2: Implement deterministic text/email**

Tất cả export dùng `selectValidSelection`; invalid IDs không xuất hiện.

- [ ] **Step 3: Implement Web Share fallback**

Nếu `navigator.share` không có hoặc throw `NotAllowedError`, fallback copy text.
User cancellation không báo lỗi nghiêm trọng.

- [ ] **Step 4: Implement download text file**

Tạo Blob UTF-8, object URL, click anchor và revoke URL. Filename dùng ASCII an toàn
như `dieu-em-yeu.txt`.

- [ ] **Step 5: Refactor summary actions**

Commands: Share khi hỗ trợ, Copy, Email, Download. Trên mobile không để bốn primary
buttons; một primary và menu các command phụ.

## Task 6: Verification toàn selection workflow

- [ ] **Step 1: Chạy unit/component tests**

Run: `npm run test`

- [ ] **Step 2: Reload/storage migration QA**

Kiểm tra schema v1/v2, storage blocked, note 500 ký tự, invalid IDs và reset/undo.

- [ ] **Step 3: Browser API QA**

Kiểm tra Clipboard fallback, Web Share supported/unsupported, mailto encoding và
download file. Không log note hoặc selection ra console.

- [ ] **Step 4: Responsive/keyboard QA**

Selection panel, action menu, inline edit và empty state tại năm viewport.

- [ ] **Step 5: Chạy lint và build**

Run in order:

```bash
npm run lint
npm run build
```

Expected: exit 0.

## Acceptance Checklist

- [ ] Selected-only view dùng chung valid-selection selector.
- [ ] Summary scan và chỉnh sửa được trên mobile/desktop.
- [ ] Undo phục hồi thay đổi gần nhất mà không persist history.
- [ ] Note báo đúng trạng thái lưu trên thiết bị.
- [ ] Share, copy, email và download đều thuần FE và có fallback.
- [ ] Không gửi dữ liệu ra backend hoặc đưa note vào URL.
- [ ] Test, lint, build và browser QA có bằng chứng mới.

## Skill Routing

- Thực thi/TDD: `superpowers:executing-plans`, `superpowers:test-driven-development`.
- React: `vercel-react-best-practices`.
- Audit selection panel: `web-design-guidelines`.
- Hoàn tất: `superpowers:verification-before-completion`.
