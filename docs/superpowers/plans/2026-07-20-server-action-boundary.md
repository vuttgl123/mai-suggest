# Server Action Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make existing DDD mutation use cases callable from future Next.js Client Components through safe Server Actions.

**Architecture:** A shared runner creates the request-scoped backend and resolves the actor once per action. Feature-owned `"use server"` modules only forward typed, serializable input to DDD use cases and revalidate the layout after successful writes.

**Tech Stack:** Next.js App Router Server Actions and cache invalidation, TypeScript strict, existing `@supabase/ssr` request-scoped client, Supabase RLS.

## Global Constraints

- No Route Handler, client UI integration, migration, RLS change, Storage operation, or service-role/secret key.
- Never receive an actor or user ID from a Client Component; resolve the actor on the server for every action.
- Retain the application's `Result<T>` transport result. Do not redirect from an action.
- Per the user's instruction, implement this backend batch before adding tests; verification occurs as one combined check afterwards.
- Do not commit or push.

---

### Task 1: Shared server-action runner

**Files:**
- Create: `src/lib/backend/run-server-action.ts`

**Consumes:** `createServerBackend(): Promise<Backend>` and `Result<CurrentActor>` from `getCurrentActor.execute()`.

**Produces:** `runServerAction<T>(operation: (backend, actor) => Promise<Result<T>>): Promise<Result<T>>` and `revalidateAfterMutation(result): Result<T>`.

- [ ] Create the runner, construct the backend inside its `try` block, and resolve the actor only through the composed identity use case.
- [ ] Return `UNEXPECTED_FAILURE` if backend construction or an adapter throws.
- [ ] Revalidate `"/"` with layout scope only when a command result is successful.

### Task 2: Member engagement actions

**Files:**
- Create: `src/modules/engagement/presentation/engagement-actions.ts`

**Consumes:** `runServerAction`, the composed `manageItemEngagement` use case, and each engagement input model.

**Produces:** six exported actions: state/rating upsert, rating deletion, comment create/update/delete.

- [ ] Mark the module with `"use server"`.
- [ ] Call the matching use case with the server-derived actor and the received serializable input.
- [ ] Revalidate only a successful mutation result.

### Task 3: Owner catalogue actions

**Files:**
- Create: `src/modules/catalogue/presentation/catalogue-admin-actions.ts`

**Consumes:** `runServerAction`, composed `manageCatalogue`, and catalogue category/item/image/link inputs.

**Produces:** twelve owner actions covering create, update, and delete for categories, items, images, and links.

- [ ] Forward each action to the single matching owner use case.
- [ ] Keep authorization out of the action: `ManageCatalogue` and RLS are the authoritative checks.
- [ ] Revalidate only successful commands.

### Task 4: Owner access-list actions

**Files:**
- Create: `src/modules/identity/presentation/allowed-user-actions.ts`

**Consumes:** `runServerAction`, composed `manageAllowedUsers`, and allowed-user create/update inputs.

**Produces:** three owner actions: create, update, and delete an allowed user.

- [ ] Keep email as a separate identifier for update/delete, preserving the database primary key semantics.
- [ ] Do not write `profiles`; the existing database trigger handles profile synchronization.
- [ ] Revalidate only successful commands.

### Task 5: Batch verification

**Files:**
- Verify: new action modules and all project checks.

- [ ] Run `npx.cmd tsc --noEmit`, `npm.cmd test`, `npm.cmd run lint -- --ignore-pattern .next`, and `npm.cmd run build`.
- [ ] With an active member, verify a state/comment/rating mutation changes only that member's row. With an owner, verify catalogue/access-list mutations. With anonymous and inactive users, verify actions return a failure result and RLS performs no write.
