# Bordeaux Diary frontend foundation design

## Goal

Replace the legacy mock-driven home experience with a refined, romantic
catalogue foundation that renders only live Supabase-backed data and remains
beautiful before the owner has added any content.

## Visual direction

The direction is **Bordeaux Diary**: deep bordeaux provides the anchor,
porcelain and warm blush create lightness, and a restrained Playfair serif is
reserved for editorial headings. The interface uses generous white space,
subtle paper borders, rounded but not pill-like controls, and tiny decorative
rules or blurred colour washes rather than stock imagery, floral clip-art, or
heavy gradients.

The visual system draws on the editorial pacing and space of Aesop and
NET-A-PORTER, while keeping Glossier's warm, approachable tone. It is an
original composition, not a copy of any source site.

## Data and page architecture

The home page is a Server Component. It creates one request-scoped backend,
resolves active-page access from its actor result, then starts the category and
item read use cases in parallel. The selected category comes from the optional
`category` search parameter and is passed to the existing public catalogue use
case.

The presentational catalogue home receives only `CatalogueCategory[]`,
`CatalogueItemSummary[]`, the selected slug, and the active actor. It contains
no Supabase call, local mock, or persistence. Existing image URLs render via
the current `SmartImage` component; if an item has no image it gets an elegant
non-image placeholder rather than an invented asset.

## First UI slice

- Define the bordeaux design tokens, responsive typography, shadows, focus
  states, reduced-motion treatment, and an unobtrusive paper-like background.
- Add an authenticated application header with brand, collection navigation,
  actor identity, and an owner indicator only when applicable.
- Add a real-data catalogue home: editorial hero, category links, responsive
  item grid, empty state, loading state, and error state.
- Restyle the login page to share the same visual language.
- Do not build item detail, engagement, owner dashboard, search, mock records,
  Storage upload, or new backend behaviour in this slice.

## Empty and failure states

When categories/items are absent, show a warm empty collection message and a
small owner-oriented hint only to owners. No card, title, image, or category is
invented. A route-level loading state uses semantic skeletons, while the error
boundary supplies a retry control and neutral Vietnamese copy.

## Accessibility and responsiveness

The header collapses to a compact, readable layout on small screens without a
JavaScript menu. Category navigation stays keyboard reachable and wraps rather
than becoming a clipped horizontal trap. The grid uses one, two, then three
columns; cards preserve their image ratio, focus states remain high-contrast,
and all decorative elements are hidden from assistive technology.

## Constraints

- Do not add mock data or call Supabase from a Client Component.
- Preserve Google-only authentication and existing active-page access rules.
- Do not add a test in this UI slice at the user's request. Validate via
  TypeScript/build and browser QA instead.
- Do not modify database schema, RLS, Storage, secrets, commit, or push.
