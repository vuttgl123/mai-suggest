# Quiet editorial home design

**Date:** 2026-09-04
**Status:** Design approved by the user on 2026-09-04. No production code changed yet.

## Goal

Rebuild the authenticated home route so it reads as one deliberate editorial
opening instead of three stacked heroes, and give the project the shared design
foundation it currently lacks. The Three.js journal stays as the single signature
moment; everything around it becomes quiet.

This is the first phase of a wider pass over every route. The foundation built
here is meant to be reused, not rewritten, by the later phases listed at the end.

## Relationship to earlier specs

This document **supersedes two earlier decisions**. Both reversals are
deliberate and were approved by the user on 2026-09-04.

### Supersedes `2026-07-27-full-web-visual-overhaul-design.md`

That spec set `MOTION_INTENSITY: 6`, `DESIGN_VARIANCE: 8` and named
*"diagonal staggered masonry for catalogue discovery content"* as a signature
component. The implementation that followed produced per-card 3D hover tilts,
gradient badges, glow shadows and a modulo-driven masonry grid.

The user has judged that result commercial rather than intimate, which also
conflicts with `docs/product-direction.md` ("ấm áp, chân thành, chậm rãi" and
"không chuyển sang phong cách thương mại đại trà"). The new direction is
**quiet editorial**, defined below. Where the July 27 spec and this one
disagree about motion, effects or grid rhythm, **this one wins**. Its other
rules — palette hierarchy, copy discipline, the data and permission boundary,
the responsive contract — remain in force.

### Supersedes the "no header in the opening viewport" rule from `2026-07-22-cinematic-diary-intro-landing-design.md`

That spec stated: *"Initial view contains no global header or navigation.
`AppHeader` appears only after the visitor has passed the intro."* Combined with
a `200svh` intro, the visitor now scrolls two full screens with no navigation,
no wordmark and no way out except the single anchor.

The replacement keeps the intent (an uninterrupted first frame) without the
cost: the header is present in the DOM from the start but stays hidden while the
journal is closed, and slides in as soon as the opening movement begins. See
"Header reveal" below.

Everything else in that spec — the scene structure, the corrected opening
direction, the hardcover geometry stack, the WebGL/reduced-motion fallbacks —
remains authoritative and is not revisited here.

### Verification boundary is restored

The cinematic spec recorded that the user had asked for tests, lint, build and
browser QA to be skipped. That waiver is **not carried forward**. `AGENTS.md`
requires verification before handover, and this work is broad enough that
unverified changes are not defensible. See "Verification".

## Diagnosis

Every claim below was read from the current source.

### The home page opens three times and repeats itself twice

| Position | Source | Content |
| --- | --- | --- |
| 1 | `cinematic-diary-intro.tsx:176` | `<h1>` "Những điều làm em mỉm cười." |
| 2 | `catalogue-home.tsx:68` | `<h1>` "Những điều làm em mỉm cười." — identical |
| 3 | `catalogue-home.tsx:164` | Featured item card |

`catalogue-home.tsx:88` and `:108` render `featuredItem.primaryImage` and
`featuredItem.title`; `CatalogueFeaturedItemCard` then renders the same image and
the same title again. The two supporting paragraphs are near-identical
rewordings of each other. Two `<h1>` elements on one page is also an
accessibility defect.

The result is roughly three and a half screens of preamble before the visitor
reaches any real content, which is why the discovery section reads as flat: its
energy was already spent.

### The intro is styled by two systems that fight each other

`globals.css` contains no `@layer` at all. Tailwind v4 places its utilities in
`@layer utilities`, and unlayered CSS beats layered CSS regardless of
specificity, so **every hand-written rule in `globals.css` silently overrides
the Tailwind utility for the same property**. On `cinematic-diary-intro.tsx:176`
the classes `text-5xl md:text-7xl font-bold ... bg-clip-text text-transparent`
are entirely inert against `globals.css:2173-2183`.

Independently, `from-brandStrong`, `via-brand`, `to-accent` and
`text-brandStrong/70` reference a colour named `brandStrong` that does not
exist: `@theme` declares `--color-brand-strong`, so Tailwind only ever generated
`*-brand-strong`. Those classes have never done anything.

### The discovery grid is mathematically unable to fill its rows

