# Image and Navigation Responsiveness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove artificial image delay and make permission-aware navigation acknowledge immediately without caching private data.

**Architecture:** Keep images as native `<img>` because external image hosts are owner-managed. Convert the shared image boundary to server-rendered markup with a narrowly scoped priority flag, and use one small client `NavigationLink` only where pending feedback is valuable. Route data, RLS, and server rendering stay unchanged.

**Tech Stack:** Next.js App Router, React, TypeScript strict, native image loading, Next `Link`/`useLinkStatus`, CSS View Transitions.

## Global Constraints

- Do not modify Supabase queries, schema, RLS, authentication, Server Actions, routes, or user data.
- Do not migrate to `next/image`, add an image proxy/CDN, or expand remote image hosts.
- Eager/high-priority loading is limited to one initial image per relevant route.
- Header destinations may use full prefetch; category and pagination links retain auto-prefetch.
- Keep normal anchors, `aria-current`, focus styles, transition types, and reduced-motion behavior.
- Do not create a commit or branch.
- Do not run tests, lint, type checks, builds, browser QA, or performance commands; source/diff review only.

---

## File structure

| Path | Responsibility |
| --- | --- |
| `src/features/catalogue/presentation/catalogue-item-image.tsx` | Server-rendered image shell and priority/lazy loading policy. |
| `src/features/catalogue/presentation/catalogue-featured-item-card.tsx` | Marks the first catalogue image as priority. |
| `src/features/catalogue/presentation/catalogue-detail-hero.tsx` | Marks the item detail hero as priority. |
| `src/components/ui/navigation-link.tsx` | Client wrapper for a Next Link's own pending status marker. |
| `src/components/app-header.tsx` | Uses full-prefetch responsive links for three top-level destinations. |
| `src/features/catalogue/presentation/catalogue-chapter-rail.tsx` | Uses responsive auto-prefetch links for category tabs. |
| `src/features/catalogue/presentation/catalogue-pagination.tsx` | Uses responsive auto-prefetch links for page controls. |
| `src/components/ui/page-transition.tsx` | Selects concurrent fade as the ordinary route transition. |
| `src/app/globals.css` | Draws the tiny pending mark and removes the fade's sequential delay. |

### Task 1: Make the shared image boundary server-rendered and priority-aware

**Files:**
- Modify: `src/features/catalogue/presentation/catalogue-item-image.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-featured-item-card.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-detail-hero.tsx`

**Consumes:** Existing source URL, alternative text, fixed 800×1000 display ratio, and current shared-image View Transition names.

**Produces:** `CatalogueItemImage({ alt, priority?, src })`, a Server Component with no hooks or event callbacks.

- [x] **Step 1: Replace the client loading state with native image semantics.**

  Remove the client directive, `Heart`, `useState`, error fallback, `onLoad`,
  `onError`, opacity/scale class interpolation, and pulse overlay. Implement:

  ```tsx
  /* eslint-disable @next/next/no-img-element */

  interface CatalogueItemImageProps {
    alt: string;
    priority?: boolean;
    src: string;
  }

  export function CatalogueItemImage({ alt, priority = false, src }: CatalogueItemImageProps) {
    return (
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-skeleton)]">
        <img
          alt={alt}
          className="h-full w-full object-cover"
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          height={1000}
          loading={priority ? "eager" : "lazy"}
          src={src}
          width={800}
        />
      </div>
    );
  }
  ```

- [x] **Step 2: Set priority on the featured item only.**

  In `catalogue-featured-item-card.tsx`, change the existing image call to:

  ```tsx
  <CatalogueItemImage alt={image.altText ?? item.title} priority src={image.url} />
  ```

  Do not change the standard catalogue-card call; it remains lazy.

- [x] **Step 3: Set priority on the catalogue detail hero only.**

  In `catalogue-detail-hero.tsx`, add `priority` to the existing primary image
  call. Do not alter the `ViewTransition` `name`, `share`, fallback artwork, or
  sticky layout.

- [x] **Step 4: Source-review image scope.**

  Confirm that timeline and future-letter calls compile against the optional prop
  without becoming eager; there must be no new client directive or image-host
  configuration change.

