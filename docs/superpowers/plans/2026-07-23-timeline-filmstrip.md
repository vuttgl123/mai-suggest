# Timeline Equal Filmstrip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render every relationship chapter as an equal frame in one horizontally swipeable Bordeaux film strip.

**Architecture:** `RelationshipTimeline` remains a Server Component and consumes the existing ordered `entries` read model. It will render one film-strip section whenever entries exist, map all entries to the existing `TimelineChapterCard`, and retain the local `TimelineFilmMarker` beneath each card. Existing global film-strip CSS remains the sole interaction and layout layer; it needs no first-frame variant.

**Tech Stack:** Next.js App Router, React Server Components, TypeScript strict, Tailwind CSS, global CSS, existing `TimelineEntry` read model.

## Global Constraints

- Do not create a branch, worktree, commit, test, build, lint, browser QA, migration, RLS change, data change, new client component, carousel dependency, View Transition or URL state.
- Preserve entry order and IDs, `TimelineChapterCard` content and props (except its existing `sequence` value), image URLs, response panel, actor permissions, header and empty state.
- Every non-empty entry uses the native horizontal film strip with `overflow-x: auto`, scroll snap, touch pan, contained overscroll and native scrollbar. Do not introduce auto-scroll or smooth-scroll behaviour.
- Remove the featured entry split and all special opening chapter copy. Sequence numbers begin at 1 for the first entry.
- Keep the existing Bordeaux paper surface, decorative perforations, responsive widths and `content-visibility`; do not introduce a dark cinema theme, animation or a visual priority variant.
- Per the user's explicit instruction, source/diff inspection is the only verification. Do not claim runtime or visual verification.

---

## File structure

- Modify `src/features/timeline/presentation/relationship-timeline.tsx`: render all timeline entries as one semantic film strip and remove the featured-chapter dependency.
- Inspect `src/app/globals.css`: retain the shared film-strip class contract without adding a first-frame CSS variant.
- Modify `docs/superpowers/specs/2026-07-23-timeline-filmstrip-design.md`: record completed implementation status.
- Modify `docs/superpowers/plans/2026-07-23-timeline-filmstrip.md`: record completed plan steps.

### Task 1: Render all timeline entries as equal film frames

**Files:**
- Modify: `src/features/timeline/presentation/relationship-timeline.tsx:1-145`

**Interfaces:**
- Consumes `entries: TimelineEntry[]`, `TimelineChapterCard` and the existing local `TimelineFilmMarker({ entry }: { entry: TimelineEntry })`.
- Produces one `timeline-filmstrip` ordered list for every non-empty `entries` array.
- Does not import or render `TimelineFeaturedChapter`.

- [x] **Step 1: Remove the featured chapter split and import**

Delete:

```tsx
import { TimelineFeaturedChapter } from "@/features/timeline/presentation/timeline-featured-chapter";

const [featuredEntry, ...chapterEntries] = entries;
```

No replacement local state or client hook is needed. The existing `entries` prop
is the single ordered data source.

- [x] **Step 2: Replace the featured/chapter conditional with one equal strip**

After the existing introductory `<section>`, render this conditional. Keep the
existing empty-state JSX exactly as it is in the `: (...)` branch.

```tsx
{entries.length ? (
  <section
    aria-labelledby="timeline-heading"
    className="border-y border-[var(--color-border)] bg-[rgb(255_252_248_/_62%)] py-11 sm:py-15"
  >
    <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-2xl text-center">
        <p className="diary-kicker">Từng trang mình đã viết</p>
        <h2
          className="font-display mt-2 text-balance text-3xl font-semibold tracking-[-0.05em] text-[var(--color-brand-strong)] sm:text-4xl"
          id="timeline-heading"
        >
          Hành trình của chúng mình
        </h2>
      </div>
      <div
        aria-label="Cuộn phim các chương trong hành trình"
        className="timeline-film-viewport mt-8 sm:mt-10"
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
    </div>
  </section>
) : (
  // Retain the current empty-state section unchanged.
)}
```

