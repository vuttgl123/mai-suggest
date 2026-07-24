# Admin Category Editor Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centre the category-edit dialog reliably and give its existing admin fields the same polished editor structure as the future-letter form.

**Architecture:** Preserve the current category editor state, validation, Server Action and feedback flow. Refactor the native dialog into a header/body/footer grid, regroup the existing fields into a catalogue-content column and an appearance/visibility column, and add narrowly-scoped `admin-category-editor-*` CSS for the new shell.

**Tech Stack:** Next.js App Router, React Client Components, TypeScript strict, Tailwind CSS, Lucide React, native HTML `<dialog>`, existing Catalogue Server Actions.

## Global Constraints

- Change only `AdminCategoryEditor` and supporting global CSS. Do not touch category creation, item editor, sidebar, data models, actions, routes, Supabase, RLS or permissions.
- The dialog must use `fixed inset-0 m-auto`, a bounded width and viewport-aware height. It must not rely on browser default modal placement.
- Keep the native dialog, `showModal`, `aria-labelledby`, form/fieldset/legend/label semantics, field names/types/validation attributes, draft state, validation messages, feedback, pending state, update action, refresh and close behavior unchanged.
- At `1024px`, content fields are in the wider left column and appearance/visibility fields are in the right column. Below it, use a single reading column with no horizontal overflow.
- The form uses header/body/footer grid rows and only the body has vertical overflow. No animation, dialog library, new state, new request, preview or image upload.
- Do not create a branch, worktree, commit, test, lint, build or browser QA. Source/diff review is the only verification by explicit user request.

---

## File structure

- Modify `src/features/catalogue/presentation/admin-category-editor.tsx`: refactor dialog structure and regroup existing fields without behavior changes.
- Modify `src/app/globals.css`: add category-editor shell, note, content/appearance surfaces, responsive spacing and body scroll styling.
- Modify `docs/superpowers/specs/2026-07-24-admin-category-editor-studio-design.md`: mark implemented status.
- Modify `docs/superpowers/plans/2026-07-24-admin-category-editor-studio.md`: mark completed steps.

### Task 1: Establish the explicitly centred category editor shell

**Files:**
- Modify: `src/features/catalogue/presentation/admin-category-editor.tsx:105-275`

**Interfaces:**
- Consumes `dialogRef`, `isPending`, `submit`, `onClose`, `draft`, `feedback` and every existing input contract.
- Produces `admin-category-editor`, `admin-category-editor-header`, `admin-category-editor-body` and `admin-category-editor-footer` semantic class hooks.

- [x] **Step 1: Replace the dialog and form shell classes**

Keep dialog props and `onClose` exactly as they are. Use this outer structure:

```tsx
<dialog
  aria-labelledby="admin-category-editor-title"
  className="admin-category-editor-dialog fixed inset-0 m-auto h-[min(44rem,calc(100dvh_-_1.5rem))] w-[min(100%_-_1.5rem,60rem)] max-w-none overflow-hidden rounded-[var(--radius-dialog)] border border-[var(--color-border)] bg-[var(--color-paper)] p-0 text-[var(--color-ink)] shadow-[var(--shadow-card)]"
  onClose={onClose}
  ref={dialogRef}
>
  <form className="admin-category-editor" onSubmit={submit}>
    {/* header, body and footer are added in later steps */}
  </form>
</dialog>
```

No hook, data mapping or submit function moves. The fixed inset and auto margin
are the only positioning source for the dialog.

- [x] **Step 2: Put the current title block into a semantic header**

Keep the existing kicker, rule, `h2` id/copy, close button props and X icon in:

```tsx
<header className="admin-category-editor-header">
  <div>
    <p className="diary-kicker">Bộ sưu tập · một chương nhỏ</p>
    <div aria-hidden="true" className="mt-3 flex items-center gap-2 text-[var(--color-accent)]">
      <span className="diary-rule" />
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
    </div>
    <h2
      className="font-display mt-3 text-3xl font-semibold tracking-[-0.045em] text-[var(--color-brand-strong)] sm:text-4xl"
      id="admin-category-editor-title"
    >
      Sửa danh mục
    </h2>
  </div>
  <Button aria-label="Đóng hộp sửa danh mục" disabled={isPending} onClick={() => dialogRef.current?.close()} size="icon" type="button" variant="quiet">
    <X size={18} aria-hidden="true" />
  </Button>
</header>
```

### Task 2: Group the existing category fields in a responsive studio body

**Files:**
- Modify: `src/features/catalogue/presentation/admin-category-editor.tsx:145-256`

**Interfaces:**
- Consumes all existing category field names, type/required/pattern/min/step,
  updateDraft calls and `inputClassName` unchanged.
- Produces one mobile reading order and a desktop two-column grid.

- [x] **Step 1: Add note, body and responsive column grid**

After the header, add this body shell and retain the note copy exactly:

```tsx
<div className="admin-category-editor-body">
  <p className="admin-category-editor-note">
    Những thay đổi này sẽ sắp xếp lại cách chương này xuất hiện trong bộ
    sưu tập của hai đứa.
  </p>
  <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(17rem,0.8fr)]">
    <fieldset className="admin-category-editor-content rounded-[var(--radius-card)] border border-[var(--color-border)] p-4 sm:p-5">
      {/* content fields in Step 2 */}
    </fieldset>
    <fieldset className="admin-category-editor-appearance rounded-[var(--radius-card)] border border-[var(--color-border)] p-4 sm:p-5">
      {/* appearance fields in Step 3 */}
    </fieldset>
  </div>
  {feedback ? (
    <p aria-live="polite" className="mt-4 rounded-[var(--radius-card)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-3 text-sm leading-6 text-[var(--color-danger)]">
      {feedback}
    </p>
  ) : null}
</div>
```

