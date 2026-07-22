# Handcrafted Bordeaux Diary System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing Bordeaux Diary UI into a cohesive, tactile physical-journal system while reducing repeated styles and avoiding new client-side visual work.

**Architecture:** Keep the existing App Router, domain modules, Supabase access, and client boundaries intact. Extract the current monolithic global CSS into ordered style layers, define semantic journal surface primitives, then migrate public storytelling routes, operational routes, and system states onto those shared contracts.

**Tech Stack:** Next.js App Router, React, TypeScript strict, Tailwind CSS v4, CSS custom properties, React View Transitions, Motion/Lucide where already present.

## Global Constraints

- Preserve all existing routes, queries, Server Actions, Supabase/RLS behavior, and Google OAuth flow.
- Deep Bordeaux, ivory paper, restrained brass, and dark ink remain the material palette; seasonal themes override tokens only.
- Use CSS gradients and pseudo-elements for texture; do not add global raster textures, new WebGL, or a client component for decoration.
- Preserve the existing reduced-motion behavior and use compositor-friendly motion only.
- Keep public pages expressive, but keep admin forms, lists, focus states, and destructive actions plain and highly legible.
- Do not create a commit or a branch.
- Do not run tests, lint, type checks, builds, browser QA, or performance commands. The user explicitly declined them.

---

## File structure

| Path | Responsibility |
| --- | --- |
| `src/app/globals.css` | Tailwind entry point and ordered imports only. |
| `src/styles/diary-tokens.css` | Base and seasonal semantic material tokens. |
| `src/styles/diary-base.css` | Reset, typography, focus, body, accessibility, and reduced-motion behavior. |
| `src/styles/diary-surfaces.css` | Book, paper, print, label, seal, ledger, header, and state-surface contracts. |
| `src/styles/diary-motion.css` | Named keyframes and View Transition selectors. |
| `src/styles/diary-features.css` | Feature-specific styles that do not qualify as shared surfaces. |
| `src/components/diary/diary-book.tsx` | Reusable root wrapper for routes that live inside the physical-book environment. |
| `src/components/diary/diary-surface.tsx` | Reusable presentational surface with the limited variants `page`, `spread`, `ledger`, `note`, and `print`. |
| `src/components/diary/diary-mark.tsx` | Reusable editorial label and decorative rule markup. |
| Public and admin presentation files listed in Tasks 3–6 | Adopt surfaces without altering data or interaction ownership. |

## Shared interfaces

```tsx
// src/components/diary/diary-book.tsx
export interface DiaryBookProps {
  children: React.ReactNode;
  className?: string;
}

export function DiaryBook({ children, className }: DiaryBookProps): React.ReactElement;

// src/components/diary/diary-surface.tsx
export type DiarySurfaceKind = "page" | "spread" | "ledger" | "note" | "print";

export interface DiarySurfaceProps {
  children: React.ReactNode;
  className?: string;
  kind?: DiarySurfaceKind;
}

export function DiarySurface({ children, className, kind }: DiarySurfaceProps): React.ReactElement;

// src/components/diary/diary-mark.tsx
export interface DiaryMarkProps {
  children: React.ReactNode;
  className?: string;
}

export function DiaryMark({ children, className }: DiaryMarkProps): React.ReactElement;
```

`DiarySurface` deliberately renders a `div`. A caller retains ownership of the
semantic parent (`section`, `aside`, `article`, `li`, or `main`) and uses the
surface only for visual grouping. This avoids a polymorphic API and prevents
semantic regressions in existing presentation components.

### Task 1: Split the global style system by responsibility

**Files:**
- Create: `src/styles/diary-tokens.css`
- Create: `src/styles/diary-base.css`
- Create: `src/styles/diary-surfaces.css`
- Create: `src/styles/diary-motion.css`
- Create: `src/styles/diary-features.css`
- Modify: `src/app/globals.css`

**Consumes:** Existing semantic variables, `data-theme` values, surface classes,
future-letter animation classes, timeline classes, and View Transition names in
`src/app/globals.css`.

