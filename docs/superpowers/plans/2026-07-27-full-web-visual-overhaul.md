# Điều Em Yêu full-web visual overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task with checkpoints. Do not use subagents unless the user explicitly requests them.

**Goal:** Translate the approved Bordeaux Diary visual direction into a complete, responsive and accessible presentation refactor across public, member, auth, system and admin surfaces while preserving the existing product behavior.

**Architecture:** Keep the existing Next.js App Router, Server Components, feature folders, Supabase access boundary, Motion, View Transition and Tailwind v4 setup. Centralize visual rules in the existing global token layer and shared presentation primitives, then recompose each surface using the approved editorial layout families. No route, schema, RLS, OAuth, server action or form-contract changes are part of the work.

**Tech Stack:** Next.js App Router, React, TypeScript strict, Tailwind CSS v4, Motion, React View Transition, Lucide React, `next/font`, Playwright, Vitest.

## Global Constraints

- Preserve the real product brand **Điều Em Yêu**. Bordeaux Diary is the visual language, never a replacement wordmark.
- Preserve route slugs, query parameters, primary navigation labels, form field names and field order.
- Do not modify Supabase schema, RLS, Google OAuth, server actions, authorization checks or data mappings.
- Do not add mock business data, fake metrics, fake screenshots or unrelated visual assets.
- Keep the existing dependency set unless a new dependency is explicitly approved after checking `package.json`.
- Use the existing Bordeaux theme token system and keep seasonal presets visually coherent.
- Public/member surfaces use `DESIGN_VARIANCE: 8`, `MOTION_INTENSITY: 6`, `VISUAL_DENSITY: 3`.
- Admin surfaces use `DESIGN_VARIANCE: 5`, `MOTION_INTENSITY: 3`, `VISUAL_DENSITY: 6`.
- Auth/system surfaces use `DESIGN_VARIANCE: 5`, `MOTION_INTENSITY: 3`, `VISUAL_DENSITY: 3`.
- Animate only `transform` and `opacity`; never use scroll listeners or React state driven by continuous scroll values.
- Every motion effect must have cleanup and a `prefers-reduced-motion` fallback.
- Every multi-column layout must define its `< 768px` fallback in the same component.
- Use sentence case, concise Vietnamese copy and no decorative em dashes, fake version labels or status dots.
- Preserve all current uncommitted user changes and review the diff before each overlapping edit.
- Use `apply_patch` for source changes. Do not create a commit unless the user separately requests one.

---

## File Map

### Global and shared presentation

- Modify `src/app/globals.css` for semantic tokens, global layout primitives, theme surfaces, focus states, motion rules and responsive helpers.
- Modify `src/app/layout.tsx` only when font metadata, theme attributes or global metadata need the approved visual contract.
- Modify `src/components/app-header.tsx` for the public/member navigation and responsive header.
- Modify `src/components/ui/button.tsx` for shared button hierarchy, focus, active and reduced-motion behavior.
- Modify `src/components/ui/page-transition.tsx` for shared transition defaults.
- Modify `src/components/theme/theme-atmosphere.tsx` and `src/components/theme/theme-maintenance-screen.tsx` for the shared atmosphere and maintenance state.
- Modify `eslint.config.mjs` only to ignore the existing generated `D:\Code\mai-suggest/**` artifact path that is nested in the workspace.

### Public/member surfaces

- Modify `src/features/catalogue/presentation/cinematic-diary-intro.tsx` and `src/features/catalogue/presentation/cinematic-diary-scene.ts` for the opening scene.
- Modify `src/features/catalogue/presentation/catalogue-home.tsx`, `catalogue-chapter-rail.tsx`, `catalogue-search.tsx`, `catalogue-pagination.tsx`, `catalogue-featured-item-card.tsx`, `catalogue-item-card.tsx` and `catalogue-item-image.tsx` for discovery.
- Modify `src/features/catalogue/presentation/catalogue-detail.tsx`, `catalogue-detail-hero.tsx`, `catalogue-keepsake-collection.tsx` and `catalogue-engagement-panel.tsx` for the detail spread.
- Modify `src/features/timeline/presentation/relationship-timeline.tsx`, `timeline-chapter-card.tsx`, `timeline-featured-chapter.tsx`, `timeline-film-controls.tsx` and `timeline-response-panel.tsx` for the timeline.
- Modify `src/features/future-letters/presentation/future-letters-experience.tsx`, `future-letter-composer.tsx`, `future-letter-opening-card.tsx` and `scheduled-letter-list.tsx` for the letters experience.

