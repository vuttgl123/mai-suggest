# Timeline Film Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let desktop readers move the Journey film strip one chapter at a time with refined side buttons while mobile readers can both swipe horizontally and scroll the page vertically.

**Architecture:** Keep `RelationshipTimeline` server-rendered and introduce one small Client Component that receives only the DOM id of the existing film viewport. That component observes scroll/resize state, finds the closest frame, and scrolls only the viewport to its adjacent frame. CSS provides the desktop-only control treatment and removes the mobile gesture restriction; data, cards and server access are unchanged.

**Tech Stack:** Next.js App Router, React Client/Server Components, TypeScript strict, Lucide React, Tailwind CSS, global CSS, existing `TimelineEntry` read model.

## Global Constraints

- Scope is limited to the Journey film strip. Do not change another page or horizontal scroll region.
- Desktop starts at `1024px` and shows left/right buttons; mobile/tablet below `1024px` hides them and retains native swipe.
- A button moves exactly one `.timeline-film-frame`, never the document or URL; it is disabled at the matching first/last edge.
- Remove only `touch-action: pan-x` from the film viewport. Preserve `overflow-x: auto`, `overscroll-behavior-x: contain`, scroll snap, native scrollbar, film frames, cards, markers, entry order, permissions and empty state.
- Keep `RelationshipTimeline` as a Server Component. The new client boundary receives only `viewportId: string`, not entries, actor or card content.
- Use native buttons, `aria-label`, `aria-controls`, passive scroll listener, `ResizeObserver`, focus styling and reduced-motion instant programmatic scrolling.
- Do not create a branch, worktree, commit, test, build, lint, browser QA, migration, RLS change, data change, carousel library, View Transition or URL state.
- Per the user's explicit instruction, source/diff inspection is the only verification. Do not claim runtime or visual verification.

---

## File structure

- Create `src/features/timeline/presentation/timeline-film-controls.tsx`: isolated client interaction component for two frame-step buttons.
- Modify `src/features/timeline/presentation/relationship-timeline.tsx`: stage wrapper, stable viewport id and conditional controls render.
- Modify `src/app/globals.css`: restore vertical mobile gesture handling and add desktop-only controls styling.
- Modify `docs/superpowers/specs/2026-07-23-timeline-film-controls-design.md`: record implementation status.
- Modify `docs/superpowers/plans/2026-07-23-timeline-film-controls.md`: record completed plan steps.

### Task 1: Create the isolated desktop film controls

**Files:**
- Create: `src/features/timeline/presentation/timeline-film-controls.tsx`

**Interfaces:**
- Consumes `TimelineFilmControlsProps` with the exact signature `{ viewportId: string }`.
- Queries the existing `.timeline-film-frame` DOM contract inside the element whose id is `viewportId`.
- Produces `TimelineFilmControls`, a Client Component that renders a `role="group"` containing two native buttons.

- [x] **Step 1: Add frame/bounds helpers before the component**

Create the file with the client directive and these imports/types/helpers:

```tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type FilmDirection = -1 | 1;

interface TimelineFilmControlsProps {
  viewportId: string;
}

interface FilmBounds {
  canGoBack: boolean;
  canGoForward: boolean;
}

const EMPTY_FILM_BOUNDS: FilmBounds = {
  canGoBack: false,
  canGoForward: false,
};

function getFilmFrames(viewport: HTMLElement) {
  return Array.from(viewport.querySelectorAll<HTMLElement>(".timeline-film-frame"));
}

function getFilmBounds(viewport: HTMLElement): FilmBounds {
  const edgeTolerance = 2;
  const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);

  return {
    canGoBack: viewport.scrollLeft > edgeTolerance,
    canGoForward: viewport.scrollLeft < maxScrollLeft - edgeTolerance,
  };
}

function getClosestFilmFrameIndex(viewport: HTMLElement, frames: HTMLElement[]) {
  const viewportLeft = viewport.getBoundingClientRect().left;

  return frames.reduce((closestIndex, frame, index) => {
    const closestDistance = Math.abs(
      frames[closestIndex].getBoundingClientRect().left - viewportLeft,
    );
    const distance = Math.abs(frame.getBoundingClientRect().left - viewportLeft);

    return distance < closestDistance ? index : closestIndex;
  }, 0);
}

function scrollToFilmFrame(viewport: HTMLElement, frame: HTMLElement) {
  const viewportLeft = viewport.getBoundingClientRect().left;
  const frameLeft = frame.getBoundingClientRect().left;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  viewport.scrollTo({
    left: frameLeft - viewportLeft + viewport.scrollLeft,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}
```

