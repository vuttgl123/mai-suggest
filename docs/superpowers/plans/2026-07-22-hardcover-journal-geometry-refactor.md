# Hardcover Journal Geometry Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Project convention prohibits subagent delegation unless the user explicitly requests it.

**Goal:** Rebuild the procedural journal as a proportioned hardbound diary whose page stack and brass details remain physically contained by its covers.

**Architecture:** Preserve `createCinematicDiaryScene` and its render lifecycle. Refactor only its journal-construction constants and animation references: derive every vertical position from a packed hardcover stack, then replace free-floating brass details with two cover-mounted meshes.

**Tech Stack:** TypeScript, Three.js core `Group`, `BoxGeometry`, `MeshPhysicalMaterial`, and `MeshStandardMaterial`.

## Global constraints

- Change only `src/features/catalogue/presentation/cinematic-diary-scene.ts` plus this design record and plan.
- Keep the existing positive `Math.PI * 0.9` cover opening, camera phases, palette updates, renderer lifecycle, and public `CinematicDiaryScene` interface.
- The packed vertical values are fixed: rear cover top `-0.14`; paper-block bottom/top `-0.136`/`0.064`; page-stack top `0.1395`; front-cover lower surface `0.1475`.
- Use six page layers at `0.012` thickness and `0.0115` spacing. Do not add textures, models, loaders, data requests, CSS changes, or a second renderer.
- Do not create a commit or branch. The user asked to skip tests, lint, build, type-check, and browser QA; use source/diff review only.

---

### Task 1: Define a contained hardcover stack

**Files:**

- Modify: `src/features/catalogue/presentation/cinematic-diary-scene.ts` near journal construction and its page animation loop
- Modify: `docs/superpowers/specs/2026-07-22-cinematic-diary-intro-landing-design.md`

**Interfaces:**

- Preserves: `createCinematicDiaryScene(canvas, palette): CinematicDiaryScene`
- Preserves: `pages: THREE.Mesh[]` for the existing animation loop

- [x] **Step 1: Declare dimensions and derived placement values before building meshes.**

  ```ts
  const COVER_THICKNESS = 0.14;
  const PAGE_COUNT = 6;
  const PAGE_THICKNESS = 0.012;
  const PAGE_SPACING = 0.0115;
  const PAGE_START_Y = 0.076;
  const pageStackTop = PAGE_START_Y + (PAGE_COUNT - 1) * PAGE_SPACING + PAGE_THICKNESS / 2;
  const frontCoverY = pageStackTop + COVER_THICKNESS / 2 + 0.008;
  ```

  Use the values to construct the rear cover at `y=-0.21`, paper block at
  `y=-0.036`, and the front hinge at `frontCoverY`.

- [x] **Step 2: Rebuild pages and spine within the covers.**

  Use a `0.20`-thick paper block and six `0.012`-thick pages, positioned with
  `PAGE_START_Y + index * PAGE_SPACING`. Make the spine a `0.18 × 0.58 × 4.46`
  leather mesh centered at `(-1.56, 0, 0)` so it visually binds the complete
  stack. In the render loop, use that same page formula before adding the tiny
  idle offset. Keep closed pages at `rotation.z = 0`; apply any page rotation
  only after its scroll-driven `pageProgress` begins, so a page edge cannot
  pierce the closed front cover.

### Task 2: Replace floating brass with cover-mounted details

**Files:**

- Modify: `src/features/catalogue/presentation/cinematic-diary-scene.ts` at the front-hinge children

**Interfaces:**

- Preserves: `frontHinge` as the sole moving parent for every front-cover detail

- [x] **Step 1: Remove the front-edge bar and corner block.**

  Remove `brassBinding` and `brassCorner`, which sit above the front-cover
  surface in the current closed pose.

- [x] **Step 2: Add a low-profile plate and inset rule.**

  Add a `0.86 × 0.014 × 0.38` brass title plate at `(1.6, 0.077, 0.12)` and a
  `1.85 × 0.012 × 0.025` brass rule at `(1.6, 0.076, -1.5)`. Both remain
  children of `frontHinge` and sit flush on a `0.14`-thick front cover.

### Task 3: Perform the allowed source-only handoff check

**Files:**

- Review: scene, design record, and this plan

- [x] **Step 1: Verify the containment arithmetic and diff cleanliness.**

  Check that `0.1395 < 0.1475`, that all brass offsets are no greater than the
  front-cover top surface plus their half-height, then run `git diff --check`.
  Do not run test, lint, build, type-check, or browser QA.