### Auth/system and admin surfaces

- Modify `src/app/login/page.tsx`, `src/app/access-denied/page.tsx`, `src/app/error.tsx` and `src/app/loading.tsx` for branded system states.
- Modify `src/components/admin/admin-workspace-header.tsx` and `src/components/admin/admin-workspace-switcher.tsx` for the admin shell.
- Modify `src/features/catalogue/presentation/admin-catalogue.tsx`, `admin-catalogue-sidebar.tsx`, `admin-item-list.tsx`, `admin-item-editor.tsx`, `admin-category-editor.tsx`, `item-keepsake-editor.tsx` and `admin-catalogue-feedback.ts` for catalogue management.
- Modify `src/features/timeline/presentation/admin-timeline.tsx`, `admin-timeline-list.tsx` and `admin-timeline-editor.tsx` for timeline management.
- Modify `src/features/site-theme/presentation/admin-site-theme.tsx`, `theme-scene-picker.tsx`, `theme-schedule-form.tsx`, `theme-schedule-list.tsx` and `theme-scene-transition-progress.tsx` for theme management.
- Modify `src/features/future-letters/presentation/admin-future-letters.tsx` for owner letter management.

### Verification

- Use existing Vitest tests under `src/**/*.test.ts(x)` for regression coverage.
- Add `tests/e2e/visual-surface-smoke.spec.ts` only if the configured test environment can authenticate and provide the required visible data without changing production behavior.
- Use `playwright.config.ts` and the existing `npm run dev` web server for browser QA.

---

## Task 1: Establish the visual baseline and safe edit boundary

**Files:**
- Read: `AGENTS.md`, `docs/product-direction.md`, `docs/superpowers/specs/2026-07-27-full-web-visual-overhaul-design.md`
- Read: current `git status`, current `git diff --stat`, `package.json`, `playwright.config.ts`
- No source modification.

**Interfaces:**
- Consumes: approved design spec and current dirty worktree.
- Produces: a recorded route/component inventory and a clean baseline report for the next task.

- [ ] **Step 1: Record the current dirty worktree.**

Run:

```bash
rtk git status --short --untracked-files=all
rtk git diff --stat
```

Expected: the existing user changes are listed and no reset, checkout or clean command is used.

- [ ] **Step 2: Run the baseline checks before editing.**

Run:

```bash
rtk npm run lint
rtk test
rtk next build
```

Expected: record pass/fail output. Existing failures are documented separately and are not silently attributed to the redesign.

- [ ] **Step 3: Confirm the route and component inventory.**

Read the route files under `src/app` and the presentation files listed in the File Map. Confirm that the implementation plan does not require changes to server modules, Supabase mappings or auth actions.

Expected: only presentation and global styling files are in scope.

- [ ] **Step 4: Keep generated build artifacts out of lint input.**

The workspace currently contains a generated directory named `D:\Code\mai-suggest/.next`. Add a scoped `**/D:*/**` pattern to `globalIgnores` in `eslint.config.mjs`; do not delete or overwrite the artifact as part of this task.

Expected: `rtk npm run lint` scans project source without parsing generated bundle output.

---

