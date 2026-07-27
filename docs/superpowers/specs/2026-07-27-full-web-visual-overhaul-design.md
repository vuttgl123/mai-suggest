# Điều Em Yêu full-web visual overhaul

## Status

Design approved by the user on 2026-07-27. This document records the visual direction and implementation boundaries before any production code changes.

## Design read

Điều Em Yêu is a private romantic diary for two people, not an ecommerce catalogue or a social feed. The redesign uses the existing Bordeaux Diary language as a cinematic editorial world: warm paper, deep Bordeaux, restrained copper, real imagery, generous whitespace and quiet motion.

The product brand remains **Điều Em Yêu**. Bordeaux Diary is the visual language, not a replacement wordmark.

## Goals

- Make the first visit feel art-directed and memorable.
- Give every major route a distinct composition while keeping one coherent visual system.
- Preserve the feeling of a private diary: slow, warm, personal and readable.
- Improve hierarchy, spacing, image treatment and responsive behavior at the same time.
- Make admin screens feel like a premium editorial desk while staying practical and information-dense.
- Make loading, empty, error, saving and success states feel intentional rather than incidental.

## Non-goals

- No route slug changes.
- No primary navigation label changes unless an existing label is proven ambiguous and explicitly approved.
- No form field name or field order changes.
- No Supabase schema, RLS, auth provider or permission model changes.
- No new social, chat, notification or commerce features.
- No mock data, fake metrics or decorative fake product interfaces.
- No replacement of the existing brand wordmark with Bordeaux Diary.

## Visual configuration

### Public and member surfaces

- `DESIGN_VARIANCE: 8`
- `MOTION_INTENSITY: 6`
- `VISUAL_DENSITY: 3`
- Theme: Bordeaux Diary light editorial, with token parity for dark system preference where it can be added without changing the product mood.
- Layout: asymmetric, image-led, open composition with varied section families.

### Admin surfaces

- `DESIGN_VARIANCE: 5`
- `MOTION_INTENSITY: 3`
- `VISUAL_DENSITY: 6`
- Theme: the same Bordeaux token system with stronger surface separation for work areas.
- Layout: editorial desk shell, practical lists and clear forms. The admin must not imitate a marketing landing page.

### Auth and system surfaces

- `DESIGN_VARIANCE: 5`
- `MOTION_INTENSITY: 3`
- `VISUAL_DENSITY: 3`
- Layout: one calm focal point, clear action, generous negative space and an obvious recovery path.

## Art direction rules

### Palette

Use one accent hierarchy per active theme preset:

- Bordeaux brand color for primary action, active navigation and key headings.
- Warm ivory or theme surface for the page field.
- Muted copper for dividers, small emphasis and ornamental detail.
- Ink and muted ink for readable content.

Do not introduce unrelated blue, purple or neon accents. Seasonal presets may alter the approved theme tokens, but their hierarchy and contrast behavior must stay consistent.

### Typography

- Keep an expressive editorial display face for the diary voice, with Vietnamese glyph coverage verified through `next/font`.
- Keep a refined sans-serif for body, form controls and administrative data.
- Use display type for short headlines only. Do not create paragraph-shaped hero headlines.
- Use sentence case for visible headings and labels.
- Keep body measure close to 65 characters where prose is meant to be read.
- Use small caps sparingly. Eyebrow labels must not appear above every section.

### Material and shape

- Paper texture is subtle and used as a fixed background treatment, not as a filter on scrolling containers.
- Use one primary radius scale for cards and a tighter scale for controls.
- Use borders and spacing before adding shadows.
- Image frames may use editorial layered edges, but repeated nested containers are prohibited.
- Shadows are warm and tinted toward Bordeaux or the active theme, never generic black.

### Copy and brand discipline

- Use the existing Vietnamese product copy as the source of truth.
- Keep copy concrete, intimate and plain. Avoid invented marketing claims.
- Never use decorative status dots, fake metrics, fake version labels or system jargon.
- Avoid em dashes and decorative separator strings in visible copy.
- Re-read all visible strings after implementation, including empty and error states.

## Page compositions

### Home and catalogue

The homepage opens with an asymmetric split hero. The left side contains a short eyebrow, a two-line headline, concise support copy and one primary action. The right side contains one strong content image with enough crop space to remain convincing on smaller screens.

The collection index follows as a chapter-like navigation block. On desktop it uses an offset text column plus a varied image grid. The grid must use exactly the number of visible content items and may use varied aspect ratios or masonry rhythm. On mobile it becomes a single-column chapter list followed by stacked image-led content.

Search, category selection and pagination remain functional URL-driven controls. They are visually integrated into the editorial layout without becoming a dense filter toolbar.

### Catalogue detail

The detail hero uses a two-column editorial spread. A large portrait image sits beside the story column. The image may be sticky on desktop, but the mobile fallback is a normal single-column flow.

