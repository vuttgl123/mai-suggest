# Catalogue Detail Editorial Diary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `/catalogue/[slug]` into an editorial diary detail page where the image and story lead the reading flow while all existing engagement behavior remains unchanged.

**Architecture:** Keep `src/app/catalogue/[slug]/page.tsx` as the existing server data boundary. Split the purely presentational hero and keepsake section from `CatalogueDetail`; the existing `CatalogueEngagementPanel` remains the sole client component and continues to receive the same serialized props.

**Tech Stack:** Next.js App Router, React View Transition, TypeScript strict, Tailwind CSS, Lucide React, existing semantic theme tokens.

## Global Constraints

- Do not create a commit or a branch.
- Do not run automated tests, lint, build, or browser QA for this refactor unless the user explicitly reverses that instruction.
- Do not change route structure, Supabase queries, Server Actions, schema, migration, RLS, auth, mock data, dependencies, or server/client ownership.
- Preserve the existing shared-image View Transition name `item-image-${item.id}`, navigation transition types, skip link, external-link safety, focus visibility, 44px interactive targets, and reduced-motion behavior.
- Use only existing `--color-*`, `--theme-*`, radius, shadow, and duration tokens. Do not add hard-coded theme-specific palette values or client state for visual effects.

---

## File Structure

- Create: `src/features/catalogue/presentation/catalogue-detail-hero.tsx` — renders the back link, shared-image hero, editorial title/summary, metadata, story copy, and external-link chips.
- Create: `src/features/catalogue/presentation/catalogue-keepsake-collection.tsx` — renders the keepsake section, empty state, and numbered keepsake cards from parsed domain data.
- Modify: `src/features/catalogue/presentation/catalogue-detail.tsx` — remains the page-level presentational composition, parses metadata once, and passes unchanged engagement props to the existing client panel.

## Task 1: Extract the editorial hero

**Files:**
- Create: `src/features/catalogue/presentation/catalogue-detail-hero.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-detail.tsx`

**Interfaces:**
- Consumes: `CatalogueItemDetail` from `@/modules/catalogue/domain/catalogue-read-models`.
- Produces: `CatalogueDetailHero({ categoryName, item })`, where `categoryName: string | null` and `item: CatalogueItemDetail`.
- Preserves: the exact `ViewTransition` name ``item-image-${item.id}`` and `share="morph"` used by collection cards.

- [ ] **Step 1: Create the server-safe hero component with its data contract.**

  Add the imports below; this file must not contain `"use client"`, hooks, a Supabase client, or mutation code.

  ```tsx
  import Link from "next/link";
  import { ViewTransition } from "react";
  import {
    ArrowLeft,
    ExternalLink,
    Heart,
    MapPin,
    Quote,
  } from "lucide-react";
  import { CatalogueItemImage } from "@/features/catalogue/presentation/catalogue-item-image";
  import type { CatalogueItemDetail } from "@/modules/catalogue/domain/catalogue-read-models";

  interface CatalogueDetailHeroProps {
    categoryName: string | null;
    item: CatalogueItemDetail;
  }
  ```