## Task 2: Build the Bordeaux visual foundation

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/page-transition.tsx`
- Modify: `src/components/theme/theme-atmosphere.tsx`
- Test: `src/features/identity/components/google-sign-in-button.test.tsx` only if button behavior changes

**Interfaces:**
- Consumes: existing theme keys, font variables, `Button` props and View Transition names.
- Produces: stable semantic tokens and shared classes that all later surface tasks can use without inventing local visual rules.

- [ ] **Step 1: Add semantic surface and typography tokens without removing compatibility aliases.**

In `globals.css`, define the page, elevated surface, control surface, primary text, muted text, line, focus and accent roles from the existing Bordeaux variables. Keep `--wine`, `--burgundy`, `--deep-wine`, `--ivory`, `--paper`, `--champagne`, `--ink`, `--muted` and `--hairline` working until all consumers migrate.

Use the approved visual rules:

```css
:root {
  --surface-page: var(--color-surface);
  --surface-paper: var(--color-paper);
  --surface-elevated: var(--theme-card-surface);
  --text-primary: var(--color-ink);
  --text-heading: var(--color-brand-strong);
  --text-muted: var(--color-muted);
  --line-subtle: var(--color-border);
  --accent-primary: var(--color-brand);
  --accent-detail: var(--color-accent);
}
```

- [ ] **Step 2: Normalize the shared shape, focus and motion rules.**

Create or update shared rules for `diary-shell`, content containers, editorial sections, image frames, focus-visible outlines, active button feedback and reduced motion. Keep the page atmosphere fixed and pointer-events-none so texture does not trigger continuous repainting.

- [ ] **Step 3: Refine the shared button contract.**

In `buttonClassName`, keep `primary`, `secondary`, `quiet` and `danger`, add `whitespace-nowrap`, visible focus, `active:scale-[0.98]` or `active:translate-y-px`, and remove transform transitions under reduced motion. Do not change props or button type defaults.

- [ ] **Step 4: Keep route transitions readable and motion-safe.**

Update `PageTransition` and related CSS so forward, back, fade and shared image transitions use only opacity and transform. Ensure the existing transition type names remain unchanged.

- [ ] **Step 5: Run the shared tests and lint.**

Run:

```bash
rtk test
rtk npm run lint
```

Expected: existing auth/button tests pass and no new lint errors are introduced.

---

## Task 3: Recompose the public shell and navigation

**Files:**
- Modify: `src/components/app-header.tsx`
- Modify: `src/features/catalogue/presentation/cinematic-diary-intro.tsx`
- Modify: `src/features/catalogue/presentation/cinematic-diary-scene.ts`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `ActiveActor`, active section values, existing navigation hrefs and theme attributes.
- Produces: one responsive public shell with the real `Điều Em Yêu` wordmark, active navigation and a usable mobile navigation treatment.

- [ ] **Step 1: Refactor the header hierarchy without changing links.**

Keep `/`, `/#collection`, `/hanh-trinh`, `/thu-hen-ngay-mo` and `/admin` hrefs exactly as they are. Make the desktop header one line at 1024px and above, with a compact brand block, active link treatment and Owner state only when applicable.

- [ ] **Step 2: Add an explicit mobile fallback.**

Below 768px, use a compact header with the wordmark and a clearly labeled or icon-labeled menu control. Keep every current destination reachable, maintain a visible focus target and prevent the nav from wrapping into an accidental second desktop row.

- [ ] **Step 3: Turn the opening intro into a restrained scene transition.**

Keep `CinematicDiaryIntro` and `CinematicDiaryScene` as presentation islands. The opening scene must not block content for users with reduced motion, must not add fake status text and must preserve the actual site brand.

- [ ] **Step 4: Verify the public shell at desktop and mobile widths.**

Check 390px and 1024px manually in the running app. Expected: no clipped nav, no horizontal overflow, active section remains obvious and the hero can begin without a layout jump.

---

## Task 4: Rebuild catalogue discovery as an editorial collection

**Files:**
- Modify: `src/features/catalogue/presentation/catalogue-home.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-chapter-rail.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-search.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-pagination.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-featured-item-card.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-item-card.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-item-image.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `CatalogueCategory`, `CatalogueItemPage`, selected category/query/page props and existing item links.
- Produces: an asymmetrical split hero, chapter index, featured editorial spread, exact-count image rhythm and explicit mobile stack.

- [ ] **Step 1: Recompose the home hero around one visual focal point.**

Keep the current title and supporting copy unless content review requires a small grammar fix. Limit the hero to one eyebrow, one two-line headline, one short paragraph and one primary action. Use the first real catalogue image where available and preserve the empty image fallback when it is not.

- [ ] **Step 2: Replace equal card repetition with a controlled masonry rhythm.**

Use CSS Grid with explicit desktop column spans and an exact number of rendered cells. Do not introduce placeholder cells. On screens below 768px, stack all cells in document order and preserve each image aspect ratio.

- [ ] **Step 3: Refine chapter navigation and search controls.**

Keep category links and URL-driven search behavior unchanged. Style the chapter rail as an editorial index, use horizontal overflow only for the mobile category strip, and keep labels readable above controls.

- [ ] **Step 4: Make featured and standard item cards distinct.**

The featured item gets the large image-led spread. Standard items use open spacing and image ratio variation. Keep `href`, `transitionTypes`, alt text, item title, summary and price label behavior unchanged.

- [ ] **Step 5: Implement empty, loading and no-result states in the same visual system.**

Keep the existing actor-aware copy and search query behavior. Use a composed empty surface with one clear next action for Owner where one exists. Do not add fake catalogue content.

- [ ] **Step 6: Run relevant catalogue tests and lint.**

Run:

```bash
rtk test
rtk npm run lint
```

Expected: catalogue query behavior and existing tests remain unchanged.

---

## Task 5: Rebuild catalogue detail and engagement

**Files:**
- Modify: `src/features/catalogue/presentation/catalogue-detail.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-detail-hero.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-keepsake-collection.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-engagement-panel.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-item-image.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `CatalogueItemDetail`, `ItemEngagementView`, actor permissions and existing engagement actions.
- Produces: an editorial detail spread and shared-notebook engagement area without changing data mutation behavior.

