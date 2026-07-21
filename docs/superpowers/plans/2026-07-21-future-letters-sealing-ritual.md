# Future Letters Sealing Ritual Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine `/thu-hen-ngay-mo` into a coherent write–seal–wait–open ritual while preserving every existing future-letter mutation, timer, dialog, and envelope-opening behavior.

**Architecture:** Keep `FutureLettersExperience` as the existing client orchestration boundary and derive hero counts directly from its two prop arrays. Keep scheduled-letter time/mutation state in `ScheduledLetterList`, but render `letters[0]` as a featured sealed letter and the rest as compact sealed entries; opening and composer components receive presentation-only changes.

**Tech Stack:** Next.js App Router, React client components, TypeScript strict, Tailwind CSS, Lucide React, existing CSS envelope animation, Supabase-backed Server Actions.

## Global Constraints

- Do not create a commit or a branch.
- Do not run automated tests, lint, build, or browser QA unless the user explicitly reverses that instruction.
- Do not alter the server page, parallel queries, Supabase/RLS/auth/schema, future-letter time functions, Server Actions, validation, data order, routes, or dependencies.
- Preserve composer state and props; preserve opening phases, 720ms timeout, focus after opening, reduced-motion shortcut, scheduled refresh timeout, 60-second countdown interval, pending state, feedback, and delete confirmation.
- Keep `FutureLettersExperience`, `ScheduledLetterList`, `FutureLetterOpeningCard`, and `FutureLetterComposer` as client components. Do not add client state, timers, network queries, or animation JavaScript.
- Reuse current semantic theme tokens and existing envelope CSS; preserve `target="_blank" rel="noreferrer"`, 44px controls, focus visibility, image lazy/error behavior, whitespace-preserving letter content, and conditional image/music rendering.

---

## File Structure

- Modify: `src/features/future-letters/presentation/future-letters-experience.tsx` — adds hero counts and reorders visual sections without changing composer orchestration.
- Modify: `src/features/future-letters/presentation/scheduled-letter-list.tsx` — derives featured/sealed entries from existing ordered props and retains timer/mutation state.
- Modify: `src/features/future-letters/presentation/future-letter-opening-card.tsx` — refines letterhead and opened-paper hierarchy without changing opening logic.
- Modify: `src/features/future-letters/presentation/future-letter-composer.tsx` — refines dialog hierarchy and surfaces only.

## Task 1: Establish the writing-desk and archive hierarchy

**Files:**
- Modify: `src/features/future-letters/presentation/future-letters-experience.tsx`

**Interfaces:**
- Consumes: unchanged `FutureLettersExperienceProps` (`actor`, `openedLetters`, `scheduledLetters`).
- Produces: unchanged `FutureLetterComposer` props and `ScheduledLetterList({ letters, onEdit })` call.
- Preserves: `isComposerOpen`, `editingLetter`, `createLetter`, `editLetter`, and `closeComposer` state flow.

- [ ] **Step 1: Add counts without creating derived state.**

  Directly after the two `useState` declarations, derive only primitive render values:

  ```tsx
  const scheduledCount = scheduledLetters.length;
  const openedCount = openedLetters.length;
  ```

  Do not use an effect, memo, interval, or query for these values.

- [ ] **Step 2: Turn the hero into a writing desk.**

  Retain the `MailPlus` badge, existing `h1`, body copy, and CTA handler. Insert a centered diary-rule divider between kicker and `h1`:

  ```tsx
  <div className="mt-4 flex items-center justify-center gap-3 text-[var(--color-accent)]" aria-hidden="true">
    <span className="diary-rule" />
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    <span className="diary-rule" />
  </div>
  ```

  Add a two-column `mt-7 grid max-w-md grid-cols-2 gap-3 mx-auto` statistic group before the CTA. Each stat is a non-interactive `rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--theme-card-surface)] px-4 py-3 text-left shadow-[var(--shadow-soft)]` card. Render `scheduledCount` under **“Đang niêm phong”** and `openedCount` under **“Đã đến ngày”**; number uses `font-display text-2xl text-[var(--color-brand-strong)]` and explanatory text is visible, so no duplicate aria label is required.

  Keep the CTA’s `onClick={createLetter}` and current button component. Change no copy in its label or state behavior.

- [ ] **Step 3: Clarify section transitions.**

  Keep the scheduled section conditional as `scheduledLetters.length ? (...) : null`, but make its wrapper `relative isolate overflow-hidden border-y border-[var(--color-border)] bg-[rgb(101_12_28_/_4%)] py-10 sm:py-12` and add a decorative 1px top gradient marked `aria-hidden`. The `ScheduledLetterList` call remains exactly:

  ```tsx
  <ScheduledLetterList letters={scheduledLetters} onEdit={editLetter} />
  ```

  Rename the opened archive kicker to **“Khoảnh khắc đã đến”** and its heading to **“Những lá thư đã mở.”**. Preserve the count badge, array mapping, `FutureLetterOpeningCard` props, no-letter empty state, and both CTA handlers exactly.

## Task 2: Present scheduled letters as a sealing desk

**Files:**
- Modify: `src/features/future-letters/presentation/scheduled-letter-list.tsx`

