# Server Action boundary design

## Goal

Expose the existing DDD mutation use cases to future Client Components without
allowing them to construct a server Supabase client, choose an actor, or bypass
the application layer.

## Chosen approach

Three options were considered:

1. Put all mutation actions in one large `src/app/actions.ts` file. This is
   quick initially but mixes identity, catalogue, and engagement concerns.
2. Add public Route Handlers. They are useful for third-party integrations but
   add HTTP parsing, endpoint versioning, and CSRF/API-consumer concerns that
   the current first-party Next.js UI does not need.
3. Keep thin, feature-owned Server Action modules over the existing use cases.
   This keeps the DDD boundaries visible and is the chosen approach.

## Architecture

`src/lib/backend/run-server-action.ts` is the only shared transport helper. For
each invocation it creates the request-scoped backend, resolves the current
actor through `getCurrentActor`, catches unexpected runtime failures, and
returns the existing `Result<T>` shape.

Feature action modules use the `"use server"` directive and contain no
PostgREST queries. They pass the server-derived actor and a JSON-serializable
input to the corresponding use case. A successful mutation revalidates the
root layout so subsequent authenticated reads are not stale. Failed
authorisation or validation results are returned for the UI to render; actions
do not redirect or decide presentation.

## Scope

- Add actions for all current mutations: item engagement, owner catalogue CRUD,
  and owner access-list CRUD.
- Keep catalogue/identity read use cases for Server Components. No read action
  is needed yet.
- Do not add a Route Handler, Server Component/UI integration, migration, RLS
  policy, Storage upload, secret, or service-role key.
- Do not add test-first work in this pass, per the user's explicit direction.

## Security and cache behaviour

- The action never accepts an actor or user ID from the browser.
- The request-scoped cookie client and the existing verified-claims flow remain
  the only source of identity. Supabase RLS remains the final enforcement layer.
- Only successful writes call `revalidatePath("/", "layout")`; a rejected
  request neither mutates data nor invalidates the cache.
- Inputs are plain serializable objects. Domain/application validation is still
  executed on every action call.
