# DDD Backend Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Delegating work to subagents is prohibited by this project's `AGENTS.md`. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a small modular-Domain-Driven Design backend core for identity-aware, server-side catalogue reads using Supabase and the existing RLS policies.

**Architecture:** Keep Next.js as the application runtime. `identity` and `catalogue` each expose application use cases and narrow repository ports; Supabase clients, SQL-shaped rows, and row mapping remain in infrastructure. Server adapters consume only use cases built by a small composition root, while RLS stays the final authorization boundary.

**Tech Stack:** Next.js App Router, TypeScript strict, Vitest, `@supabase/ssr` 0.12.3, `@supabase/supabase-js` 2.110.7, Supabase Postgres/Auth/RLS.

## Global Constraints

- Keep Node.js at version 22 or later; the installed Supabase packages no longer support Node 20.
- Keep `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as the only client-visible configuration. Never add a service-role/secret key.
- Use `@supabase/ssr` for Next.js cookie sessions; server identity validation uses `auth.getClaims()`, never trusts `getSession()` as authorization evidence.
- Do not create a separate backend service, alter `docs/database`, apply migrations, change RLS, or seed Supabase in this plan.
- No repository, Supabase client, database row, or server-only import may be used in a Client Component.
- Do not replace the current JSON catalogue adapter in this backend-core slice. That is a separately approved UI/data migration.
- Preserve all unrelated working-tree changes.
- Follow TDD for every handwritten behavior: make the focused test fail, add the smallest implementation, then rerun it green.

---

## Planned file structure

```text
src/
  core/application/
    result.ts
    result.test.ts

  lib/supabase/
    config.ts
    config.test.ts
    database.types.ts
    client.ts
    server.ts

  modules/
    identity/
      domain/current-actor.ts
      domain/current-actor.test.ts
      application/actor-reader.ts
      application/get-current-actor.ts
      application/get-current-actor.test.ts
      infrastructure/supabase-actor-reader.ts
      infrastructure/supabase-actor-reader.test.ts

    catalogue/
      domain/catalogue-read-models.ts
      application/catalogue-reader.ts
      application/list-visible-categories.ts
      application/list-visible-items.ts
      application/get-visible-item-detail.ts
      application/catalogue-use-cases.test.ts
      infrastructure/catalogue-mappers.ts
      infrastructure/catalogue-mappers.test.ts
      infrastructure/supabase-catalogue-reader.ts
      infrastructure/supabase-catalogue-reader.test.ts

  lib/backend/
    create-server-backend.ts
    create-server-backend.test.ts
```

No existing UI page, component, `public/data`, migration, or RLS file changes in this plan.

## Task 1: Isolate Supabase configuration and typed clients

**Files:**
- Create: `src/lib/supabase/config.ts`
- Test: `src/lib/supabase/config.test.ts`
- Create: `src/lib/supabase/database.types.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`

**Interfaces:**
- Produces `getSupabasePublicConfig(environment?: NodeJS.ProcessEnv): SupabasePublicConfig`.
- Produces `createBrowserSupabaseClient()` and `createServerSupabaseClient()` returning `SupabaseClient<Database>`.
- Consumed later by both Supabase repository implementations and the composition root.

- [ ] **Step 1: Write the failing configuration test**

```ts
import { describe, expect, it } from "vitest";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

describe("getSupabasePublicConfig", () => {
  it("rejects a missing publishable configuration without naming a secret", () => {
    expect(() => getSupabasePublicConfig({})).toThrow(
      "Missing required Supabase public configuration.",
    );
  });

  it("returns only URL and publishable key", () => {
    expect(
      getSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
        SUPABASE_SECRET_KEY: "must-not-be-returned",
      }),
    ).toEqual({
      url: "https://project.supabase.co",
      publishableKey: "publishable-key",
    });
  });
});
```

- [ ] **Step 2: Verify the configuration test fails**

Run: `npm test -- src/lib/supabase/config.test.ts`  
Expected: FAIL because `@/lib/supabase/config` does not exist.

- [ ] **Step 3: Implement the minimum configuration boundary**

```ts
// src/lib/supabase/config.ts
export interface SupabasePublicConfig {
  url: string;
  publishableKey: string;
}

