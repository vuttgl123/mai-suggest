# Client Delivery Performance Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Project convention prohibits subagent delegation unless the user explicitly requests it.

**Goal:** Reduce initial client delivery and offscreen rendering work without changing data behavior.

**Architecture:** Replace the per-image client state boundary with static native image markup, code-split forms that are conditional by design, and apply CSS containment only to independent offscreen/decorative surfaces. Keep all server data and public interfaces intact.

**Tech Stack:** Next.js App Router, React, `next/dynamic`, native image loading, CSS containment.

## Global constraints

- Do not change Supabase clients, queries, schema, migrations, RLS, auth, Server Actions, routes, or dependencies.
- Preserve image box dimensions (`4:5`), `loading="lazy"`, `decoding="async"`, width, height and alt text.
- Keep `CatalogueItemImage` call sites and View Transition names unchanged.
- Dynamically load only `FutureLetterComposer` and `ThemeScheduleForm`; do not defer visible primary content or the Three.js scene.
- Preload each dynamic module from the existing interaction that opens it.
- Do not create a commit or branch. The user asked to skip tests, lint, build, type-check, and browser QA; use source/diff review only.

---

### Task 1: Remove per-card image hydration and defer offscreen card paint

**Files:**

- Modify: `src/features/catalogue/presentation/catalogue-item-image.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-item-card.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-featured-item-card.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**

- Preserves: `CatalogueItemImageProps { src: string; alt: string }`
- Preserves: existing item-image View Transition names

- [x] **Step 1: Make image markup server-rendered.**

  Remove the client directive, React hooks, events and Lucide fallback from
  `CatalogueItemImage`. Keep one reserved wrapper with:

  ```tsx
  <img alt={alt} className="absolute inset-0 h-full w-full object-cover" decoding="async" height={1000} loading="lazy" src={src} width={800} />
  ```

- [x] **Step 2: Add containment hooks.**

  Add `catalogue-item-card` and `catalogue-featured-item-card` to the existing
  root links. Add CSS:

  ```css
  .catalogue-item-card { content-visibility: auto; contain-intrinsic-size: auto 31rem; }
  .catalogue-featured-item-card { content-visibility: auto; contain-intrinsic-size: auto 38rem; }
  ```

  Add `contain: paint` to `.theme-atmosphere` without changing animations.

### Task 2: Code-split initially closed forms

**Files:**

- Modify: `src/features/future-letters/presentation/future-letters-experience.tsx`
- Modify: `src/features/site-theme/presentation/admin-site-theme.tsx`

**Interfaces:**

- Preserves: current composer/form props, actions, validation and refresh behavior
- Produces: interaction-reusable loaders for both dynamic modules

- [x] **Step 1: Dynamically load the future-letter composer.**

  Replace its static import with a module loader and dynamic component:

  ```tsx
  const loadFutureLetterComposer = () => import("@/features/future-letters/presentation/future-letter-composer").then((module) => module.FutureLetterComposer);
  const FutureLetterComposer = dynamic(loadFutureLetterComposer, { ssr: false });
  ```

  Call the loader before create/edit state updates, preload it on hover/focus for
  both existing create buttons, and render the composer only when open.

- [x] **Step 2: Dynamically load the theme schedule form.**

  Use the same loader pattern for `ThemeScheduleForm`. Invoke it before
  `setShowComposer(true)` from the new-schedule button and `startEditing`.
  Keep the existing conditional JSX and props.

### Task 3: Perform the allowed source-only handoff check

**Files:**

- Review: all modified files and this plan

- [x] **Step 1: Verify delivery boundaries and diff cleanliness.**

  Confirm that the image component has no client directive/hooks/events, both
  form imports occur only inside loader functions, `ssr: false` stays inside
  Client Components, and all containment styles exist. Run `git diff --check`.
  Do not run test, lint, build, type-check, or browser QA.