`catalogue-home.tsx:186` sizes cards with
`index % 5 === 0 ? col-span-5 : index % 3 === 0 ? col-span-4 : col-span-3`
on a 12-column grid. The resulting sequence is 5,3,3 = 11 of 12 columns (one
column short) then 4,3,3 = 10 of 12 (two columns short). Ragged holes are
guaranteed, not incidental.

### There is no design system, and the one that was started was abandoned

`globals.css:608-643` already declares a five-step type scale — `display-xl`,
`display-lg`, `heading-md`, `body-text`, `caption-text`. Only `display-xl` is
used anywhere. The other four are dead, and the JSX instead carries twelve
distinct ad-hoc `tracking-[...]` values (−0.035, −0.04, −0.045, −0.05, −0.055,
−0.06, −0.07em among them).

Alongside that: 743 inline `[var(--color-*)]` arbitrary values in TSX, only two
shared UI primitives (`button.tsx`, `page-transition.tsx`), a 2388-line
`globals.css` in which `.diary-shell` is defined twice (lines 524 and 676), and
eight backwards-compatibility colour aliases of which six have zero remaining
uses.

## Design language: quiet editorial

Depth comes from typography, paper, thin rules and negative space — not from
effects.

**Removed everywhere:**

- 3D hover tilts such as
  `hover:[transform:perspective(1000px)_translateY(-6px)_rotateX(2deg)_rotateY(-2deg)]`
- gradient-filled badges
- glow shadows (`--shadow-luxury-glow`, `--shadow-luxury-glow-strong`)
- long staggered reveals (`animationDelay: (index + 2) * 100ms`, which costs
  1.4 seconds across twelve cards)

**Kept:** a hover that lifts 2px and shifts the border colour, and nothing else.

The Three.js journal is the deliberate exception and the only one. It reads as
special precisely because its surroundings are calm; adding effects elsewhere
would spend the contrast that makes it work.

## Design system foundation

Built as a thin slice — only what the home route needs — so later phases extend
it rather than replace it.

### Layering fix

Wrap all hand-written CSS in `@layer components`. This one change restores
Tailwind utilities as the override mechanism across the whole project and
removes the "I added a class and nothing happened" failure mode.

### Type scale

Finish the abandoned scale. Seven steps, each pairing size, line height and
tracking, with tracking tightening as size grows:

| Token | Size | Line height | Tracking |
| --- | --- | --- | --- |
| `--type-display-xl` | `clamp(2.75rem, 6vw, 4.75rem)` | 0.98 | −0.035em |
| `--type-display-lg` | `clamp(2.1rem, 4vw, 3.25rem)` | 1.05 | −0.030em |
| `--type-display-md` | `clamp(1.6rem, 2.6vw, 2.25rem)` | 1.15 | −0.020em |
| `--type-title` | `1.25rem` | 1.30 | −0.010em |
| `--type-body` | `1rem` | 1.70 | 0 |
| `--type-body-sm` | `0.875rem` | 1.65 | 0 |
| `--type-kicker` | `0.6875rem` | 1.35 | 0.18em, uppercase |

The existing `display-xl` / `display-lg` / `heading-md` / `body-text` /
`caption-text` classes are re-pointed at these tokens so current call sites keep
working during migration, then retired once no call site remains.

### Elevation and motion

Three elevation steps replace the current scatter of shadow variables: `flat`
(border only), `raised` (resting card), `lifted` (hover, floating header).
Shadows stay tinted toward Bordeaux.

Motion is two durations and one easing: `--motion-quick: 160ms`,
`--motion-base: 320ms`, `--motion-ease: cubic-bezier(0.2, 0, 0, 1)`.

### Primitives

Added under `src/components/ui/`: `Card`, `SectionHeader`, `Kicker`, `Badge`,
`Surface`, `MediaRail`.

### File split

`globals.css` becomes `tokens.css`, `base.css`, `themes.css` and
`components/*.css`, imported from `globals.css`. The duplicate `.diary-shell`
block is merged during the split.

### Codemod

The 743 inline `[var(--color-*)]` values are rewritten to the corresponding
theme utilities (`text-brand-strong`, `bg-paper`, and so on) by script, not by
hand. The generated utilities already exist because `@theme` declares the
matching `--color-*` keys.

## Home page architecture

The route keeps its current server boundary: `src/app/page.tsx` stays a Server
Component, resolves access through `requireActivePageAccess()`, and passes plain
read models into presentational components. No Supabase call moves into a Client
Component.

Three modes, selected by the existing search parameters:

| URL | Mode | Content |
| --- | --- | --- |
| `/` | Chapter overview | One block per chapter: cover image, name, item count, description, a five-item horizontal rail, and an "Mở chương →" link |
| `/?category=<slug>` | Single chapter | That chapter only: chapter hero, full grid, pagination |
| `/?q=<text>` | Search results | Flat grid, no chapter grouping, pagination |

`?category` and `?q` together behave as they do today: the search is scoped to
the category and the page renders in search-results mode.

### Server branching

`src/app/page.tsx` chooses its reads from the parsed parameters instead of
always paging items:

- **Chapter overview** (`?category` and `?q` both absent): run
  `listVisibleCategories` and `listVisibleChapterPreviews({ itemsPerChapter: 5 })`
  in parallel. `listVisibleItemPage` is not called.
- **Single chapter and search**: exactly today's reads —
  `listVisibleCategories` and `listVisibleItemPage` — including the existing
  re-read when the requested page exceeds `pageCount`.

`PUBLIC_PAGE_SIZE` stays at 6.

### Pagination per mode

Chapter overview is **not paginated**. Every chapter is rendered, each showing
at most five preview items, so the page length is bounded by the number of
chapters rather than by the number of items — and chapters are owner-curated and
few. Depth lives behind "Mở chương →", which enters single-chapter mode where
the existing pagination continues to work unchanged.

Single-chapter and search modes keep `CataloguePagination` exactly as it is.

### Featured card per mode

`CatalogueFeaturedItemCard` survives, with a narrower rule. It no longer
duplicates anything, because the second hero that used to repeat its image and
title is gone.

| Mode | Featured card |
| --- | --- |
| Chapter overview | None. The chapter bands already carry the emphasis. |
| Single chapter, page 1 | First item of the page, as today. The remaining five fill the grid. |
| Single chapter, page 2+ | None. |
| Search results | None. A result set has no editorial "open this first". |

### Utility row

A single slim row sits between the journal and the first chapter, replacing both
the current chapter-rail card grid and the boxed search section:

- chapter jump links — one small anchor per chapter scrolling to that chapter's
  band in overview mode, and the existing category links in the other two modes,
  keeping `aria-current="page"`;
- the search field and its clear control, as a compact inline form.

It carries no heading of its own. In single-chapter and search modes it also
shows the "Xem tất cả" link back to `/`.

### Empty states

`EmptyCollection` in `catalogue-home.tsx` is kept and reused for single-chapter
and search modes. Chapter overview gets the same component when no chapter has
any item; when only some chapters are empty, those chapters render their band
without a rail and without the "Mở chương →" link, as described below.

### Header reveal

`AppHeader` moves **above** `CinematicDiaryIntro` in `catalogue-home.tsx`.

The intro's client component writes its phase to `document.body.dataset.introPhase`
in addition to the section's own `data-phase`, and clears it on unmount. CSS
hides the header only under `body[data-intro-phase="closed"]`; the default state
is visible, so every other route and the reduced-motion path are unaffected. The
header slides in when the phase reaches `opening`.

This is safe with the existing DOM. `body` uses `overflow-x: clip`
(`globals.css:391`), which — unlike `overflow: hidden` — does not create a scroll
container, so `position: sticky` continues to work. `html` already sets
`scroll-padding-top: 5rem` for a sticky header. React's `ViewTransition` wrapper
renders no DOM element. The intro's existing theme `MutationObserver` filters on
`data-theme` only, so writing `data-intro-phase` does not trigger it.

The header's own width is aligned to `--content-max` instead of its current
`max-w-5xl`, which is narrower than the content it sits above.

## The cinematic intro

Unchanged: `cinematic-diary-scene.ts` and `cinematic-diary-geometry.ts`. The
model is sound, the geometry has tests, and the problem is the staging.

Changed:

- Intro height `200svh → 140svh` desktop, `160svh → 120svh` below 640px. The
  four phases keep their proportions; only the dead scroll is removed.
- The journal becomes the page's only `<h1>`.
- Every inert Tailwind class on `.cinematic-diary-intro__*` elements is deleted,
  including the non-existent `brandStrong` colours and the `bg-clip-text`
  gradient. Styling for this component lives in CSS, because it is driven by
  `data-phase` state that utilities cannot express.
- `import * as THREE` becomes named imports in
  `cinematic-diary-scene.ts`, `cinematic-diary-geometry.ts` and
  `magical-background.tsx`, so bundling can drop unused parts of the 636 KB
  module.