The story column contains the category, title, summary, real metadata and external links. Keepsakes and quotations are separate open sections below the hero. Engagement appears as a calm shared-notebook area with strong form labels, clear feedback and readable author content.

### Relationship timeline

The timeline uses the existing filmstrip concept as the signature interaction. A featured memory is larger than adjacent frames, and all frames align to one visual rhythm line. Each chapter shows date, title, image and short story excerpt.

Desktop may use horizontal film navigation or a pinned narrative sequence when the implementation remains keyboard accessible. Below 768px it becomes a vertical stack with one chapter per row and no horizontal overflow.

### Future letters

The composer is an editorial split layout. The sealed Bordeaux envelope is the visual focal point, while the writing form remains practical and readable. Labels stay above fields. The opening date and time controls remain explicit.

The archive uses correspondence rows rather than a grid of identical cards. Sealed, opened, empty and unavailable states each have a meaningful visual treatment. The opening ritual uses cinematic fade-through motion and becomes immediate under reduced motion.

### Admin workspace

The admin shell uses a compact header, a stable workspace navigation area and an open main work surface. The content list uses real thumbnails, concise metadata, visible status text and clear row actions. Status indicators are semantic only and are not repeated as decoration.

The admin editor uses a two-column image and form arrangement on large screens, then one column on mobile. Forms use labels above controls, helper text where necessary, inline validation and a persistent action area when the form is long. Existing field names and order remain stable.

### Auth and system screens

Login uses a single branded entrance with one Google OAuth action and a quiet privacy note. Access denied, loading, error and theme maintenance screens share the same typography, paper surface and recovery navigation. Error messages are direct and actionable.

## Signature component set

1. Off-grid editorial layout for public page openings and section transitions.
2. Layered image crop frames for hero, detail and timeline imagery.
3. Diagonal staggered masonry for catalogue discovery content.
4. Vertical rhythm lines for timeline chapters and chapter navigation.

Shared primitives remain owned by the project: `AppHeader`, page shell, buttons, form controls, image frame, empty state, loading state, error state and accessible transition wrapper. No second design system or UI library is introduced.

## Motion specification

- Route changes use the existing View Transition and Motion infrastructure where supported.
- Hero and section entrances use short opacity and transform reveals.
- Timeline motion communicates sequence and memory progression.
- Letter opening motion communicates a state change, not decoration.
- Hover and press states use transform and color changes only.
- No `window.addEventListener('scroll')`, React state driven by scroll position or layout-property animation.
- All motion above intensity 3 has a `prefers-reduced-motion` fallback.
- Every effect has cleanup and is isolated to a client leaf.

## Asset strategy

The existing content images remain the production source for catalogue, timeline and letter content. The generated design references are preview-only art direction material and are not used as production content.

If a production surface lacks a suitable visual, generate a dedicated asset for that surface rather than using a CSS fake screenshot, unrelated stock image or cropped fragment of another reference. Any new asset must have a clear placement, alt text and a stable loading strategy.

## Responsive contract

- `320px`: one-column content, no horizontal overflow, compact navigation and readable controls.
- `390px`: hero headline remains within three lines, CTA remains visible, chapter navigation becomes a clear list.
- `768px`: all multi-column compositions explicitly collapse or switch to their tablet layout.
- `1024px`: desktop navigation remains one line and the primary content hierarchy is visible without accidental wrapping.
- `1440px`: content is constrained by a max-width container and does not stretch into empty wide space.
- All image placements reserve their aspect ratio to avoid layout shift.

## Data and permission boundary

This is a presentation refactor. Server Components, server actions, Supabase reads, RLS, Google OAuth, role checks, route guards and storage behavior remain unchanged. Client Components may own only local interaction state already required by the feature. No server-only query is moved into a Client Component.

## Implementation sequence after spec approval

1. Baseline verification and current dirty-worktree inventory.
2. Global visual tokens and shared primitives.
3. Public/member shell, homepage and catalogue.
4. Catalogue detail and engagement.
5. Timeline and future letters.
6. Auth, loading, error and maintenance surfaces.
7. Admin workspace, lists and editors.
8. Responsive, accessibility, motion, performance and final regression verification.

## Acceptance criteria

- The site visibly follows the approved Bordeaux editorial direction and feels substantially more art-directed than the current UI.
- The real brand name remains Điều Em Yêu.
- Existing routes, data contracts, permissions and interactions continue to work.
- Public, member, admin and system screens share one coherent visual system while using appropriate density per surface.
- No major layout overflow or overlap appears at the required viewport widths.
- Focus, contrast, labels, loading, empty, error, success and reduced-motion behavior are covered.
- `rtk npm run lint`, relevant tests and `rtk next build` pass before completion.
- The final diff contains only scoped visual and presentation changes. No commit is created without a separate user request.