**Produces:** A stable ordered CSS contract that feature components can consume
without duplicating material styles or copying per-theme geometry.

- [ ] **Step 1: Create the import-only global entry point.**

  Keep Tailwind first and import local layers in this exact order so tokens are
  available to every later rule:

  ```css
  @import "tailwindcss";
  @import "../styles/diary-tokens.css";
  @import "../styles/diary-base.css";
  @import "../styles/diary-surfaces.css";
  @import "../styles/diary-motion.css";
  @import "../styles/diary-features.css";
  ```

- [ ] **Step 2: Move all token declarations without changing their values.**

  Put the existing `:root` block and every `body[data-theme="..."]` variable
  block in `diary-tokens.css`. Keep compatibility aliases until all existing
  Tailwind arbitrary-value consumers have been migrated. Do not put selectors
  such as `.theme-atmosphere` or `.timeline-rail` in this file.

- [ ] **Step 3: Move global document and accessibility rules to the base layer.**

  Move the universal box-sizing, `html`, `body`, `@media (prefers-reduced-motion:
  reduce)`, and focus-visible rules to `diary-base.css`. Preserve the global
  reduced-motion overrides for the landing scene, theme atmosphere, maintenance
  meter, and future-letter paper.

- [ ] **Step 4: Establish shared material selectors in the surface layer.**

  Move reusable existing rules such as `.diary-shell`, `.diary-wash`,
  `.diary-kicker`, `.diary-rule`, `.app-header`, and theme-frame surface rules to
  `diary-surfaces.css`. Add the following selectors, each using semantic tokens
  rather than literal seasonal colors:

  ```css
  .diary-book { min-height: 100svh; position: relative; }
  .diary-surface { position: relative; isolation: isolate; }
  .diary-surface--page { background: var(--theme-card-surface); box-shadow: var(--shadow-card), var(--theme-frame-inset); }
  .diary-surface--spread { background: var(--theme-wash); box-shadow: var(--shadow-card), var(--theme-frame-inset); }
  .diary-surface--ledger { background: var(--theme-control-surface); box-shadow: var(--shadow-soft), var(--theme-frame-inset); }
  .diary-surface--note { background: var(--color-brand-soft); box-shadow: var(--shadow-soft); }
  .diary-surface--print { background: var(--color-paper); box-shadow: var(--shadow-card); }
  ```

  Give surfaces a reusable inset rule, low-opacity grain pseudo-element, and
  edge shadow. Add no pseudo-element to controls or list rows.

- [ ] **Step 5: Move animation and route-transition rules to the motion layer.**

  Move all `@keyframes`, `::view-transition-*`, and animation-only selectors to
  `diary-motion.css`. Preserve current transition names (`fade-in`, `fade-out`,
  `slide-up`, `slide-down`, `nav-forward`, `nav-back`, `morph`, and
  `persistent-nav`) exactly.

- [ ] **Step 6: Move feature-only styles to the feature layer.**

  Keep timeline, future-letter, theme-picker, maintenance, and cinematic intro
  selectors in `diary-features.css`. Do not merge a feature-specific rule into a
  generic surface merely because both use a border or shadow.

- [ ] **Step 7: Source-review the moved selectors.**

  Read the five layer files and confirm that each original global selector exists
  once, imports precede CSS declarations, and every seasonal theme still exports
  every variable that its components read. Do not run a validation command.

### Task 2: Add minimal diary presentation primitives

**Files:**
- Create: `src/components/diary/diary-book.tsx`
- Create: `src/components/diary/diary-surface.tsx`
- Create: `src/components/diary/diary-mark.tsx`

**Consumes:** The `.diary-book`, `.diary-surface`, `.diary-surface--*`,
`.diary-kicker`, and `.diary-rule` contracts from Task 1.

**Produces:** Server-compatible visual wrappers that feature components can use
without turning presentation markup into client code.

- [ ] **Step 1: Implement `DiaryBook` with predictable class merging.**

  ```tsx
  import type { ReactNode } from "react";

  export interface DiaryBookProps {
    children: ReactNode;
    className?: string;
  }

  export function DiaryBook({ children, className }: DiaryBookProps) {
    return <div className={["diary-shell", "diary-book", className].filter(Boolean).join(" ")}>{children}</div>;
  }
  ```

