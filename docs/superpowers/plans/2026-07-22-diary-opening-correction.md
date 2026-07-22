# Diary Opening Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Project convention prohibits subagent delegation unless the user explicitly requests it.

**Goal:** Correct the journal cover direction and turn the opening into a longer three-act scroll sequence ending on a first-page reading moment.

**Architecture:** Keep the existing procedural scene and its public interface unchanged. Revise its progress-to-transform mapping so the cover opening and later reading pose use separate progress ranges, then expose the reading phase through the existing Client intro's data attribute and semantic overlay.

**Tech Stack:** TypeScript, Three.js core math and meshes.

## Global constraints

- Modify only the existing intro scene, controller/CSS, and design record; do not change data flow, Supabase, routing, or dependencies.
- The spine remains at the left edge and the cover remains its child; correct the direction by changing the rotation sign, not by mirroring the whole journal.
- The final cover pose is about `0.9π` radians positive, so it reads as an opened book rather than a vertical signboard.
- Keep page motion lower-amplitude than the cover motion and do not add geometry, textures, models, or a new renderer loop.
- Intro scroll length is `200svh` on desktop and `160svh` on mobile. It uses invitation (0–16%), opening (16–72%), first-page reading (72–90%), and handoff (90–100%) phases.
- Do not create a commit or branch. The user asked to skip tests, lint, build, type-check, and browser QA; use source/diff review only.

---

### Task 1: Correct the procedural opening pose and add the reading camera beat

**Files:**

- Modify: `src/features/catalogue/presentation/cinematic-diary-scene.ts` in the animation loop and camera setup
- Modify: `docs/superpowers/specs/2026-07-22-cinematic-diary-intro-landing-design.md`

**Interfaces:**

- Preserves: `CinematicDiaryScene.setProgress(progress: number): void`
- Preserves: `frontHinge`, `pages`, and the current renderer/lifecycle interface

- [x] **Step 1: Define the corrected progress mapping.**

  Replace the negative partial cover rotation with a positive near-flat rotation:

  ```ts
  const openingProgress = THREE.MathUtils.smoothstep(renderedProgress, 0.16, 0.72);
  const readingProgress = THREE.MathUtils.smoothstep(renderedProgress, 0.72, 0.9);
  const openingAngle = Math.PI * 0.9;
  frontHinge.rotation.z = THREE.MathUtils.lerp(0.015, openingAngle, openingProgress);
  ```

  Keep the closed value just above zero so the cover does not visually clip into
  the page stack at the start.

- [x] **Step 2: Reduce the secondary page motion and keep a late camera movement.**

  Retain the existing fixed pages and use their stagger only as a subtle lift:

  ```ts
  const pageProgress = THREE.MathUtils.clamp((openingProgress - index * 0.08) * 1.35, 0, 1);
  page.rotation.z = (index - 3) * 0.002 + pageProgress * (0.006 + index * 0.001);
  ```

  Interpolate from the existing open camera position to a slightly closer,
  higher reading camera only with `readingProgress`. This cannot reverse the
  cover direction because it changes the camera only after the cover has settled.

- [x] **Step 3: Review the permitted source scope.**

  Run `git diff --check` and inspect the changed transform mapping plus the
  design correction. Do not run test, lint, build, type-check, or browser QA.

### Task 2: Extend the semantic scroll chapter

**Files:**

- Modify: `src/features/catalogue/presentation/cinematic-diary-intro.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**

- Preserves: `CinematicDiaryIntro` public use in `catalogue-home.tsx`
- Produces: one additional `reading` value for the section `data-phase`

- [x] **Step 1: Add the reading phase and semantic line.**

  Map `0.72–0.9` to `data-phase="reading"` and add the normal DOM copy:

  ```tsx
  <p className="cinematic-diary-intro__reading-line">
    Có những điều đẹp nhất cần được mở thật chậm.
  </p>
  ```

- [x] **Step 2: Give the added phase visual space.**

  Set the outer intro to `min-height: 200svh` and its mobile variant to
  `160svh`. Keep the new reading line hidden outside its phase, then fade it in
  without obscuring the open journal; use the existing handoff fade after `90%`.

### Task 3: Perform the allowed source-only handoff check

**Files:**

- Review: the files above and this plan

- [x] **Step 1: Review the permitted source scope.**

  Run `git diff --check` and inspect the opening direction, phase thresholds,
  responsive heights, semantic reading line, and changed documentation. Do not
  run test, lint, build, type-check, or browser QA.