- [ ] **Step 2: Implement the complete hero markup as an editorial spread.**

  Return one `<section>` with `mx-auto max-w-7xl px-5 pb-10 pt-6 sm:px-8 sm:pb-14 lg:px-10`. Keep the current back link at its top with `href="/"`, `transitionTypes={["nav-back"]}`, `min-h-11`, visible focus styles, `ArrowLeft`, and the text **“Trở lại bộ sưu tập”**.

  Beneath it, render a grid with `mt-5 gap-7 lg:mt-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.72fr)] lg:items-center lg:gap-14`. Its image column must use `overflow-hidden rounded-[var(--radius-dialog)] border border-[var(--color-border)] bg-[var(--color-paper)] shadow-[var(--shadow-card)]`. Render the existing image exactly through:

  ```tsx
  {item.primaryImage ? (
    <ViewTransition
      default="none"
      name={`item-image-${item.id}`}
      share="morph"
    >
      <CatalogueItemImage
        alt={item.primaryImage.altText ?? item.title}
        src={item.primaryImage.url}
      />
    </ViewTransition>
  ) : (
    <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-[linear-gradient(145deg,_var(--color-brand-soft),_var(--color-paper)_65%,_rgb(166_91_69_/_18%))]">
      <span className="absolute h-48 w-48 rounded-full border border-[var(--color-border)]" aria-hidden="true" />
      <Heart
        className="relative text-[var(--color-brand)]"
        fill="currentColor"
        size={34}
        strokeWidth={1.1}
        aria-hidden="true"
      />
    </div>
  )}
  ```

  Make the text column `py-1 lg:py-8`. Render the category fallback **“Một điều được lưu lại”**, then title, optional summary, and optional metadata. Use this stable hierarchy:

  ```tsx
  <p className="diary-kicker">{categoryName ?? "Một điều được lưu lại"}</p>
  <h1 className="font-display mt-4 text-balance text-4xl font-semibold tracking-[-0.06em] text-[var(--color-brand-strong)] sm:text-5xl xl:text-6xl">
    {item.title}
  </h1>
  {item.summary ? (
    <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--color-muted)]">
      {item.summary}
    </p>
  ) : null}
  ```

  Put optional `priceLabel` and `address` in a `mt-6 flex flex-wrap gap-x-5 gap-y-2 border-y border-[var(--color-border)] py-4 text-sm font-semibold text-[var(--color-brand)]` group; address uses `MapPin` at size 16 and `aria-hidden`. If `description` exists, introduce it with a `diary-rule`, a `Quote` icon marked `aria-hidden`, the kicker **“Câu chuyện”**, and a `whitespace-pre-line` paragraph at `mt-3 text-base leading-8 text-[var(--color-ink)]`.

  Finally, map `item.links` only when nonempty into `target="_blank" rel="noreferrer"` chips. Every chip has `min-h-11`, border/background tokens, a `motion-reduce:transition-none` class, its `link.title`, and `ExternalLink` at size 15 with `aria-hidden`.

- [ ] **Step 3: Replace the inlined detail hero with the new component.**

  In `catalogue-detail.tsx`, remove imports used only by the old hero (`Link`, `ViewTransition`, `ArrowLeft`, `ExternalLink`, `Heart`, `MapPin`) and add:

  ```tsx
  import { CatalogueDetailHero } from "@/features/catalogue/presentation/catalogue-detail-hero";
  ```

  Replace the first `<section>` inside `<main>` with:

  ```tsx
  <CatalogueDetailHero categoryName={categoryName} item={item} />
  ```

  Keep the existing outer `diary-shell`, skip link, `AppHeader`, `<main id="item-content" tabIndex={-1}>`, and `readItemKeepsakes(item.metadata)` unchanged.

## Task 2: Extract keepsakes as a paper-memento collection

**Files:**
- Create: `src/features/catalogue/presentation/catalogue-keepsake-collection.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-detail.tsx`

**Interfaces:**
- Consumes: `ItemKeepsake[]` from `@/modules/catalogue/domain/item-keepsakes`.
- Produces: `CatalogueKeepsakeCollection({ keepsakes })`, where `keepsakes: ItemKeepsake[]`.
- Preserves: the existing labels `Lời nhắn`, `Một bài thơ`, and `Kỷ niệm`; no domain mapping or metadata parsing moves into the component.

- [ ] **Step 1: Create the keepsake section and empty state.**

  Add a server-safe component importing `BookHeart`, `Quote`, and `Sparkles` from `lucide-react` plus `ItemKeepsake`. Its public contract is:

  ```tsx
  interface CatalogueKeepsakeCollectionProps {
    keepsakes: ItemKeepsake[];
  }
  ```

  Return `<section className="relative isolate overflow-hidden border-y border-[var(--color-border)] bg-[rgb(255_249_243_/_72%)]">`. Add two decorative, `aria-hidden` spans inside it: a large circular `bg-[var(--color-brand-soft)]/60 blur-3xl` wash near the upper right and a smaller `bg-[var(--color-accent)]/10 blur-3xl` wash near the lower left. They must be `pointer-events-none absolute` and remain below the section content.

  Render the content in `relative mx-auto max-w-5xl px-5 py-11 sm:px-8 sm:py-15 lg:px-10`. Keep the centered `BookHeart` badge and exact heading text **“Những điều muốn nói”**. When `keepsakes.length === 0`, render the existing **“Chỗ này đang chờ một điều thật riêng.”** title and explanatory text in a `diary-wash` card with `rounded-[var(--radius-card)]`, token border, and `shadow-[var(--shadow-soft)]`.