export function getSupabasePublicConfig(
  environment: NodeJS.ProcessEnv = process.env,
): SupabasePublicConfig {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Missing required Supabase public configuration.");
  }

  return { url, publishableKey };
}
```

Create `database.types.ts` as a maintained TypeScript `Database` definition
for the five tables this slice reads: `profiles`, `categories`, `items`,
`item_images`, and `item_links`. Model every selected column from
`docs/database`, including the `app_role`, `item_kind`, and `item_link_type`
enums. Keep `Json` and all PostgREST-only types in this file.

Implement the two client factories as follows:

```ts
// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "./config";
import type { Database } from "./database.types";

export function createBrowserSupabaseClient() {
  const { url, publishableKey } = getSupabasePublicConfig();
  return createBrowserClient<Database>(url, publishableKey);
}
```

```ts
// src/lib/supabase/server.ts
import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicConfig } from "./config";
import type { Database } from "./database.types";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabasePublicConfig();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (values) => {
        try {
          values.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies; proxy/auth work is later.
        }
      },
    },
  });
}
```

- [ ] **Step 4: Verify configuration passes and compiles**

Run: `npm test -- src/lib/supabase/config.test.ts`  
Expected: PASS (2 tests).

Run: `npx tsc --noEmit`  
Expected: exit code 0.

- [ ] **Step 5: Commit the isolated configuration task**

```bash
git add src/lib/supabase
git commit -m "feat: add typed Supabase client boundaries"
```

## Task 2: Add core result types and the Identity domain/application boundary

**Files:**
- Create: `src/core/application/result.ts`
- Test: `src/core/application/result.test.ts`
- Create: `src/modules/identity/domain/current-actor.ts`
- Test: `src/modules/identity/domain/current-actor.test.ts`
- Create: `src/modules/identity/application/actor-reader.ts`
- Create: `src/modules/identity/application/get-current-actor.ts`
- Test: `src/modules/identity/application/get-current-actor.test.ts`

**Interfaces:**
- Produces `Result<T>`, `success(value)`, `failure(code)`, and the exact error
  codes `UNAUTHENTICATED`, `ACCESS_DENIED`, `NOT_FOUND`, `VALIDATION_FAILED`,
  `UNEXPECTED_FAILURE`.
- Produces discriminated `CurrentActor` and `ActiveActor` types.
- Produces `requireActiveActor(actor): Result<ActiveActor>` and
  `GetCurrentActor.execute(): Promise<Result<CurrentActor>>`.
- Consumes an `ActorReader` port; Supabase implements it in Task 3.

- [ ] **Step 1: Write failing result and actor tests**

```ts
import { expect, it } from "vitest";
import { requireActiveActor } from "@/modules/identity/domain/current-actor";

it("rejects an anonymous actor before a protected use case runs", () => {
  expect(
    requireActiveActor({
      status: "anonymous",
      userId: null,
      email: null,
      role: null,
      canManageCatalogue: false,
    }),
  ).toEqual({ ok: false, error: { code: "UNAUTHENTICATED" } });
});

it("allows an active owner and preserves catalogue permission", () => {
  const result = requireActiveActor({
    status: "active",
    userId: "actor-id",
    email: "owner@example.com",
    role: "owner",
    canManageCatalogue: true,
  });

  expect(result).toEqual({ ok: true, value: expect.objectContaining({ role: "owner" }) });
});
```

```ts
import { expect, it } from "vitest";
import { GetCurrentActor } from "@/modules/identity/application/get-current-actor";

it("returns the reader result without exposing its implementation", async () => {
  const expected = {
    ok: true as const,
    value: {
      status: "anonymous" as const,
      userId: null,
      email: null,
      role: null,
      canManageCatalogue: false,
    },
  };
  const useCase = new GetCurrentActor({ readCurrentActor: async () => expected });

  await expect(useCase.execute()).resolves.toEqual(expected);
});
```

- [ ] **Step 2: Verify identity tests fail**

Run: `npm test -- src/core/application/result.test.ts src/modules/identity`  
Expected: FAIL because the core and identity modules do not exist.

- [ ] **Step 3: Implement minimal core and identity types**

```ts
// src/core/application/result.ts
export type ApplicationErrorCode =
  | "UNAUTHENTICATED"
  | "ACCESS_DENIED"
  | "NOT_FOUND"
  | "VALIDATION_FAILED"
  | "UNEXPECTED_FAILURE";

