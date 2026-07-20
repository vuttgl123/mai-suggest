# DDD Backend Core Design

**Date:** 2026-07-20  
**Status:** Approved design — awaiting review of this written specification

## Goal

Create a small, modular DDD backend foundation inside the existing Next.js App
Router application. It must replace direct data access with server-side use
cases while preserving Supabase Postgres, Google OAuth, and the existing RLS
policies as the system of record for authorization.

The first delivery is deliberately a narrow vertical slice: resolve the current
actor and read the visible catalogue. Later work will add catalogue management,
ratings, comments, and per-user item state one feature at a time.

## Constraints

- Next.js remains both the UI and server-side application runtime. No separate
  backend service is introduced.
- Supabase remains the source of truth for Postgres, Auth, and RLS.
- Browser code may only use the Supabase URL and publishable key. Repository
  implementations are server-only and must never use a service-role key.
- The current database schema, triggers, indexes, and RLS policies are not
  changed as part of this foundation.
- Authorization is enforced by RLS. The application layer performs session and
  access-state checks to select a use case outcome; it is not a substitute for
  RLS.
- The existing working tree contains unrelated user changes. This work must not
  refactor or modify them outside the agreed backend foundation.

## Bounded contexts

### Identity and Access

This context translates Supabase Auth plus `profiles` into a stable application
concept: `CurrentActor`.

`CurrentActor` contains only the fields consumers need:

- `userId`
- `email`
- `role` (`owner` or `member`)
- `status` (`anonymous`, `inactive`, or `active`)
- `canManageCatalogue`

No catalogue or engagement code reads JWT claims, `auth.users`, or the
`profiles` table directly. Google OAuth callback/sign-in orchestration is a
subsequent access feature; the foundation supplies the server-side session and
actor boundary it requires.

### Catalogue

`Category` is an independent domain concept. `Item` is the catalogue aggregate
root and owns its images and links. Categories and items are initially read
through purpose-built read models rather than exposing raw Supabase rows.

The initial use cases are:

- `ListVisibleCategories`
- `ListVisibleItems`
- `GetVisibleItemDetail`

The catalogue module only receives an actor/access abstraction and does not
depend on profile tables or Supabase APIs.

### Engagement

`Rating`, `Comment`, and `UserItemState` remain separate future aggregates:
they change independently for each member and should not be embedded inside the
`Item` aggregate. This context is intentionally not implemented in the core
delivery.

## Module structure

```text
src/
  core/
    domain/                       # Entity, value-object, Result, DomainError
    application/                  # shared command/query and error helpers

  modules/
    identity/
      domain/                     # CurrentActor and access concepts
      application/                # GetCurrentActor and repository port
      infrastructure/             # Supabase actor reader and row mapper

    catalogue/
      domain/                     # category/item domain and read-model rules
      application/                # read use cases and repository ports
      infrastructure/             # Supabase queries and row mappers

    engagement/                   # reserved until its first vertical slice

  lib/supabase/                   # server/browser clients and database types
  app/                            # server components, actions, route handlers
```

Each module has the following dependency direction:

```text
app adapter -> application use case -> domain and port
infrastructure repository ----------^
```

The domain and application layers must not import React, Next.js, or
`@supabase/*`. Supabase row types and query syntax stay in infrastructure.
There is no DI container; a server composition function constructs the
Supabase repository and injects it into the relevant use case.

## Request and authorization flow

```text
Server Component / Server Action
  -> server composition function
  -> application use case
  -> repository port
  -> Supabase server client with request cookies
  -> Postgres RLS policy
  -> typed row mapper
  -> application DTO/read model
```

Reads require an active actor. An anonymous actor produces `Unauthenticated`;
an inactive profile produces `AccessDenied`. A non-visible or absent item is
always represented as `NotFound`, so unpublished records are not disclosed.
Unexpected Supabase failures are converted at the infrastructure boundary to a
safe application error with an internal cause for server logging only.

## Ports and error model

The foundation defines narrow, intent-based ports rather than a generic CRUD
repository:

- `ActorReader.getCurrentActor()`
- `CatalogueReader.listVisibleCategories()`
- `CatalogueReader.listVisibleItems(criteria)`
- `CatalogueReader.getVisibleItemDetail(slug)`

The shared error/result model exposes only stable outcomes to adapters:

- `Unauthenticated`
- `AccessDenied`
- `NotFound`
- `ValidationFailed`
- `UnexpectedFailure`

Route handlers and Server Actions map those outcomes to their transport/UI
representation. Server Components may render an access or not-found state. No
database error message, query detail, credential, or raw row is exposed.

## Initial implementation scope

The backend-core implementation contains:

1. Server and browser Supabase client boundaries, with generated/maintained
   database types isolated under `src/lib/supabase`.
2. Core DDD primitives and the shared application-error/result convention.
3. The Identity `CurrentActor` read use case and Supabase implementation.
4. Catalogue read ports, use cases, Supabase implementation, and row-to-read
   model mapping.
5. A server-side composition entry point for the App Router.
6. A minimal adapter integration for catalogue reads only when replacing the
   existing mock-data path is within the implementation plan.

It explicitly excludes schema migrations, RLS edits, service-role use, owner
write commands, engagement commands, Storage, Realtime, and a generic
repository framework.

## Testing and verification

- Unit tests cover core error/result behavior and actor access-state mapping.
- Application tests use small fake ports to cover authentication, inactive
  access, empty catalogue, and not-found behavior.
- Infrastructure tests cover Supabase row mapping and ensure server-only
  boundaries are used for repository queries.
- The existing read-only connection verification script remains a connectivity
  check only; it does not prove RLS or OAuth behavior.
- Before a write feature is added, RLS tests must separately exercise
  anonymous, inactive/unapproved member, active member, and owner access.
- Completion requires the relevant tests, lint, TypeScript/build verification,
  and a diff review limited to this scope.

## Evolution plan

After the core is stable, add one vertical slice at a time:

1. Google OAuth entry/callback/logout and protected-route adapters.
2. Owner catalogue commands for categories, items, images, and links.
3. Member ratings and comments.
4. Member favorite/state/note management.

Each slice gets its own design, implementation plan, tests, and RLS-role
verification before expanding the next context.