The helpers make no data request and only calculate the existing viewport's
scroll state and adjacent frame target.

- [x] **Step 2: Add observing, step navigation and accessible buttons**

Append this component to the same file:

```tsx
export function TimelineFilmControls({ viewportId }: TimelineFilmControlsProps) {
  const [bounds, setBounds] = useState<FilmBounds>(EMPTY_FILM_BOUNDS);

  const updateBounds = useCallback(() => {
    const viewport = document.getElementById(viewportId);
    const nextBounds = viewport ? getFilmBounds(viewport) : EMPTY_FILM_BOUNDS;

    setBounds((currentBounds) => (
      currentBounds.canGoBack === nextBounds.canGoBack
        && currentBounds.canGoForward === nextBounds.canGoForward
        ? currentBounds
        : nextBounds
    ));
  }, [viewportId]);

  useEffect(() => {
    const viewport = document.getElementById(viewportId);
    if (!viewport) {
      updateBounds();
      return;
    }

    let animationFrame = 0;
    const scheduleBoundsUpdate = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(updateBounds);
    };
    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(scheduleBoundsUpdate);

    resizeObserver?.observe(viewport);
    viewport.addEventListener("scroll", scheduleBoundsUpdate, { passive: true });
    scheduleBoundsUpdate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      viewport.removeEventListener("scroll", scheduleBoundsUpdate);
      resizeObserver?.disconnect();
    };
  }, [updateBounds, viewportId]);

  const move = useCallback((direction: FilmDirection) => {
    const viewport = document.getElementById(viewportId);
    if (!viewport) {
      return;
    }

    const frames = getFilmFrames(viewport);
    const nextFrame = frames[getClosestFilmFrameIndex(viewport, frames) + direction];
    if (!nextFrame) {
      updateBounds();
      return;
    }

    scrollToFilmFrame(viewport, nextFrame);
  }, [updateBounds, viewportId]);

  return (
    <div aria-label="Điều hướng cuộn phim" className="timeline-film-controls" role="group">
      <button
        aria-controls={viewportId}
        aria-label="Xem chương trước"
        className="timeline-film-control"
        disabled={!bounds.canGoBack}
        onClick={() => move(-1)}
        type="button"
      >
        <ChevronLeft aria-hidden="true" size={21} strokeWidth={1.5} />
      </button>
      <button
        aria-controls={viewportId}
        aria-label="Xem chương tiếp theo"
        className="timeline-film-control"
        disabled={!bounds.canGoForward}
        onClick={() => move(1)}
        type="button"
      >
        <ChevronRight aria-hidden="true" size={21} strokeWidth={1.5} />
      </button>
    </div>
  );
}
```

The effect has no server-only dependency. If the viewport, frames or
`ResizeObserver` are unavailable, both buttons stay disabled rather than
throwing. `scrollToFilmFrame` changes only `viewport.scrollLeft`, so it cannot
move the document vertically.

### Task 2: Attach the controls without widening the server boundary

**Files:**
- Modify: `src/features/timeline/presentation/relationship-timeline.tsx:1-86`

**Interfaces:**
- Consumes `TimelineFilmControls({ viewportId })` from Task 1.
- Produces `id="timeline-film-viewport"` on the single existing region and a
  `timeline-film-stage` parent around the viewport and controls.

- [x] **Step 1: Import the controls and declare a stable viewport id**

Add this import after `TimelineChapterCard`:

```tsx
import { TimelineFilmControls } from "@/features/timeline/presentation/timeline-film-controls";
```

Add this module constant after the imports:

```tsx
const TIMELINE_FILM_VIEWPORT_ID = "timeline-film-viewport";
```

Do not add hooks or a `"use client"` directive to `RelationshipTimeline`.

- [x] **Step 2: Wrap the current viewport and conditionally render controls**

Replace the current `timeline-film-viewport mt-8 sm:mt-10` element with this
stage, preserving the existing `<ol>`, `entries.map`, card props and marker:

```tsx
<div className="timeline-film-stage mt-8 sm:mt-10">
  <div
    aria-label="Cuộn phim các chương trong hành trình"
    className="timeline-film-viewport"
    id={TIMELINE_FILM_VIEWPORT_ID}
    role="region"
    tabIndex={0}
  >
    <ol className="timeline-filmstrip">
      {entries.map((entry, index) => (
        <li
          className="timeline-film-frame"
          id={`timeline-entry-${entry.id}`}
          key={entry.id}
        >
          <TimelineChapterCard
            actorId={actor.userId}
            canManage={actor.canManageCatalogue}
            entry={entry}
            sequence={index + 1}
          />
          <TimelineFilmMarker entry={entry} />
        </li>
      ))}
    </ol>
  </div>
  {entries.length > 1 ? <TimelineFilmControls viewportId={TIMELINE_FILM_VIEWPORT_ID} /> : null}
</div>
```