- [ ] **Step 2: Implement `DiarySurface` as a bounded variant map.**

  ```tsx
  import type { ReactNode } from "react";

  export type DiarySurfaceKind = "page" | "spread" | "ledger" | "note" | "print";

  export interface DiarySurfaceProps {
    children: ReactNode;
    className?: string;
    kind?: DiarySurfaceKind;
  }

  export function DiarySurface({ children, className, kind = "page" }: DiarySurfaceProps) {
    return <div className={["diary-surface", `diary-surface--${kind}`, className].filter(Boolean).join(" ")}>{children}</div>;
  }
  ```

- [ ] **Step 3: Implement the editorial mark.**

  `DiaryMark` renders the existing kicker class and offers a `DiaryRule` sibling
  export that renders `<span className="diary-rule" aria-hidden="true" />`.
  It accepts no color, size, animation, or theme props; seasonal variation comes
  only from tokens.

- [ ] **Step 4: Source-review boundaries.**

  Confirm that all three files are Server Components, have no hooks, no browser
  globals, and no data dependencies.

### Task 3: Convert the shared shell, navigation, and system states

**Files:**
- Modify: `src/components/app-header.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/loading.tsx`
- Modify: `src/app/error.tsx`
- Modify: `src/app/access-denied/page.tsx`
- Modify: `src/app/login/page.tsx`
- Modify: `src/components/theme/theme-maintenance-screen.tsx`

**Consumes:** Task 1 surface contracts and Task 2 wrappers.

**Produces:** A persistent bookmark navigation and all non-content states that
visually belong to the same physical journal.

- [ ] **Step 1: Restyle the header as a bookmark rail.**

  Keep its current landmark, route links, `persistent-nav` View Transition name,
  actor text, and owner visibility condition. Replace the generic translucent
  panel treatment with the `.diary-header` contract: a narrow paper rail, an
  inset print line, the brand mark as a wax-seal-like circle, and a restrained
  active tab underline. Preserve all current minimum target sizes and visible
  focus behavior.

- [ ] **Step 2: Apply book and paper contracts to loading and error states.**

  Wrap each state inside `DiaryBook`; group the inner panel with `DiarySurface`
  using `ledger` for skeletons and `note` for recoverable errors. Keep existing
  `aria-busy`, error role, and reset behavior.

- [ ] **Step 3: Convert access-denied and login into stationery surfaces.**

  Keep Google OAuth props and callback error handling exactly as they are. Make
  the login split view a dark Bordeaux cover next to a paper sheet. Make access
  denied a compact centered note with the existing sign-in link, not a public
  story card.

- [ ] **Step 4: Keep maintenance status explicit.**

  Update `ThemeMaintenanceScreen` classes to use the ledger/note surface tokens
  while preserving the three-step progress wording and live status behavior.
  Decorative layers must remain `aria-hidden`.

- [ ] **Step 5: Source-review accessibility invariants.**

  Confirm landmarks, link destinations, error semantics, focus indicators,
  reduced-motion CSS coverage, and login action props remain unchanged.

### Task 4: Refactor catalogue presentation into editorial spreads

**Files:**
- Modify: `src/features/catalogue/presentation/catalogue-home.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-chapter-rail.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-featured-item-card.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-item-card.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-detail.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-detail-hero.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-keepsake-collection.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-engagement-panel.tsx`

**Consumes:** Task 2 primitives; existing catalogue read models, navigation, and
engagement actions.

**Produces:** The collection, detail, photos, and engagement areas as coherent
storytelling sheets without changing pagination, View Transition names, or client
interaction ownership.

- [ ] **Step 1: Wrap catalogue roots and high-level hero regions.**

  Replace direct `diary-shell` wrappers with `DiaryBook`. Place catalogue hero
  summaries in a `spread` surface and use `DiaryMark` for existing kicker/rule
  combinations. Preserve `#main-content`, the skip link, the cinematic intro,
  selected category, pagination, and all text/data branches.

