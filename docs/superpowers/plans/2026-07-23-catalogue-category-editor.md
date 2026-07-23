# Catalogue Category Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an Owner edit every existing catalogue-category field in an accessible dialog without changing the item-management workflow.

**Architecture:** Add a focused client dialog that owns only editable draft state and calls the existing `updateCatalogueCategoryAction`. The sidebar owns which category is being edited and continues to own workspace-level success feedback; validation and action errors remain visible inside the dialog.

**Tech Stack:** Next.js App Router, React, TypeScript strict, native HTML `<dialog>`, existing Server Action, Supabase-backed repository.

## Global Constraints

- Reuse `updateCatalogueCategoryAction`, `ManageCatalogue.updateCategory`, the current domain model, and current Supabase RLS; do not change schema, migration, RLS, Auth, or Server Action behavior.
- Do not change item editor behavior, category creation/deletion behavior, public catalogue UI, cache policy, global animation, or styles outside the new dialog/sidebar trigger.
- Keep server-side Owner authorization authoritative; do not introduce client-side authorization or a new backend endpoint.
- Do not add dependencies, create a branch, or create a commit.
- Do not run tests, lint, type checks, builds, browser QA, or performance commands; source and diff review only.

---

## File structure

| Path | Responsibility |
| --- | --- |
| `src/features/catalogue/presentation/admin-category-editor.tsx` | Native dialog, category draft lifecycle, client validation, Server Action call, local error feedback, and success handoff. |
| `src/features/catalogue/presentation/admin-catalogue-sidebar.tsx` | Tracks the selected category being edited and supplies the focused `Sửa danh mục` trigger. |

### Task 1: Create the category editing dialog

**Files:**
- Create: `src/features/catalogue/presentation/admin-category-editor.tsx`

**Consumes:** `ManagedCatalogueCategory`, `CatalogueCategoryInput`,
`updateCatalogueCategoryAction`, `feedbackForFailure`, `Button`, Next router,
and the existing native-dialog lifecycle pattern in `future-letter-composer.tsx`.

**Produces:** `AdminCategoryEditor`, a Client Component that updates exactly one
category and returns success feedback to its sidebar parent.

- [x] **Step 1: Define the props and draft shape.**

  Create the module as a Client Component with the following public interface:

  ```tsx
  interface AdminCategoryEditorProps {
    category: ManagedCatalogueCategory | null;
    isOpen: boolean;
    onClose: () => void;
    onFeedback: (feedback: AdminFeedback) => void;
  }

  interface CategoryDraft {
    coverImageUrl: string;
    description: string;
    icon: string;
    isActive: boolean;
    name: string;
    slug: string;
    sortOrder: string;
  }
  ```

  Use `useRef<HTMLDialogElement>`, `useRouter`, `useEffect`, `useState`, and
  `useTransition`. Create `createDraft(category)` that maps nullable persisted
  fields to empty strings and `sortOrder` to `String(category.sortOrder)`.

- [x] **Step 2: Synchronize the native dialog and category draft.**

  Use an effect keyed by `isOpen` and `category` that resets local error/draft
  state before calling `showModal()` when a category is available. Close an open
  dialog when either prop no longer permits editing:

  ```tsx
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && category) {
      setDraft(createDraft(category));
      setFeedback(null);
      if (!dialog.open) dialog.showModal();
      return;
    }

    if (dialog.open) dialog.close();
  }, [category, isOpen]);
  ```

  Attach `onClose={onClose}` directly to the dialog, so Escape and either close
  control return ownership to the sidebar state.

- [x] **Step 3: Implement one validated update submission.**

  Convert the draft to `CatalogueCategoryInput` only after checking that the
  trimmed name is non-empty and `sortOrder` is a non-negative integer. Use
  `null` for empty optional fields. On action failure, set the local dialog
  feedback to `feedbackForFailure(result).message`; do not close the dialog.
  On success, close the dialog, call the parent success feedback, then refresh:

  ```tsx
  const result = await updateCatalogueCategoryAction(category.id, input);

  if (!result.ok) {
    setFeedback(feedbackForFailure(result).message);
    return;
  }

  dialogRef.current?.close();
  onFeedback({ tone: "success", message: "Đã lưu thay đổi danh mục." });
  router.refresh();
  ```

  Keep the existing Server Action responsible for final slug, URL, and Owner
  validation.

