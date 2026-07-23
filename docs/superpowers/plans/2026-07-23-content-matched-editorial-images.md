# Content-Matched Editorial Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the image column of the approved two-column editorial cards match its neighbouring content height without changing portrait image contexts.

**Architecture:** Extend the existing URL-image component with an explicit layout variant instead of changing its default aspect ratio globally. The default stays portrait; `content-fill` exposes a minimum-height, full-height frame that grid parents can stretch. Only TimelineFeaturedChapter and CatalogueFeaturedItemCard opt into it at their existing desktop grid breakpoints.

**Tech Stack:** Next.js App Router, React, TypeScript strict, Tailwind CSS, Lucide React, native image loading.

## Global Constraints

- Do not create a branch, worktree, commit, migration, RLS change, data change, or Supabase client query.
- Preserve the `portrait` 4:5 default, URL-image loading state, error fallback, alt text, lazy loading and `object-cover` behavior.
- Do not edit global CSS or alter TimelineChapterCard, list cards, detail hero, future letters, keepsakes, image URLs, or View Transition behavior.
- Apply `content-fill` only to TimelineFeaturedChapter at `lg` and CatalogueFeaturedItemCard at `md`; their existing grids must explicitly stretch items.
- Per the user's explicit instruction, do not write/run tests, lint, build, or browser QA. Inspect source and scoped diff only; do not claim runtime verification.

---

## File structure

- Modify `src/features/catalogue/presentation/catalogue-item-image.tsx`: define the contextual image-frame variant while keeping the default output unchanged.
- Modify `src/features/timeline/presentation/timeline-featured-chapter.tsx`: opt the featured journey image into the stretch variant in its existing large-screen grid.
- Modify `src/features/catalogue/presentation/catalogue-featured-item-card.tsx`: opt the featured catalogue image into the stretch variant in its existing medium-screen grid.

### Task 1: Add a non-breaking content-fill image frame

**Files:**
- Modify: `src/features/catalogue/presentation/catalogue-item-image.tsx`

**Interfaces:**
- Changes props to `{ src: string; alt: string; variant?: "portrait" | "content-fill" }`.
- Produces a `portrait` default equal to the existing `aspect-[4/5]` output.
- Produces `content-fill` with `h-full min-h-64` on both loading and fallback frames.

- [x] **Step 1: Declare the variant and derive frame classes once**

```tsx
type CatalogueItemImageVariant = "portrait" | "content-fill";

interface CatalogueItemImageProps {
  src: string;
  alt: string;
  variant?: CatalogueItemImageVariant;
}

export function CatalogueItemImage({
  src,
  alt,
  variant = "portrait",
}: CatalogueItemImageProps) {
  const frameClassName =
    variant === "content-fill"
      ? "relative h-full min-h-64 overflow-hidden bg-[var(--color-skeleton)]"
      : "relative aspect-[4/5] overflow-hidden bg-[var(--color-skeleton)]";
  const fallbackClassName =
    variant === "content-fill"
      ? "flex h-full min-h-64 flex-col items-center justify-center gap-2 bg-[var(--color-skeleton)] px-4 text-center text-[var(--color-muted)]"
      : "flex aspect-[4/5] flex-col items-center justify-center gap-2 bg-[var(--color-skeleton)] px-4 text-center text-[var(--color-muted)]";
```

Use `fallbackClassName` on the existing failed-image `<div>` and
`frameClassName` on the existing loading/image `<div>`. Leave the `<img>` class,
intrinsic dimensions, events, error message and skeleton unchanged.

- [x] **Step 2: Static inspect default preservation**

Run: `rtk read src/features/catalogue/presentation/catalogue-item-image.tsx`

Expected: omitting `variant` still produces `aspect-[4/5]`; only
`content-fill` uses `h-full min-h-64`.

### Task 2: Opt in only the approved editorial grids

**Files:**
- Modify: `src/features/timeline/presentation/timeline-featured-chapter.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-featured-item-card.tsx`

**Interfaces:**
- Consumes `CatalogueItemImage` from Task 1 with `variant="content-fill"`.
- Keeps both card props, data reads, View Transition name, fallback imagery and
copy unchanged.

- [x] **Step 1: Stretch the featured Timeline grid image**

Change the image grid class and image call to:

```tsx
hasImage
  ? "grid lg:grid-cols-[minmax(15rem,0.86fr)_minmax(0,1fr)] lg:items-stretch"
  : ""

<div className="overflow-hidden border-b border-[var(--color-border)] lg:border-b-0 lg:border-r">
  <CatalogueItemImage
    alt={entry.imageAltText}
    src={entry.imageUrl}
    variant="content-fill"
  />
</div>
```

The existing `entry.imageUrl && entry.imageAltText` guard preserves non-null
TypeScript narrowing. The content column continues to determine the row height
on `lg`; the child frame fills that stretched grid area.

- [x] **Step 2: Stretch the featured Catalogue grid image**

Change the outer card grid and image call to:

```tsx
className="group grid overflow-hidden rounded-[var(--radius-dialog)] border border-[var(--color-border)] bg-[var(--theme-card-surface)] shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--color-accent)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-focus)] md:grid-cols-[minmax(13rem,0.8fr)_minmax(0,1fr)] md:items-stretch"

<CatalogueItemImage
  alt={image.altText ?? item.title}
  src={image.url}
  variant="content-fill"
/>
```

Keep the `ViewTransition` wrapper and badge exactly where they are. The grid
stays a vertical composition below `md`; `min-h-64` provides the mobile image
height until the grid has a stretched row.

- [x] **Step 3: Static inspect opt-in scope**

Run: `rg -n "content-fill|items-stretch" src/features/timeline/presentation/timeline-featured-chapter.tsx src/features/catalogue/presentation/catalogue-featured-item-card.tsx && rg -n "<CatalogueItemImage" src --glob '*.tsx'`

Expected: exactly two `content-fill` call sites; the other four current image
call sites omit `variant` and continue to use the default portrait layout.

### Task 3: Scope review and source-only handoff

**Files:**
- Modify: `docs/superpowers/specs/2026-07-23-content-matched-editorial-images-design.md` (status)
- Modify: `docs/superpowers/plans/2026-07-23-content-matched-editorial-images.md` (mark completed boxes)
- Inspect: the three source files in Tasks 1–2

**Interfaces:**
- Consumes the `portrait`/`content-fill` variant contract and two opt-in sites.
- Produces a scoped inspection record without a runtime claim.

- [x] **Step 1: Check the design against source**

Confirm default portrait frames remain at 4:5, `content-fill` keeps `object-cover`
and minimum height, two and only two approved grids use the new variant, and no
global CSS/data/auth/URL-image path changed.

- [x] **Step 2: Inspect the semantic diff**

Run: `git diff --ignore-space-at-eol --unified=0 -- src/features/catalogue/presentation/catalogue-item-image.tsx src/features/timeline/presentation/timeline-featured-chapter.tsx src/features/catalogue/presentation/catalogue-featured-item-card.tsx docs/superpowers/specs/2026-07-23-content-matched-editorial-images-design.md docs/superpowers/plans/2026-07-23-content-matched-editorial-images.md`

Expected: only the explicit image variant, the two editorial opt-ins, and their
documentation appear. Do not use `git diff --check` because this workspace has
pre-existing line-ending noise.

- [x] **Step 3: State the verification boundary**

Report static source/diff inspection only. State that tests, lint, build and
browser QA were intentionally not run by user request; do not claim visual or
runtime verification.
