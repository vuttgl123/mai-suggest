# Timeline Filmstrip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present the previously written relationship chapters as a native, horizontally swipeable Bordeaux film strip with a labelled milestone under every frame.

**Architecture:** RelationshipTimeline keeps its current server data and featured opening chapter, but replaces only the old vertical rail markup with an accessible horizontal scroll viewport. Each film frame remains a TimelineChapterCard plus a local marker rendered from the same TimelineEntry. CSS establishes the snap strip, aligned flex frames, understated film perforations and individual bottom milestones without a client carousel.

**Tech Stack:** Next.js App Router, React Server Components, TypeScript strict, Tailwind CSS, global CSS, existing TimelineEntry read model.

## Global Constraints

- Do not create a branch, worktree, commit, test, build, lint, browser QA, migration, RLS change, data change, new client component, carousel dependency, View Transition, or URL state.
- Preserve the featured opening chapter, TimelineChapterCard content, entry order, entry IDs, image URLs, response panel, actor permissions, header, and empty state.
- Only old `chapterEntries` may become film frames. The film strip must use native `overflow-x: auto`, scroll-snap, touch pan, contained overscroll, a visible native scrollbar and no auto-scroll/smooth-scroll behavior.
- Every frame must render a lower marker using `entry.dateLabel` and `entry.title`; markers align at the bottom of the grid row despite unequal card content length.
- Keep the Bordeaux Diary aesthetic: paper surfaces, restrained Bordeaux/copper rail and decorative perforations; do not introduce a dark cinema theme, neon, or animation.
- Per the user's explicit instruction, source/diff inspection is the only verification. Do not claim runtime or visual verification.

---

## File structure

- Modify `src/features/timeline/presentation/relationship-timeline.tsx`: replace the vertical old-chapter rail with the semantic viewport, film frame and local marker component.
- Modify `src/app/globals.css`: replace the unused vertical timeline rail selectors with horizontal film-strip and marker styles, including responsive width rules.

### Task 1: Render film frames and semantic milestones

**Files:**
- Modify: `src/features/timeline/presentation/relationship-timeline.tsx`

**Interfaces:**
- Consumes the existing `TimelineEntry` and `TimelineChapterCard` props unchanged.
- Produces local `TimelineFilmMarker({ entry }: { entry: TimelineEntry })`.
- Leaves `TimelineFeaturedChapter` and its `featuredEntry` destructuring unchanged.

- [x] **Step 1: Replace only the old vertical `<ol>`**

Replace the `chapterEntries.length` section body after its heading with this
structure, preserving the existing `chapterEntries.map` order and card props:

```tsx
<section
  className="border-b border-[var(--color-border)] bg-[rgb(255_252_248_/_62%)] py-11 sm:py-15"
  aria-labelledby="past-timeline-heading"
>
  <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
    <div className="mx-auto max-w-2xl text-center">
      <p className="diary-kicker">Lật lại những trang trước</p>
      <h2
        className="font-display mt-2 text-balance text-3xl font-semibold tracking-[-0.05em] text-[var(--color-brand-strong)] sm:text-4xl"
        id="past-timeline-heading"
      >
        Những chương đã viết
      </h2>
    </div>
    <div
      aria-label="Cuộn phim các chương đã viết"
      className="timeline-film-viewport mt-8 sm:mt-10"
      tabIndex={0}
    >
      <ol className="timeline-filmstrip">
        {chapterEntries.map((entry, index) => (
          <li className="timeline-film-frame" id={`timeline-entry-${entry.id}`} key={entry.id}>
            <TimelineChapterCard
              actorId={actor.userId}
              canManage={actor.canManageCatalogue}
              entry={entry}
              sequence={index + 2}
            />
            <TimelineFilmMarker entry={entry} />
          </li>
        ))}
      </ol>
    </div>
  </div>
</section>
```

Do not retain `timeline-rail`, `timeline-entry`, or `timeline-entry--right`
classes in JSX.

- [x] **Step 2: Add the date-and-title marker in the same module**

Add after `RelationshipTimeline`:

```tsx
function TimelineFilmMarker({ entry }: { entry: TimelineEntry }) {
  const dateLabel = entry.occurredOn ? (
    <time className="timeline-film-marker-date" dateTime={entry.occurredOn}>
      {entry.dateLabel}
    </time>
  ) : (
    <p className="timeline-film-marker-date">{entry.dateLabel}</p>
  );

  return (
    <div className="timeline-film-marker">
      <span className="timeline-film-marker-dot" aria-hidden="true" />
      {dateLabel}
      <p className="timeline-film-marker-title">{entry.title}</p>
    </div>
  );
}
```

This preserves semantic dates when available, puts both required values below
the frame, and does not change the title heading inside TimelineChapterCard.

- [x] **Step 3: Static inspect the server-only structure**

Run: `rtk read src/features/timeline/presentation/relationship-timeline.tsx`

Expected: the featured chapter is still rendered before the old chapters; each
old entry has one `li`, card, marker, date label and title; no client hook,
database call, or changed TimelineChapterCard prop exists.

### Task 2: Replace the vertical rail CSS with the native film strip

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes `.timeline-film-viewport`, `.timeline-filmstrip`,
  `.timeline-film-frame`, `.timeline-film-marker`,
  `.timeline-film-marker-dot`, `.timeline-film-marker-date`, and
  `.timeline-film-marker-title` from Task 1.
- Produces a one-row horizontal grid with equal-height frame columns and aligned
  lower markers.

