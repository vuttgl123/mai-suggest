# Section 02: UI Foundation và Design System Implementation Plan

> **Cho Codex:** REQUIRED SUB-SKILL: dùng `superpowers:executing-plans`. Dùng
> `vercel-composition-patterns` chỉ cho primitive có nhiều consumer thực tế.

**Mục tiêu:** Chuẩn hóa token, typography, control và dialog để UI nhất quán,
accessible và dễ refactor mà không tiếp tục nhân bản className.

**Kiến trúc:** Design tokens nằm trong CSS; primitive React nhỏ và explicit nằm ở
`src/components/ui`. Feature component vẫn sở hữu layout và nội dung theo domain.

**Tech stack:** Tailwind CSS, CSS custom properties, React, Lucide React, Motion.

## Global Constraints

- Section 01 đã hoàn tất và test foundation hoạt động.
- Không thêm component library hoặc CSS-in-JS runtime.
- Không tạo generic component khi chưa có ít nhất hai consumer rõ ràng.
- Card item dùng radius <= 8 px; không dùng card lồng card.
- Font size dùng rem và breakpoint, không dùng `vw` hoặc `clamp()` gắn với viewport.
- Letter spacing bằng 0; không dùng tracking âm.
- Motion phải tôn trọng `prefers-reduced-motion`.

---

## Target File Map

```text
src/
  components/ui/
    button.tsx
    button.test.tsx
    icon-button.tsx
    filter-chip.tsx
    form-control.tsx
    dialog.tsx
    dialog.test.tsx
  hooks/
    use-dialog-lifecycle.ts
    use-dialog-lifecycle.test.tsx
  app/globals.css
```

## Task 1: Thiết lập semantic design tokens

**Files:**

- Modify: `src/app/globals.css`
- Modify incrementally: component files đang dùng raw color/radius.

**Produces:** Token semantic cho màu, typography, spacing, radius, control height,
focus ring, shadow và motion.

- [x] **Step 1: Kiểm kê raw style đang lặp**

Run:

```bash
rg -o "#[0-9a-fA-F]{6}|rounded-\[[^]]+\]|tracking-\[[^]]+\]" src | sort | uniq -c | sort -nr
```

Expected: có danh sách màu/radius/tracking thực tế để map sang token.

- [x] **Step 2: Thêm token semantic vào `:root`**

Token đích:

```css
:root {
  --color-brand: #6b1726;
  --color-brand-strong: #3b0b13;
  --color-accent: #a77b33;
  --color-positive: #486457;
  --color-paper: #fffdf9;
  --color-surface: #f5f1ec;
  --color-ink: #241c1e;
  --color-muted: #685d60;
  --color-border: rgb(59 11 19 / 14%);
  --color-focus: #0b6bcb;
  --radius-control: 6px;
  --radius-card: 8px;
  --radius-dialog: 8px;
  --control-height: 44px;
  --shadow-card: 0 8px 24px rgb(36 28 30 / 8%);
  --duration-fast: 140ms;
  --duration-base: 220ms;
}
```

Màu cuối phải được kiểm tra contrast trước khi khóa. Không biến toàn trang thành
nhiều sắc độ rượu vang và kem; positive/focus cung cấp tín hiệu chức năng riêng.

- [x] **Step 3: Chuẩn hóa typography**

Tạo utility CSS cho `display-xl`, `display-lg`, `heading-md`, `body`, `caption` với
font-size cố định và media query. Mọi utility dùng `letter-spacing: 0`.

- [x] **Step 4: Chuẩn hóa focus và reduced motion**

Focus ring dùng màu token có contrast rõ trên nền sáng/tối. Giữ global reduced
motion, đồng thời tránh đặt animation bắt buộc trong component.

- [x] **Step 5: Migrate một component đại diện**

Migrate `src/components/preference-card.tsx` trước để xác minh token đủ dùng. Không
đổi information hierarchy trong task này.

- [ ] **Step 6: Chạy verification**

Run:

```bash
npm run test
npm run lint
npm run build
```

Expected: exit 0; card không đổi kích thước ở liked/favorite state.

## Task 2: Tạo Button và IconButton primitives

**Files:**

- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/button.test.tsx`
- Create: `src/components/ui/icon-button.tsx`

**Interfaces:**

```ts
export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";
export type ButtonSize = "medium" | "compact" | "icon";

export function buttonClassName(options?: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}): string;

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  },
): React.ReactElement;

export function IconButton(
  props: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    label: string;
    icon: React.ReactNode;
  },
): React.ReactElement;
```

- [x] **Step 1: Viết failing tests**

```tsx
it("keeps the native disabled behavior", async () => {
  const onClick = vi.fn();
  render(<Button disabled onClick={onClick}>Lưu</Button>);
  await user.click(screen.getByRole("button", { name: "Lưu" }));
  expect(onClick).not.toHaveBeenCalled();
});