- [ ] **Step 1: Implement the two-column detail spread.**

Keep the back link and route. Use a large portrait image frame beside the story column. Preserve the no-image fallback, `ViewTransition` name and image alt source. At `< 768px`, use a single-column flow with the image before the story.

- [ ] **Step 2: Separate story, metadata and keepsakes by hierarchy.**

Keep only real metadata fields. Use sparse dividers and open spacing rather than nested boxes. Keep the existing external link targets and labels.

- [ ] **Step 3: Reframe ratings and comments as a shared notebook.**

Preserve every server action, actor check, edit/delete path, confirmation state and feedback string. Improve labels, textarea contrast, button hierarchy, inline feedback and author layout. Keep comments readable at 320px without action controls colliding with timestamps.

- [ ] **Step 4: Verify the engagement interaction contract.**

Exercise rating save/delete, comment create/edit/delete, validation error and pending state manually. Run the existing test suite after the visual changes.

---

## Task 6: Rebuild the relationship timeline

**Files:**
- Modify: `src/features/timeline/presentation/relationship-timeline.tsx`
- Modify: `src/features/timeline/presentation/timeline-chapter-card.tsx`
- Modify: `src/features/timeline/presentation/timeline-featured-chapter.tsx`
- Modify: `src/features/timeline/presentation/timeline-film-controls.tsx`
- Modify: `src/features/timeline/presentation/timeline-response-panel.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `TimelineEntry`, actor permissions, existing film viewport ID and response actions.
- Produces: a filmstrip-inspired desktop timeline with a clear vertical mobile fallback.

- [ ] **Step 1: Recompose the timeline header and featured memory.**

Keep the page title and core meaning. Use one calm opening scene, one featured chapter and a short supporting paragraph. Remove repeated eyebrow decoration where it does not add navigation value.

- [ ] **Step 2: Refine chapter frame hierarchy.**

Keep date, title, story, lesson, image and response content. Use varied image treatment and a single visual rhythm line. Preserve semantic `ol`, `article`, `time`, focus behavior and accessible region labels.

- [ ] **Step 3: Make film controls keyboard-safe and responsive.**

Keep the current viewport ID and control behavior. At mobile widths, replace the forced horizontal presentation with one-column chapters and visible previous/next controls only when they remain meaningful.

- [ ] **Step 4: Verify timeline and response states.**

Check empty timeline, Owner management link, response create/edit/delete and reduced motion. Run lint and tests.

---

## Task 7: Rebuild future letters as a correspondence ritual

**Files:**
- Modify: `src/features/future-letters/presentation/future-letters-experience.tsx`
- Modify: `src/features/future-letters/presentation/future-letter-composer.tsx`
- Modify: `src/features/future-letters/presentation/future-letter-opening-card.tsx`
- Modify: `src/features/future-letters/presentation/scheduled-letter-list.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `FutureLetter`, `FutureLetterRecord`, existing composer state and server actions.
- Produces: sealed-letter composer, correspondence archive and reduced-motion opening ritual.

- [ ] **Step 1: Recompose the page opening without fake counters.**

Use the envelope visual and one primary action. Keep the real scheduled/opened counts only where they help a user understand state; do not present them as decorative metrics. Preserve the current open-composer behavior.

- [ ] **Step 2: Restyle the composer without changing fields or validation.**

