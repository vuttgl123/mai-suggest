# Retire Legacy Mock Catalogue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove every unused JSON/mock preference catalogue path so the app
only reads catalogue business data from Supabase.

**Architecture:** Keep the already-routed server-rendered `CatalogueHome` and
DDD modules unchanged. Delete the self-contained legacy feature tree and its
JSON assets; no compatibility adapter or seed data is retained.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Supabase DDD
application modules.

## Global Constraints

- Do not modify Supabase schema, RLS, migrations, credentials or production data.
- Do not add mock records, fixtures or automated tests.
- Preserve `src/features/catalogue/presentation`, `src/modules`, `src/core`,
  authentication and the shared Button.
- Do not commit or push changes; the user controls Git integration.

---

### Task 1: Remove JSON-backed catalogue inputs and scripts

**Files:**
- Delete: `public/data/preferences.json`, `public/data/site.json`, and all files
  under `public/data/categories/`.
- Delete: `scripts/build-catalogue.mjs`, `scripts/check-image-metadata.mjs`.
- Modify: `package.json` to remove `check:images`.

**Interfaces:**
- Removes the former `getPreferenceData()` input surface; no routed page imports it.
- Leaves `verify:supabase` intact as the supported connection verification command.

- [ ] Delete only the public JSON catalogue assets and the two scripts that read
  or generate them.
- [ ] Remove the dangling `check:images` package script.

### Task 2: Remove the unused client mock feature tree

**Files:**
- Delete: `src/types/preference.ts`, `src/lib/get-preference-data.ts`,
  `src/lib/preference-validation.ts`, `src/lib/catalogue-layout.ts`,
  `src/lib/selection-email.ts`, `src/lib/selection-text.ts`.
- Delete: `src/features/catalogue/components/`, `src/features/catalogue/hooks/`,
  `src/features/catalogue/lib/catalogue-query.ts`.
- Delete: `src/features/selection/`.
- Delete: `src/hooks/use-dialog-lifecycle.ts`, `src/hooks/use-product-page-size.ts`.

**Interfaces:**
- Removes `PreferenceData`, selection-localStorage state and comparison/filter
  UI models that were only consumed by the JSON catalogue.
- Preserves `src/features/catalogue/presentation/`, whose inputs are the typed
  `CatalogueCategory` and `CatalogueItemSummary` read models.

- [ ] Delete the self-contained modules after confirming no production import
  from the routed Supabase UI depends on them.

### Task 3: Remove legacy presentation-only components

**Files:**
- Delete: legacy components under `src/components/`:
  `category-note.tsx`, `category-tabs.tsx`, `confirm-dialog.tsx`,
  `data-error-state.tsx`, `decorative-elements.tsx`, `hero-section.tsx`,
  `loading-catalogue.tsx`, `mobile-selection-bar.tsx`, `preference-card.tsx`,
  `preference-catalogue.tsx`, `preference-grid.tsx`,
  `product-message-dialog.tsx`, `selection-progress.tsx`, `smart-image.tsx`,
  `toast.tsx`.
- Delete: unused legacy UI primitives under `src/components/ui/`:
  `dialog.tsx`, `filter-chip.tsx`, `form-control.tsx`, `icon-button.tsx`.

**Interfaces:**
- Preserves `src/components/app-header.tsx` and `src/components/ui/button.tsx`.
- The home route continues to render only the new server component catalogue.

- [ ] Remove only components whose production imports are confined to Tasks 1–2.

### Task 4: Verify no mock path survives

**Files:**
- Review: `src/app/page.tsx`, `src/features/catalogue/presentation/`,
  `package.json`.

**Interfaces:**
- The root route queries `createServerBackend()` and accepts only live
  `CatalogueCategory` and `CatalogueItemSummary` data.

- [ ] Search source and package scripts for `getPreferenceData`, `PreferenceData`,
  `public/data`, and `build-catalogue`; confirm no production references remain.
- [ ] Ask the user to run `npx.cmd tsc --noEmit` and `npm.cmd run build` with
  Node 24 on Windows. Expected: both commands exit successfully.