- [ ] **Step 2: Make chapter navigation an editorial index.**

  Keep category links and their selected state. Give the rail a ruled-paper
  background and a compact index marker; do not create a horizontal animation or
  a new client component.

- [ ] **Step 3: Differentiate printed images from content cards.**

  Apply `print` only around item imagery in featured, grid, and detail cards.
  Keep the native `<img>` loading strategy from `catalogue-item-image.tsx`
  untouched. Use a small transform on the print wrapper for hover, never on
  every text/content card.

- [ ] **Step 4: Build the item detail as a two-page spread.**

  Keep the exact title, summary, metadata, description, links, and image View
  Transition. Visually group prose and metadata on an open paper surface and the
  image as a printed facing page. Do not change the sticky image's responsive
  condition or the link security attributes.

- [ ] **Step 5: Use calmer paper sections for keepsakes and engagement.**

  Update their surrounding sections to use page/note surfaces. Keep all review,
  comment, and owner moderation controls behaviorally identical; do not move
  state out of the existing client component.

- [ ] **Step 6: Source-review catalogue invariants.**

  Verify every item link, category query parameter, pagination query parameter,
  item image shared-transition name, engagement action prop, and empty state
  condition remains present.

### Task 5: Refactor timeline and future letters as bound chapters

**Files:**
- Modify: `src/features/timeline/presentation/relationship-timeline.tsx`
- Modify: `src/features/timeline/presentation/timeline-featured-chapter.tsx`
- Modify: `src/features/timeline/presentation/timeline-chapter-card.tsx`
- Modify: `src/features/timeline/presentation/timeline-response-panel.tsx`
- Modify: `src/features/future-letters/presentation/future-letters-experience.tsx`
- Modify: `src/features/future-letters/presentation/future-letter-opening-card.tsx`
- Modify: `src/features/future-letters/presentation/scheduled-letter-list.tsx`
- Modify: `src/features/future-letters/presentation/future-letter-composer.tsx`

**Consumes:** Task 1–2 surfaces; existing timeline and future-letter actions and
on-demand composer modules.

**Produces:** Physical binding for timeline chapters and an integrated paper
system for scheduled/opened letters, with no regression to author controls.

- [ ] **Step 1: Make the timeline rail read as a stitched binding.**

  Retain the existing ordered list and alternating desktop layout. Restyle only
  the `.timeline-rail`, entry marker, and card surroundings to use stitch,
  thread, and page-edge cues. Do not use a continuously animated dotted line.

- [ ] **Step 2: Apply narrative paper to timeline chapters and responses.**

  Keep response form ownership and edit/delete conditions unchanged. Featured
  content uses a `spread`; historic entries use `page`; compact reply controls
  use `ledger` styling only.

- [ ] **Step 3: Preserve the future-letter composer loading boundary.**

  Keep `loadFutureLetterComposer`, `dynamic(..., { ssr: false })`, composer
  preloading on hover/focus, and conditional rendering when open. Visual changes
  may affect the trigger and modal interior but must not make the composer eager.

- [ ] **Step 4: Integrate envelopes with the shared paper system.**

  Scheduled letters retain their sealed-envelope hierarchy. Opened letters use
  a `print` or `page` interior after the envelope animation. Preserve time copy,
  author editing, status branches, and all form controls.

- [ ] **Step 5: Source-review interaction boundaries.**

  Confirm that only existing client presentation files retain hooks and dynamic
  imports, and that no timeline/letter action signature changes.

### Task 6: Convert all admin workspaces into the restrained editor's desk