it("requires an accessible label for icon buttons", () => {
  render(<IconButton label="Đóng" icon={<X />} />);
  expect(screen.getByRole("button", { name: "Đóng" })).toBeVisible();
});
```

- [x] **Step 2: Chạy test và xác minh RED**

Run: `npm run test -- src/components/ui/button.test.tsx`

Expected: FAIL vì primitive chưa tồn tại.

- [x] **Step 3: Implement primitive explicit**

Không dùng boolean prop cho visual mode. `variant` và `size` có union hữu hạn;
native props được forward. IconButton có `aria-label` và `title` từ `label`.

- [x] **Step 4: Chạy test và xác minh GREEN**

Run: `npm run test -- src/components/ui/button.test.tsx`

Expected: PASS cho accessible name, disabled, native type và custom className.

- [x] **Step 5: Migrate buttons theo nhóm**

Thứ tự: dialog close/reset, summary actions, card actions, discovery clear/filter,
hero CTA. Chạy component tests sau mỗi nhóm.

## Task 3: Tạo form controls và filter chip

**Files:**

- Create: `src/components/ui/form-control.tsx`
- Create: `src/components/ui/filter-chip.tsx`
- Create: `src/components/ui/form-control.test.tsx`
- Modify: `src/components/catalogue-discovery.tsx`
- Modify: `src/components/category-note.tsx`

**Interfaces:**

```ts
export function FieldLabel(props: React.LabelHTMLAttributes<HTMLLabelElement>): React.ReactElement;
export function SelectControl(props: React.SelectHTMLAttributes<HTMLSelectElement>): React.ReactElement;
export function TextAreaControl(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>): React.ReactElement;
export function FilterChip(props: {
  selected: boolean;
  onClick(): void;
  children: React.ReactNode;
}): React.ReactElement;
```

- [x] **Step 1: Viết tests cho label, selected state và keyboard activation**

FilterChip phải expose `aria-pressed`; select/textarea giữ native accessible name.

- [x] **Step 2: Implement controls dùng token chung**

Control có min-height 44 px, focus rõ, disabled state và không thay đổi layout khi
selected. Không bọc toàn bộ field trong card.

- [x] **Step 3: Migrate discovery và note**

Giữ nguyên event signatures để không làm thay đổi domain behavior.

- [ ] **Step 4: Chạy test, lint và build**

Run in order:

```bash
npm run test
npm run lint
npm run build
```

Expected: exit 0.

## Task 4: Tạo dialog foundation dùng chung

**Files:**

- Create: `src/hooks/use-dialog-lifecycle.ts`
- Create: `src/hooks/use-dialog-lifecycle.test.tsx`
- Create: `src/components/ui/dialog.tsx`
- Create: `src/components/ui/dialog.test.tsx`
- Modify: `src/components/product-message-dialog.tsx`
- Modify: `src/components/confirm-dialog.tsx`
- Modify: `src/features/selection/components/selection-summary.tsx`

**Interfaces:**

```ts
export function useDialogLifecycle(options: {
  open: boolean;
  onClose(): void;
  containerRef: React.RefObject<HTMLElement | null>;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}): void;

export function Dialog(props: {
  open: boolean;
  titleId: string;
  descriptionId?: string;
  onClose(): void;
  children: React.ReactNode;
}): React.ReactElement | null;
```

- [x] **Step 1: Viết failing lifecycle tests**

Bao phủ Escape, Tab wrap, Shift+Tab wrap, scroll lock, restore focus và cleanup khi
unmount.

- [x] **Step 2: Chạy RED**

Run: `npm run test -- src/hooks/use-dialog-lifecycle.test.tsx`

Expected: FAIL do hook chưa tồn tại.

- [x] **Step 3: Implement lifecycle một lần**

Hook truy vấn focusable elements trong container, không đăng ký listener khi
`open=false` và luôn cleanup body overflow.

- [x] **Step 4: Implement Dialog shell**

Shell cung cấp overlay, `role="dialog"`, `aria-modal`, labelledby/describedby và
close behavior. Nội dung domain vẫn do consumer truyền vào.

- [x] **Step 5: Migrate từng dialog**

Migrate `ConfirmDialog`, chạy test; sau đó product dialog; cuối cùng summary.
Không migrate ba dialog trong một bước chưa được kiểm tra.

- [x] **Step 6: Chạy dialog test suite**

Run: `npm run test -- src/components/ui/dialog.test.tsx src/hooks/use-dialog-lifecycle.test.tsx`

Expected: PASS keyboard, focus và cleanup.

## Task 5: Xóa raw style duplication có kiểm soát

**Files:**

- Modify: các component đã có primitive consumer.
- Modify: `src/app/globals.css`

- [x] **Step 1: Scan raw color/radius/tracking lần hai**

Run:

```bash
rg -n "#[0-9a-fA-F]{6}|rounded-\[[^]]+\]|tracking-\[-" src/components src/app
```

Expected: danh sách còn lại chỉ gồm ngoại lệ có lý do cụ thể.

- [x] **Step 2: Migrate theo component, không bulk replace**

Mỗi component được render/test sau khi migrate. Không đổi layout cùng lúc với đổi
token để diff có thể review.

- [ ] **Step 3: Chạy browser QA nền tảng**

Kiểm tra focus ring, control height, dialog, contrast và reduced-motion tại mobile
và desktop.

- [ ] **Step 4: Chạy verification toàn section**

Run in order:

```bash
npm run test
npm run lint
npm run build
```

Expected: exit 0.

## Acceptance Checklist

- [ ] Token semantic thay thế phần lớn raw color/radius lặp.
- [ ] Typography không còn viewport-scaled size hoặc tracking âm.
- [ ] Button, icon button, form control và chip có API explicit.
- [ ] Dialog lifecycle không còn lặp ở ba component.
- [ ] Control chính đạt vùng tương tác 44 x 44 px.
- [ ] Focus, disabled, selected và reduced-motion đã được browser QA.
- [ ] Test, lint và build có bằng chứng mới.

## Skill Routing

- Bắt buộc: `superpowers:executing-plans`, `superpowers:test-driven-development`.
- React: `vercel-react-best-practices`.
- Primitive API phức tạp: `vercel-composition-patterns`.
- Audit sau migration: `web-design-guidelines`.
- Hoàn tất: `superpowers:verification-before-completion`.