Keep title, content, date, time, image, alt text and music URL fields in their current order. Put labels above inputs, maintain helper/error text below fields and keep the existing `dialog` lifecycle and server action.

- [ ] **Step 3: Replace generic letter cards with archive rows and one featured entry.**

Keep edit/delete permissions, confirmation behavior, countdown calculation and feedback. Use a large featured sealed letter followed by sparse correspondence rows. Preserve all buttons and labels.

- [ ] **Step 4: Keep the opening ritual meaningful and safe.**

Use the existing envelope/seal elements and CSS animation hooks. Ensure the reveal communicates the transition from sealed to opened, cleans up effects and becomes immediate for reduced motion.

- [ ] **Step 5: Exercise all letter states.**

Verify empty, scheduled, opened, editing, pending, validation error, delete confirmation and opened-letter reader states. Run lint and tests.

---

## Task 8: Rebuild auth, loading, error and theme maintenance surfaces

**Files:**
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/access-denied/page.tsx`
- Modify: `src/app/error.tsx`
- Modify: `src/app/loading.tsx`
- Modify: `src/components/theme/theme-maintenance-screen.tsx`
- Modify: `src/features/site-theme/presentation/theme-scene-transition-progress.tsx`
- Modify: `src/app/layout.tsx` only if metadata or theme loading behavior needs presentation adjustments

**Interfaces:**
- Consumes: existing Google OAuth action, error/reset props, maintenance theme state and transition progress.
- Produces: branded entrance and system states with clear recovery actions and no auth behavior change.

- [ ] **Step 1: Recompose login around one calm focal point.**

Keep Google OAuth as the only sign-in action. Preserve callback behavior, accessibility labels and error handling. Use the existing brand name and a real visual treatment without introducing credentials forms.

- [ ] **Step 2: Make access denied, error and loading states compositional.**

Keep current recovery links and reset behavior. Use skeleton geometry for loading, direct copy for errors and an obvious route back for access denied.

- [ ] **Step 3: Restyle theme maintenance without changing transition semantics.**

Keep target theme, progress data and transition timing. Ensure motion is reduced when requested and the screen remains readable at 320px.

- [ ] **Step 4: Verify anonymous and failure states.**

Exercise login render, OAuth failure messaging, access denied render, thrown error reset and loading fallback. Run relevant identity tests, lint and build.

---

## Task 9: Rebuild the admin shell and catalogue workspace

**Files:**
- Modify: `src/components/admin/admin-workspace-header.tsx`
- Modify: `src/components/admin/admin-workspace-switcher.tsx`
- Modify: `src/features/catalogue/presentation/admin-catalogue.tsx`
- Modify: `src/features/catalogue/presentation/admin-catalogue-sidebar.tsx`
- Modify: `src/features/catalogue/presentation/admin-item-list.tsx`
- Modify: `src/features/catalogue/presentation/admin-item-editor.tsx`
- Modify: `src/features/catalogue/presentation/admin-category-editor.tsx`
- Modify: `src/features/catalogue/presentation/item-keepsake-editor.tsx`
- Modify: `src/features/catalogue/presentation/admin-catalogue-feedback.ts`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: existing managed catalogue models, admin feedback type, server actions and workspace routes.
- Produces: a usable editorial CMS shell and responsive catalogue editor without changing Owner behavior.

- [ ] **Step 1: Make the workspace shell compact and stable.**

Keep workspace hrefs and active keys. Make the header one clear row on desktop, allow intentional horizontal scrolling only for the mobile workspace strip and preserve focus/current-page semantics.

- [ ] **Step 2: Recompose the catalogue list.**

Keep search, category selection, item selection and row actions. Use real thumbnails, sparse dividers, concise metadata and clear status text. Do not invent analytics summary numbers.

- [ ] **Step 3: Recompose the item and category editors.**

Keep all fields, server actions, image alt behavior, validation and cancel/save paths. Use a large image preview beside labeled fields on desktop and one column below 768px. Make the action area visible without covering content.

- [ ] **Step 4: Verify catalogue admin behavior.**

Exercise select item, create item, edit item, category editor, keepsake editor, image fallback, validation failure and success/error feedback. Run tests and lint.

---

## Task 10: Rebuild timeline, theme and letter admin surfaces

**Files:**
- Modify: `src/features/timeline/presentation/admin-timeline.tsx`
- Modify: `src/features/timeline/presentation/admin-timeline-list.tsx`
- Modify: `src/features/timeline/presentation/admin-timeline-editor.tsx`
- Modify: `src/features/site-theme/presentation/admin-site-theme.tsx`
- Modify: `src/features/site-theme/presentation/theme-scene-picker.tsx`
- Modify: `src/features/site-theme/presentation/theme-schedule-form.tsx`
- Modify: `src/features/site-theme/presentation/theme-schedule-list.tsx`
- Modify: `src/features/site-theme/presentation/theme-scene-transition-progress.tsx`
- Modify: `src/features/future-letters/presentation/admin-future-letters.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: existing managed timeline, site-theme and future-letter models, form actions and Owner-only page guards.
- Produces: consistent admin editorial desk surfaces for all remaining workspaces.

