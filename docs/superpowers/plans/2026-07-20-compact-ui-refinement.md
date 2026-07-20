# Compact Bordeaux UI refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Do not use subagents for this repository.

**Goal:** Reduce the visual footprint of the catalogue, detail and Owner workspace by 15–20% while retaining the warm Bordeaux diary aesthetic, accessibility and existing data flows.

**Architecture:** This is a presentation-only pass. Tailwind utility adjustments in each feature component consume the existing semantic CSS tokens; `src/app/globals.css` remains the one source of truth for type scales and View Transition timing. No reader, use case, Server Action, route, schema, RLS or Supabase client contract changes.

**Tech Stack:** Next.js 16 App Router, React ViewTransition, TypeScript strict, Tailwind CSS, Lucide React.

## Global Constraints

- Keep Bordeaux tokens and their semantic meanings; do not add mock data or an animation library.
- Reduce large visual spacing and display typography by approximately 15–20%; keep body copy at least 15px and interactive targets at least 44px high.
- Preserve existing View Transition recipes and `prefers-reduced-motion` behavior; only make normal motion feel faster and less visually heavy.
- Do not change Supabase, schema, RLS, roles, routes, Server Actions, tests or business data.
- Do not commit or push changes; the user owns Git operations.
- Verify with Windows Node 24 commands: `npx.cmd tsc --noEmit` and `npm.cmd run build`. No new unit tests are requested.

## File Structure

| File | Responsibility in this change |
| --- | --- |
| `src/app/globals.css` | Compact display scale and View Transition duration tokens without changing color semantics. |
| `src/components/app-header.tsx` | Keep the persistent header compact at all breakpoints. |
| `src/app/loading.tsx` | Match loading geometry to the smaller home layout. |
| `src/features/catalogue/presentation/catalogue-home.tsx` | Reduce public hero, filter and grid section rhythm. |
| `src/features/catalogue/presentation/catalogue-item-card.tsx` | Reduce card copy spacing while preserving its image ratio and link semantics. |
| `src/features/catalogue/presentation/catalogue-pagination.tsx` | Move pagination closer to the collection without shrinking controls below 44px. |
| `src/features/catalogue/presentation/catalogue-detail.tsx` | Balance item hero and keepsake section at the compact scale. |
| `src/features/catalogue/presentation/admin-catalogue.tsx` | Reduce workspace outer rhythm, masthead and three-column gap. |
| `src/features/catalogue/presentation/admin-catalogue-sidebar.tsx` | Compact category navigation and create-category surface. |
| `src/features/catalogue/presentation/admin-item-list.tsx` | Compact managed-item list rows and pagination surface. |
| `src/features/catalogue/presentation/admin-item-editor.tsx` | Tighten editor sections, attachment panels and form grouping. |
| `src/features/catalogue/presentation/item-keepsake-editor.tsx` | Tighten public-message editor cards without reducing text field usability. |

---

### Task 1: Establish compact global visual tokens

**Files:**
- Modify: `src/app/globals.css:1-210`

**Consumes:** Existing `--duration-*` tokens and typography utility classes.

**Produces:** A smaller `display-xl`/`display-lg` scale plus shorter normal-motion timing that all pages can consume without new APIs.

- [ ] **Step 1: Reduce only display scales and movement timing in the root token block**

  Replace the large-scale and transition values with compact equivalents:

  ```css
  --duration-base: 240ms;
  --duration-exit: 130ms;
  --duration-enter: 180ms;
  --duration-move: 320ms;

  .display-xl {
    font-size: clamp(2.8rem, 9vw, 5.6rem);
    line-height: 0.96;
    letter-spacing: -0.055em;
  }

  .display-lg {
    font-size: clamp(2.15rem, 5vw, 3.7rem);
    line-height: 1;
    letter-spacing: -0.04em;
  }
  ```

  Keep color, radius, focus and `--control-height: 44px` unchanged.

- [ ] **Step 2: Confirm reduced-motion selectors remain unchanged**

  Retain the existing `@media (prefers-reduced-motion: reduce)` block exactly so compacting normal navigation never removes the reduced-motion safeguard.

- [ ] **Step 3: Inspect the stylesheet for unintended token changes**

  Run: `rtk diff -- src/app/globals.css`

  Expected: only display typography and `--duration-*` values differ; no palette or accessibility token is removed.

### Task 2: Compact public collection and its loading state

**Files:**
- Modify: `src/components/app-header.tsx:12-86`
- Modify: `src/features/catalogue/presentation/catalogue-home.tsx:41-158`
- Modify: `src/features/catalogue/presentation/catalogue-item-card.tsx:21-69`
- Modify: `src/features/catalogue/presentation/catalogue-pagination.tsx:20-85`
- Modify: `src/app/loading.tsx:7-34`

