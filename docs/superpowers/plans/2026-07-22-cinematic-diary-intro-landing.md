# Cinematic Diary Intro Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking. Project convention prohibits subagent delegation unless the user explicitly requests it.

**Goal:** Turn the opening of `/` into a responsive Three.js journal ritual that opens with natural scroll before handing off to the existing catalogue.

**Architecture:** Keep the existing home page as a Server Component that fetches its current data. Add a self-contained Client intro with semantic overlay/fallback markup; it dynamically imports a small Three.js scene factory only after mount, so no Three.js/Supabase boundary crosses into catalogue data. The scene renders only procedural primitives and cleans itself up when it is no longer visible.

**Tech Stack:** Next.js App Router, React, TypeScript strict, Tailwind CSS, native CSS, Three.js, existing Lucide React and CSS theme tokens.

## Global Constraints

- Preserve the existing root route, authentication/access check, catalogue queries, category filters, pagination, links, `#collection`, View Transitions, timeline, future letters, theme schedules, Supabase/RLS, and routes.
- Add only the runtime package `three` and its development-only TypeScript declarations `@types/three`; do not add react-three-fiber, Drei, GLTF/model loaders, post-processing, an image/model asset, a remote request, audio, video, tracking, scroll lock, or a database change.
- The journal uses core Three.js primitives only: covers, spine, pages, brass strips, light, shadow plane, and a bounded dust field. Do not use a downloaded or generated bitmap/model.
- Initial intro view shows no `AppHeader`; put the existing header immediately after the intro, before the existing collection content.
- Canvas is decorative and inaccessible; semantic title, description, and `#collection` link stay in DOM and work without JavaScript/WebGL.
- WebGL rendering is Client-only and dynamically imported after mount; cap device pixel ratio at `1.5`, pause when offscreen/hidden, and dispose all GPU resources on unmount.
- Reduced motion, unavailable WebGL 2, or dynamic-import failure uses the static CSS journal fallback; do not show an error state for decoration.
- Use `apply_patch`; do not create a commit or branch. The user asked to skip tests, lint, build, type-check, and browser QA; use source/diff checks only and state that boundary accurately.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `package.json` / `package-lock.json` | Adds `three` plus development-only `@types/three` declarations. |
| `src/features/catalogue/presentation/cinematic-diary-scene.ts` | Client-only dynamic Three.js scene factory, progress/pointer API, resize/render lifecycle, and GPU disposal. |
| `src/features/catalogue/presentation/cinematic-diary-intro.tsx` | Semantic Client intro markup, CSS-fallback state, capability checks, passive scroll/pointer handling, observer lifecycle, and dynamic scene loading. |
| `src/features/catalogue/presentation/catalogue-home.tsx` | Places intro before header and preserves all current catalogue markup/data below it. |
| `src/app/globals.css` | Intro composition, sticky canvas, text phase transitions, static journal fallback, responsive breakpoints, and reduced-motion rules. |

