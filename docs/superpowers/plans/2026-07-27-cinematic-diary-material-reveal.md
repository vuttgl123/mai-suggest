# Cinematic Diary Material Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task with checkpoints. Do not use subagents or create a commit unless the user separately requests it.

**Goal:** Replace the current box-like Three.js book intro with a tactile Bordeaux leather diary reveal that uses a real page curl, a restrained pressed-heart detail and a calm handoff into the catalogue collection.

**Architecture:** Keep `CinematicDiaryIntro` as the client-side scroll and lifecycle boundary and keep `CinematicDiaryScene` as the public Three.js scene interface. Extract only the reusable bendable-page geometry math into a focused sibling module with pure geometry behavior that can be tested independently. Upgrade the CSS fallback to a static two-page spread so WebGL, mobile and reduced-motion states tell the same story.

**Tech Stack:** Next.js App Router, React, TypeScript strict, Three.js 0.185, Motion `useScroll`, CSS custom properties, Vitest, Playwright.

## Global Constraints

- Preserve the existing `CinematicDiaryScene` interface: `dispose`, `resize`, `setActive`, `setPalette`, `setPointer` and `setProgress`.
- Preserve the existing Vietnamese copy, section phases, `#collection` anchor, routes, Supabase boundaries and product brand **Điều Em Yêu**.
- Do not add a 3D asset dependency, external texture or audio autoplay.
- Use project-owned Three.js geometry; use `BufferGeometry` subdivisions for page curvature and `MeshPhysicalMaterial` only for the small number of cover materials.
- Keep the existing WebGL2 capability check, intersection pause, document visibility pause, renderer disposal and capped pixel ratio.
- Do not use `window.addEventListener('scroll')`, React state for continuous progress, GSAP or a second animation loop.
- Animate only transforms, opacity, light intensity and page vertex attributes. Avoid DOM layout-property animation.
- Respect `prefers-reduced-motion`; reduced motion must show a static fallback without requiring scroll to understand the content.
- Define the mobile fallback explicitly below 768px and verify 320, 390, 768, 1024 and 1440 px.
- Use `apply_patch` for source edits. Preserve all unrelated dirty-worktree changes. Do not commit.

## File Map

- Create: `src/features/catalogue/presentation/cinematic-diary-geometry.ts` for bendable page geometry creation and vertex updates.
- Create: `src/features/catalogue/presentation/cinematic-diary-geometry.test.ts` for deterministic geometry behavior tests.
- Modify: `src/features/catalogue/presentation/cinematic-diary-scene.ts` for the leather diary composition, page reveal, heart detail, camera choreography and palette updates.
- Modify: `src/features/catalogue/presentation/cinematic-diary-intro.tsx` for the structured CSS fallback markup only; keep the scroll and lifecycle API intact.
- Modify: `src/app/globals.css` for the fallback spread, phase states, mobile placement and reduced-motion static treatment.
- Read only during verification: `package.json`, `playwright.config.ts`, current dirty-worktree diff and the approved spec.

---

### Task 1: Establish a safe baseline for the focused refactor

**Files:**
- Read: `AGENTS.md`
- Read: `docs/superpowers/specs/2026-07-27-cinematic-diary-material-reveal-design.md`
- Read: `src/features/catalogue/presentation/cinematic-diary-intro.tsx`
- Read: `src/features/catalogue/presentation/cinematic-diary-scene.ts`
- Read: `src/app/globals.css`
- No source modification.

**Interfaces:**
- Consumes: approved material-reveal spec and the current dirty worktree.
- Produces: a recorded baseline and a confirmed list of overlapping files before edits.

- [ ] **Step 1: Confirm the focused dirty-worktree boundary.**

Run:

```bash
git status --short --untracked-files=all
git diff --stat -- src/features/catalogue/presentation/cinematic-diary-intro.tsx src/features/catalogue/presentation/cinematic-diary-scene.ts src/app/globals.css
```

Expected: existing changes are preserved; no reset, checkout, clean or delete command is run.

- [ ] **Step 2: Run focused baseline checks.**

Run:

```bash
npm run lint
npm test -- --run src/modules/catalogue/application/catalogue-use-cases.test.ts
```

Expected: record the current result before changing the scene. If the repository-wide lint includes the known generated artifact issue, keep the existing scoped ignore and document the failure instead of changing unrelated files.

- [ ] **Step 3: Confirm the existing public scene contract.**

Verify that `CinematicDiaryIntro` still imports only the `CinematicDiaryPalette` and `CinematicDiaryScene` types, dynamically imports `createCinematicDiaryScene`, and sends progress through `setProgress`. Verify that no data or server module is involved.