- The closing anchor targets the first chapter block.

## Chapter overview composition

Each chapter block, in source order:

1. A rule and chapter number ("CHƯƠNG 01") in the kicker style.
2. A two-column band: cover image on one side, chapter name at
   `--type-display-md`, item count and description on the other. Columns
   alternate side between chapters to give the page rhythm without asymmetric
   grid maths.
3. A horizontal rail of up to five item cards.
4. An "Mở chương →" link to `/?category=<slug>`.

Chapters with no items render their band without a rail and without the link,
rather than an empty rail.

Below 768px the band stacks to a single column, image first. The rail stays
horizontal on every width — that is its purpose — and is reachable by keyboard
and by touch scrolling.

### Grid rhythm

Single-chapter and search modes use `repeat(auto-fill, minmax(17rem, 1fr))`.
A uniform grid cannot leave holes and suits the quiet direction. The asymmetric
rhythm is confined to the chapter bands, where the item count is fixed at five
and therefore controllable.

## Data layer

Following the existing ports-and-adapters structure. **No migration, no schema,
RLS or permission change.**

| File | Change |
| --- | --- |
| `domain/catalogue-read-models.ts` | Add `CatalogueChapterPreview` — a `CatalogueCategory` plus `items: CatalogueItemSummary[]` and `totalItems: number` |
| `application/catalogue-reader.ts` | Add `listChapterPreviews(criteria: { itemsPerChapter: number })` to the `CatalogueReader` port |
| `application/list-visible-chapter-previews.ts` | New use case, mirroring `ListVisibleCategories`: `requireActiveActor` first, validate `itemsPerChapter` is a positive integer, then delegate |
| `infrastructure/supabase-catalogue-reader.ts` | Implement the port method |
| `lib/backend/create-server-backend.ts` | Register the use case |

The adapter avoids N+1 while keeping the current two-query cost: read
`items` with `ITEM_SUMMARY_COLUMNS` (no images), group by `category_id` in
memory, take the first five per chapter, then read `item_images` for **only**
those selected item ids. Ordering matches `listItems` (`order("title")`) so the
preview is stable and predictable.

Known trade-off, accepted for now: this reads every `items` row. For a private
two-person diary that is fine. If the catalogue ever passes a few hundred items,
replace it with a `top_n_per_category` RPC — that would be a separate change
with its own migration approval.

## Shared rail component

`TimelineFilmControls` (`timeline-film-controls.tsx`) is already a good
horizontal-rail controller: `requestAnimationFrame`-throttled bounds, a
`ResizeObserver`, `prefers-reduced-motion` respected in `scrollToFilmFrame`,
and correct ARIA (`role="group"`, `aria-controls`, disabled edge states).

Only two things bind it to the timeline: the hard-coded `.timeline-film-frame`
selector (line 23) and the Vietnamese labels (lines 121 and 131).

It is promoted to `src/components/ui/media-rail.tsx`, taking the frame selector
and the two button labels as props. The timeline and the catalogue chapter rails
then share one implementation, and `.timeline-film-viewport` /
`.timeline-film-controls` CSS generalises alongside it. Timeline behaviour must
not change.

## Component map

Where each existing file ends up, so the implementation plan has no room to
guess.

| File | Outcome |
| --- | --- |
| `catalogue-home.tsx` | Rewritten as a mode switch; the second hero deleted; drops to roughly half its 255 lines |
| `catalogue-chapter-rail.tsx` | Becomes the utility row: jump links plus search, no heading, no card grid |
| `catalogue-search.tsx` | Keeps its client logic and URL behaviour; loses its section wrapper, kicker and `<h2>` and is embedded in the utility row |
| `catalogue-chapter-band.tsx` | **New.** One chapter: rule, number, cover, name, count, description, rail, "Mở chương →" |
| `catalogue-item-card.tsx` | Kept; effects stripped, title demoted `<h2>` → `<h3>`, spacing moved onto the type scale |
| `catalogue-featured-item-card.tsx` | Kept for single-chapter page 1; effects stripped |
| `catalogue-item-image.tsx` | Unchanged |
| `catalogue-pagination.tsx` | Unchanged |
| `cinematic-diary-intro.tsx` | Inert classes deleted, phase written to `body`, height reduced |
| `cinematic-diary-scene.ts`, `cinematic-diary-geometry.ts` | Unchanged except named `three` imports |
| `app-header.tsx` | Moves above the intro, widens to `--content-max`, effects stripped |
| `timeline-film-controls.tsx` | Promoted to `components/ui/media-rail.tsx`; timeline re-points at it |