- [x] **Step 4: Render the accessible full-field form.**

  Follow the existing `FutureLetterComposer` native-dialog styling pattern:
  `w-[min(100%_-_1.5rem,44rem)]`, semantic title with
  `aria-labelledby`, scrollable form body, and an action row. Render controlled
  inputs for all fields below, disabling them during the transition:

  ```text
  Tên danh mục       required text input
  Slug               text input with [a-z0-9]+(?:-[a-z0-9]+)* pattern
  Mô tả              textarea
  Biểu tượng         optional text input
  Ảnh bìa            optional URL input
  Thứ tự hiển thị    required number input, min=0, step=1
  Hiển thị ngay      checkbox
  ```

  Put local feedback in an `aria-live="polite"` paragraph inside the dialog.
  Include accessible `Đóng`, `Hủy`, and `Lưu thay đổi` controls, with all three
  disabled when pending. Do not add an image preview or a new dependency.

### Task 2: Connect the dialog to the selected category sidebar entry

**Files:**
- Modify: `src/features/catalogue/presentation/admin-catalogue-sidebar.tsx`

**Consumes:** `AdminCategoryEditor`, existing `categories`,
`selectedCategoryId`, and workspace `onFeedback` callback.

**Produces:** A compact `Sửa danh mục` trigger only for the currently selected
category, without changing category create/delete behavior.

- [x] **Step 1: Add dialog state and derive the category safely.**

  Import `Pencil` and `AdminCategoryEditor`. Add a nullable ID state alongside
  the existing confirmation state:

  ```tsx
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const editingCategory =
    categories.find((category) => category.id === editingCategoryId) ?? null;
  ```

  Do not add a second copy of category data to sidebar state.

- [x] **Step 2: Render a focused edit trigger without altering navigation.**

  In the existing selected-category branch, render this button before the
  existing delete confirmation controls:

  ```tsx
  <Button
    className="mt-1 w-full justify-start px-3 text-[11px]"
    disabled={isPending}
    onClick={() => setEditingCategoryId(category.id)}
    size="compact"
    type="button"
    variant="quiet"
  >
    <Pencil size={13} aria-hidden="true" />
    Sửa danh mục
  </Button>
  ```

  Preserve the category `Link`, `aria-current`, delete confirmation behavior,
  and all creation code unchanged.

- [x] **Step 3: Mount one dialog after the sidebar content.**

  Render one instance after the `<aside>` element:

  ```tsx
  <AdminCategoryEditor
    category={editingCategory}
    isOpen={editingCategory !== null}
    onClose={() => setEditingCategoryId(null)}
    onFeedback={onFeedback}
  />
  ```

  This keeps a selected category mounted while opening the dialog and naturally
  closes it if the category disappears after refresh.

### Task 3: Source-only completion review

**Files:**
- Review: `src/features/catalogue/presentation/admin-category-editor.tsx`
- Review: `src/features/catalogue/presentation/admin-catalogue-sidebar.tsx`
- Review: `src/modules/catalogue/presentation/catalogue-admin-actions.ts`
- Review: `src/modules/catalogue/application/manage-catalogue.ts`
- Review: `src/modules/catalogue/infrastructure/supabase-catalogue-admin-repository.ts`

**Consumes:** The approved design and existing category update pipeline.

**Produces:** Evidence that the UI calls only the already-authorized update
action and preserves all unrelated workflows.

- [x] **Step 1: Trace update wiring.**

  Confirm the new dialog calls `updateCatalogueCategoryAction` exactly once on
  submit, and that no direct Supabase client/database import appears in either
  Client Component. Re-read the existing action, `ManageCatalogue.updateCategory`,
  and repository `updateCategory` to confirm Owner validation and RLS-backed
  update remain unchanged.

- [x] **Step 2: Inspect interaction and accessibility source.**

  Confirm all seven editable fields appear, local error feedback is inside the
  dialog, `aria-labelledby` points to the title, `onClose` clears sidebar state,
  and pending disables close/cancel/save controls.

- [x] **Step 3: Inspect the semantic diff and report limits.**

  Use `git diff --ignore-space-at-eol --unified=0` for the new dialog and
  sidebar. Confirm there are no changes to database code, global CSS, item
  editor, category create/delete logic, routing, cache, or public UI. Report
  that tests, lint, typecheck, build, browser QA, commits, and branches were
  intentionally not run/created.
