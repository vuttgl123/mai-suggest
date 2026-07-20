# Catalogue administration read design

## Goal

Give a future owner dashboard typed, owner-only read use cases without leaking
administrative fields into the public catalogue reader.

## Architecture

The public `CatalogueReader` remains limited to active/published catalogue
views. A separate `CatalogueAdminReader` port returns managed category and
item models already used by write commands, including active/published flags,
audit timestamps, metadata, images, and links.

`ListManagedCategories`, `ListManagedItems`, and `GetManagedItemDetail` first
require an active owner. The Supabase adapter issues exact column queries using
the request-scoped authenticated client; existing RLS is therefore the final
database authorization check. No filter is applied in SQL to hide inactive or
unpublished rows because the application authorization and RLS policy allow an
owner to manage both states.

`requireCatalogueOwner` is promoted to the identity domain so every existing
and new owner-only use case shares the same anonymous, inactive, and member
failure behaviour.

## Query shapes

- Categories: all categories in display order, with `isActive` and audit data.
- Items: all owner-visible items ordered by creation time, with an
  optional `categoryId` filter and all editable scalar fields.
- Item detail: one item addressed by ID, plus its ordered image and link rows.

The existing `ManageAllowedUsers.list` use case is already the owner-only read
side for the access list, so this slice adds no duplicate identity reader.

## Boundaries

- Move catalogue-admin row mappers out of the write adapter so write and read
  adapters share one snake_case-to-camelCase mapping implementation.
- Expose the three new use cases through `createServerBackend`. Server
  Components can call them directly; a read Server Action is intentionally not
  added.
- No UI, Route Handler, Server Action, migration, RLS change, pagination,
  search index, or Storage operation is included.
- The user requested code before test-first work; verification remains a single
  combined step after implementation.