**Interfaces:**
- Consumes: existing `ScheduledLetterListProps` and current ordered `letters` input.
- Produces: `ScheduledLetterCard({ letter, variant, now, isPending, isConfirming, onEdit, onRequestDelete, onCancelDelete, onDelete })`, where `variant` is the string union `"featured" | "sealed"`.
- Preserves: the existing `useEffect` countdown interval, open-time refresh timeout, `deleteLetter`, `feedback`, `confirmingLetterId`, and `onEdit` behavior.

- [ ] **Step 1: Derive featured and sealed entries without sorting.**

  Immediately after state declarations, add:

  ```tsx
  const [featuredLetter, ...sealedLetters] = letters;
  ```

  Do not call `.sort()`, `toSorted()`, filter, or calculate a different nearest date. The first entry is featured solely because the server reader already supplied it first.

- [ ] **Step 2: Replace the flat list with featured and compact regions.**

  Keep the outer section and its feedback behavior. Change its introductory kicker to **“Bàn niêm phong”** and heading to **“Những lá thư đang hẹn.”**. When `featuredLetter` exists, render it inside an `<ol className="mt-6">` using:

  ```tsx
  <ScheduledLetterCard
    isConfirming={confirmingLetterId === featuredLetter.id}
    isPending={isPending}
    letter={featuredLetter}
    now={now}
    onCancelDelete={() => setConfirmingLetterId(null)}
    onDelete={() => deleteLetter(featuredLetter.id)}
    onEdit={onEdit}
    onRequestDelete={() => setConfirmingLetterId(featuredLetter.id)}
    variant="featured"
  />
  ```

  When `sealedLetters.length > 0`, render a visually separated `<div className="mt-7 border-t border-[var(--color-border)] pt-6">` with kicker **“Đang chờ đúng ngày”** and `<ol className="mt-4 grid gap-3 md:grid-cols-2">`. Map each sealed letter to the same component with `variant="sealed"`; all handlers must close over that letter id exactly as in the featured example.

- [ ] **Step 3: Implement `ScheduledLetterCard` outside the parent component.**

  Define the component with the exact interface produced above. Its root is `<li>`. In `"featured"` mode, use `relative overflow-hidden rounded-[var(--radius-dialog)] border border-[var(--color-border)] bg-[var(--theme-card-surface)] p-5 shadow-[var(--shadow-card)] sm:p-6`; add an `aria-hidden` circular `bg-[var(--color-brand-soft)]` wash and a wax-seal-style `Clock3` badge. Show title without `truncate`, formatted open time, `formatCountdown(letter.opensAt, now)`, and the existing edit/delete controls and confirmation UI.

  In `"sealed"` mode, retain the compact paper-card surface, but render title with `break-words` rather than `truncate`; preserve formatted open time, countdown, controls, confirmation, disabled states, copy, and feedback ownership. Use the parent state/handlers passed as props; the helper must not create state, timer, router, mutation, or effect.

  Reuse the exact `formatCountdown` function already in the file. Do not change its strings or timing calculation.

## Task 3: Refine opened letter and composer surfaces without changing behavior

**Files:**
- Modify: `src/features/future-letters/presentation/future-letter-opening-card.tsx`
- Modify: `src/features/future-letters/presentation/future-letter-composer.tsx`

**Interfaces:**
- Consumes: unchanged `FutureLetterOpeningCard({ letter })` and `FutureLetterComposer({ isOpen, letter, onClose })` props.
- Produces: the same opening phase transition and dialog/create/update callbacks.
- Preserves: every effect dependency and event handler currently present.

- [ ] **Step 1: Refine only markup/classes inside opened-paper rendering.**

  Keep `openLetter`, both effects, phase conditionals, refs, envelope DOM structure, 10 spark elements, the 720ms timer, and `aria-hidden` behavior unchanged. In `.future-letter-paper`, add a diary-rule/letterhead row above the author block and make the existing sender/date block a clear header separated by the current bottom border. Keep title/content/image conditional semantics unchanged.

  Update the music link classes to include explicit `focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-focus)] motion-reduce:transform-none motion-reduce:transition-none`, while retaining its min-height, href, `target="_blank"`, and `rel="noreferrer"` values.

- [ ] **Step 2: Reorder composer surface cues only.**

  Keep every dialog effect, input name, field, value, validation property, `submit` function, action call, pending state, and onClose behavior untouched. In the dialog form header, add a diary-rule divider below the kicker and before the `h2`; add a muted letter-writing surface (`bg-[rgb(101_12_28_/_4%)]`) behind the intro copy without changing its words.

  Retain the existing three semantic groups in order: title/content, time fieldset, optional accompaniments. Give the title/content group its own `rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--theme-card-surface)] p-4` wrapper; leave existing field names and labels intact. Keep the sticky behavior absent and do not change dialog dimensions or native modal semantics.

- [ ] **Step 3: Perform the source-only scope check requested by the user.**

  Do not execute test, lint, build, or browser commands. Read all four edited files and confirm: `FutureLettersExperience` has only its original two composer state values; `ScheduledLetterList` has the same two effects, mutation and handler semantics; `FutureLetterOpeningCard` retains every phase/timer/focus/reduced-motion line; composer submit/data fields remain unchanged; no new Supabase client, dependency, route, commit, branch, timer, or network request has been introduced.

## Handoff

Execute inline only if the user asks to proceed. The implementation diff is limited to the four listed presentation components and must not create a commit, branch, automated test, lint/build run, or browser QA run under the active user instructions.