- [x] **Step 1: Replace the existing vertical timeline rail block**

Remove the base selectors `.timeline-rail`, `.timeline-rail::before`,
`.timeline-entry`, `.timeline-entry::before`, and the old standalone
`.timeline-entry-card` block. Add the following base styles in their place:

```css
.timeline-film-viewport {
  margin-inline: -1.25rem;
  padding-inline: 1.25rem;
  padding-bottom: 0.65rem;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-color: var(--color-accent) transparent;
  touch-action: pan-x;
}

.timeline-filmstrip {
  display: grid;
  grid-auto-columns: 86vw;
  grid-auto-flow: column;
  grid-template-rows: minmax(0, 1fr);
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
  scroll-snap-type: x mandatory;
}

.timeline-film-frame {
  position: relative;
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding-block: 0.45rem;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  content-visibility: auto;
  contain-intrinsic-size: auto 34rem;
}

.timeline-film-frame::before,
.timeline-film-frame::after {
  position: absolute;
  right: 0.8rem;
  left: 0.8rem;
  height: 0.25rem;
  content: "";
  pointer-events: none;
  background: radial-gradient(circle, rgb(101 12 28 / 24%) 1.5px, transparent 1.8px) 0 50% / 0.9rem 0.25rem repeat-x;
}

.timeline-film-frame::before { top: 0; }
.timeline-film-frame::after { bottom: 0; }

.timeline-film-frame .timeline-entry-card {
  flex: 1;
}

.timeline-entry-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-dialog);
  padding: 1.25rem;
  background-color: var(--theme-card-surface);
  background-image: var(--theme-card-highlight);
  box-shadow: var(--shadow-soft);
}

.timeline-film-marker {
  position: relative;
  min-height: 5.7rem;
  margin-top: 1rem;
  border-top: 1px solid var(--theme-timeline-rail);
  padding: 1rem 0.35rem 0;
}

.timeline-film-marker-dot {
  position: absolute;
  top: -0.43rem;
  left: 0.8rem;
  width: 0.82rem;
  height: 0.82rem;
  border: 3px solid var(--color-paper);
  border-radius: 999px;
  background: var(--color-brand);
  box-shadow: var(--theme-entry-shadow);
}

.timeline-film-marker-date,
.timeline-film-marker-title {
  margin: 0;
}

.timeline-film-marker-date {
  color: var(--color-accent);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.13em;
  line-height: 1.35;
  text-transform: uppercase;
}

.timeline-film-marker-title {
  display: -webkit-box;
  max-width: 22rem;
  margin-top: 0.35rem;
  overflow: hidden;
  color: var(--color-brand-strong);
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
```

- [x] **Step 2: Replace the old `@media (min-width: 768px)` timeline rules**

Delete only the `.timeline-rail`, `.timeline-entry`,
`.timeline-entry--right`, and `.timeline-entry-card` declarations inside that
media block. Add these responsive rules outside or inside their own media blocks:

```css
@media (min-width: 640px) {
  .timeline-film-viewport {
    margin-inline: 0;
    padding-inline: 0;
  }

  .timeline-filmstrip {
    grid-auto-columns: minmax(23rem, 26rem);
    gap: 1.25rem;
  }
}

@media (min-width: 768px) {
  .timeline-entry-card {
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .timeline-filmstrip {
    gap: 1.5rem;
  }
}
```

Keep unrelated selectors in the existing 768px media block exactly as they are.

- [x] **Step 3: Static inspect interaction and alignment rules**

Run: `rg -n "timeline-film|timeline-rail|timeline-entry--right|scroll-snap|overscroll-behavior|touch-action|content-visibility" src/app/globals.css src/features/timeline/presentation/relationship-timeline.tsx`

Expected: only film-strip selectors remain; the viewport has native horizontal
interaction, each frame is a vertical flex container, card flexes into the
shared row, and the marker carries a lower rail and dot.

### Task 3: Scope review and source-only handoff

**Files:**
- Modify: `docs/superpowers/specs/2026-07-23-timeline-filmstrip-design.md` (status)
- Modify: `docs/superpowers/plans/2026-07-23-timeline-filmstrip.md` (mark completed boxes)
- Inspect: `src/features/timeline/presentation/relationship-timeline.tsx` and `src/app/globals.css`

**Interfaces:**
- Consumes the approved layout and CSS class contract from Tasks 1–2.
- Produces source-only evidence and a verification-boundary record.

- [x] **Step 1: Re-read the approved design against the source**

Check: opening chapter remains separate, only old chapters map to frames,
native scroll-snap/scrollbar/touch pan are present, marker includes date+title,
frame markers align through shared grid row + flex, no JavaScript carousel or
data/security change exists, and no animation was added.

- [x] **Step 2: Inspect the semantic diff**

Run: `git diff --ignore-space-at-eol --unified=0 -- src/features/timeline/presentation/relationship-timeline.tsx src/app/globals.css docs/superpowers/specs/2026-07-23-timeline-filmstrip-design.md docs/superpowers/plans/2026-07-23-timeline-filmstrip.md`

Expected: only the film-strip JSX/CSS and related documents appear. Do not use
`git diff --check`, because the workspace has pre-existing line-ending noise.

- [x] **Step 3: State verification limits honestly**

State that static source and scoped-diff review were run, while test, lint,
build and browser interaction QA were intentionally not run by the user's
explicit request. Do not claim runtime/visual verification.
