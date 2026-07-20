# Owner Admin and Initial Catalogue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Seed the empty Supabase catalogue with nine curated records and let
the owner create or delete categories and items at `/admin`.

**Architecture:** A one-time server-only script writes the initial curated
records only to an empty database. A protected App Router page reads through the
existing DDD backend and delegates user mutations to owner-authorized Server
Actions, keeping secrets and Supabase queries out of Client Components.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS,
`@supabase/supabase-js`, existing DDD use cases and Server Actions.

## Global Constraints

- No migration, RLS, trigger, schema, profile-role or dashboard configuration change.
- `SUPABASE_SECRET_KEY` is read only by the one-time Node seed script and never
  copied into source, browser code or logs.
- Use only official source URLs for initial records; do not insert stock/mock images.
- `/admin` is owner-only in both the route and Server Actions.
- Do not add automated tests, commit or push.

---

### Task 1: Create and execute a guarded initial catalogue seed

**Files:**
- Create: `scripts/seed-initial-catalogue.mjs`.

**Interfaces:**
- Consumes `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SECRET_KEY` from
  `.env.local`.
- Writes only `categories`, `items` and `item_links`.
- Produces only aggregate count output.

- [ ] Query aggregate category and item counts; fail when either count is nonzero.
- [ ] Insert the three predefined categories, then nine items using their returned
  IDs, then their official website/shopping links.
- [ ] Print inserted aggregate counts and run a read-only count verification.

### Task 2: Add the owner-only admin route

**Files:**
- Create: `src/app/admin/page.tsx`.
- Create: `src/features/catalogue/presentation/admin-catalogue.tsx`.
- Modify: `src/components/app-header.tsx` to expose an Owner-only admin link.

**Interfaces:**
- Route consumes `createServerBackend()`, `getCurrentActor`,
  `listManagedCategories` and `listManagedItems`.
- Client component consumes `ManagedCatalogueCategory[]` and
  `ManagedCatalogueItem[]`.
- Client component calls `createCatalogueCategoryAction`,
  `createCatalogueItemAction`, `createCatalogueItemImageAction`,
  `createCatalogueItemLinkAction`, `deleteCatalogueCategoryAction` and
  `deleteCatalogueItemAction`.

- [ ] Redirect non-owner actors to `/access-denied` before querying management
  records.
- [ ] Render an owner dashboard that reads categories/items in parallel and
  serializes only read models to the client component.
- [ ] Add category and item forms with clear labels, native validation and inline
  action feedback.
- [ ] Create an optional image record and official source link after a successful
  item creation.
- [ ] Allow deleting items and only empty categories after browser confirmation.

### Task 3: Verify the data and admin handoff

**Files:**
- Review: `scripts/seed-initial-catalogue.mjs`, `src/app/admin/page.tsx`,
  `src/features/catalogue/presentation/admin-catalogue.tsx`.

**Interfaces:**
- `/` remains the public-in-app live catalogue; `/admin` is the owner manager.

- [ ] Confirm seeded aggregate counts and category/item slugs through a
  secret-safe read-only query.
- [ ] Ask the user to run TypeScript and production build with Node 24, then
  browser QA for create/delete as their Owner session.