## Deletions

The user asked for redundant parts to be removed. Each item below was verified
unused or duplicated.

**Components**

- `catalogue-home.tsx:58-115` — the second hero, in full. Its headline duplicates
  the journal's, its image and title duplicate the featured card's. The line
  "Dành riêng cho những điều dịu dàng" is dropped rather than moved: the journal
  already carries the kicker "Một chương dành riêng cho hai người", which says
  the same thing more specifically.
- The `<h2>` "Điều em đang tìm" in `catalogue-search.tsx` — search becomes a slim
  utility row beside the chapter jump links, not a titled section competing with
  real content.
- `ListVisibleItems`, `CatalogueReader.listItems`, its Supabase implementation and
  the tests that exist only to cover them. No page or component calls
  `backend.listVisibleItems`; it is production code kept alive solely by its own
  tests. `listItemPage` covers every real caller.

**CSS**

- Duplicate `.diary-shell` block (`globals.css:676-678`), merged into line 524.
- Ten classes declared and never used: `body-text`, `caption-text`,
  `catalogue-surface`, `display-lg`, `glass-dock`, `heading-md`, `hero-overlay`,
  `hide-scrollbar`, `paper-card`, `summary-scroll`. `display-lg`, `heading-md`,
  `body-text` and `caption-text` come back as part of the finished type scale;
  the other six go for good.
- `.catalogue-surface::before { content: none }` — a rule with no effect.
- The `letter-spacing: 0` reset on the type-scale group, immediately overridden
  by every member of that group.
- Compatibility aliases with zero uses: `--wine`, `--burgundy`, `--ivory`,
  `--champagne`, `--paper`, `--muted`. The two with one use each, `--deep-wine`
  and `--ink`, are migrated to their semantic names and then removed too.
- The `brandStrong` classes and the `bg-clip-text` gradient in
  `cinematic-diary-intro.tsx`.

**Repository**

- The directory literally named `D:\Code\mai-suggest/`, created by a Windows path
  used as a relative path.
- `Build` — an empty file at the repository root.
- `diff.txt` — a 55 KB captured diff.

## Repository hygiene

`git diff` currently reports 3693 insertions and 3693 deletions across 28 files
with **no content change at all**: those files were rewritten with CRLF line
endings. Review is impossible in that state, and every future edit to them will
appear as a full-file rewrite.

Add `.gitattributes` with `* text=auto eol=lf`, then `git add --renormalize .`.
This is done before any redesign work so that the redesign diff is readable.

## Visual verification access

`/` redirects anonymous visitors to `/login` (verified: `307 →
/login?next=%2F`), so the home route cannot be inspected in a browser without a
session, and `AGENTS.md` requires browser QA at 320, 390, 768, 1024 and 1440px
before handover.

`scripts/save-auth-state.mjs` launches a headed Chromium, waits for the user to
complete Google OAuth once, and saves the storage state to
`tests/e2e/.auth/state.json`. That path is added to `.gitignore`. The script
never prints tokens, cookies or the session payload, and it is a developer tool
only — it is not imported by application code and adds no runtime dependency.

## Accessibility and responsive contract

- Exactly one `<h1>` per page. Chapter names are `<h2>`; item titles inside rails
  are `<h3>`.
- The existing skip link to `#main-content` keeps working, and the journal's
  closing anchor resolves to a real in-page target.
- The canvas stays `aria-hidden` and unfocusable.
- Rails are keyboard reachable; their controls keep the current `aria-controls`,
  `role="group"` and disabled-edge behaviour.
- Chapter links keep `aria-current="page"` when active.
- Under `prefers-reduced-motion`: the header is simply always visible, the
  journal keeps its existing static fallback, rails scroll with
  `behavior: "auto"`, and card hover is colour-only. Card entrances must remain
  visible if animation is suppressed — no element may depend on an animation to
  reach `opacity: 1`.
- Verified at 320, 390, 768, 1024 and 1440px for overflow, overlap, text
  clipping, hover and focus.

## Scope and non-goals

- No database schema, migration, RLS, auth provider or permission change.
- No route slug change, no navigation label change.
- No new runtime dependency; `three`, `motion` and `lucide-react` are the
  existing set.