export type Failure = { ok: false; error: { code: ApplicationErrorCode } };
export type Success<T> = { ok: true; value: T };
export type Result<T> = Success<T> | Failure;

export const success = <T>(value: T): Success<T> => ({ ok: true, value });
export const failure = (code: ApplicationErrorCode): Failure => ({
  ok: false,
  error: { code },
});
```

```ts
// src/modules/identity/domain/current-actor.ts
import { failure, success, type Result } from "@/core/application/result";

export type AppRole = "owner" | "member";
export type CurrentActor =
  | { status: "anonymous"; userId: null; email: null; role: null; canManageCatalogue: false }
  | { status: "inactive"; userId: string; email: string | null; role: AppRole; canManageCatalogue: false }
  | { status: "active"; userId: string; email: string | null; role: AppRole; canManageCatalogue: boolean };
export type ActiveActor = Extract<CurrentActor, { status: "active" }>;

export function requireActiveActor(actor: CurrentActor): Result<ActiveActor> {
  if (actor.status === "anonymous") return failure("UNAUTHENTICATED");
  if (actor.status === "inactive") return failure("ACCESS_DENIED");
  return success(actor);
}
```

Define `ActorReader` with `readCurrentActor(): Promise<Result<CurrentActor>>`.
`GetCurrentActor` receives that port in its constructor and delegates only to
`readCurrentActor`; it does not import Supabase.

- [ ] **Step 4: Verify core and identity tests pass**

Run: `npm test -- src/core/application/result.test.ts src/modules/identity`  
Expected: PASS.

- [ ] **Step 5: Commit the core identity task**

```bash
git add src/core src/modules/identity/domain src/modules/identity/application
git commit -m "feat: add identity application core"
```

## Task 3: Implement the Supabase Identity reader

**Files:**
- Create: `src/modules/identity/infrastructure/supabase-actor-reader.ts`
- Test: `src/modules/identity/infrastructure/supabase-actor-reader.test.ts`

**Interfaces:**
- Consumes `SupabaseClient<Database>` and implements `ActorReader`.
- Produces `CurrentActor` from verified JWT claims plus the caller's `profiles`
  record.
- Produces `UNEXPECTED_FAILURE` for Auth or profile-query errors; never returns
  raw Supabase errors.

- [ ] **Step 1: Write the failing actor-reader tests**

```ts
it("returns anonymous when verified claims have no subject", async () => {
  const reader = new SupabaseActorReader(fakeSupabaseWithClaims(null));

  await expect(reader.readCurrentActor()).resolves.toEqual({
    ok: true,
    value: {
      status: "anonymous",
      userId: null,
      email: null,
      role: null,
      canManageCatalogue: false,
    },
  });
});

it("maps an active owner profile to an active actor", async () => {
  const reader = new SupabaseActorReader(
    fakeSupabaseWithClaimsAndProfile(
      { sub: "actor-id", email: "owner@example.com" },
      { id: "actor-id", email: "owner@example.com", role: "owner", is_active: true },
    ),
  );

  await expect(reader.readCurrentActor()).resolves.toEqual({
    ok: true,
    value: {
      status: "active",
      userId: "actor-id",
      email: "owner@example.com",
      role: "owner",
      canManageCatalogue: true,
    },
  });
});