### Task 1: Add Three.js and isolate the procedural scene boundary

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/features/catalogue/presentation/cinematic-diary-scene.ts`

**Interfaces:**

- Produces `createCinematicDiaryScene(canvas, palette): CinematicDiaryScene`.
- `CinematicDiaryScene` exposes `setProgress(progress: number)`, `setPointer(x: number, y: number)`, `setActive(isActive: boolean)`, `resize(width: number, height: number)`, and `dispose()`.
- `CinematicDiaryPalette` carries computed CSS color strings: `accent`, `brand`, `brandStrong`, `paper`, and `surface`.

- [x] **Step 1: Add the runtime dependency and its TypeScript declarations.**

  Run:

  ```bash
  npm install three
  ```

  Confirm `package.json` places `three` under `dependencies` and let npm update
  the lockfile. Do not add wrapper or loader packages.

- [x] **Step 2: Define the narrow scene interface and procedural journal factory.**

  Create `cinematic-diary-scene.ts` with direct Three imports and these exported
  types/signature:

  ```ts
  import * as THREE from "three";

  export interface CinematicDiaryPalette {
    accent: string;
    brand: string;
    brandStrong: string;
    paper: string;
    surface: string;
  }

  export interface CinematicDiaryScene {
    dispose(): void;
    resize(width: number, height: number): void;
    setActive(isActive: boolean): void;
    setPointer(x: number, y: number): void;
    setProgress(progress: number): void;
  }
  ```

  Export `createCinematicDiaryScene(canvas: HTMLCanvasElement,
  palette: CinematicDiaryPalette): CinematicDiaryScene` from the same file.

  Build the journal with these fixed core meshes: a `book` root group; rear
  cover/spine boxes; a `frontHinge` group whose front cover and brass edge strip
  have their local origin at the spine; seven thin paper boxes; a transparent
  `PlaneGeometry` shadow; and a `Points` field with at most 42 vertices. Use one
  ambient, one directional, and one point light. Use transparent canvas renderer
  with antialiasing, `SRGBColorSpace`, `setPixelRatio(Math.min(devicePixelRatio,
  1.5))`, and no texture/model load.

- [x] **Step 3: Map state to a physically coherent bounded render loop.**

  Store target and rendered values for progress/pointer; on each active animation
  frame use a fixed easing factor, not React state. Clamp progress to `0..1`, then
  use it for `frontHinge.rotation.z`, page rotations/offsets, camera z/y,
  directional-light intensity, and journal tilt. Apply only a low-amplitude time
  drift before progress reaches the handoff. `setActive(false)` cancels the frame;
  `setActive(true)` starts exactly one frame loop.

  Render loop shape:

  ```ts
  function render(now: number) {
    if (!isActive) return;
    frameId = window.requestAnimationFrame(render);
    renderedProgress += (targetProgress - renderedProgress) * 0.09;
    frontHinge.rotation.z = -0.04 - renderedProgress * 1.5;
    camera.position.lerpVectors(closedCamera, openCamera, renderedProgress);
    renderer.render(scene, camera);
  }
  ```

  Keep all mesh and material references in local collections. `dispose()` must
  stop the loop, dispose every geometry/material, call `renderer.dispose()`, and
  clear the renderer context.

- [x] **Step 4: Source-check bundle and lifecycle boundaries.**

  Run:

  ```bash
  rg -n 'from "three"|createCinematicDiaryScene|setActive|setProgress|setPointer|dispose\(' package.json src/features/catalogue/presentation/cinematic-diary-scene.ts
  ```

  Expected: only `cinematic-diary-scene.ts` has a static Three import; it exports
  the complete lifecycle API; no GLTF, texture, post-processing, or additional
  3D library appears.

### Task 2: Build the semantic landing controller with reliable fallbacks

**Files:**

- Create: `src/features/catalogue/presentation/cinematic-diary-intro.tsx`

**Interfaces:**

- Consumes `createCinematicDiaryScene` through a dynamic import and the CSS
  classes created in Task 3.
- Produces `<CinematicDiaryIntro />` with canvas enhancement, normal DOM copy,
  and a regular collection link.
- Does not receive props, query data, actor data, or communicate with Supabase.

- [x] **Step 1: Render the stable semantic fallback first.**

  Create a `"use client"` component whose SSR/client markup always contains:

  ```tsx
  <section className="cinematic-diary-intro" ref={sectionRef}>
    <div className="cinematic-diary-intro__stage">
      <canvas aria-hidden="true" className="cinematic-diary-intro__canvas" ref={canvasRef} />
      <div aria-hidden="true" className="cinematic-diary-intro__fallback" />
      <div className="cinematic-diary-intro__copy">
        <p className="diary-kicker">Một chương dành riêng cho hai người</p>
        <h1 className="font-display">Những điều làm em mỉm cười.</h1>
        <p>Một nơi nhỏ để gìn giữ những lựa chọn đẹp đẽ và những ngày thường trở nên đặc biệt.</p>
        <a href="#collection">Khám phá chương đầu <span aria-hidden="true">↓</span></a>
      </div>
    </div>
  </section>
  ```

  The canvas has no focus or screen-reader role. Keep copy visible even if no
  scene is ready; toggle `data-scene-ready="true"` on the section only after
  successful scene creation so CSS can gently fade the fallback behind the canvas.

- [x] **Step 2: Add capability, scroll, pointer, and visibility orchestration.**

  In one mount effect, return immediately for
  `matchMedia("(prefers-reduced-motion: reduce)").matches` or when
  `document.createElement("canvas").getContext("webgl2")` is null. Otherwise
  dynamically import the scene factory:

  ```ts
  const { createCinematicDiaryScene } = await import(
    "@/features/catalogue/presentation/cinematic-diary-scene"
  );
  ```

  Read palette values with `getComputedStyle(document.body).getPropertyValue(...)`.
  Register a passive scroll listener that computes:

  ```ts
  const bounds = section.getBoundingClientRect();
  const range = Math.max(section.offsetHeight - window.innerHeight, 1);
  scene.setProgress(Math.min(1, Math.max(0, -bounds.top / range)));
  ```

  During the same update, set
  `section.style.setProperty("--diary-intro-progress", String(progress))` so CSS
  copy phases follow the exact same scroll progress. Add pointer parallax only when
  `matchMedia("(hover: hover) and (pointer: fine)").matches`; normalize pointer
  coordinates to `-1..1`, then call `setPointer`. Add a `ResizeObserver` that
  calls `scene.resize`, an `IntersectionObserver` that calls `setActive`, and a
  `visibilitychange` handler that deactivates the scene while the document is
  hidden. Keep the current intersection boolean so a successfully imported scene
  immediately receives its correct `setActive` state. Use a `cancelled` flag so a
  late import after unmount calls `dispose` immediately.

- [x] **Step 3: Guarantee cleanup and no layout-state re-render loop.**

  Effect cleanup removes every listener/observer and calls `scene.dispose()` once
  if present. Do not put scroll progress in React state; the scene API owns it.
  The only React state is the boolean that marks successful scene readiness and
  controls fallback visibility. Maintain a normal static fallback if dynamic
  import or renderer construction throws.

- [x] **Step 4: Source-check accessibility and client isolation.**

  Run:

  ```bash
  rg -n 'use client|aria-hidden|href="#collection"|prefers-reduced-motion|webgl2|IntersectionObserver|ResizeObserver|visibilitychange|import\(' src/features/catalogue/presentation/cinematic-diary-intro.tsx
  ```

  Expected: intro is the only Client controller; it has a semantic link, a
  decorative canvas, both capability fallbacks, and cleanup-relevant observers.

### Task 3: Compose the landing into the existing home and give it editorial polish

**Files:**

- Modify: `src/features/catalogue/presentation/catalogue-home.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**