**Consumes:** Task 1 global type/motion tokens; existing `CatalogueItemPage` and navigation helpers.

**Produces:** A shorter public landing experience with unchanged filtering, pagination URLs, shared-element transitions and keyboard behavior.

- [ ] **Step 1: Make the persistent header visibly lighter, not functionally smaller than touch requirements**

  Update the header wrapper and brand to use a 72px minimum row on wider screens while retaining `min-h-10` navigation links and the `h-9 w-9` logo target. For example:

  ```tsx
  <div className="mx-auto flex min-h-[4.5rem] max-w-7xl flex-wrap items-center justify-between gap-x-5 gap-y-2 px-5 py-2.5 sm:px-8 lg:px-10">
  ```

  Reduce only decorative vertical margins (such as the brand subtitle margin); do not change links, actor data, role checks or `viewTransitionName`.

- [ ] **Step 2: Tighten the home hero, collection filter and grid section**

  In `CatalogueHome`, make these proportional class changes:

  ```tsx
  // Hero: replace gap-12 / pt-16 / pb-16 with gap-9 / pt-12 / pb-12;
  // on large screens use lg:gap-14 lg:pt-20 lg:pb-20.
  <section className="mx-auto grid max-w-7xl gap-9 px-5 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.65fr)] lg:items-end lg:gap-14 lg:px-10 lg:pb-20 lg:pt-20">
  ```

  Lower hero sub-block spacing (`mt-5`/`mt-7`) by one step, make the count `text-4xl`, reduce the count card to `p-6 sm:p-7`, and reduce the collection/grid sections from `py-6` and `py-12 sm:py-16 lg:py-20` to `py-5` and `py-10 sm:py-12 lg:py-16`. Keep the same heading hierarchy, Link URLs and transition types.

- [ ] **Step 3: Compact cards and pagination without shrinking controls**

  In `CatalogueItemCard`, replace the content wrapper with:

  ```tsx
  <div className="space-y-2.5 p-4 sm:p-5">
  ```

  Change the card title to `text-xl` and lead margin to `mt-1.5`; retain `aspect-[4/5]`, all image handling, focus styling and the link target. In `CataloguePagination`, change only the outer nav from `mt-10` to `mt-7`; leave every `min-h-11` and `h-11` control intact.

- [ ] **Step 4: Keep loading geometry visually aligned**

  In `Loading`, use `py-12 sm:py-16` for the main container, `mt-14` for the skeleton grid and `p-5` for its card copy. Keep `aria-busy`, `aria-label`, the three skeletons, image aspect ratio and `ViewTransition` unchanged.

- [ ] **Step 5: Check public routes manually after implementation**

  At `/`, verify category filtering, page links, card navigation and back navigation retain their existing URLs. At widths 320, 390, 768, 1024 and 1440px, verify no filter chip, pagination action or header link falls below a 44px target or overlaps text.

### Task 3: Compact item detail while protecting long-form reading

**Files:**
- Modify: `src/features/catalogue/presentation/catalogue-detail.tsx:34-182`

**Consumes:** Existing `CatalogueItemDetail`, `ItemKeepsake`, public page route and ViewTransition image name.

**Produces:** A denser detail page with unchanged keepsake content/order, fallback image and external links.

- [ ] **Step 1: Reduce hero rhythm and display scale**

  Update the main section and hero grid with these targets:

  ```tsx
  <section className="mx-auto max-w-7xl px-5 pb-8 pt-6 sm:px-8 sm:pb-12 lg:px-10">
  <div className="mt-6 grid gap-7 lg:grid-cols-[minmax(0,0.95fr)_minmax(20rem,0.8fr)] lg:items-start lg:gap-12">
  ```

  Use `text-4xl sm:text-5xl` for the item `h1`; reduce decorative/content margins by one Tailwind spacing step. Do not reduce the `text-base leading-8` description or change any conditional data rendering.

- [ ] **Step 2: Compact the keepsake section, not the keepsake text**

  Make its outer container `py-10 sm:py-14`, use `text-3xl sm:text-4xl` on the section `h2`, change the grid margin to `mt-7`, and make cards `p-5 sm:p-6`. Use `text-4xl` for the faint sequence and `text-2xl` for a keepsake title. Preserve the `text-[15px] leading-8` body, `whitespace-pre-line`, `keepsakeCopy` and item ordering.

- [ ] **Step 3: Tighten the no-keepsakes state**

  Reduce its vertical padding from `py-10` to `py-8`, with the existing content, icon and text retained. This prevents an empty item from looking taller than an item with real messages.

- [ ] **Step 4: Manually check long content behavior**

  Open an item with a long title, summary, description and multi-line poem. Confirm all content wraps instead of truncating, the external links remain accessible, and the 320px viewport has no horizontal scroll.