### Task 2: Add immediate, non-blocking link pending feedback

**Files:**
- Create: `src/components/ui/navigation-link.tsx`
- Modify: `src/components/app-header.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-chapter-rail.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-pagination.tsx`
- Modify: `src/app/globals.css`

**Consumes:** Existing `Link` hrefs, navigation types, class names, and active
route states.

**Produces:** `NavigationLink`, preserving the Link API while rendering a small
pending mark only for the link currently navigating.

- [x] **Step 1: Create the client wrapper.**

  ```tsx
  "use client";

  import Link, { useLinkStatus } from "next/link";
  import type { ComponentProps } from "react";

  type NavigationLinkProps = ComponentProps<typeof Link>;

  function NavigationPendingMark() {
    const { pending } = useLinkStatus();

    return <span aria-hidden="true" className="navigation-link__pending" data-pending={pending || undefined} />;
  }

  export function NavigationLink({ children, className, ...props }: NavigationLinkProps) {
    return (
      <Link {...props} className={["navigation-link", className].filter(Boolean).join(" ")}>
        {children}
        <NavigationPendingMark />
      </Link>
    );
  }
  ```

- [x] **Step 2: Replace only navigation-oriented Link imports/usages.**

  In the header, replace the four existing Next Links with `NavigationLink` and
  add `prefetch` to each. Preserve Owner visibility and `activeSection` classes.
  In the chapter rail and pagination, replace existing links with
  `NavigationLink` without adding `prefetch`; preserve every href,
  `transitionTypes`, `aria-current`, and disabled span.

- [x] **Step 3: Add the pending mark CSS.**

  Add the following after shared link styles in `globals.css`:

  ```css
  .navigation-link { position: relative; }
  .navigation-link__pending {
    position: absolute;
    right: 0.45rem;
    bottom: 0.18rem;
    left: 0.45rem;
    height: 2px;
    border-radius: 999px;
    opacity: 0;
    transform: scaleX(0.2);
    transform-origin: left;
    background: var(--color-accent);
    transition: opacity 100ms ease, transform 160ms ease;
  }
  .navigation-link__pending[data-pending] { opacity: 1; transform: scaleX(1); }
  ```

  In the existing reduced-motion block, include `.navigation-link__pending` in
  the zero-duration transition override.

- [x] **Step 4: Source-review interaction semantics.**

  Confirm the new child mark is `aria-hidden`, all links remain actual anchors,
  and the client boundary is limited to navigation controls rather than page
  content or data loading.

### Task 3: Remove sequential transition latency from ordinary navigation

**Files:**
- Modify: `src/components/ui/page-transition.tsx`
- Modify: `src/app/globals.css`

**Consumes:** Existing named View Transition CSS selectors and directional
navigation types.

**Produces:** Concurrent short fades for ordinary routes while retaining
directional forward/back transitions where a caller explicitly requests them.

- [x] **Step 1: Change only the generic PageTransition default.**

  Replace default enter/exit transition types with the existing fade names:

  ```tsx
  <ViewTransition
    default="none"
    enter={{
      "nav-forward": "nav-forward",
      "nav-back": "nav-back",
      "page-forward": "nav-forward",
      "page-back": "nav-back",
      default: "fade-in",
    }}
    exit={{
      "nav-forward": "nav-forward",
      "nav-back": "nav-back",
      "page-forward": "nav-forward",
      "page-back": "nav-back",
      default: "fade-out",
    }}
  >
  ```

- [x] **Step 2: Make the fade concurrent.**

  Remove only the `var(--duration-exit)` delay from
  `::view-transition-new(.fade-in)`. Preserve its opacity keyframe and keep the
  directional slide and image-morph rules unchanged.

- [x] **Step 3: Source-only completion review.**

  Re-read the diff against the design: no server data/cache policy changed, no
  public image proxy was added, priority appears in exactly the featured and
  detail callers, and no unrelated Link was changed. Do not run tests, lint,
  type checks, builds, browser QA, or performance tools.
