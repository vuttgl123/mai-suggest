# Handcrafted Bordeaux Diary System — Design

**Date:** 2026-07-22  
**Status:** Approved for planning  
**Scope:** A site-wide visual-system, component-boundary, and delivery-performance refactor for Mai Suggest.

## Intent

Mai Suggest should feel like a physical, handcrafted journal made for two people:
rich in paper, ink, binding, and depth, but still clearly a Bordeaux Diary rather
than a generic vintage scrapbook. The entire experience, including the management
workspace, belongs to one coherent object. Public storytelling pages may be more
expressive; data-entry and management tasks remain calm, legible, and efficient.

This refactor improves three qualities together:

- a clear, tactile visual identity across every route;
- a smaller, more reusable presentation system with fewer one-off styles;
- less unnecessary client-side and rendering work.

## Goals

- Keep deep Bordeaux as the emotional anchor, with ivory paper, restrained aged
  brass, and dark ink as supporting materials.
- Make the physical-book metaphor obvious: cover, open sheets, page edges,
  stitch lines, printed photographs, editorial labels, and seals.
- Preserve content hierarchy and fast task completion, particularly in admin
  forms, lists, and destructive actions.
- Let approved seasonal presets change atmosphere through semantic tokens while
  preserving the same book-and-paper construction.
- Respect `prefers-reduced-motion` and avoid visual effects that require a large
  JavaScript payload or continuous layout work.

## Non-goals

- No new product feature, database schema, RLS policy, route, authentication, or
  content model.
- No chat/feed/social mechanics and no custom per-user theme CSS.
- No raster texture layer repeated over the entire site, no heavy WebGL outside
  the existing, deferred landing scene, and no decoration that compromises form
  readability.
- No commit or branch creation. Per the user's instruction, no test, lint, type
  check, build, or browser-run command is part of this delivery.

## Visual language

### Environment and surfaces

The browser body represents the dark Bordeaux writing surface around a book. A
single global atmosphere layer supplies the quiet desk depth and ambient light.
The primary page surface is warm, fibrous ivory paper. It has a slightly denser
edge, an inset printed rule, a directional shadow, and an optional binding edge.

Secondary content is intentionally not all the same kind of card:

- narrative content uses an open-sheet or journal-spread surface;
- media uses a printed-photograph surface with a narrow paper border;
- short metadata uses editorial labels or stamped notes;
- important promises and one-off reveals use seals and envelopes;
- admin controls use a flat ledger surface with clear alignment and contrast.

Brass is limited to selected rules, seals, and a few active-state details. Script
styling is limited to dates, dedications, and small annotations. Long prose stays
in the established readable body typeface.

### Route composition

The landing intro remains the cover and first opening gesture. Its handoff leads
into the book's interior rather than a visually unrelated page.

Catalogue pages use chapter sheets and printed images. Item detail is the richest
editorial spread, with media, prose, links, and engagement grouped as intentional
paper sections rather than unrelated rounded boxes.

The timeline turns its rail into a binding/stitch line. Each chapter reads like a
keepsake attached to an open page, without adding scattered scrapbook clutter.

Future letters retain the envelope ritual, then reveal a letter sheet consistent
with the global paper system.

Administration is the same journal viewed as an editor's desk: Bordeaux surround,
paper ledger, carefully ruled fields, disciplined list rows, and highly legible
actions. It deliberately omits torn edges, tapes, and distracting reveal effects.
Login, loading, error, access-denied, and maintenance screens use compact
stationery surfaces so they remain part of the same world.

### Navigation and interaction

The site header becomes a restrained bookmark/header rail. It stays readable,
operable, and unobtrusive when sticky. Navigation never requires a page-turn
gesture; the book metaphor enriches transitions without obscuring the web's
normal navigation model.

Motion is reserved for meaningful spatial changes: entering a chapter, opening a
letter, elevating a photograph, or crossing from cover to interior. Hover effects
are small. The reduced-motion path retains all hierarchy and state changes while
removing decorative drift, page movement, and reveal animations.

## Presentation architecture

The current global stylesheet will be separated by responsibility:

1. **tokens** — color, typography, spacing, radii, elevation, duration, and
   semantic material tokens;
2. **themes** — per-season token overrides only, with no duplicated component
   layout rules;
3. **base** — reset, typography, focus, body, and reduced-motion rules;
4. **diary surfaces** — book surroundings, paper sheets, photo prints, labels,
   seals, and ledger surfaces;
5. **motion** — focused keyframes and View Transition styling;
6. **feature styles** — only styles that genuinely belong to a single feature.

Reusable presentation primitives will encapsulate shared visual contracts. The
planned set includes a diary page shell, paper panel, editorial label, photo
print, and ledger panel. Feature components will use these primitives instead of
locally recreating gradients, borders, shadows, and texture rules.

Primitives are visual and compositional only: existing Supabase queries, server
actions, routes, access checks, and domain models stay untouched. Client
boundaries remain at interaction owners; server-rendered presentational markup is
not moved into client components merely for styling.

## Delivery and performance constraints

- Keep one global decorative atmosphere rather than every feature creating its
  own fixed layers.
- Build paper and grain from reusable CSS gradients and pseudo-elements, not
  large raster backgrounds. Use low-opacity, bounded layers and `contain` where
  appropriate.
- Animate only compositor-friendly `opacity` and `transform` for normal motion;
  do not continuously animate layout, blur, or large image filters.
- Preserve dynamic loading of the deferred landing scene and on-demand composers
  already introduced in the application. Do not make global decoration a client
  component.
- Use content containment only on long, off-screen collections, with intrinsic
  size estimates to avoid jumpy scrolling.
- Respect responsive scale: the physical-book illusion can simplify on smaller
  screens, but touch targets, content order, contrast, and scroll position remain
  stable.

## Error and state treatment

Loading, empty, error, disabled, focus, selected, and destructive states use the
same semantic tokens as their normal surfaces. Decorative layers never conceal a
status or change the meaning communicated by text and color. Existing access and
maintenance behavior is preserved.

## Acceptance criteria

- The same handcrafted Bordeaux language is recognizable on all public, admin,
  authentication, error, loading, and maintenance routes.
- Seasonal themes alter material tokens and atmospheric accents without changing
  the underlying component geometry or requiring duplicated styling.
- Repeated paper/photo/label/ledger treatments are supplied by shared primitives,
  not copied per feature.
- The admin experience remains more restrained and faster to scan than public
  storytelling routes.
- Existing content, route behavior, permissions, data access, and reduced-motion
  fallback remain intact.
- The refactor introduces no forced client rendering and avoids new globally
  running JavaScript for purely visual effects.

## Validation boundary

The user explicitly asked not to run tests, lint, type checking, builds, or
browser QA. Implementation handoff will therefore state the absence of runtime
or measured performance validation and will be limited to source-level/diff
inspection that does not contradict that request.