Expected: later tasks touch only the five files in this plan plus the new geometry test/module.

---

### Task 2: Add tested bendable-page geometry primitives

**Files:**
- Create: `src/features/catalogue/presentation/cinematic-diary-geometry.ts`
- Create: `src/features/catalogue/presentation/cinematic-diary-geometry.test.ts`

**Interfaces:**
- Consumes: Three.js `BufferGeometry` and the page dimensions used by the scene.
- Produces: `createBendablePageGeometry(options)` and `updateBendablePageGeometry(geometry, progress, options)` for the scene task.

- [ ] **Step 1: Write the failing geometry tests.**

Create tests with these exact behaviors:

```ts
import * as THREE from "three";
import { createBendablePageGeometry, updateBendablePageGeometry } from "./cinematic-diary-geometry";

describe("bendable diary pages", () => {
  it("creates a subdivided sheet with position and uv attributes", () => {
    const geometry = createBendablePageGeometry({
      width: 3,
      depth: 4,
      segmentsX: 12,
      segmentsZ: 8,
    });

    expect(geometry.getAttribute("position").count).toBe((12 + 1) * (8 + 1));
    expect(geometry.getAttribute("uv").count).toBe((12 + 1) * (8 + 1));
    geometry.dispose();
  });

  it("keeps the spine edge fixed while the far edge lifts during a curl", () => {
    const geometry = createBendablePageGeometry({ width: 3, depth: 4, segmentsX: 12, segmentsZ: 8 });
    const position = geometry.getAttribute("position");
    const spineX = position.getX(0);
    const spineY = position.getY(0);

    updateBendablePageGeometry(geometry, 0.7, { width: 3, maxAngle: Math.PI * 0.9 });

    expect(position.getX(0)).toBeCloseTo(spineX);
    expect(position.getY(0)).toBeCloseTo(spineY);
    expect(position.getY(12)).toBeGreaterThan(spineY);
    geometry.dispose();
  });

  it("clamps progress and restores the original flat sheet at zero", () => {
    const geometry = createBendablePageGeometry({ width: 3, depth: 4, segmentsX: 12, segmentsZ: 8 });
    const position = geometry.getAttribute("position");
    const originalFarX = position.getX(12);
    const originalFarY = position.getY(12);

    updateBendablePageGeometry(geometry, 2, { width: 3, maxAngle: Math.PI * 0.9 });
    updateBendablePageGeometry(geometry, -1, { width: 3, maxAngle: Math.PI * 0.9 });

    expect(position.getX(12)).toBeCloseTo(originalFarX);
    expect(position.getY(12)).toBeCloseTo(originalFarY);
    geometry.dispose();
  });
});
```

- [ ] **Step 2: Run the geometry tests and verify the expected failure.**

Run:

```bash
npm test -- --run src/features/catalogue/presentation/cinematic-diary-geometry.test.ts
```

Expected: FAIL because the new module and functions do not exist yet.

- [ ] **Step 3: Implement `createBendablePageGeometry`.**

Define:

```ts
export interface BendablePageOptions {
  width: number;
  depth: number;
  segmentsX: number;
  segmentsZ: number;
}

export interface BendablePageUpdateOptions {
  width: number;
  maxAngle: number;
}

export function createBendablePageGeometry(options: BendablePageOptions): THREE.BufferGeometry;
export function updateBendablePageGeometry(
  geometry: THREE.BufferGeometry,
  progress: number,
  options: BendablePageUpdateOptions,
): void;
```

Build a grid whose local `x` coordinate runs from the spine at `0` to the outer edge at `width`, whose `z` coordinate runs from `-depth / 2` to `depth / 2`, and whose original positions are stored in `geometry.userData.basePositions`. Add `position`, `uv`, triangle indices and computed normals. Keep all dimensions finite and clamp segment counts to at least 1.

- [ ] **Step 4: Implement the page arc update.**

For each vertex, clamp `progress` to `[0, 1]`, calculate the normalized distance from the spine, then use a circular arc in the `x/y` plane:

```ts
const totalAngle = Math.max(0.001, maxAngle * progress);
const radius = width / totalAngle;
const theta = totalAngle * normalizedX;
const x = radius * Math.sin(theta);
const y = radius * (1 - Math.cos(theta));
```

Use the stored `z` coordinate unchanged, update the position attribute, set `needsUpdate = true` and call `computeVertexNormals()`. When progress is zero, copy the stored flat coordinates exactly. Do not mutate the stored base array.

- [ ] **Step 5: Run the geometry tests and the full unit suite.**

Run:

```bash
npm test -- --run src/features/catalogue/presentation/cinematic-diary-geometry.test.ts
npm test
```

Expected: the three geometry tests pass and existing tests remain green.

---

### Task 3: Rebuild the Three.js diary composition and reveal timeline

**Files:**
- Modify: `src/features/catalogue/presentation/cinematic-diary-scene.ts`
- Read: `src/features/catalogue/presentation/cinematic-diary-geometry.ts`

**Interfaces:**
- Consumes: the geometry helpers from Task 2 and the existing `CinematicDiaryPalette`.
- Produces: the same `CinematicDiaryScene` interface with a more physical scene and the approved scroll choreography.

- [ ] **Step 1: Replace the flat cover primitives with a material hierarchy.**

Keep the existing `journal` group, lights, renderer lifecycle and palette inputs. Replace the cover meshes with rounded or beveled project-owned geometry, keeping the same hinge axis at the left spine. Use:

```ts
new THREE.MeshPhysicalMaterial({
  color: brandStrong,
  roughness: 0.5,
  metalness: 0.02,
  clearcoat: 0.22,
  clearcoatRoughness: 0.58,
});
```

Use `MeshStandardMaterial` for page surfaces and page edges. Keep brass/copper material limited to the foil rule, heart mark and hinge detail. Register every created geometry and material in the existing disposal arrays.

- [ ] **Step 2: Add the open-spread page structure.**

Create a small number of bendable page meshes from `createBendablePageGeometry`, with their local spine edge aligned to the book hinge. Keep one quieter left flyleaf and one or two right sheets that curl during the reveal. Use `DoubleSide` on the page material only where required for the visible turn. Do not create a large page stack or load external page textures.

- [ ] **Step 3: Add the pressed-heart reveal detail.**

Create a small heart-shaped `THREE.Shape`, convert it to a shallow `ExtrudeGeometry`, and attach it to the reading spread as a copper/pressed mark. Keep it hidden or very low opacity before the reading phase. Add a short ruled line or abstract paper mark using thin project-owned geometry, without adding fake catalogue data or visible system metadata.

- [ ] **Step 4: Replace the current animation math with semantic progress bands.**

Keep the existing phase boundaries from `CinematicDiaryIntro` and derive scene-only values:

```ts
const coverProgress = THREE.MathUtils.smoothstep(renderedProgress, 0.16, 0.42);
const pageRevealProgress = THREE.MathUtils.smoothstep(renderedProgress, 0.32, 0.72);
const readingProgress = THREE.MathUtils.smoothstep(renderedProgress, 0.72, 0.9);
```

Use them as follows:

- `coverProgress`: rotate the front hinge from nearly closed to the open reading angle around the spine;
- `pageRevealProgress`: call `updateBendablePageGeometry` for the turning sheet, lift the heart mark and reveal the inner paper detail;
- `readingProgress`: move the camera toward the shallow top-down reading pose, lower dust movement and settle the book;
- `renderedProgress < 0.16`: allow only a very small damped idle drift and pointer response;
- `renderedProgress >= 0.9`: reduce object emphasis so the existing copy can hand off to `#collection`.

Keep `THREE.MathUtils.damp` for scroll and pointer values. Do not add a new animation loop, DOM scroll listener or React state.

- [ ] **Step 5: Update camera and lighting for the reveal.**

Keep separate closed, open and reading camera positions. Interpolate closed to open with `coverProgress`, then open to reading with `readingProgress`. Add a localized warm light response tied to `pageRevealProgress`, with a bounded intensity. Tie dust opacity and movement to the reveal so dust supports the page opening instead of running as unrelated decoration.

- [ ] **Step 6: Make palette changes cover every new object.**

Extend `setPalette` to update cover, spine, paper, page edge, copper, heart mark, shadow, dust and light colors. Keep all fallback values aligned with the existing `CinematicDiaryPalette` fields. Confirm the method remains safe when a theme mutation occurs while the scene is active.

- [ ] **Step 7: Run lint, geometry tests and a production build.**

Run:

```bash
npm run lint
npm test
npm run build
```

Expected: no TypeScript, Three.js disposal or lint errors; the scene remains dynamically imported and the build emits the existing catalogue route.

---

### Task 4: Replace the CSS fallback with a static two-page spread

**Files:**
- Modify: `src/features/catalogue/presentation/cinematic-diary-intro.tsx:162-164`
- Modify: `src/app/globals.css:1897-1948, 2072-2131`

**Interfaces:**
- Consumes: the existing `data-phase` and `data-scene-ready` attributes.
- Produces: a WebGL-independent visual that communicates closed cover, inner spread and heart/foil detail without requiring motion.