The complete replacement must not retain the “Một chương đang mở”, “Điều mình
đang cùng viết” or “Những chương đã viết” labels. The empty branch must retain
its full existing JSX instead of the comment shown above.

- [x] **Step 3: Preserve the marker and card contract**

Do not modify `TimelineFilmMarker` or `TimelineChapterCard`. The call below is
the only per-frame extension and keeps date semantics in the local component:

```tsx
<TimelineFilmMarker entry={entry} />
```

Each `TimelineChapterCard` must continue to receive `actorId`,
`canManage`, `entry` and `sequence`; only `sequence` changes from `index + 2`
to `index + 1`.

### Task 2: Confirm the shared film-strip styling has no featured variant

**Files:**
- Inspect: `src/app/globals.css:630-740,1253-1275`

**Interfaces:**
- Consumes the existing `.timeline-film-viewport`, `.timeline-filmstrip`,
  `.timeline-film-frame` and marker classes emitted in Task 1.
- Produces no CSS changes unless inspection finds a selector that targets a
  special first frame.

- [x] **Step 1: Inspect frame and responsive selector scope**

Run:

```bash
rg -n "timeline-film|timeline-entry-card|first-child|nth-child|featured" src/app/globals.css
```

Expected: film-strip selectors style every `.timeline-film-frame` identically;
there is no first-frame/featured selector. Existing viewport interaction rules
continue to include:

```css
overflow-x: auto;
overscroll-behavior-x: contain;
touch-action: pan-x;
scroll-snap-type: x mandatory;
```

- [x] **Step 2: Leave global CSS unchanged when the contract already fits**

No CSS edit is required for equal frames: `.timeline-filmstrip` already places
each frame in the same auto-column grid, and `.timeline-film-frame` already
makes every card flex into the same row before its marker. Do not add selector
branches for the first entry.

### Task 3: Source-only scope review and documentation status

**Files:**
- Modify: `docs/superpowers/specs/2026-07-23-timeline-filmstrip-design.md:3`
- Modify: `docs/superpowers/plans/2026-07-23-timeline-filmstrip.md`
- Inspect: `src/features/timeline/presentation/relationship-timeline.tsx`, `src/app/globals.css`

**Interfaces:**
- Consumes the equal film-strip source contract from Tasks 1–2.
- Produces a scoped source/diff review record without runtime claims.

- [x] **Step 1: Mark the approved spec as implemented**

Change its status line to:

```md
**Trạng thái:** Đã được người dùng duyệt và triển khai theo đặc tả này.
```

- [x] **Step 2: Perform static source checks**

Run:

```bash
rg -n "TimelineFeaturedChapter|featuredEntry|chapterEntries|Một chương đang mở|Điều mình đang cùng viết|Những chương đã viết" src/features/timeline/presentation/relationship-timeline.tsx
```

Expected: no results. Then run:

```bash
rg -n "entries\.map|sequence=\{index \+ 1\}|TimelineFilmMarker|timeline-film-viewport|timeline-filmstrip" src/features/timeline/presentation/relationship-timeline.tsx
```

Expected: all entries map to one list, start at sequence 1 and receive the
existing marker.

- [x] **Step 3: Review the scoped semantic diff and document completion**

Run:

```bash
git diff --ignore-space-at-eol --unified=0 -- src/features/timeline/presentation/relationship-timeline.tsx src/app/globals.css docs/superpowers/specs/2026-07-23-timeline-filmstrip-design.md docs/superpowers/plans/2026-07-23-timeline-filmstrip.md
```

Expected: semantic source changes are limited to the equal film strip and
associated documents; no Supabase, permission or route change appears. Mark
the completed checkboxes in this plan. Report only static source/diff review;
do not run or claim test, lint, build or browser QA.