it("does not turn a missing or inactive profile into an active actor", async () => {
  const reader = new SupabaseActorReader(
    fakeSupabaseWithClaimsAndProfile({ sub: "actor-id" }, null),
  );

  await expect(reader.readCurrentActor()).resolves.toMatchObject({
    ok: true,
    value: { status: "inactive", userId: "actor-id", canManageCatalogue: false },
  });
});
```

- [ ] **Step 2: Verify the actor-reader tests fail**

Run: `npm test -- src/modules/identity/infrastructure/supabase-actor-reader.test.ts`  
Expected: FAIL because `SupabaseActorReader` does not exist.

- [ ] **Step 3: Implement the verified-claims reader**

Implement `SupabaseActorReader.readCurrentActor()` in this order:

1. Call `client.auth.getClaims()`; on an error return `failure("UNEXPECTED_FAILURE")`.
2. If `data.claims?.sub` is absent, return `success` with the anonymous actor.
3. Query only `id,email,role,is_active` from `profiles` using the claim subject
   and `.maybeSingle()`.
4. Return `failure("UNEXPECTED_FAILURE")` for a query error.
5. Return an inactive member actor when no profile is returned; otherwise use
   `profile.is_active` and `profile.role` to create the correct discriminated
   actor. Only an active owner has `canManageCatalogue: true`.

The reader must not use `getSession()` or `user_metadata` to make an access
decision. Its fake client test fixture must implement only the chained methods
used by the reader; it must not call a real Supabase project.

- [ ] **Step 4: Verify actor-reader tests pass**

Run: `npm test -- src/modules/identity/infrastructure/supabase-actor-reader.test.ts`  
Expected: PASS (anonymous, active owner, inactive profile, unexpected-error cases).

- [ ] **Step 5: Commit the actor reader**

```bash
git add src/modules/identity/infrastructure
git commit -m "feat: resolve current actor through Supabase"
```

## Task 4: Add catalogue read models, ports, and protected use cases

**Files:**
- Create: `src/modules/catalogue/domain/catalogue-read-models.ts`
- Create: `src/modules/catalogue/application/catalogue-reader.ts`
- Create: `src/modules/catalogue/application/list-visible-categories.ts`
- Create: `src/modules/catalogue/application/list-visible-items.ts`
- Create: `src/modules/catalogue/application/get-visible-item-detail.ts`
- Test: `src/modules/catalogue/application/catalogue-use-cases.test.ts`

**Interfaces:**
- Produces `CatalogueCategory`, `CatalogueItemSummary`, `CatalogueItemDetail`,
  `CatalogueImage`, and `CatalogueLink` read models.
- Produces `CatalogueReader` with `listCategories`, `listItems`, and
  `findItemDetailBySlug` methods returning `Promise<Result<...>>`.
- Every use case consumes `CurrentActor`, calls `requireActiveActor` before its
  reader, and returns `NOT_FOUND` when the detail reader returns `null`.
- The Supabase implementation is added in Task 5.

- [ ] **Step 1: Write failing protected-catalogue use-case tests**

```ts
const anonymousActor = {
  status: "anonymous" as const,
  userId: null,
  email: null,
  role: null,
  canManageCatalogue: false,
};

it("does not query categories for an anonymous actor", async () => {
  const reader = { listCategories: vi.fn() } as unknown as CatalogueReader;
  const useCase = new ListVisibleCategories(reader);

  await expect(useCase.execute(anonymousActor)).resolves.toEqual({
    ok: false,
    error: { code: "UNAUTHENTICATED" },
  });
  expect(reader.listCategories).not.toHaveBeenCalled();
});

it("returns not found when an active actor requests a non-visible slug", async () => {
  const reader = fakeCatalogueReader({ findItemDetailBySlug: async () => success(null) });
  const useCase = new GetVisibleItemDetail(reader);

  await expect(useCase.execute(activeMember, "private-item")).resolves.toEqual({
    ok: false,
    error: { code: "NOT_FOUND" },
  });
});
```

- [ ] **Step 2: Verify catalogue use-case tests fail**

Run: `npm test -- src/modules/catalogue/application/catalogue-use-cases.test.ts`  
Expected: FAIL because the catalogue module does not exist.

- [ ] **Step 3: Implement read models, port, and use cases**

Use these exact model shapes:

```ts
export interface CatalogueCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  coverImageUrl: string | null;
  sortOrder: number;
}

export interface CatalogueItemSummary {
  id: string;
  categoryId: string;
  slug: string;
  kind: "place" | "product" | "experience" | "article" | "other";
  title: string;
  summary: string | null;
  priceLabel: string | null;
  primaryImage: { url: string; altText: string | null } | null;
}

