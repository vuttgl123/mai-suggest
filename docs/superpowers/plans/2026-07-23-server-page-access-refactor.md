# Server Page Access Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate repeated server-page actor and Owner access guards without changing route behavior, UI, queries, caching, or Supabase/RLS policy.

**Architecture:** A small server-only backend helper creates the backend, resolves the current actor, and performs the existing redirect decisions. A second helper adds the existing catalogue-Owner check. Protected pages start this access promise alongside route params, then retain their own query and rendering logic.

**Tech Stack:** Next.js App Router, TypeScript strict, `next/navigation`, Supabase-backed server backend.

## Global Constraints

- Keep all existing route URLs, JSX, page props, loading order of actor-dependent queries, and error messages.
- Do not change Supabase queries, schema, migrations, RLS, Auth, Server Actions, route handlers, cache policy, or Client Components.
- Do not change visuals, styles, animation, transition, image loading, or form behavior.
- Do not create a commit or branch.
- Do not run tests, lint, type checks, builds, browser QA, or performance commands; source and diff review only.

---

## File structure

| Path | Responsibility |
| --- | --- |
| `src/lib/backend/require-page-access.ts` | Server-only access context and Owner guard, returning the existing backend with an allowed actor. |
| `src/app/page.tsx` | Uses the active-member helper while resolving search params in parallel. |
| `src/app/catalogue/[slug]/page.tsx` | Uses the active-member helper while resolving route params in parallel. |
| `src/app/hanh-trinh/page.tsx` | Uses the active-member helper before visible timeline queries. |
| `src/app/thu-hen-ngay-mo/page.tsx` | Uses the active-member helper before future-letter queries. |
| `src/app/admin/page.tsx` | Uses the Owner helper while resolving search params in parallel. |
| `src/app/admin/hanh-trinh/page.tsx` | Uses the Owner helper while resolving search params in parallel. |
| `src/app/admin/khong-khi/page.tsx` | Uses the Owner helper before theme-management queries. |

### Task 1: Create one server-only access boundary

**Files:**
- Create: `src/lib/backend/require-page-access.ts`

**Consumes:** `createServerBackend`, the existing pure `resolveActivePageAccess`, and Next's `redirect`.

**Produces:** `requireActivePageAccess()` and `requireCatalogueOwnerPageAccess()`, each returning `{ actor, backend }` on the allowed path and otherwise ending the request using the same redirects as today.

- [x] **Step 1: Add the active-member and Owner guard helpers.**

  Create the file with the complete implementation below. Do not accept an actor
  from the client and do not add caching.

  ```tsx
  import "server-only";

  import { redirect } from "next/navigation";
  import { createServerBackend } from "@/lib/backend/create-server-backend";
  import { resolveActivePageAccess } from "@/modules/identity/presentation/active-page-access";

  export async function requireActivePageAccess() {
    const backend = await createServerBackend();
    const access = resolveActivePageAccess(
      await backend.getCurrentActor.execute(),
    );

    if (access.kind === "redirect") {
      redirect(access.to);
    }

    return { actor: access.actor, backend };
  }

  export async function requireCatalogueOwnerPageAccess() {
    const pageAccess = await requireActivePageAccess();

    if (!pageAccess.actor.canManageCatalogue) {
      redirect("/access-denied");
    }

    return pageAccess;
  }
  ```

- [x] **Step 2: Source-review redirect equivalence.**

  Read `src/modules/identity/presentation/active-page-access.ts` and confirm the
  helper delegates every active/inactive/anonymous/error result to that existing
  decision function. Confirm the Owner helper is the only new direct
  `/access-denied` redirect.

