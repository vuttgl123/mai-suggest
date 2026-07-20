# DDD engagement and catalogue administration design

## Goal

Complete the next backend slice on the existing Supabase schema: active users
can record their own item state, rating, and comments; active owners can manage
categories, items, images, links, and the access list.

## Boundaries

- This is server-side application/domain/infrastructure code only. It does not
  add Route Handlers, Server Actions, client UI, migrations, RLS changes,
  Storage, or secrets.
- Supabase is called only by infrastructure adapters. Domain and application
  layers receive ports and return the existing `Result<T>` type.
- The existing RLS policies remain the enforcement layer. Application use cases
  fail closed for anonymous/inactive actors and fail owner-only commands for
  non-owners before calling the repository.
- Per user-item state and rating are upserts on their existing unique keys;
  comments are individual rows. Catalogue assets are individual CRUD commands,
  not destructive delete-and-reinsert replacement batches.

## Modules

### Engagement

`engagement/domain` defines typed read models for state, rating, comment, and
an item engagement view. `engagement/application` contains a repository port
and one application service that validates input and executes state/rating/
comment commands for the current active actor. `engagement/infrastructure`
maps Supabase rows and uses upsert/delete/update queries that naturally obey
the current RLS policies.

### Catalogue administration

`catalogue/domain` gains command models. `catalogue/application` adds an
owner-only administration service and repository port. The Supabase adapter
uses targeted row-level insert/update/delete calls for categories, items,
images, and links. Creation stamps `created_by` from the owner actor.

### Access-list administration

`identity/domain` defines the allowed-user command and read models. Its
owner-only application service changes `allowed_users`, rather than writing to
`profiles`: existing database triggers are responsible for synchronizing an
email's active state, role, and approved display name into an auth profile.

### Composition

The server backend factory creates the two additional repositories and exposes
the two application services beside existing identity/catalogue read use cases.
No client receives a Supabase client through these services.

## Validation

- Slugs use the database-compatible lowercase kebab-case expression.
- Category/item names and comment content are trimmed and non-empty.
- Image/link sort order is a non-negative integer.
- Item rating score is an integer 1 through 5; external rating is a number in
  the database range 0 through 5; review count is a non-negative integer.
- Optional notes are trimmed and capped at the existing database limit of
  1,000 characters; comments are capped at 2,000 characters.
- Metadata is a plain object and never an array or `null`.
- User-entered image, map, and external links accept only HTTP(S) URLs, so a
  later UI can safely render them as anchors or images.

## Verification

The user explicitly requested that this batch not pause for test-first steps.
After implementation, they run the full TypeScript, unit, lint, Supabase
configuration, build, and manual RLS-role checks as one verification batch.
