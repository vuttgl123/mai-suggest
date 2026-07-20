# Bordeaux Diary Frontend Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mock-driven home page with an elegant, real-data catalogue foundation in the Bordeaux Diary visual language.

**Architecture:** The App Router page owns one request-scoped backend request and passes serializable read models to presentational components. The new feature UI owns responsive layout and states; it never queries Supabase or synthesizes catalogue data.

**Tech Stack:** Next.js App Router Server Components, TypeScript strict, Tailwind CSS v4, existing Next fonts, Lucide React, existing typed backend use cases.

## Global Constraints

- Use data returned by the existing backend only; no mock records, placeholder catalogue cards, or local business data.
- No Client Component Supabase call, database/RLS/Storage change, secret, commit, or push.
- Preserve current Google-only login and active/inactive access behaviour.
- Do not add automated tests in this slice per the user's instruction. Verify with TypeScript/build and browser QA at 320, 390, 768, 1024, and 1440 pixels.

---

### Task 1: Design tokens and shared primitives

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/ui/button.tsx`
- Create: `src/components/app-header.tsx`

**Produces:** Bordeaux Diary colour/spacing/radius/shadow tokens, a matching
button surface, and a responsive authenticated header.

- [ ] Replace the legacy compatibility-first colour values with bordeaux,
  porcelain, blush, ink, and accessible focus tokens while retaining aliases
  needed by untouched components.
- [ ] Apply the control radius, button hover, and focus treatment to the shared
  button primitive.
- [ ] Render an accessible brand link, collection link, identity chip, and
  owner label from `ActiveActor`; use CSS wrapping rather than a client menu.

### Task 2: Real-data catalogue presentation

**Files:**
- Create: `src/features/catalogue/presentation/catalogue-home.tsx`
- Create: `src/features/catalogue/presentation/catalogue-item-card.tsx`

**Consumes:** `CatalogueCategory`, `CatalogueItemSummary`, and `ActiveActor`.

**Produces:** an editorial hero, category navigation, responsive real-data
grid, card, and no-data state.

- [ ] Link category filters to `/?category=<slug>` and provide a clear route
  back to the complete collection.
- [ ] Render item title, category-derived context, summary, price label, and
  real primary image only when supplied by the backend.
- [ ] Render a graceful no-image surface and a distinct owner hint when there
  are no items; never add synthetic catalogue content.

### Task 3: Server page and route states

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/loading.tsx`
- Create: `src/app/error.tsx`

**Consumes:** `createServerBackend`, `resolveActivePageAccess`, and public
catalogue use cases.

**Produces:** a one-client, parallel real-data page request with loading and
retryable failure UI.

- [ ] Parse one optional category query parameter, resolve access from the
  already-created backend, and redirect with existing rules.
- [ ] Fetch categories and items in `Promise.all`; throw only for an unexpected
  read result so Next's error boundary handles it.
- [ ] Return the feature catalogue presentation and remove the legacy
  `getPreferenceData`/`PreferenceCatalogue` dependency from the home route.

### Task 4: Login and browser QA

**Files:**
- Modify: `src/app/login/page.tsx`

- [ ] Restyle the login shell with the same visual tokens, editorial copy, and
  responsive proportions without changing Google OAuth behaviour.
- [ ] Run TypeScript/build and inspect login/home at 320, 390, 768, 1024, and
  1440 px for overflow, focus, reduced motion, empty data, and error state.