This keeps the mobile/desktop markup data-identical and avoids rendering
non-functional controls for a single frame.

### Task 3: Restore mobile vertical scrolling and style desktop controls

**Files:**
- Modify: `src/app/globals.css:630-740,1271-1275`

**Interfaces:**
- Consumes the `timeline-film-stage`, `timeline-film-controls` and
  `timeline-film-control` classes from Tasks 1–2.
- Produces desktop-only visible controls while the viewport remains natively
  horizontal on every screen size.

- [x] **Step 1: Remove the gesture restriction and add base control styles**

Delete this declaration from `.timeline-film-viewport`:

```css
touch-action: pan-x;
```

Place these styles after the viewport block:

```css
.timeline-film-stage {
  position: relative;
}

.timeline-film-controls {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: none;
  align-items: center;
  justify-content: space-between;
  padding-inline: 0.7rem;
  pointer-events: none;
}

.timeline-film-control {
  display: grid;
  width: 3rem;
  height: 3rem;
  place-items: center;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-brand-strong);
  background: rgb(255 251 246 / 92%);
  box-shadow: var(--shadow-soft);
  cursor: pointer;
  pointer-events: auto;
  transition: transform var(--duration-fast), background-color var(--duration-fast), box-shadow var(--duration-fast);
}

.timeline-film-control:hover:not(:disabled) {
  background: var(--color-paper);
  box-shadow: var(--shadow-card);
  transform: translateY(-0.1rem);
}

.timeline-film-control:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 3px;
}

.timeline-film-control:disabled {
  cursor: not-allowed;
  opacity: 0.38;
}
```

No replacement `touch-action` rule is added: native browser gesture arbitration
allows a vertical page scroll and a horizontal overflow scroll from the same
mobile region.

- [x] **Step 2: Reveal controls only on desktop and respect reduced motion**

Extend the existing `@media (min-width: 1024px)` block with:

```css
.timeline-film-controls {
  display: flex;
}
```

Add this standalone media block near other motion rules:

```css
@media (prefers-reduced-motion: reduce) {
  .timeline-film-control {
    transition: none;
  }
}
```

Do not add the controls to the `640px` or `768px` rules. They remain visually
absent and non-interactive on mobile/tablet.

### Task 4: Static review and documentation handoff

**Files:**
- Modify: `docs/superpowers/specs/2026-07-23-timeline-film-controls-design.md:3`
- Modify: `docs/superpowers/plans/2026-07-23-timeline-film-controls.md`
- Inspect: the three source files from Tasks 1–3

**Interfaces:**
- Consumes the source contracts defined by Tasks 1–3.
- Produces source-only evidence and documented verification limits.

- [x] **Step 1: Mark the approved spec as implemented**

Change its status line to:

```md
**Trạng thái:** Đã được người dùng duyệt và triển khai theo đặc tả này.
```

- [x] **Step 2: Inspect interaction and accessibility contracts**

Run:

```bash
rg -n "touch-action: pan-x|TimelineFilmControls|timeline-film-stage|timeline-film-controls|timeline-film-control|aria-controls|ResizeObserver|scrollTo\(" src/app/globals.css src/features/timeline/presentation/relationship-timeline.tsx src/features/timeline/presentation/timeline-film-controls.tsx
```

Expected: no `touch-action: pan-x`; the server component passes only the
viewport id; controls have buttons, labels and `aria-controls`; frame lookup,
resize cleanup and viewport-only `scrollTo` are present; CSS reveals controls
only in the 1024px media query.

- [x] **Step 3: Inspect the scoped semantic diff and record completion**

Run:

```bash
git diff --ignore-space-at-eol --unified=0 -- src/features/timeline/presentation/timeline-film-controls.tsx src/features/timeline/presentation/relationship-timeline.tsx src/app/globals.css docs/superpowers/specs/2026-07-23-timeline-film-controls-design.md docs/superpowers/plans/2026-07-23-timeline-film-controls.md
```

Expected: only the new isolated client control, its server attachment, targeted
CSS and related documents appear. Mark the completed boxes in this plan. Report
only static source/diff review; do not run or claim test, lint, build or browser
QA.