**Files:**
- Modify: `src/app/admin/page.tsx`
- Modify: `src/app/admin/hanh-trinh/page.tsx`
- Modify: `src/app/admin/khong-khi/page.tsx`
- Modify: `src/components/admin/admin-workspace-header.tsx`
- Modify: `src/components/admin/admin-workspace-switcher.tsx`
- Modify: `src/features/catalogue/presentation/admin-catalogue.tsx`
- Modify: `src/features/catalogue/presentation/admin-catalogue-sidebar.tsx`
- Modify: `src/features/catalogue/presentation/admin-item-list.tsx`
- Modify: `src/features/catalogue/presentation/admin-item-editor.tsx`
- Modify: `src/features/timeline/presentation/admin-timeline.tsx`
- Modify: `src/features/timeline/presentation/admin-timeline-list.tsx`
- Modify: `src/features/timeline/presentation/admin-timeline-editor.tsx`
- Modify: `src/features/site-theme/presentation/admin-site-theme.tsx`
- Modify: `src/features/site-theme/presentation/theme-scene-picker.tsx`
- Modify: `src/features/site-theme/presentation/theme-schedule-list.tsx`
- Modify: `src/features/site-theme/presentation/theme-schedule-form.tsx`
- Modify: `src/features/site-theme/presentation/theme-scene-transition-progress.tsx`

**Consumes:** `DiaryBook` and `ledger` surfaces. Existing management Server
Actions, navigation helpers, dynamic schedule-form boundary, and query params.

**Produces:** A visually unified but information-dense workspace without
changing authorizations or form behavior.

- [ ] **Step 1: Use `DiaryBook` in every admin route.**

  Replace only the outer shell; preserve access redirect checks, actor props,
  query parsing, backend calls, `PageTransition`, and skip-link targets.

- [ ] **Step 2: Give the workspace header and switcher ledger treatment.**

  Keep heading hierarchy, workspace routes, active `aria-current`, icons, and
  horizontal overflow behavior. Use ruled-paper and ink-style selected markers
  in place of elevated decorative cards.

- [ ] **Step 3: Normalize list, editor, and form surfaces.**

  Catalogue, timeline, and theme management should each use the same three
  surface levels: main ledger panel, flat list row, and bordered edit sheet.
  Retain native labels, error messages, selected-item behaviors, destructive
  confirmation behavior, and mobile stacking. Do not add torn edges, tape, or
  non-essential animation.

- [ ] **Step 4: Preserve conditional module loading.**

  In `admin-site-theme.tsx`, leave `loadThemeScheduleForm`, its preload path,
  and `dynamic(..., { ssr: false })` in place. Update styles and markup only
  around the currently conditional composer.

- [ ] **Step 5: Source-review owner safety.**

  Confirm all `canManageCatalogue` access decisions, `FormData` field names,
  action imports, delete controls, and route query strings are unchanged.

### Task 7: Finish the material system and perform source-only handoff review

**Files:**
- Modify: `src/styles/diary-tokens.css`
- Modify: `src/styles/diary-surfaces.css`
- Modify: `src/styles/diary-features.css`
- Modify: every file modified by Tasks 1–6 only where a repeated local material
  class remains.

**Consumes:** Completed migrations from Tasks 1–6.

**Produces:** A clean final style boundary with no duplicated global atmosphere,
no accidental client promotion, and no imported dependency changes.

- [ ] **Step 1: Remove obsolete duplicate material declarations.**

  Replace repeated literal paper backgrounds, frame shadows, and generic card
  borders only when an equivalent semantic surface exists. Keep feature layout,
  responsive grid, data-state, and control-specific rules local.

- [ ] **Step 2: Confirm theme token completeness.**

  Each supported `data-theme` must inherit or override all material tokens used
  by `DiaryBook`, `DiarySurface`, header, print, ledger, and state surfaces. Do
  not copy full component selectors into seasonal blocks.

- [ ] **Step 3: Confirm visual work has not widened the client bundle.**

  Source-review imports for the modified files: the diary primitives are server
  compatible, no new `"use client"` directive was introduced for decoration,
  and existing dynamic imports for the landing scene, letter composer, and theme
  schedule form remain deferred.

- [ ] **Step 4: Final source-only review.**

  Re-read the approved design against the diff, check for obvious invalid JSX,
  conflicting class names, duplicate selectors, or unintentional domain/data
  edits. Do not run tests, lint, type checking, build, browser QA, or performance
  tooling; report this validation boundary explicitly at handoff.
