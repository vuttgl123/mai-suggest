# Cinematic Diary Intro Landing Design

**Date:** 2026-07-22  
**Status:** Implemented with approved opening and extended-intro corrections; source/diff review only by user request

## Goal

Give the root route a memorable opening that feels like entering a private
editorial world rather than arriving directly at a catalogue. A Three.js journal
opens naturally as the visitor scrolls, then hands off without a route change to
the existing collection experience.

## Product Contract

- `/` remains the authenticated home route and keeps its existing catalogue data,
  category filtering, pagination, item cards, links, and access control.
- The new intro is a standalone landing section before the current collection.
  It does not replace the catalogue, timeline, or future letters.
- Initial view contains no global header or navigation. `AppHeader` appears only
  after the visitor has passed the intro and entered the collection content.
- The interaction is scroll-led, never scroll-jacking: normal page scrolling maps
  to the journal opening, and a regular anchor lets visitors skip directly to the
  collection.
- The journal is a procedural Three.js scene, not a downloaded model, stock image,
  remote texture, or generated bitmap. It keeps the Bordeaux Diary art direction
  and adapts to the existing resolved `body[data-theme]` tokens.

## Experience

The landing occupies a tall opening chapter (`155svh` on supported mobile
viewports; a `min-height` fallback elsewhere). Its canvas remains sticky while
the first part of the page scrolls beneath it.

1. **Closed volume — scroll 0%**: a thick Bordeaux journal floats at a slight
   angle above a soft paper shadow. A restrained brass rim, page block, and
   dimly moving dust create depth. The only copy is a small invitation and the
   title “Những điều làm em mỉm cười.”
2. **Opening movement — scroll 12–78%**: the camera eases closer; the front
   cover pivots from its spine, page layers fan subtly, and warm light crosses
   the paper. Overlay copy appears in a small editorial sequence. Motion follows
   scroll progress with easing and remains interruptible at every point.
3. **Handoff — scroll 78–100%**: the opened journal settles into a near-flat
   composition, the light becomes the existing page wash, and a quiet “Khám phá
   chương đầu” anchor leads to `#collection`. The following content begins with
   the normal header and current catalogue introduction; no fake loading screen,
   modal, route transition, or duplicate data request is used.

The effect should feel materially responsive, not like a generic rotating 3D
demo: floating drift is low amplitude, opening is bound to scroll, page motion
is slight, and all decorative activity fades behind readable text.

## Architecture

### Server and component boundaries

- `src/features/catalogue/presentation/catalogue-home.tsx` remains the Server
  Component responsible for the authenticated home layout and its already-loaded
  data. It places the intro before the collection shell and moves `AppHeader`
  below that intro.
- A small Client Component owns only the intro canvas, scroll mapping, capability
  detection, and DOM overlay. It receives no catalogue records and never queries
  Supabase.
- The Three.js scene is dynamically imported inside the Client Component after
  mount. The normal catalogue SSR response remains useful before JavaScript is
  available and does not include Three.js in its server-rendered content.
- Add the single runtime dependency `three`; do not add react-three-fiber, Drei,
  post-processing, a GLTF loader, an image asset, or another animation library.

### Scene composition

The canvas uses a transparent `WebGLRenderer` bound to an existing `<canvas>`.
The scene contains only low-complexity primitives:

- a root `Group` for journal position and tilt;
- separate spine-pivot groups for front cover and page block;
- core `BoxGeometry` meshes for the two covers and spine, plus a small fixed set
  of thin page meshes and brass edge strips;
- ambient, directional, and low-intensity point lights; a soft procedural shadow
  plane; and a small `Points` dust field;
- `MeshPhysicalMaterial` / `MeshStandardMaterial` values derived from the
  existing CSS scene variables, without textures.

Scroll progress is a clamped `0..1` value based on the intro section's document
position. It drives cover rotation, page spread, camera position, overlay phase,
and light intensity. Pointer movement may add a tiny parallax tilt only when a
fine pointer is available; it never changes opening progress.

### Rendering lifecycle and performance

