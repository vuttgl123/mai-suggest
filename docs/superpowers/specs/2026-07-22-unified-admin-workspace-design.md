# Unified Admin Workspace Design

**Date:** 2026-07-22  
**Status:** Approved design; awaiting written-spec review before implementation planning

## Goal

Refactor the three owner administration screens into one coherent, information-dense
workspace that remains easy to scan while editing detailed content.

## Scope

- `/admin` — catalogue management
- `/admin/hanh-trinh` — relationship timeline management
- `/admin/khong-khi` — site-theme management

The work is visual and structural only. Existing Supabase-backed readers, Server
Actions, authorization, URL selection, pagination, mutations, and View Transition
behavior remain unchanged.

## Chosen Direction: Owner Workbench

Each screen uses the same visual hierarchy:

1. A compact workbench header with a clear owner-context breadcrumb, concise status
   counts, and the one primary action for that screen.
2. A shared section switcher immediately below the header for Catalogue, Journey,
   and Atmosphere. It makes the three areas discoverable without repeating scattered
   cross-links in every hero.
3. A desktop master-detail workspace: a sticky navigation or list column on the
   left and a large detailed editing surface on the right. Catalogue preserves its
   two-level category/item navigation inside the master area.
4. A compact, consistent list-row language: title, essential metadata, visible
   selection state, and a small Live/Draft status indicator. Destructive controls
   remain hidden until deliberately requested.

On small screens, the section switcher scrolls horizontally and each workspace
flows from navigation/list into editor. Controls retain their current accessible
touch targets, focus behavior, feedback messages, loading states, and reduced-motion
fallbacks.

## Screen-specific Composition

### Catalogue

- Retain the category sidebar and item list, but treat them as two clearly labelled
  layers in one compact master area.
- Put item totals, filter context, and creation actions next to their relevant list,
  not in the global header.
- Let the selected item editor dominate the detail surface; its save/delete controls
  are visually anchored to the editing context so long forms remain easy to act on.

### Journey

- Use the same master-detail proportions and selected-row treatment as catalogue.
- Each chapter row foregrounds date, publication state, response count, and sort
  order without opening the editor.
- Group detailed editor fields into scannable editorial sections without changing
  input names, validation, or mutations.

### Atmosphere

- Separate the current resolved theme, manual override choice, and scheduled themes
  into three explicitly ranked panels.
- Make each schedule row primarily communicate its active time, theme, and priority;
  edit/delete behavior remains the existing behavior.
- Keep the preset chooser dense and immediately actionable in the left control area.

## Component Boundaries

- Introduce presentation-only shared workspace primitives for the header, section
  switcher, and compact status/list treatments when they remove repeated markup.
- Preserve the existing feature boundaries: catalogue components stay under
  `features/catalogue`, timeline under `features/timeline`, and theme under
  `features/site-theme`.
- Do not move server data access, Server Actions, domain types, or route ownership
  into a client component.

## Interaction and Accessibility

- The active workspace and selected record use both visible styling and semantic
  `aria-current`/labels, preserving keyboard access.
- All existing confirmation steps for deletion stay in place.
- Feedback remains in its current live region. Pending actions remain disabled as
  they are today.
- Decorative elements are `aria-hidden`; the UI works at 320px through desktop
  without relying on hover to reveal essential actions.

## Explicitly Deferred

- New dashboard analytics, search, filtering, bulk operations, reordering,
  permissions, routes, data fields, migrations, or RLS changes.
- Changes to the collection, journey, future-letter, or theme public experiences.

## Acceptance Criteria

- Owners can move among all three management areas from the same clear switcher.
- The three screens share recognisable header, navigation/list, status, and
  master-detail patterns while retaining their feature-specific editing needs.
- Dense editing information is easier to scan; no existing management capability is
  removed or moved behind an undiscoverable control.
- Existing data flow, authorization, Server Actions, URL-driven selection, and
  deletion confirmation logic are unchanged.