- [ ] **Step 1: Apply one admin shell rhythm to timeline management.**

Keep draft/publication state, ordering and editor actions. Use a sparse list with a clear selected entry and a focused editor layout. Preserve all date and story field contracts.

- [ ] **Step 2: Apply the token system to theme management.**

Keep scene picker values, schedule form fields, automatic/manual behavior and transition progress. Make theme previews visually legible and consistent without adding custom per-user themes.

- [ ] **Step 3: Apply the token system to admin future letters.**

Keep open/delete/management actions and existing role restrictions. Use the same correspondence language as the member archive, with denser controls appropriate for Owner work.

- [ ] **Step 4: Verify all admin workspaces.**

Check desktop and mobile widths, selected state, save/publish/delete feedback, empty lists and validation states. Run lint, tests and build.

---

## Task 11: Browser QA, accessibility and performance verification

**Files:**
- Modify: `tests/e2e/visual-surface-smoke.spec.ts` only if the configured environment supports authenticated test data
- Modify: presentation files only for defects found during QA
- Read: `docs/superpowers/specs/2026-07-27-full-web-visual-overhaul-design.md`

**Interfaces:**
- Consumes: all completed presentation tasks and configured Supabase/auth test environment.
- Produces: evidence that the approved visual contract works across the required routes and viewport sizes.

- [ ] **Step 1: Run the full static verification suite.**

Run:

```bash
rtk npm run lint
rtk test
rtk next build
```

Expected: all commands pass. If a pre-existing failure remains, record its exact command and output before claiming completion.

- [ ] **Step 2: Start the configured app and inspect the public surfaces.**

Run:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Inspect `/`, `/catalogue/<visible-slug>`, `/hanh-trinh` and `/thu-hen-ngay-mo` at 320, 390, 768, 1024 and 1440px. Verify no overflow, overlap, clipped copy, broken image frame or CTA wrapping.

- [ ] **Step 3: Inspect auth, system and admin surfaces.**

Inspect `/login`, `/access-denied`, an error state, the loading fallback and every `/admin` workspace in the configured test environment. Verify keyboard focus, active navigation, labels above inputs, inline errors, pending states and recovery links.

- [ ] **Step 4: Verify motion and contrast.**

Test normal motion and `prefers-reduced-motion: reduce`. Check that route transitions, timeline movement and letter opening still communicate hierarchy or state change without jank. Check primary, secondary, quiet and danger buttons, inputs, placeholders, helper text and error text for readable contrast.

- [ ] **Step 5: Review image and performance behavior.**

Confirm hero and above-the-fold images reserve space and use the appropriate `next/image` loading priority. Confirm no fixed grain layer sits on a scrolling container and no animation changes layout properties. Inspect the browser console for hydration, image, key and accessibility errors.

- [ ] **Step 6: Review the final diff boundary.**

Run:

```bash
rtk git status --short --untracked-files=all
rtk git diff --stat
rtk git diff --check
```

Expected: only scoped presentation, style, tests and documentation changes are present. Do not stage or commit without user instruction.

---

## Execution checkpoints

- Checkpoint A after Task 2: shared tokens, buttons and transitions render without regressions.
- Checkpoint B after Task 4: homepage and catalogue show the approved visual direction at desktop and mobile.
- Checkpoint C after Task 7: all member experiences use the same editorial system and their interactions remain intact.
- Checkpoint D after Task 10: admin is visually coherent and still practical.
- Checkpoint E after Task 11: verification evidence is complete and the diff is in scope.