- [ ] **Step 2: Render the numbered keepsake grid and card.**

  When keepsakes are present, render:

  ```tsx
  <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-5">
    {keepsakes.map((keepsake, index) => (
      <KeepsakeCard
        keepsake={keepsake}
        key={keepsake.id}
        sequence={index + 1}
      />
    ))}
  </div>
  ```

  Define `KeepsakeCard` in the same file. It receives `{ keepsake: ItemKeepsake; sequence: number }`, derives its label through `keepsakeCopy`, and returns an `<article>` with `relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-paper)] p-5 shadow-[var(--shadow-soft)] sm:p-6`. Add a 1px top diary rule as decoration, then retain the low-contrast padded two-digit sequence in the upper right, the `Quote` + `diary-kicker` row, optional title at `max-w-[82%]`, and a `whitespace-pre-line` body. Do not make cards clickable, add hover lift, or add JavaScript stagger/animation.

  Implement the label function exactly as follows so `ItemKeepsake["kind"]` remains exhaustive:

  ```tsx
  function keepsakeCopy(kind: ItemKeepsake["kind"]): { label: string } {
    const labels = {
      message: { label: "Lời nhắn" },
      poem: { label: "Một bài thơ" },
      memory: { label: "Kỷ niệm" },
    } as const;

    return labels[kind];
  }
  ```

- [ ] **Step 3: Compose the extracted collection from `CatalogueDetail`.**

  In `catalogue-detail.tsx`, remove `BookHeart`, `Quote`, `Sparkles`, `ItemKeepsake`, `KeepsakeCard`, and `keepsakeCopy`. Add:

  ```tsx
  import { CatalogueKeepsakeCollection } from "@/features/catalogue/presentation/catalogue-keepsake-collection";
  ```

  Replace the complete existing “Những điều muốn nói” `<section>` with:

  ```tsx
  <CatalogueKeepsakeCollection keepsakes={keepsakes} />
  ```

## Task 3: Finish the reading flow around existing engagement

**Files:**
- Modify: `src/features/catalogue/presentation/catalogue-detail.tsx`

**Interfaces:**
- Consumes: unchanged `ActiveActor`, `CatalogueItemDetail`, and `ItemEngagementView` props on `CatalogueDetail`.
- Produces: the existing `CatalogueEngagementPanel` call with exactly `actorId={actor.userId}`, `canManage={actor.canManageCatalogue}`, `engagement={engagement}`, and `itemId={item.id}`.
- Preserves: all engagement mutation, refresh, accessibility, and permission behavior inside `catalogue-engagement-panel.tsx`.

- [ ] **Step 1: Restyle only the outer engagement section as the story closing.**

  Keep `CatalogueEngagementPanel` untouched. Replace its parent section with this structural wrapper:

  ```tsx
  <section className="relative isolate overflow-hidden border-b border-[var(--color-border)] bg-[rgb(255_252_248_/_62%)]">
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/45 to-transparent"
    />
    <div className="relative mx-auto max-w-5xl px-5 py-11 sm:px-8 sm:py-15 lg:px-10">
      <CatalogueEngagementPanel
        actorId={actor.userId}
        canManage={actor.canManageCatalogue}
        engagement={engagement}
        itemId={item.id}
      />
    </div>
  </section>
  ```

  This creates a quiet closing boundary without modifying any client component, copy, server action, or engagement data.

- [ ] **Step 2: Perform a source-only scope check without executing verification commands.**

  Review the edited imports and rendered tree manually. Confirm `catalogue-detail.tsx` contains only page composition plus metadata parsing; both new components are server-safe; `CatalogueEngagementPanel` still has its four original props; every optional item field remains conditionally rendered; and no touched file adds a dependency, data fetch, client directive, commit, branch, or test command.

## Handoff

Implementation must follow the user’s active constraints: no commit, branch, test, lint, build, or browser QA. The expected code diff is limited to the two new presentation components and `catalogue-detail.tsx`.
