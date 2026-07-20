# DDD Engagement and Catalogue Administration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add DDD application services and Supabase adapters for engagement and owner catalogue management on the existing schema.

**Architecture:** Each module keeps command/read models in domain, repository contracts and authorization/validation in application, and all PostgREST calls in infrastructure. The existing backend composition root owns wiring; RLS remains the final authorization boundary.

**Tech Stack:** Next.js App Router server runtime, TypeScript strict, `@supabase/supabase-js`, `@supabase/ssr`, Supabase Postgres/RLS.

## Global Constraints

- Use existing `allowed_users`, `ratings`, `comments`, `user_item_states`, `categories`, `items`, `item_images`, and `item_links` tables only.
- No database migration, policy change, service-role key, public API route, or UI integration.
- Do not commit or push changes.
- The user explicitly requested no test-first pause; add no new test files in this batch and perform verification only after implementation.

---

### Task 1: Complete typed Supabase schema coverage

**Files:**
- Modify: `src/lib/supabase/database.types.ts`

- [ ] Add `ratings`, `comments`, and `user_item_states` row types and enum
  `user_item_state`; keep timestamps, nullable fields, and unique-key columns
  aligned with `docs/database`.
- [ ] Add the `allowed_users` row type used by owner access-list management.

### Task 2: Implement the engagement DDD module

**Files:**
- Create: `src/modules/engagement/domain/engagement-models.ts`
- Create: `src/modules/engagement/application/engagement-repository.ts`
- Create: `src/modules/engagement/application/manage-item-engagement.ts`
- Create: `src/modules/engagement/infrastructure/supabase-engagement-repository.ts`

- [ ] Define typed state/rating/comment models and command inputs.
- [ ] Add active-actor authorization and validation helpers to one application
  service for reads, state/rating upsert/delete, and comment create/update/delete.
- [ ] Implement the repository with exact select columns, user-item upserts on
  `item_id,user_id`, ordered comment/rating reads, and owner-aware comment
  deletion.

### Task 3: Implement owner catalogue administration

**Files:**
- Create: `src/modules/catalogue/domain/catalogue-admin-models.ts`
- Create: `src/modules/catalogue/application/catalogue-admin-repository.ts`
- Create: `src/modules/catalogue/application/manage-catalogue.ts`
- Create: `src/modules/catalogue/infrastructure/supabase-catalogue-admin-repository.ts`

- [ ] Define category/item/image/link command models with only writable
  database fields.
- [ ] Add owner authorization and database-aligned validation to the
  application service.
- [ ] Implement targeted Supabase CRUD operations; set `created_by` only on
  initial category/item creation and use individual asset rows rather than
  replacement batches.

### Task 4: Compose services for the Next.js server runtime

**Files:**
- Modify: `src/lib/backend/create-server-backend.ts`

- [ ] Instantiate engagement and catalogue-admin adapters from the typed
  request-scoped client and expose their application services with existing
  identity and catalogue-read use cases.

### Task 5: Implement owner access-list administration

**Files:**
- Create: `src/modules/identity/domain/allowed-user.ts`
- Create: `src/modules/identity/application/allowed-user-repository.ts`
- Create: `src/modules/identity/application/manage-allowed-users.ts`
- Create: `src/modules/identity/infrastructure/supabase-allowed-user-repository.ts`
- Modify: `src/lib/backend/create-server-backend.ts`

- [ ] Define allowed-user read/command models and preserve the email primary
  key on update.
- [ ] Enforce active owner authorization, normalized lower-case email, a valid
  application role, and a boolean active status.
- [ ] Read and mutate only `allowed_users`; leave profile synchronization to
  the installed database trigger.

### Task 6: Batch verification

**Files:**
- Verify: all new backend files and existing project checks.

- [ ] Run `npx.cmd tsc --noEmit`, `npm.cmd test`,
  `npm.cmd run test:verify:supabase`, `npm.cmd run verify:supabase`,
  `npm.cmd run lint -- --ignore-pattern .next`, and `npm.cmd run build`.
- [ ] Manually verify RLS with anonymous, inactive, active member, and active
  owner accounts before wiring mutations into UI.