### Task 4: Make the Owner workspace more information-dense

**Files:**
- Modify: `src/features/catalogue/presentation/admin-catalogue.tsx:36-99`
- Modify: `src/features/catalogue/presentation/admin-catalogue-sidebar.tsx:96-231`
- Modify: `src/features/catalogue/presentation/admin-item-list.tsx:54-146`
- Modify: `src/features/catalogue/presentation/admin-item-editor.tsx:129-495`
- Modify: `src/features/catalogue/presentation/item-keepsake-editor.tsx:65-232`

**Consumes:** Existing client state, Server Actions, `AdminFeedback`, URL navigation builders and Owner-only page guard.

**Produces:** A compact three-column Owner workspace with the exact same mutations, selection URL behavior and form validation.

- [ ] **Step 1: Compact workspace shell and masthead**

  In `AdminCatalogue`, reduce the main wrapper to `py-8 sm:py-10 lg:py-12`, masthead to `px-5 py-6 sm:px-7 sm:py-8`, and masthead title to `text-4xl sm:text-5xl`. Reduce its top section grid margin from `mt-8` to `mt-6`, gap from `gap-6` to `gap-5`, and use `xl:grid-cols-[14rem_minmax(18rem,0.65fr)_minmax(28rem,1.15fr)]`. Keep selected-item ViewTransition keys and all props unchanged.

- [ ] **Step 2: Tighten category sidebar and item list surfaces**

  Reduce outer panel padding by one step (`p-5` to `p-4`, `sm:p-6` to `sm:p-5`), headings one text scale where appropriate, create forms to `p-3`, and list/card internal padding to `p-3`. Keep any button component size, `min-h-10`/`min-h-11`, delete confirmations and router mutation sequence unchanged.

- [ ] **Step 3: Re-space the item editor by section**

  In `AdminItemEditor`, use `p-4 sm:p-6`, a `text-3xl` editor title, `mt-6` for the main form, `mt-5 grid gap-4` for information fields, and `mt-6` for the save action. Keep input class minimum height (`min-h-11`), textarea minimum heights and every form field name exactly as they are; this task is layout-only.

  Reduce attachment section separation and panels proportionally:

  ```tsx
  <section className="mt-9 border-t border-[var(--color-border)] pt-6" aria-labelledby="attachments-heading">
  <div className="mt-5 grid gap-4 xl:grid-cols-2">
  <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[rgb(255_249_243_/_62%)] p-3">
  ```

  Preserve `createCatalogueItemImageAction`, link/image update/delete actions, confirmation state and `router.refresh()` behavior.

- [ ] **Step 4: Tighten keepsake editing without making writing cramped**

  In `ItemKeepsakeEditor`, change top separation to `mt-8 pt-6`, heading to `text-2xl`, list spacing to `space-y-3`, and each message surface to `p-4`. Keep text areas at `min-h-32 py-3 leading-7`, all reorder buttons, delete confirmation, `disabled` behavior and `onChange` contract exactly unchanged.

- [ ] **Step 5: Manually validate Owner interactions and responsive order**

  As Owner, create/select an item, edit a field, add/reorder a keepsake, add an image/link, cancel and confirm deletion, then reload. At 320/390px verify the order remains category → item list → editor and at 1024/1440px confirm columns do not overlap. Check focus visibility for every form action.

### Task 5: Validate presentation-only scope and hand off

**Files:**
- Inspect: all files above
- Inspect: `docs/superpowers/specs/2026-07-20-compact-ui-timeline-direction-design.md`

**Consumes:** Completed Tasks 1–4.

**Produces:** Evidence that the refactor is scoped to presentation and the user can run the required Windows verification commands.

- [ ] **Step 1: Inspect the final diff for scope**

  Run: `rtk diff --check`

  Expected: no whitespace errors. Confirm no file under `src/modules`, `src/lib/supabase`, migration directory or environment file changed for this task.

- [ ] **Step 2: Run static verification in the user’s Windows terminal**

  Run:

  ```bat
  npx.cmd tsc --noEmit
  npm.cmd run build
  ```

  Expected: TypeScript exits successfully and Next.js reports a successful optimized production build.

- [ ] **Step 3: Complete visual QA**

  Inspect `/`, `/catalogue/[slug]` and `/admin` at 320, 390, 768, 1024 and 1440px. Verify text wrapping, images, hover, keyboard focus, View Transitions and `prefers-reduced-motion`. Report any pre-existing verification failure separately rather than widening this presentation-only refactor.

- [ ] **Step 4: Hand off without Git operations**

  Report the compact UI changes, the two Windows commands and the future timeline direction. Do not create a commit, push or alter Supabase configuration.