- No mock or placeholder content.
- No commit and no branch. `AGENTS.md` reserves both for an explicit user
  request, which overrides the brainstorming skill's default of committing the
  spec.
- The later phases listed below are out of scope for this document.

## Implementation ownership

Implementation is handed to a separate agent, working from
`docs/superpowers/plans/2026-09-04-quiet-editorial-home.md` and this document
alone. It will not have the conversation that produced either. Three
consequences follow, and the plan is written to satisfy them:

1. **The plan is self-contained.** It states its own commands, its own hard
   rules, and its own stop conditions rather than deferring to `AGENTS.md`,
   which instructs agents to use `rtk`, `apply_patch` and the `superpowers:*`
   skills — none of which another harness has.
2. **Every step names its expected output.** A step that says only what to do
   invites a fast implementer to report success it has not earned. Each
   verification step gives the command and what the command should print.
3. **Risky work carries explicit stop conditions** rather than relying on
   judgement the implementer may not have.

**The five tasks that carry real risk**

- **The stylesheet layering.** Highest blast radius in the project: the file
  holds `@theme` with nested `@keyframes`, five `:root` / `body[data-theme]`
  blocks and several `@media` blocks, and a wrong layer scope silently breaks
  all five seasonal themes. No test guards it, so the plan supplies an
  observable proof — a utility class that must visibly take effect afterwards
  and demonstrably did not before.
- **Promoting `TimelineFilmControls` to `MediaRail`.** Must not regress a
  working timeline that is otherwise out of scope.
- **The Supabase chapter-preview adapter.** Easy to write as an N+1 query; the
  plan states the exact query budget so the mistake is checkable.
- **The read-model and port change**, which deliberately leaves the build red
  until the adapter lands. The plan says so, because an implementer that
  "fixes" it early will stub the adapter.
- **The auth-state capture**, which needs a human to complete a Google login.

**Preconditions for the two mechanical scripts**

The colour codemod must handle the 28 call sites where `var(--color-*)` is
nested inside `color-mix()`, `calc()` or `linear-gradient()` — a naive
find-and-replace corrupts them — and must only rewrite colours that `@theme`
actually declares, or it emits classes Tailwind never generated. Both scripts
are written and dry-run-verified in their own tasks before any task applies
them.

The Three.js import conversion covers 122 `THREE.` references across three files
and 36 distinct symbols, one of which (`RoundedBoxGeometry`) lives in
`three/addons` rather than the package root. Because a missed symbol fails
silently at runtime and the benefit is unproven — modern bundlers often
tree-shake a namespace import from an ESM package unaided — the plan treats it
as a measurement with a revert path rather than a foregone change.

## Verification

- New data-layer behaviour is written test-first per
  test-driven development — a failing test first, then the smallest
  implementation that passes it — following the existing
  `catalogue-use-cases.test.ts` and `supabase-catalogue-reader.test.ts`.
- `MediaRail` keeps the timeline's current behaviour; a test covers frame
  selection through the injected selector.
- Visual changes get visual criteria and browser QA, not decorative unit tests.
- Each phase ends with `npm run lint`, `npx tsc --noEmit`, `vitest run` and
  `next build`. Lint alone is not accepted as evidence.
- Baseline for comparison: lint currently reports one warning
  (`magical-background.tsx:164`, `react-hooks/exhaustive-deps`).

## Acceptance criteria

- The home page has one `<h1>`, one hero and no repeated featured item.
- Navigation is reachable within the first opening movement rather than after
  two screens of scrolling.
- No 3D hover tilt, gradient badge or glow shadow remains on any surface
  touched by this phase.
- The item grid fills its rows at every item count.
- No inert Tailwind class remains on the intro, and adding a utility class to a
  component visibly overrides `globals.css`.
- Chapter previews come from Supabase through the existing use-case boundary,
  in the same number of queries as today.
- `git diff` shows only intended changes, with no line-ending noise.
- Lint, type check, tests and build pass; browser QA is done at all five widths.

## Later phases

Each gets its own design pass; the foundation from this phase carries forward.

| Phase | Scope |
| --- | --- |
| 3 | `/catalogue/[slug]`, including splitting the 562-line `catalogue-engagement-panel.tsx` |
| 4 | `/hanh-trinh`, adopting the shared `MediaRail` |
| 5 | `/thu-hen-ngay-mo` |
| 6 | `/admin` — five screens, each currently styled by hand |
| 7 | `/login`, `/access-denied`, `error.tsx`, `loading.tsx` |
