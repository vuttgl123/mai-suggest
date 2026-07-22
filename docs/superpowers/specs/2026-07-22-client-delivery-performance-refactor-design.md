# Client Delivery Performance Refactor Design

**Date:** 2026-07-22  
**Status:** Implemented in the current workspace; source/diff review only by user request

## Goal

Reduce initial client JavaScript and offscreen render work across public pages,
then apply the same on-demand loading discipline to owner-only composers.

## Audit findings

- Public data stays server-rendered and the post-access category/item reads are
  already parallel; retain the current Supabase/query design.
- The Three.js intro is already dynamically loaded and remains unchanged.
- Every catalogue image currently creates a client hydration boundary only for
  load/error state.
- `FutureLetterComposer` and `ThemeScheduleForm` are only needed after explicit
  interaction but currently enter their parent route's initial client graph.
- Catalogue cards below the opening chapter can defer layout and paint.

## Design

`CatalogueItemImage` becomes server-rendered native image markup. Its existing
4:5 box, lazy loading, async decoding, intrinsic size and alt text stay intact.
The skeleton background remains beneath the image; the current React load fade
and custom error panel are removed in favour of the browser-native image
fallback. This removes one hydrated island per catalogue card.

The two catalogue card variants get CSS hooks with `content-visibility: auto`
and conservative intrinsic heights. The fixed theme-atmosphere gets
`contain: paint`; its theme visuals and reduced-motion behavior do not change.

Future-letter composing and theme-schedule editing use `next/dynamic`. Their
modules load only when their UI opens, with hover/focus and create/edit handlers
preloading the relevant chunk to avoid an interaction delay. Props, validation,
actions and refresh behavior remain unchanged.

## Non-goals

- No schema, migration, index, RLS, auth, Supabase query, cache, route, Server
  Action, dependency, image service, or CDN change.
- No visual redesign or business behavior change. The only visual simplification
  is the browser-native fallback in place of the JavaScript image fade/error UI.
- No commit or branch. The user has asked to skip tests, lint, build,
  type-check, and browser QA; source/diff checks are the allowed handoff scope.

## Acceptance criteria

- Catalogue images no longer hydrate React state while preserving stable boxes,
  lazy loading, decoding, width, height and alt text.
- Offscreen cards can defer layout/paint without changing their links or View
  Transition names.
- The two conditional form modules are absent from initial route delivery until
  interaction-preloaded or opened.
- Theme atmosphere remains visible with paint containment.