- Consumes `<CinematicDiaryIntro />` from Task 2 without passing catalogue data.
- Produces the order `skip link → intro → AppHeader → existing main/catalogue`.
- Preserves existing `#main-content` and `#collection` destinations.

- [x] **Step 1: Insert landing before the existing header without changing data flow.**

  In `catalogue-home.tsx`, import and render `CinematicDiaryIntro` directly after
  the current skip link. Move the unchanged `<AppHeader ... />` immediately after
  it, leaving all existing `main`, current hero, `#collection`, collection rail,
  View Transition, pagination, and empty state markup unchanged. The resulting
  semantic order is:

  ```tsx
  <div className="diary-shell">
    <a href="#main-content">Đi tới nội dung chính</a>
    <CinematicDiaryIntro />
    <AppHeader activeSection="catalogue" actor={actor} />
    <main id="main-content" tabIndex={-1}>...</main>
  </div>
  ```

  Do not change server fetching, props, actor conditions, category calculations,
  `ViewTransition` configuration, or current visible collection copy.

- [x] **Step 2: Add the cinematic stage and static journal CSS.**

  Add namespaced `.cinematic-diary-intro*` rules to `globals.css`:

  - parent uses `min-height: 155svh` and reserves regular document scroll;
  - stage is `position: sticky; top: 0; min-height: 100svh; overflow: clip`;
  - canvas and fallback are absolute inset layers with `pointer-events: none`;
  - fallback draws a CSS book silhouette with Bordeaux cover, ivory page block,
    brass edge, paper shadow, and scene-token lighting; it visibly remains when
    `data-scene-ready` is absent;
  - copy has a constrained readable width and three opacity/transform phases
    keyed from the section `--diary-intro-progress` custom property. The Client
    controller sets this property during the same passive scroll update;
  - canvas readiness fades fallback opacity only, never hides semantic copy;
  - collection link has a visible focus state and correct hover/touch behavior.

  Use the existing `--color-*`, `--theme-*`, `--shadow-*`, and display font
  tokens. Do not use a hard-coded raster URL or a global `transition: all`.