### Task 2: Replace active-member guard boilerplate on public pages

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/catalogue/[slug]/page.tsx`
- Modify: `src/app/hanh-trinh/page.tsx`
- Modify: `src/app/thu-hen-ngay-mo/page.tsx`

**Consumes:** `requireActivePageAccess()` from Task 1.

**Produces:** The same catalogue, item-detail, timeline, and future-letter
pages with route-local query/rendering code and no duplicated actor guard.

- [x] **Step 1: Update the home page without serializing params.**

  Replace the `redirect`, `createServerBackend`, and `resolveActivePageAccess`
  imports with `requireActivePageAccess`. Replace the initial backend/access
  block with:

  ```tsx
  const [params, { actor, backend }] = await Promise.all([
    searchParams,
    requireActivePageAccess(),
  ]);
  const categorySlug = firstSearchParam(params.category);
  const requestedPage = parsePositivePage(params.page);
  ```

  Replace every `access.actor` in this page with `actor`. Keep catalogue query
  inputs, fallback-page query, errors, and `CatalogueHome` props otherwise
  identical.

- [x] **Step 2: Update the catalogue detail page without serializing params.**

  Replace its three access imports with `requireActivePageAccess`, then use:

  ```tsx
  const [{ slug }, { actor, backend }] = await Promise.all([
    params,
    requireActivePageAccess(),
  ]);
  ```

  Replace all `access.actor` references with `actor`. Preserve the existing
  `notFound()` branch and keep the item/categories `Promise.all` before the
  actor-dependent engagement read.

- [x] **Step 3: Update the timeline and future-letter pages.**

  In each page, replace the duplicated backend/access creation and redirect
  block with:

  ```tsx
  const { actor, backend } = await requireActivePageAccess();
  ```

  Replace remaining `access.actor` values with `actor`. Preserve the timeline
  single query, the future-letter `Promise.all`, and every component prop.

- [x] **Step 4: Source-review public routes.**

  Confirm each public page imports only `requireActivePageAccess` for access,
  each backend query still receives `actor`, and neither `redirect` nor
  `resolveActivePageAccess` remains in these four route modules.

### Task 3: Replace Owner guard boilerplate on administration pages

**Files:**
- Modify: `src/app/admin/page.tsx`
- Modify: `src/app/admin/hanh-trinh/page.tsx`
- Modify: `src/app/admin/khong-khi/page.tsx`

**Consumes:** `requireCatalogueOwnerPageAccess()` from Task 1.

**Produces:** The same Owner-only admin pages with a single source for the
Owner redirect policy.

- [x] **Step 1: Update catalogue and timeline administration in parallel with search params.**

  Remove `redirect`, `createServerBackend`, and `resolveActivePageAccess`
  imports from both pages; import `requireCatalogueOwnerPageAccess` instead.
  Use the following shape in each page:

  ```tsx
  const [params, { actor, backend }] = await Promise.all([
    searchParams,
    requireCatalogueOwnerPageAccess(),
  ]);
  ```

  Leave each page's existing `firstSearchParam` function/import, query
  `Promise.all`, errors, selected-record behavior, skip-link, `AppHeader`, and
  feature component props unchanged. Replace only `access.actor` references
  with `actor` and remove the now-redundant redirect/Owner checks.

- [x] **Step 2: Update site-theme administration.**

  Remove the same three access imports and use:

  ```tsx
  const { actor, backend } = await requireCatalogueOwnerPageAccess();
  ```

  Pass `actor` to `getManagedSiteTheme` and `AppHeader`; preserve the existing
  management error and page markup.

- [x] **Step 3: Source-review Owner routes.**

  Confirm all three admin pages import only `requireCatalogueOwnerPageAccess`
  for access, retain no route-local `canManageCatalogue` test, and pass `actor`
  to the exact same management queries/components as before.

### Task 4: Complete a source-only scope review

**Files:**
- Review: every file changed in Tasks 1–3

**Consumes:** The approved design and the existing user preference to skip
runtime verification commands.

**Produces:** A reviewed minimal diff with no visual/data-policy side effects.

- [x] **Step 1: Inspect imports and access usage.**

  Run source searches confirming `requireActivePageAccess` is used by exactly
  the four public protected pages and `requireCatalogueOwnerPageAccess` by
  exactly the three admin pages. Confirm the new helper contains `server-only`.

- [x] **Step 2: Inspect the semantic diff.**

  Use `git diff --ignore-space-at-eol --unified=0` on the helper and seven
  route files. Verify no database queries, component props, URLs, style classes,
  transition mappings, or error strings changed outside the removed guard
  boilerplate.

- [x] **Step 3: Hand off with verification limits stated.**

  Report the source-review evidence and explicitly state that no tests, lint,
  typecheck, build, browser QA, commit, or branch were run/created at the user's
  request.