export interface CatalogueItemDetail extends CatalogueItemSummary {
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  mapUrl: string | null;
  externalRating: number | null;
  externalReviewCount: number | null;
  externalRatingSource: string | null;
  metadata: Record<string, unknown>;
  images: CatalogueImage[];
  links: CatalogueLink[];
}
```

`ListVisibleItems.execute` accepts an optional `{ categorySlug?: string }`
criteria object and delegates it unchanged after authorization. `GetVisibleItemDetail`
turns a successful `null` detail into `failure("NOT_FOUND")`; all other reader
results pass through unchanged.

- [ ] **Step 4: Verify catalogue use-case tests pass**

Run: `npm test -- src/modules/catalogue/application/catalogue-use-cases.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit the protected read use cases**

```bash
git add src/modules/catalogue/domain src/modules/catalogue/application
git commit -m "feat: add protected catalogue read use cases"
```

## Task 5: Implement typed Supabase catalogue mapping and repository

**Files:**
- Create: `src/modules/catalogue/infrastructure/catalogue-mappers.ts`
- Test: `src/modules/catalogue/infrastructure/catalogue-mappers.test.ts`
- Create: `src/modules/catalogue/infrastructure/supabase-catalogue-reader.ts`
- Test: `src/modules/catalogue/infrastructure/supabase-catalogue-reader.test.ts`

**Interfaces:**
- `SupabaseCatalogueReader` implements `CatalogueReader` from Task 4.
- Mapper functions consume only the five typed Supabase rows defined in Task 1
  and emit Task 4's read models.
- Repository queries stay bounded: one categories query, one items query plus
  one batched images query for a list, and one item query plus parallel images
  and links queries for a detail.

- [ ] **Step 1: Write failing mapper and repository tests**

```ts
it("maps a database item image row to a primary image without leaking snake case", () => {
  expect(
    toCatalogueImage({
      id: "image-id",
      item_id: "item-id",
      image_url: "https://cdn.example/image.jpg",
      alt_text: "A gift",
      sort_order: 0,
      created_at: "2026-07-20T00:00:00.000Z",
    }),
  ).toEqual({ id: "image-id", url: "https://cdn.example/image.jpg", altText: "A gift", sortOrder: 0 });
});

it("batches primary-image lookup once for the listed item ids", async () => {
  const client = fakeSupabaseForCatalogueList();
  const reader = new SupabaseCatalogueReader(client);

  const result = await reader.listItems({});

  expect(result).toMatchObject({ ok: true, value: [{ primaryImage: { url: expect.any(String) } }] });
  expect(client.imageQuery.in).toHaveBeenCalledWith("item_id", ["item-1", "item-2"]);
});

it("maps a hidden or absent detail result to null without exposing PostgREST details", async () => {
  const reader = new SupabaseCatalogueReader(fakeSupabaseWithNoItem());

  await expect(reader.findItemDetailBySlug("hidden-item")).resolves.toEqual(success(null));
});
```

- [ ] **Step 2: Verify infrastructure tests fail**

Run: `npm test -- src/modules/catalogue/infrastructure`  
Expected: FAIL because mapper and reader files do not exist.

- [ ] **Step 3: Implement mappers and batched queries**

Implement these query rules exactly:

1. `listCategories` selects `id,slug,name,description,icon,cover_image_url,sort_order`
   from `categories`, orders by `sort_order` ascending, and maps every row.
2. `listItems` selects the summary columns from `items`. When `categorySlug` is
   supplied, resolve it with a visible `categories` query first; return
   `success([])` when the category is absent. Query all images for the returned
   item IDs with one `.in("item_id", ids)` request, order by `sort_order`, and
   use the first image per item as `primaryImage`.
3. `findItemDetailBySlug` uses `.maybeSingle()` on the item query. When it is
   `null`, return `success(null)`. When present, request its images and links
   concurrently, both ordered by `sort_order`, then create the complete detail
   model.
4. Convert Supabase errors to `failure("UNEXPECTED_FAILURE")`; never include
   `error.message`, SQL details, or values in the Result.
5. Convert a non-object JSON `metadata` value to `{}` defensively, even though
   the database check constraint normally prevents it.

Use the indexes already present in `docs/database` (`category_id`,
`category_id,is_published`, `item_id,sort_order`) and do not issue a query per
item.

- [ ] **Step 4: Verify infrastructure tests pass**

Run: `npm test -- src/modules/catalogue/infrastructure`  
Expected: PASS.

- [ ] **Step 5: Commit Supabase catalogue infrastructure**

