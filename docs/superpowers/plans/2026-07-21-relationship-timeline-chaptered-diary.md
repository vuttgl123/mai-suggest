# Relationship Timeline Chaptered Diary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/hanh-trinh` into a chaptered relationship diary with one editorial opening chapter and a readable rail of later chapters, without changing timeline data or response behavior.

**Architecture:** Keep `RelationshipTimeline` server-safe and responsible for splitting the already ordered `entries` into `entries[0]` and `entries.slice(1)`. Two server-safe presentation components render the featured chapter and rail chapters; both pass their original data directly into the unchanged client `TimelineResponsePanel`.

**Tech Stack:** Next.js App Router, React Server Components, TypeScript strict, Tailwind CSS, Lucide React, existing timeline CSS and semantic theme tokens.

## Global Constraints

- Do not create a commit or a branch.
- Do not run automated tests, lint, build, or browser QA unless the user explicitly reverses that instruction.
- Do not change `/hanh-trinh`, its server page, `listVisibleTimeline`, Supabase/RLS/auth, Server Actions, timeline read models, dependencies, data order, or admin-facing timeline code.
- Keep `TimelineResponsePanel` untouched as the sole client mutation boundary; it must keep `entryId`, `responses`, `actorId`, and `canManage` props unchanged.
- Preserve `AppHeader`, skip link, empty state, current `CatalogueItemImage` lazy/error behavior, text wrapping, focus behavior, and reduced-motion behavior.
- Do not add ViewTransition, client state, hooks, animation/stagger JavaScript, new images, or hard-coded theme-only colors.

---

## File Structure

- Create: `src/features/timeline/presentation/timeline-featured-chapter.tsx` — server-safe, editorial rendering of the first supplied entry and its existing response panel.
- Create: `src/features/timeline/presentation/timeline-chapter-card.tsx` — server-safe, numbered rendering of each later timeline entry and its existing response panel.
- Modify: `src/features/timeline/presentation/relationship-timeline.tsx` — splits entries, renders the opening hierarchy/sections, and retains empty state.

## Task 1: Build the featured opening chapter

**Files:**
- Create: `src/features/timeline/presentation/timeline-featured-chapter.tsx`

**Interfaces:**
- Consumes: `TimelineEntry` from `@/modules/timeline/domain/timeline-models`.
- Produces: `TimelineFeaturedChapter({ entry, actorId, canManage })` where `actorId: string` and `canManage: boolean` are forwarded unchanged to the response panel.
- Depends on: existing `CatalogueItemImage` and `TimelineResponsePanel`.

- [ ] **Step 1: Define the server-safe component contract and imports.**

  Add only static imports and the following public interface. Do not add a `"use client"` directive or hooks.

  ```tsx
  import { Bookmark, Quote } from "lucide-react";
  import { CatalogueItemImage } from "@/features/catalogue/presentation/catalogue-item-image";
  import { TimelineResponsePanel } from "@/features/timeline/presentation/timeline-response-panel";
  import type { TimelineEntry } from "@/modules/timeline/domain/timeline-models";

  interface TimelineFeaturedChapterProps {
    actorId: string;
    canManage: boolean;
    entry: TimelineEntry;
  }
  ```

- [ ] **Step 2: Render the featured entry as an editorial spread.**

  Export `TimelineFeaturedChapter`. Its root is an `<article>` with `relative overflow-hidden rounded-[var(--radius-dialog)] border border-[var(--color-border)] bg-[var(--theme-card-surface)] shadow-[var(--shadow-card)]`. Add a non-interactive decorative radial wash using `bg-[var(--color-brand-soft)]` plus `opacity` and `blur-3xl`; set it `pointer-events-none` and `aria-hidden`.

  The content grid is `relative grid lg:grid-cols-[minmax(15rem,0.86fr)_minmax(0,1fr)]`. If both `entry.imageUrl` and `entry.imageAltText` exist, render:

  ```tsx
  <div className="overflow-hidden border-b border-[var(--color-border)] lg:border-b-0 lg:border-r">
    <CatalogueItemImage alt={entry.imageAltText} src={entry.imageUrl} />
  </div>
  ```

  If no image is available, omit the image column and make the content grid span full width with `lg:col-span-2`; do not invent an image placeholder beyond the component’s existing behavior.

  In the text column, add a `Bookmark` badge with **“Chương đang mở”**, `entry.dateLabel`, optional `<time dateTime={entry.occurredOn}>` using `formatTimelineDate`, and `<h3>` for `entry.title`. Render story as `whitespace-pre-line text-[15px] leading-8`. Render lesson only when present as a border-left `blockquote` containing `Quote`; its border/background must use existing semantic tokens. End with:

  ```tsx
  <TimelineResponsePanel
    actorId={actorId}
    canManage={canManage}
    entryId={entry.id}
    responses={entry.responses}
  />
  ```

  Define `formatTimelineDate(value: string)` in this file using the existing `vi-VN` formatter with `day: "2-digit"`, `month: "long"`, and `year: "numeric"`, constructing the date as ``new Date(`${value}T00:00:00`)``.

## Task 2: Build numbered chapter cards for the rail

**Files:**
- Create: `src/features/timeline/presentation/timeline-chapter-card.tsx`

**Interfaces:**
- Consumes: `TimelineEntry` and the actor primitives from Task 1.
- Produces: `TimelineChapterCard({ entry, sequence, actorId, canManage })`, where `sequence: number` is visual-only and does not alter the data order.
- Preserves: every `TimelineResponsePanel` prop and its mutation behavior.

