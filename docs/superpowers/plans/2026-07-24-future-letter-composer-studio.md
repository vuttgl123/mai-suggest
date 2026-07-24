# Future Letter Composer Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centre the “Hẹn một lá thư” dialog reliably and present its existing fields in a polished desktop studio layout that collapses to a safe, scrollable mobile form.

**Architecture:** Keep the current client component, draft state, submit function and server actions intact. Refactor only the form shell into an explicit header/body/footer grid and regroup the existing fields into a writing column plus a scheduling/details column. Global CSS owns dialog positioning and reusable composer surfaces; Tailwind retains local spacing and typography.

**Tech Stack:** Next.js App Router, React Client Components, TypeScript strict, Tailwind CSS, Lucide React, native HTML `<dialog>`, existing Future Letter Server Actions.

## Global Constraints

- Scope is limited to `FutureLetterComposer` and its global CSS. Do not change the letters page, opened-letter view, domain model, Server Actions, routes, Supabase, RLS or permissions.
- The modal must use explicit `fixed inset-0 m-auto` positioning, a bounded desktop width and a max viewport height. Do not depend on browser default dialog positioning.
- Keep the native modal dialog, `showModal`, `aria-labelledby`, labels, fieldsets, legends, validation attributes, create/edit copy, submit/close behavior, pending state and feedback strings unchanged.
- Desktop starts at `1024px`: writing stays in the wider left column; time and optional media stay in the right column. Below `1024px`, fields form one vertical reading order with no horizontal overflow.
- The form shell must use header/body/footer grid rows; only the body scrolls. Header and footer remain visible for long text and small viewports.
- Do not add a dialog library, new state, new request, media preview, animation, test, lint, build, browser QA, commit or branch.
- Per the user's explicit instruction, source/diff inspection is the only verification. Do not claim runtime or visual verification.

---

## File structure

- Modify `src/features/future-letters/presentation/future-letter-composer.tsx`: replace the single scrolling form with studio header/body/footer and regroup existing fields.
- Modify `src/app/globals.css`: centre/bound the dialog and add composer-specific surface, body and footer styles.
- Modify `docs/superpowers/specs/2026-07-24-future-letter-composer-studio-design.md`: record implementation status.
- Modify `docs/superpowers/plans/2026-07-24-future-letter-composer-studio.md`: record completed steps.

### Task 1: Make the dialog an explicit centred editor shell

**Files:**
- Modify: `src/features/future-letters/presentation/future-letter-composer.tsx:95-234`

**Interfaces:**
- Consumes the existing `dialogRef`, `isOpen`, `letter`, `isPending`, `draft`, `feedback`, `submit` and `onClose` values unchanged.
- Produces semantic `future-letter-composer`, `future-letter-composer-header`, `future-letter-composer-body` and `future-letter-composer-footer` class hooks.

- [x] **Step 1: Replace dialog/form shell classes with an explicit grid**

Keep the `<dialog>` props and `onClose` handler. Replace its current class and
the direct form class with:

```tsx
<dialog
  aria-labelledby="future-letter-composer-title"
  className="future-letter-dialog fixed inset-0 m-auto h-[min(46rem,calc(100dvh_-_1.5rem))] w-[min(100%_-_1.5rem,62rem)] max-w-none overflow-hidden rounded-[var(--radius-dialog)] border border-[var(--color-border)] bg-[var(--color-paper)] p-0 text-[var(--color-ink)] shadow-[var(--shadow-card)]"
  onClose={onClose}
  ref={dialogRef}
>
  <form
    className="future-letter-composer"
    onSubmit={(event) => {
      event.preventDefault();
      submit();
    }}
  >
    {/* header, body and footer from later steps */}
  </form>
</dialog>
```

Do not move the dialog ref or alter its `showModal`/`close` effects. The fixed
inset + auto margins are the source-level correction for the left-offset dialog.

- [x] **Step 2: Move the current top block into the studio header**

Place the existing kicker, decorative rule, mode-aware `h2` and close button in
this header. Keep the exact text, id, button props and `X` icon:

```tsx
<header className="future-letter-composer-header">
  <div>
    <p className="diary-kicker">Một điều để ngày mai mở ra</p>
    <div className="mt-3 flex items-center gap-2 text-[var(--color-accent)]" aria-hidden="true">
      <span className="diary-rule" />
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
    </div>
    <h2 id="future-letter-composer-title" className="font-display mt-3 text-3xl font-semibold tracking-[-0.045em] text-[var(--color-brand-strong)] sm:text-4xl">
      {letter ? "Sửa lá thư đang hẹn" : "Hẹn một lá thư"}
    </h2>
  </div>
  <Button aria-label="Đóng" disabled={isPending} onClick={() => dialogRef.current?.close()} size="icon" type="button" variant="quiet">
    <X size={18} aria-hidden="true" />
  </Button>
</header>
```

### Task 2: Regroup existing fields into writing and scheduling studio areas

**Files:**
- Modify: `src/features/future-letters/presentation/future-letter-composer.tsx:125-220`

**Interfaces:**
- Consumes all existing input `name`, `value`, `onChange`, `required`,
  `disabled`, `maxLength`, `autoComplete`, `inputMode`, `type` and
  `inputClassName` contracts.
- Produces a scrollable body with the existing fields in exactly one place each.

- [x] **Step 1: Add note and responsive two-column body**

After the header, add:

```tsx
<div className="future-letter-composer-body">
  <p className="future-letter-composer-note">
    Trước giờ hẹn chỉ mình bạn nhìn thấy lá thư này. Khi đến giờ, nó sẽ mở
    ra với tất cả thành viên đang hoạt động.
  </p>
  <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.22fr)_minmax(17rem,0.78fr)]">
    <section className="future-letter-composer-writing rounded-[var(--radius-card)] border border-[var(--color-border)] p-4 sm:p-5">
      {/* title and letter labels in Step 2 */}
    </section>
    <div className="grid content-start gap-5">
      {/* schedule and optional detail fieldsets in Step 3 */}
    </div>
  </div>
  {feedback ? <p aria-live="polite" className="mt-4 text-sm leading-6 text-[var(--color-danger)]">{feedback}</p> : null}
</div>
```

On mobile this remains one grid column in the exact reading order shown. The
note has no business-logic change.

- [x] **Step 2: Move title and letter fields to the writing section**

Move the existing title label, input, counter, letter label, textarea and
counter into the left section without changing their props. The section body is:

```tsx
<p className="diary-kicker text-[var(--color-accent)]">Phần muốn gửi lại</p>
<label className="future-letter-field mt-4">
  <span>Tiêu đề</span>
  <input
    autoComplete="off"
    className={inputClassName}
    disabled={isPending}
    maxLength={160}
    name="future-letter-title"
    onChange={(event) => updateDraft({ title: event.target.value })}
    placeholder="Ví dụ: Mở vào một chiều thật dịu"
    required
    value={draft.title}
  />
  <small>{draft.title.length}/160</small>
</label>
<label className="future-letter-field mt-5">
  <span>Lá thư</span>
  <textarea
    autoComplete="off"
    className={`${inputClassName} min-h-52 py-3 leading-7`}
    disabled={isPending}
    maxLength={8000}
    name="future-letter-content"
    onChange={(event) => updateDraft({ content: event.target.value })}
    placeholder="Viết điều bạn muốn giữ lại cho một ngày mai…"
    required
    value={draft.content}
  />
  <small>{draft.content.length}/8000</small>
</label>
```

- [x] **Step 3: Keep schedule and optional media in the right column**

Move the existing schedule fieldset and optional media fieldset into the right
column. Keep every existing field prop and helper copy. Give them these classes:

```tsx
<fieldset className="future-letter-composer-schedule rounded-[var(--radius-card)] border border-[var(--color-border)] p-4 sm:p-5">
  {/* existing legend, Clock3 helper, date and time fields */}
</fieldset>

<fieldset className="future-letter-composer-details rounded-[var(--radius-card)] border border-[var(--color-border)] p-4 sm:p-5">
  {/* existing legend and image URL, alt text and music URL fields */}
</fieldset>
```

Retain the schedule's `sm:grid-cols-2` field grid. Do not drop the conditional
required `imageAltText` contract when an image URL has content.

### Task 3: Add a fixed action footer and composer surface styles

**Files:**
- Modify: `src/features/future-letters/presentation/future-letter-composer.tsx:221-233`
- Modify: `src/app/globals.css:790-810`

**Interfaces:**
- Consumes the existing cancel/submit buttons and pending text/icon logic.
- Produces a visible action footer and responsive presentation styles for the
  class hooks produced in Task 1.

- [x] **Step 1: Move current action buttons into the footer**

After the body, add this footer. Preserve the existing button variants,
`disabled` state, click handler and mode/pending content exactly:

```tsx
<footer className="future-letter-composer-footer">
  <div className="flex flex-wrap items-center justify-end gap-2">
    <Button disabled={isPending} onClick={() => dialogRef.current?.close()} type="button" variant="quiet">
      Hủy
    </Button>
    <Button disabled={isPending} type="submit">
      {letter ? <Check size={16} aria-hidden="true" /> : <MailPlus size={16} aria-hidden="true" />}
      {isPending ? "Đang lưu…" : letter ? "Lưu thay đổi" : "Niêm phong lá thư"}
    </Button>
  </div>
</footer>
```

- [x] **Step 2: Replace the minimal dialog style with studio shell styles**

Keep the existing backdrop selector. Replace `.future-letter-dialog` and add
these selectors directly after it:

```css
.future-letter-dialog {
  overscroll-behavior: contain;
}

.future-letter-composer {
  display: grid;
  height: 100%;
  min-height: 0;
  grid-template-rows: auto minmax(0, 1fr) auto;
}

.future-letter-composer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--color-border);
  padding: 1.25rem 1.25rem 1rem;
  background: linear-gradient(135deg, rgb(101 12 28 / 6%), transparent 58%);
}

.future-letter-composer-body {
  min-height: 0;
  padding: 1.25rem;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.future-letter-composer-note {
  margin: 0;
  border: 1px solid rgb(101 12 28 / 10%);
  border-radius: var(--radius-card);
  padding: 0.8rem 0.95rem;
  color: var(--color-muted);
  background: rgb(101 12 28 / 4%);
  font-size: 0.875rem;
  line-height: 1.65;
}

.future-letter-composer-writing {
  background: var(--theme-card-surface);
  box-shadow: var(--shadow-soft);
}

.future-letter-composer-schedule {
  background: rgb(101 12 28 / 4%);
}

.future-letter-composer-details {
  background: rgb(255 251 246 / 62%);
}

.future-letter-composer-footer {
  border-top: 1px solid var(--color-border);
  padding: 1rem 1.25rem 1.25rem;
  background: rgb(255 250 244 / 92%);
}
```

- [x] **Step 3: Add compact mobile spacing without changing field order**

Add after the composer selectors:

```css
@media (min-width: 640px) {
  .future-letter-composer-header {
    padding: 1.5rem 1.75rem 1.1rem;
  }

  .future-letter-composer-body {
    padding: 1.5rem 1.75rem;
  }

  .future-letter-composer-footer {
    padding: 1rem 1.75rem 1.5rem;
  }
}
```

The JSX `lg:grid-cols-[…]` controls the 1024px column switch; do not create a
CSS breakpoint that reorders content.

### Task 4: Static review and documentation handoff

**Files:**
- Modify: `docs/superpowers/specs/2026-07-24-future-letter-composer-studio-design.md:3`
- Modify: `docs/superpowers/plans/2026-07-24-future-letter-composer-studio.md`
- Inspect: `future-letter-composer.tsx` and `globals.css`

**Interfaces:**
- Consumes the studio class/markup contract from Tasks 1–3.
- Produces static evidence and documented verification limits.

- [x] **Step 1: Mark the approved spec as implemented**

Change its status line to:

```md
**Trạng thái:** Đã được người dùng duyệt và triển khai theo đặc tả này.
```

- [x] **Step 2: Inspect positioning, layout and preserved data contracts**

Run:

```bash
rg -n "fixed inset-0 m-auto|future-letter-composer-(header|body|footer|writing|schedule|details)|lg:grid-cols|createFutureLetterAction|updateFutureLetterAction|future-letter-(title|content|open-date|open-time|image-url|image-alt|music-url)" src/features/future-letters/presentation/future-letter-composer.tsx src/app/globals.css
```

Expected: source has the explicit dialog centering classes, header/body/footer,
desktop two-column layout hook, all seven existing named fields and both actions;
CSS makes the body the sole overflow region.

- [x] **Step 3: Inspect scoped semantic diff and record completion**

Run:

```bash
git diff --ignore-space-at-eol --unified=0 -- src/features/future-letters/presentation/future-letter-composer.tsx src/app/globals.css docs/superpowers/specs/2026-07-24-future-letter-composer-studio-design.md docs/superpowers/plans/2026-07-24-future-letter-composer-studio.md
```

Expected: only the composer layout, targeted CSS and related documents change.
Mark all completed boxes in this plan. Report only static source/diff review; do
not run or claim test, lint, build or browser QA.