- [x] **Step 3: Add small-screen and reduced-motion variants.**

  At maximum `639px`, set the intro to `125svh`, reduce copy scale/spacing, show
  the static book at a smaller size, and do not depend on pointer effects. Inside
  the existing reduced-motion media query, set intro/stage height to content-fit
  bounds, hide the canvas, reveal the fallback in a settled open-book state, and
  disable its transforms/transitions. This ensures the collection anchor and
  header remain promptly reachable.

- [x] **Step 4: Source-check home composition and visual constraints.**

  Run:

  ```bash
  rg -n 'CinematicDiaryIntro|AppHeader|main-content|id="collection"' src/features/catalogue/presentation/catalogue-home.tsx
  rg -n 'cinematic-diary-intro|prefers-reduced-motion|155svh|125svh|data-scene-ready' src/app/globals.css
  ```

  Expected: intro precedes header; collection anchor remains; all intro styles are
  namespaced; responsive and reduced-motion fallback selectors are present.

### Task 4: Perform the allowed source-only handoff checks

**Files:**

- Modify: no files expected
- Inspect: `package.json`, `package-lock.json`, all files in the File Structure table

**Interfaces:**

- Consumes the dependency declaration, dynamic scene boundary, semantic intro,
  existing home integration, and CSS fallback.
- Produces source/diff evidence only; it does not claim package-install success,
  WebGL rendering, browser behavior, accessibility audit, test, lint, type-check,
  or build success.

- [x] **Step 1: Inspect the approved source scope.**

  Run:

  ```bash
  git diff --name-only -- package.json package-lock.json src/features/catalogue/presentation src/app/globals.css
  git status --short -- src/features/catalogue/presentation/cinematic-diary-intro.tsx src/features/catalogue/presentation/cinematic-diary-scene.ts
  ```

  Expected: only the dependency, intro/scene presentation, existing home, and
  global CSS paths occur; newly created components remain uncommitted.

- [x] **Step 2: Check whitespace and forbidden-scope markers.**

  Run:

  ```bash
  git diff --check
  rg -n 'GLTFLoader|TextureLoader|Audio|Supabase|use server|fetch\(' src/features/catalogue/presentation/cinematic-diary-intro.tsx src/features/catalogue/presentation/cinematic-diary-scene.ts
  ```

  Expected: whitespace check has no output; forbidden terms have no matches;
  Three remains isolated from data/backend behavior.

- [x] **Step 3: State the verification boundary accurately.**

  Report source/diff evidence. State that no visual/browser, reduced-motion
  device, WebGL, test, lint, build, or type-check verification was run under the
  user’s standing instruction. Do not claim runtime rendering success.