- [ ] **Step 1: Add semantic decorative fallback layers.**

Replace the empty fallback `div` with an `aria-hidden` decorative structure:

```tsx
<div aria-hidden="true" className="cinematic-diary-intro__fallback">
  <span className="cinematic-diary-intro__fallback-spread">
    <span className="cinematic-diary-intro__fallback-crease" />
    <span className="cinematic-diary-intro__fallback-mark" />
  </span>
  <span className="cinematic-diary-intro__fallback-cover" />
</div>
```

Keep all meaning in the existing heading, descriptions and CTA. No visible copy is added to the fallback.

- [ ] **Step 2: Style the fallback as a layered paper object.**

Use the current Bordeaux tokens to create a spread with two ivory pages, a centered crease, a copper mark and a front cover edge. Use `transform-style: preserve-3d`, one warm tinted shadow and the existing paper atmosphere. Keep the fallback behind the copy and preserve the current `data-scene-ready` fade when WebGL takes over.

- [ ] **Step 3: Add explicit phase and responsive states.**

At `opening`, let the cover edge rotate or lift slightly. At `reading`, expose the spread and mark. At `handoff`, lower opacity and scale so the collection transition remains calm. Below 640px, reduce the spread width, move it higher in the stage and protect the copy/CTA area. Do not use horizontal overflow or `h-screen`.

- [ ] **Step 4: Verify the reduced-motion path.**

Under `@media (prefers-reduced-motion: reduce)`, hide the canvas, show the fallback at a stable angle, disable transforms/transitions and keep the copy fully readable. Ensure the fallback itself is not the only source of meaning.

- [ ] **Step 5: Run lint and unit tests after the JSX/CSS edit.**

Run:

```bash
npm run lint
npm test
```

Expected: no JSX accessibility or CSS-related lint regressions and all existing tests remain green.

---

### Task 5: Verify responsive, accessibility and performance behavior

**Files:**
- Read: `src/features/catalogue/presentation/cinematic-diary-intro.tsx`
- Read: `src/features/catalogue/presentation/cinematic-diary-scene.ts`
- Read: `src/app/globals.css`
- No additional source changes unless a scoped defect is found.

**Interfaces:**
- Consumes: the implemented diary reveal and the approved acceptance criteria.
- Produces: fresh lint, test, build and browser evidence for the focused refactor.

- [ ] **Step 1: Start the local app and capture the intro at all required widths.**

Run:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Use Playwright or the existing browser workflow to inspect 320, 390, 768, 1024 and 1440 px. At each width check the closed state, mid-scroll opening, reading pose and handoff. Expected: no clipping, copy overlap, horizontal overflow or CTA loss.

- [ ] **Step 2: Check interaction and accessibility states.**

At 1024px and 1440px, move the pointer over the stage and confirm the tilt is subtle and returns smoothly. Tab to the CTA and confirm the focus ring is visible. At a non-hover pointer profile, confirm the scene still follows scroll without pointer tilt. Confirm the canvas is `aria-hidden` and the CTA remains a native anchor to `#collection`.

- [ ] **Step 3: Check reduced motion and theme mutation.**

Run the intro with `prefers-reduced-motion: reduce` enabled and inspect the static fallback. Toggle the existing theme attribute and confirm the scene palette updates without throwing or leaving a stale color on the heart, cover, paper or lights.

- [ ] **Step 4: Check lifecycle and performance behavior.**

Scroll the intro out of view, switch tabs and unmount/reload the page. Confirm rendering pauses outside the viewport or while hidden, and that no recurring errors appear in the browser console. Confirm no WebGL context or resize errors appear on reload.

- [ ] **Step 5: Run the required final checks.**

Run:

```bash
npm run lint
npm test
npm run build
git diff --check -- src/features/catalogue/presentation/cinematic-diary-geometry.ts src/features/catalogue/presentation/cinematic-diary-geometry.test.ts src/features/catalogue/presentation/cinematic-diary-scene.ts src/features/catalogue/presentation/cinematic-diary-intro.tsx src/app/globals.css docs/superpowers/specs/2026-07-27-cinematic-diary-material-reveal-design.md docs/superpowers/plans/2026-07-27-cinematic-diary-material-reveal.md
```

Expected: lint, tests and build pass. If `git diff --check` reports pre-existing mixed line endings outside the focused files, report that separately and do not normalize unrelated files. No commit is created.

- [ ] **Step 6: Review the final focused diff against the spec.**

Confirm the diff contains only the new geometry helper/test, the cinematic scene, its intro fallback/CSS, and the approved spec/plan. Verify that no route, data, auth, Supabase or unrelated global behavior changed.
