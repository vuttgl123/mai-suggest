# Cinematic diary material reveal

## Status

Design direction approved by the user on 2026-07-27. Production code is not yet changed. This specification covers only the opening cinematic diary scene above the catalogue collection.

## Design read

This is a premium editorial opening for a private romantic diary. It should feel like opening a physical keepsake slowly, with believable material, one memorable reveal and a calm handoff into the collection.

## Current audit

The existing scene already has a useful scroll-driven structure, a Bordeaux palette, a WebGL capability check and a CSS fallback. The visual weakness is inside the Three.js scene:

- the cover, spine, page block and pages are mostly `BoxGeometry` primitives;
- the page stack only changes position and applies a very small rotation, so it does not read as a page turn;
- the cover has a brass plate and rule, but no embossed or tactile focal detail;
- the scene has dust and light, but no material reveal that gives those effects a narrative purpose;
- the fallback is a single flat cover shape and does not communicate an open spread;
- the existing scroll phases and `#collection` handoff should remain stable.

Reference studies:

- [Leather journal on Sketchfab](https://sketchfab.com/3d-models/leather-journal-18f2248f31e6497f8e8bd9fd517f0137) for the physical silhouette and leather treatment.
- [Page Curl / Book Turn WebGL](https://html-in-canvas.dev/demos/page-curl-book-turn/) for page bending and shadow behavior.
- [3D Books by Stripe Press](https://www.webgpu.com/showcase/3d-books-by-stripe-press/) for scroll-led book reveal and editorial presentation.
- [Interactive 3D Bookshop](https://discourse.threejs.org/t/interactive-3d-bookshop-experience/92446) for the idea of the book as an exploratory object.

These references are art-direction studies only. No external model is added to the production bundle. The production scene remains project-owned Three.js geometry so that licensing, loading and responsive behavior stay controlled.

## Goals

- Make the first catalogue moment feel physically crafted rather than illustrative.
- Preserve the existing Vietnamese copy, `#collection` anchor and scroll-driven narrative.
- Give the opening a clear sequence: closed keepsake, tactile opening, page reveal, reading pose and collection handoff.
- Keep the Bordeaux editorial language coherent with the rest of the site.
- Maintain graceful behavior on mobile, devices without WebGL and users who prefer reduced motion.
- Keep the scene self-contained in the existing client-side Three.js boundary.

## Non-goals

- No route, Supabase, data, auth or permission changes.
- No new catalogue content model or dependency for importing 3D assets.
- No full interactive book reader or arbitrary page navigation.
- No audio autoplay, cursor replacement or scroll hijacking.
- No change to the public brand name, copy hierarchy or collection information architecture.

## Visual direction

### Material language

The object is a Bordeaux leather diary with warm ivory paper, restrained copper foil and a small pressed-heart detail. The cover gets subtle edge variation and a low-gloss clearcoat. The page block has a warmer, irregular edge tone. The inside spread is quieter than the cover so the transition feels like opening into a private space.

The scene uses one primary object and a restrained supporting set:

1. rear cover and rounded spine;
2. page block with a small number of individually bendable sheets;
3. front cover on a hinge;
4. inner flyleaf and a small heart seal or pressed mark;
5. one quiet paper detail, such as a short ruled line or abstract handwritten mark, without pretending to be real catalogue data;
6. soft ground shadow, warm key light and a few dust motes used only during the reveal.

The object should remain readable at laptop size. Decorative elements must never compete with the headline or CTA.

### Composition

The opening starts with a three-quarter view, slightly offset from center so the spine and cover thickness are visible. During the opening, the camera rises and moves toward a readable spread. The object settles into a shallow top-down pose before the collection handoff.

The background remains the existing warm paper field with grain and Bordeaux atmosphere. It should gain a gentle localized light response as the book opens, not a generic neon glow.

## Scroll and motion specification

The existing section remains scroll-driven and keeps its four semantic phases:

| Progress | Scene behavior | Purpose |
| --- | --- | --- |
| 0.00-0.16 | Closed cover, quiet breathing motion, visible spine and foil detail | Establish the object and invite attention |
| 0.16-0.40 | Hinge releases, front cover opens with damped motion, inner paper begins to catch light | Communicate physical opening |
| 0.40-0.72 | One or two sheets bend across the spine with a real curve, page shadows move across the spread, heart mark appears | Deliver the memorable reveal |
| 0.72-0.90 | Camera settles into reading angle, dust slows, copy transitions to the reading line | Create a pause for emotional focus |
| 0.90-1.00 | Book lowers and de-emphasizes while the copy hands off toward `#collection` | Connect the cinematic intro to the catalogue |

Motion must communicate the act of opening and the transition into reading. Idle movement is limited to a very small object drift and pointer response while the scene is closed. No effect is added only for spectacle.

Implementation constraints:

- Use `BufferGeometry` with enough subdivisions for page curvature, updating vertex positions or a dedicated bend function from the rendered scroll progress.
- Keep the scene in the existing Three.js client island. Do not mix GSAP or a second animation loop into this component.
- Continue using damped values for scroll and pointer input so fast scroll does not snap the object.
- Animate transforms, material opacity/intensity and geometry attributes only where needed. Avoid DOM layout properties.
- Pause rendering when the section is not intersecting or the document is hidden.
- Keep the current WebGL2 check, renderer disposal and context cleanup.

Three.js's [BufferGeometry](https://threejs.org/docs/pages/BufferGeometry.html) and custom buffer attributes are appropriate for the bendable page mesh. `MeshPhysicalMaterial` can supply the cover's clearcoat, but its documented per-pixel cost means it should be limited to the small number of cover materials rather than applied to every page.

## Component and data boundaries

No public component API changes are required. `CinematicDiaryIntro` continues to own:

- the sticky scroll section;
- Motion's `useScroll` progress source;
- phase attributes used by CSS copy transitions;
- WebGL capability, visibility and intersection lifecycle;
- the CSS fallback and reduced-motion path.

`CinematicDiaryScene` continues to expose:

- `dispose()`;
- `resize(width, height)`;
- `setActive(isActive)`;
- `setPalette(palette)`;
- `setPointer(x, y)`;
- `setProgress(progress)`.

The scene implementation may split private geometry/material helpers inside the same file or into focused sibling modules if the file becomes difficult to reason about. The public interface stays stable.

## Fallback and accessibility

The CSS fallback is upgraded from a single flat cover to a quiet two-page spread with a front cover edge, a center crease and the same heart/foil visual language. It remains decorative and is paired with the existing semantic HTML copy.

For `prefers-reduced-motion: reduce`:

- WebGL canvas remains hidden;
- the fallback is static and fully visible;
- no scroll-dependent movement is required to understand the headline or CTA;
- the copy remains readable without waiting for a scene phase;
- the collection anchor remains a normal keyboard-operable link.

The canvas stays `aria-hidden`. All meaning remains in the existing heading, description, reading line and CTA. Pointer movement is enhancement only and never required.

## Responsive behavior

- At 1440px and 1024px, use the full three-quarter opening and readable spread.
- At 768px, reduce camera distance and dust count if needed, while preserving the same sequence.
- At 390px and 320px, use a tighter object scale, fewer page meshes and a more top-down camera so the book does not collide with the copy. The fallback must not overflow horizontally.
- Below the hover-capable pointer query, omit pointer tilt and keep only scroll progress.
- The first viewport must keep the headline and CTA legible. The book may move behind the copy but may not obscure it.

## Performance contract

- Keep the existing capped pixel ratio of 1.5 unless browser QA shows a lower mobile cap is needed.
- Prefer a small number of bendable page meshes over a large stack of individually animated boxes.
- Avoid external textures unless an actual asset is available and its loading cost is justified.
- Dispose all geometries and materials created by the scene.
- Verify that a WebGL failure still leaves a complete CSS experience.

## Acceptance criteria

- The closed state reads as a tactile leather diary, not a rectangular box.
- The front cover visibly opens around a spine hinge.
- At least one page visibly bends through the opening arc with a changing shadow, rather than only rotating as a flat slab.
- The reveal contains a restrained heart or pressed-mark detail and a clear reading pose.
- The final scene hands off naturally to the existing collection section and keeps the `#collection` anchor working.
- The CSS and reduced-motion fallback communicate the same story without WebGL.
- No horizontal overflow, copy overlap or unreadable CTA appears at 320, 390, 768, 1024 or 1440 px.
- The scene pauses outside the viewport, cleans up on unmount and respects document visibility.
- `rtk npm run lint`, relevant tests and `rtk next build` pass after implementation.
- Browser QA covers the intro in light and dark theme presets, pointer and non-pointer input, focus state and reduced motion.
- The final diff is limited to the cinematic intro scene, its presentation styles, this spec and any narrowly scoped tests. No commit is created without a separate user request.

## Implementation sequence

1. Capture a baseline of the current intro and confirm the dirty-worktree boundary.
2. Refactor private Three.js geometry and material helpers for the leather cover, spine, page bend and reveal detail.
3. Update the render timeline and camera choreography while preserving the existing public scene interface.
4. Replace the flat CSS fallback with a static two-page spread and align phase transitions.
5. Run lint, relevant tests and build.
6. Run browser QA at 320, 390, 768, 1024 and 1440 px, including reduced motion and theme states.
7. Review the diff and report any environment limitation that prevents an authenticated route from being exercised.
