# Image and Navigation Responsiveness — Design

**Date:** 2026-07-23  
**Status:** Approved for implementation planning  
**Scope:** Remove artificial image and navigation delay without changing data,
permissions, routes, or the established visual language.

## Problem evidence

`CatalogueItemImage` is a Client Component used by catalogue, timeline, and
future-letter views. Every instance is `loading="lazy"`, waits for hydration and
an `onLoad` state change, starts at zero opacity, and then plays a 700 ms fade.
This delays even the first visible image and produces a visible blank/skeleton
period regardless of whether bytes are already in the browser cache.

Route and category navigation are dynamic because content is permission-aware.
The page content therefore waits for a server response. The existing generic
View Transition adds a sequential slide after content arrives, and tabs provide
no immediate pending acknowledgement. Default Link prefetching is partial for
dynamic routes; full eager prefetch for every category would create needless
private data requests.

## Goals

- Show the featured catalogue image and an item detail hero image as soon as the
  browser can render them.
- Keep below-the-fold images lazy, with no per-image hydration or artificial
  fade delay.
- Make header and category/pagination tabs acknowledge navigation immediately.
- Keep server data authoritative and do not add cross-user page/data caching.
- Shorten generic route transitions without removing all spatial continuity.

## Non-goals

- No Supabase schema, RLS, authentication, server action, or query changes.
- No image proxy, third-party image CDN, Storage migration, or remote-host
  allow-list expansion.
- No `next/image` migration: owner-managed image URLs can use arbitrary hosts,
  while the current Next configuration intentionally allows only known hosts.
- No broad visual refactor and no prefetch of every category's full result.

## Image delivery design

`CatalogueItemImage` becomes a Server Component that returns a native `<img>`
inside the existing aspect-ratio shell. Its interface gains `priority?: boolean`.

- `priority=true` emits `loading="eager"` and `fetchPriority="high"` for the
  single primary image visible at the start of a route.
- The default emits `loading="lazy"` and `fetchPriority="auto"` for archive and
  below-the-fold images.
- All images retain explicit `width`, `height`, `decoding="async"`, `object-fit`,
  and a fixed aspect-ratio container to prevent layout shift.
- The component removes `useState`, `onLoad`, `onError`, Lucide fallback markup,
  opacity gating, and the 700 ms fade. A broken remote URL falls back to the
  browser's standard image failure treatment rather than hydrating every card.

Priority is applied only to the featured catalogue card and the catalogue detail
hero. Timeline and future-letter imagery keep the default because they are not
reliably the initial content or may appear only after interaction.

## Navigation responsiveness design

Create a small Client Component, `NavigationLink`, around Next `Link`. It keeps
the existing `href`, `transitionTypes`, semantics, and class styling. A child
using `useLinkStatus()` renders an `aria-hidden` inline progress mark while that
specific link is pending.

- Header links use `prefetch={true}` because there are only a few stable top-level
  destinations and they are likely next navigation targets.
- Category and pagination links keep Next's default auto-prefetch strategy;
  pointer/touch behavior may promote a relevant link without fetching every
  category at page load.
- The progress mark is a small underline/ink sweep, not a blocking overlay or
  spinner. It supplies immediate click acknowledgement while the server remains
  the data authority.

`PageTransition` changes its default route transition from sequential vertical
slides to the existing short fade transition. The old and new page snapshots fade
at the same time; navigation-specific `nav-forward` and `nav-back` types remain
available where their spatial direction is useful. The shared image morph and
reduced-motion rules stay unchanged.

## Files and boundaries

- `src/features/catalogue/presentation/catalogue-item-image.tsx` owns native image
  priority/lazy semantics and becomes server-rendered.
- `catalogue-featured-item-card.tsx` and `catalogue-detail-hero.tsx` choose
  `priority`; other callers retain defaults.
- `src/components/ui/navigation-link.tsx` owns Link pending feedback and no data.
- `src/components/app-header.tsx`, `catalogue-chapter-rail.tsx`, and
  `catalogue-pagination.tsx` use `NavigationLink`.
- `src/components/ui/page-transition.tsx` owns default transition selection.
- `src/app/globals.css` defines only the small pending mark and concurrent fade.

## Accessibility and failure behavior

Links remain actual anchors, preserve `aria-current`, keyboard focus and existing
labels, and keep normal browser navigation fallback. The pending mark is hidden
from assistive technology because it adds no user action or error. If a route
request fails, existing error boundaries still own the error state. Reduced-motion
continues to suppress View Transition animation.

## Validation boundary

The user previously requested no tests, lint, type checks, builds, or browser
QA. Delivery may use only source/diff inspection and must explicitly state that
runtime and measured performance validation were not run. No commit or branch is
created.
