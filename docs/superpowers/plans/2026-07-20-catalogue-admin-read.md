# Catalogue Administration Read Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add owner-only DDD query use cases for dashboard management of categories and items.

**Architecture:** Public and administrative reads use separate repository ports. The admin adapter shares canonical mapping functions with the write adapter, and use cases enforce active-owner access before RLS executes the query.

**Tech Stack:** TypeScript strict, Next.js server runtime, existing `@supabase/supabase-js` typed client, Supabase RLS.

## Global Constraints

- Keep public catalogue read models and behaviour unchanged.
- No UI, route, read Server Action, migration, RLS policy, Storage change, secret, commit, or push.
- Query with the request-scoped authenticated client; no service-role key.
- Per the user's instruction, implement before adding tests and verify in one batch afterwards.

---

### Task 1: Reuse catalogue-admin mapping functions

**Files:**
- Create: `src/modules/catalogue/infrastructure/catalogue-admin-mappers.ts`
- Modify: `src/modules/catalogue/infrastructure/supabase-catalogue-admin-repository.ts`

**Produces:** `toManagedCategory`, `toManagedItem`, `toManagedItemImage`, and
`toManagedItemLink` for both admin adapters.

- [ ] Move the four row-to-domain mapping functions and the metadata guard into
  the mapper module.
- [ ] Import them in the write adapter without changing its persistence calls.

### Task 2: Define the owner admin read port and use cases

**Files:**
- Create: `src/modules/catalogue/application/catalogue-admin-reader.ts`
- Create: `src/modules/catalogue/application/list-managed-categories.ts`
- Create: `src/modules/catalogue/application/list-managed-items.ts`
- Create: `src/modules/catalogue/application/get-managed-item-detail.ts`
- Modify: `src/modules/catalogue/domain/catalogue-admin-models.ts`
- Modify: `src/modules/identity/domain/current-actor.ts`
- Modify: `src/modules/catalogue/application/manage-catalogue.ts`
- Modify: `src/modules/identity/application/manage-allowed-users.ts`

**Produces:** `CatalogueAdminReader`, `ManagedCatalogueItemDetail`, and the
three active-owner query services.

- [ ] Define `listManagedCategories()`, `listManagedItems({ categoryId? })`,
  and `findManagedItemDetailById(itemId)` on a read-only port.
- [ ] Promote the repeated owner authorization branch into
  `requireCatalogueOwner`, then use it in all owner-only use cases. Return
  `VALIDATION_FAILED` for blank IDs.
- [ ] Compose the detail result from one item and its image/link collections;
  use `NOT_FOUND` only when the item query returns no row.

### Task 3: Supabase admin reader

**Files:**
- Create: `src/modules/catalogue/infrastructure/supabase-catalogue-admin-reader.ts`

**Consumes:** the read port and shared admin mappers.

**Produces:** exact-column PostgREST reads, category-filtered item listing, and
parallel image/link reads for detail.

- [ ] Select all managed category columns in `sort_order` then `name` order.
- [ ] Select all managed item columns in descending `created_at` order and add
  `category_id` equality only when a category criterion is supplied.
- [ ] Retrieve detail image/link collections in `Promise.all`, each in
  `sort_order` order, and map all values through the shared mappers.

### Task 4: Server composition

**Files:**
- Modify: `src/lib/backend/create-server-backend.ts`

- [ ] Instantiate the admin reader from the same request client.
- [ ] Expose `listManagedCategories`, `listManagedItems`, and
  `getManagedItemDetail` alongside existing use cases.

### Task 5: Batch verification

**Files:**
- Verify: all source files above.

- [ ] Run `npx.cmd tsc --noEmit`, `npm.cmd test`, `npm.cmd run lint -- --ignore-pattern .next`, and `npm.cmd run build`.
- [ ] With member/owner/inactive accounts, verify owner sees inactive and
  unpublished data while non-owners get application failure and RLS returns no
  management rows.