- Clamp renderer pixel ratio to `min(devicePixelRatio, 1.5)` and size from a
  `ResizeObserver`.
- Use one `requestAnimationFrame` loop only while the intro is intersecting and
  the document is visible. Pause it after exit and on `visibilitychange`.
- Scroll and pointer listeners are passive where possible; they only store target
  values. The animation loop performs the eased transform updates and render.
- On unmount, cancel the animation frame, remove listeners/observers, dispose
  geometries, materials, and renderer, and remove any canvas-specific state.
- If WebGL 2 is unavailable, dynamic import fails, or reduced motion is enabled,
  render the same semantic intro with a static CSS journal silhouette, paper
  lighting, title, and collection anchor. No error UI is shown for a decorative
  enhancement.

## Accessibility and responsive behavior

- The title, description, and skip-to-collection anchor are normal HTML above
  the canvas; the canvas is `aria-hidden` and never takes focus.
- Preserve the existing skip link to `#main-content`; ensure `#collection`
  remains a valid in-page destination.
- `prefers-reduced-motion` shows an open, static journal and removes scroll-bound
  canvas animation and pointer parallax. The section remains the same height only
  as needed for readable copy, not as a decorative scroll trap.
- At `320–639px`, shrink book scale, use a shorter intro (`125svh`), remove
  pointer parallax, and keep copy within a single readable column. At tablet and
  desktop, keep the cinematic negative space without obscuring the title.
- Support keyboard and touch scrolling naturally. The collection anchor is a
  regular link, not a click handler on a non-interactive surface.

## Scope and non-goals

- Do not alter database schema, Supabase queries, RLS, authentication, theme
  schedule behavior, routes, catalogue filters, pagination, or existing page
  transitions.
- Do not introduce audio, autoplay video, remote image/model requests, custom
  theme input, user tracking, scroll locking, or a new visual theme key.
- Do not create a commit or branch.
- The user previously requested tests, lint, build, type-check, and browser QA be
  skipped unless explicitly reversed. Implementation therefore uses source/diff
  checks only and reports that boundary honestly.

## Acceptance criteria

- The first visit to `/` presents the cinematic journal intro before all current
  collection content, without global navigation in the opening viewport.
- Scrolling naturally opens the journal and hands off to the ordinary catalogue;
  clicking the accessible collection anchor reaches `#collection` immediately.
- The visual object has a cover, spine, page depth, soft shadow, and restrained
  lighting that respond to the existing active scene; no external image or model
  is loaded.
- The home catalogue retains all current server data behavior and remains visible
  and usable with JavaScript, WebGL, or motion disabled.
- One bounded Three.js renderer is client-only, dynamically loaded, paused off
  screen, and fully disposed on unmount.

## Opening correction — approved 2026-07-22

The initial implementation put the spine at the left edge but rotated the front
cover around its Z axis in the negative direction. That lowers its free edge
through the journal instead of lifting it, which makes the book appear to open
backwards. Its `1.48` radian endpoint also leaves the cover too upright.

The corrected motion keeps the same spine and scene structure, but rotates the
front cover in the positive direction toward the camera and lets it settle at
roughly `0.9π` radians (about 162 degrees). This ends in a near-flat open-book
pose rather than a vertical display. The page movement remains intentionally
subtle: smaller staggered lifts accompany the cover without making the page
block look like a fan or a separate animated object.

## Extended intro chapter — approved 2026-07-22

The intro becomes a three-act scroll sequence rather than a longer version of
the same motion. It uses `200svh` on desktop and `160svh` on mobile:

1. **Invitation (0–16%)** — the closed journal and opening title get a calm
   moment before any movement.
2. **Opening (16–72%)** — the corrected cover opens toward the camera; the
   pages respond only as a very small secondary movement.
3. **First page (72–90%)** — the cover is already settled. The camera moves a
   little higher and closer to the open spread while a single quiet line appears:
   “Có những điều đẹp nhất cần được mở thật chậm.”
4. **Handoff (90–100%)** — the new line and decorative scene fade back, leaving
   the ordinary header and catalogue as the next visual chapter.

No additional renderer, image, model, data request, or route is introduced.