- [x] **Step 2: Move name, slug and description into the content fieldset**

Use the original legend “Nội dung danh mục” and move these exact existing
labels/fields into it: `category-name`, `category-slug` and
`category-description`. Preserve name `required`, slug `pattern`,
`spellCheck={false}`, description `min-h-28`, every `onChange`, value and the
slug helper text. Their container remains:

```tsx
<div className="mt-4 grid gap-4">
  {/* the three preserved labels appear here in name, slug, description order */}
</div>
```

- [x] **Step 3: Move appearance, sort, cover and active controls to the right fieldset**

Use the original legend “Diện mạo và thứ tự”. Preserve `category-icon`,
`category-sort-order`, `category-cover-image` and `category-is-active` in this
order. The icon/order wrapper is:

```tsx
<div className="mt-4 grid gap-4 sm:grid-cols-2">
  {/* preserved icon and numeric sort-order labels */}
</div>
```

Keep the cover URL label after that grid and keep the existing checked,
disabled and updateDraft contract on the active checkbox. Do not add a cover
image preview.

### Task 3: Add stable actions and category-editor styles

**Files:**
- Modify: `src/features/catalogue/presentation/admin-category-editor.tsx:257-274`
- Modify: `src/app/globals.css` near the existing future-letter editor styles

**Interfaces:**
- Consumes current cancel/submit button logic.
- Produces a fixed visual footer plus responsive category editor surfaces.

- [x] **Step 1: Move the existing action row into a footer**

After the body, render this footer with the same button props and copy:

```tsx
<footer className="admin-category-editor-footer">
  <div className="flex flex-wrap items-center justify-end gap-2">
    <Button disabled={isPending} onClick={() => dialogRef.current?.close()} type="button" variant="quiet">
      Hủy
    </Button>
    <Button disabled={isPending} type="submit">
      <Check size={16} aria-hidden="true" />
      {isPending ? "Đang lưu…" : "Lưu thay đổi"}
    </Button>
  </div>
</footer>
```

- [x] **Step 2: Add the category editor surface styles**

Add these selectors after the future-letter composer styles:

```css
.admin-category-editor-dialog {
  overscroll-behavior: contain;
}

.admin-category-editor {
  display: grid;
  height: 100%;
  min-height: 0;
  grid-template-rows: auto minmax(0, 1fr) auto;
}

.admin-category-editor-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--color-border);
  padding: 1.25rem 1.25rem 1rem;
  background: linear-gradient(135deg, rgb(101 12 28 / 6%), transparent 58%);
}

.admin-category-editor-body {
  min-height: 0;
  padding: 1.25rem;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.admin-category-editor-note {
  margin: 0;
  border: 1px solid rgb(101 12 28 / 10%);
  border-radius: var(--radius-card);
  padding: 0.8rem 0.95rem;
  color: var(--color-muted);
  background: rgb(101 12 28 / 4%);
  font-size: 0.875rem;
  line-height: 1.65;
}

.admin-category-editor-content {
  background: var(--theme-card-surface);
  box-shadow: var(--shadow-soft);
}

.admin-category-editor-appearance {
  background: rgb(255 251 246 / 62%);
}

.admin-category-editor-footer {
  border-top: 1px solid var(--color-border);
  padding: 1rem 1.25rem 1.25rem;
  background: rgb(255 250 244 / 92%);
}
```

- [x] **Step 3: Match the larger-screen spacing of the letter studio**

Add to the existing `@media (min-width: 640px)` block:

```css
.admin-category-editor-header {
  padding: 1.5rem 1.75rem 1.1rem;
}

.admin-category-editor-body {
  padding: 1.5rem 1.75rem;
}

.admin-category-editor-footer {
  padding: 1rem 1.75rem 1.5rem;
}
```

The JSX `lg:grid-cols-[…]` handles desktop grouping; no CSS reordering is
added.

### Task 4: Static review and documentation handoff

**Files:**
- Modify: `docs/superpowers/specs/2026-07-24-admin-category-editor-studio-design.md:3`
- Modify: `docs/superpowers/plans/2026-07-24-admin-category-editor-studio.md`
- Inspect: `admin-category-editor.tsx` and `globals.css`

**Interfaces:**
- Consumes the category editor studio markup/CSS contract from Tasks 1–3.
- Produces source-only verification evidence.

- [x] **Step 1: Mark the approved spec as implemented**

Set its status to:

```md
**Trạng thái:** Đã được người dùng duyệt và triển khai theo đặc tả này.
```

- [x] **Step 2: Inspect structure and preserved category contracts**

Run:

```bash
rg -n "fixed inset-0 m-auto|admin-category-editor-(header|body|footer|content|appearance)|lg:grid-cols|updateCatalogueCategoryAction|category-(name|slug|description|icon|sort-order|cover-image|is-active)" src/features/catalogue/presentation/admin-category-editor.tsx src/app/globals.css
```

Expected: explicit centering, header/body/footer, two-column hook, all seven
category field names and the original update action are present; CSS makes body
the sole overflow area.

- [x] **Step 3: Inspect scoped semantic diff and mark completed tasks**

Run:

```bash
git diff --ignore-space-at-eol --unified=0 -- src/features/catalogue/presentation/admin-category-editor.tsx src/app/globals.css docs/superpowers/specs/2026-07-24-admin-category-editor-studio-design.md docs/superpowers/plans/2026-07-24-admin-category-editor-studio.md
```

Expected: only the category editor layout, targeted CSS and related documents
change. Mark the completed boxes. Do not run or claim test, lint, build or
browser QA.