- [ ] **Step 1: Define the card contract and static imports.**

  Import `Quote`, `CatalogueItemImage`, `TimelineResponsePanel`, and `TimelineEntry`; define:

  ```tsx
  interface TimelineChapterCardProps {
    actorId: string;
    canManage: boolean;
    entry: TimelineEntry;
    sequence: number;
  }
  ```

  Keep this component server-safe. Include the same local `formatTimelineDate` implementation as Task 1; it is intentionally local so this small presentation component has no additional shared utility dependency.

- [ ] **Step 2: Implement the self-contained paper card.**

  Export `TimelineChapterCard` as an `<article className="timeline-entry-card relative overflow-hidden">`. Add an `aria-hidden` top rule with `bg-gradient-to-r from-transparent via-[var(--color-accent)]/65 to-transparent` and a low-contrast absolute sequence marker `String(sequence).padStart(2, "0")`.

  Render dateLabel/optional time in the existing flex metadata row, then render `entry.title` in an `<h3>` and `entry.story` as whitespace-preserving body copy. Retain the conditional image block below the title:

  ```tsx
  {entry.imageUrl && entry.imageAltText ? (
    <div className="mt-5 overflow-hidden rounded-[calc(var(--radius-card)_-_0.35rem)] border border-[var(--color-border)]">
      <CatalogueItemImage alt={entry.imageAltText} src={entry.imageUrl} />
    </div>
  ) : null}
  ```

  Retain lesson as a conditional `blockquote` with `Quote`, then render `TimelineResponsePanel` using the exact four props from Task 1. Do not add hover lift, click handlers, transition effects, truncation, or controls to the article.

## Task 3: Compose the chaptered page without changing data flow

**Files:**
- Modify: `src/features/timeline/presentation/relationship-timeline.tsx`

**Interfaces:**
- Consumes: the unchanged `RelationshipTimelineProps` with `actor: ActiveActor` and ordered `entries: TimelineEntry[]`.
- Produces: `TimelineFeaturedChapter` for the first entry and `TimelineChapterCard` for each remaining entry.
- Preserves: the existing skip link, `AppHeader`, empty state, owner CTA, and `id="timeline-entry-${entry.id}"` anchors.

- [ ] **Step 1: Replace inlined card dependencies with presentation components.**

  Remove imports now owned by the new components: `Quote`, `CatalogueItemImage`, and `TimelineResponsePanel`. Keep `BookHeart`, `Heart`, and `Sparkles`; add:

  ```tsx
  import { TimelineChapterCard } from "@/features/timeline/presentation/timeline-chapter-card";
  import { TimelineFeaturedChapter } from "@/features/timeline/presentation/timeline-featured-chapter";
  ```

  Directly after the function arguments, split the already ordered array without sorting or mutating it:

  ```tsx
  const [featuredEntry, ...chapterEntries] = entries;
  ```

- [ ] **Step 2: Refine the intro into a book preface.**

  Keep the existing `h1`, icon, kicker, and body copy. Inside the hero section, insert the following decorative divider between the kicker and the `h1`:

  ```tsx
  <div className="mt-4 flex items-center justify-center gap-3 text-[var(--color-accent)]" aria-hidden="true">
    <span className="diary-rule" />
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    <span className="diary-rule" />
  </div>
  ```

  Adjust hero spacing to `pb-11 pt-11 sm:pb-15 sm:pt-17`, then change the `h1` margin from `mt-4` to `mt-5`; do not change copy or heading level.

- [ ] **Step 3: Replace the nonempty branch with featured and rail sections.**

  Replace the current `entries.length` branch with `featuredEntry ? (...) : (...)`. The nonempty branch starts with a `border-t` section whose content is `mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10`. Render an `h2` with id `timeline-heading`, kicker **“Một chương đang mở”**, title **“Điều mình đang cùng viết”**, then:

  ```tsx
  <TimelineFeaturedChapter
    actorId={actor.userId}
    canManage={actor.canManageCatalogue}
    entry={featuredEntry}
  />
  ```

  When `chapterEntries.length > 0`, follow it with a second bordered section containing a centered heading whose kicker is **“Lật lại những trang trước”** and h2 is **“Những chương đã viết”**. Its rail remains:

  ```tsx
  <ol className="timeline-rail">
    {chapterEntries.map((entry, index) => (
      <li
        className={`timeline-entry ${index % 2 ? "timeline-entry--right" : ""}`}
        id={`timeline-entry-${entry.id}`}
        key={entry.id}
      >
        <TimelineChapterCard
          actorId={actor.userId}
          canManage={actor.canManageCatalogue}
          entry={entry}
          sequence={index + 2}
        />
      </li>
    ))}
  </ol>
  ```

  Leave the no-entry branch exactly functionally equivalent, including its Owner-only `/admin/hanh-trinh` CTA. Remove the old local `formatTimelineDate` because both new presentation components own their local formatter.

- [ ] **Step 4: Perform the source-only scope check requested by the user.**

  Do not execute test, lint, build, or browser commands. Read the edited files and confirm: the server page is untouched; `relationship-timeline.tsx` still has no client directive or data mutation; all response panel props remain exact; optional image/time/lesson fields stay conditional; headings progress `h1 → h2 → h3`; and no changed file adds Supabase client, dependency, branch, or commit command.

## Handoff

Execute inline only if the user asks to proceed. The expected implementation diff is limited to the two new timeline presentation components and `relationship-timeline.tsx`; no commit, branch, automated test, lint, build, or browser QA is permitted under the active user instructions.