```bash
git add src/modules/catalogue/infrastructure
git commit -m "feat: add Supabase catalogue reader"
```

## Task 6: Compose server services and verify the backend-core boundary

**Files:**
- Create: `src/lib/backend/create-server-backend.ts`
- Test: `src/lib/backend/create-server-backend.test.ts`

**Interfaces:**
- Produces `createServerBackend(): Promise<{ getCurrentActor; listVisibleCategories; listVisibleItems; getVisibleItemDetail }>`.
- Consumes only `createServerSupabaseClient`, `SupabaseActorReader`, and
  `SupabaseCatalogueReader`.
- Is the only concrete-construction entry point for future Server Components,
  Server Actions, and Route Handlers.

- [ ] **Step 1: Write the failing composition test**

```ts
import { expect, it, vi } from "vitest";

it("constructs identity and catalogue use cases with the same server client", async () => {
  const client = {};
  vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(async () => client),
  }));

  const { createServerBackend } = await import("@/lib/backend/create-server-backend");
  const backend = await createServerBackend();

  expect(backend).toEqual({
    getCurrentActor: expect.any(Object),
    listVisibleCategories: expect.any(Object),
    listVisibleItems: expect.any(Object),
    getVisibleItemDetail: expect.any(Object),
  });
});
```

- [ ] **Step 2: Verify the composition test fails**

Run: `npm test -- src/lib/backend/create-server-backend.test.ts`  
Expected: FAIL because `create-server-backend` does not exist.

- [ ] **Step 3: Implement the server composition root**

```ts
import "server-only";
import { GetCurrentActor } from "@/modules/identity/application/get-current-actor";
import { SupabaseActorReader } from "@/modules/identity/infrastructure/supabase-actor-reader";
import { ListVisibleCategories } from "@/modules/catalogue/application/list-visible-categories";
import { ListVisibleItems } from "@/modules/catalogue/application/list-visible-items";
import { GetVisibleItemDetail } from "@/modules/catalogue/application/get-visible-item-detail";
import { SupabaseCatalogueReader } from "@/modules/catalogue/infrastructure/supabase-catalogue-reader";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function createServerBackend() {
  const client = await createServerSupabaseClient();
  const actorReader = new SupabaseActorReader(client);
  const catalogueReader = new SupabaseCatalogueReader(client);

  return {
    getCurrentActor: new GetCurrentActor(actorReader),
    listVisibleCategories: new ListVisibleCategories(catalogueReader),
    listVisibleItems: new ListVisibleItems(catalogueReader),
    getVisibleItemDetail: new GetVisibleItemDetail(catalogueReader),
  };
}
```

- [ ] **Step 4: Verify the composition test passes**

Run: `npm test -- src/lib/backend/create-server-backend.test.ts`  
Expected: PASS.

- [ ] **Step 5: Run the backend-core verification suite**

Run:

```bash
npm test -- src/core src/lib/supabase src/lib/backend src/modules/identity src/modules/catalogue
npm run test:verify:supabase
npm run lint
npx tsc --noEmit
npm run build
```

Expected: all commands exit with code 0. `test:verify:supabase` only validates
the script behavior without credentials; use `npm run verify:supabase` locally
with `.env.local` to confirm the remote API connection without printing secrets.

- [ ] **Step 6: Review scope and commit the composition root**

```bash
git diff --check
git diff -- src/core src/lib/supabase src/lib/backend src/modules/identity src/modules/catalogue
git add src/lib/backend
git commit -m "feat: compose DDD backend core"
```

Confirm the diff contains no UI/mock-data replacement, migration, RLS change,
secret, or unrelated formatting change before committing.

## Plan self-review

- Spec coverage: Tasks 1–6 cover typed SSR clients, the Result/error model,
  identity/session mapping, catalogue ports/use cases, Supabase infrastructure,
  server composition, and all agreed testing boundaries. OAuth mutation flow,
  UI migration, schema/RLS changes, and engagement are intentionally excluded.
- Placeholder scan: no TBD/TODO markers or unspecified interfaces remain.
- Type consistency: `Result<T>`, `CurrentActor`, `ActorReader`,
  `CatalogueReader`, `SupabaseActorReader`, `SupabaseCatalogueReader`, and
  `createServerBackend` use the same names and return shapes throughout.
