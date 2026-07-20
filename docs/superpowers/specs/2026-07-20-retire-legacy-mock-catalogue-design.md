# Retire Legacy Mock Catalogue Design

## Goal

Remove the unused JSON-driven preference catalogue so the application has one
source of business data: the existing Supabase-backed DDD modules.

## Findings

- `src/app/page.tsx` now renders `CatalogueHome` using server-side catalogue
  use cases. It no longer imports `getPreferenceData` or `PreferenceCatalogue`.
- The legacy JSON manifest under `public/data/` and the related React feature
  tree are therefore dead production code.
- The protected home page only renders for an authenticated user whose profile
  is active. An empty Supabase catalogue intentionally renders the new empty
  state; the cleanup does not create sample records.

## Scope

Delete the complete legacy preference-catalogue chain:

- JSON manifests and category files under `public/data/`.
- The mock catalogue generation and image-check scripts, and their package
  script entry.
- The obsolete preference types, validation/read helpers, display components,
  discovery/compare hooks, selection state, and UI primitives used exclusively
  by that chain.

Preserve:

- The Supabase client/configuration and all DDD modules in `src/core` and
  `src/modules`.
- The new presentation components in `src/features/catalogue/presentation`.
- The authentication flow, app header, base Button and root loading/error
  states.

## Data Policy

No data will be inserted into Supabase in this change. Invented categories or
items would recreate mock data. Real records will be added later through an
owner-facing management UI or from user-supplied catalogue content.

## Verification

The user will run TypeScript and production build checks after removal. No
automated tests are added, per the user's explicit request.
