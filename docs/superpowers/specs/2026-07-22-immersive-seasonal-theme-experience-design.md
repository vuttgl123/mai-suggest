# Immersive Seasonal Theme Experience Design

**Date:** 2026-07-22  
**Status:** Approved design; awaiting written-spec review before implementation planning

## Goal

Transform each existing seasonal preset from a color palette into a full-site visual
experience. A theme changes the page atmosphere, shell geometry, shared controls,
surface treatments, and restrained ambient motion across every public and owner
screen, while preserving all content and product behavior.

## Scope

- All routes rendered inside `RootLayout`, including catalogue, item details,
  relationship timeline, future letters, login, and all owner administration pages.
- The five existing keys: `bordeaux`, `valentine`, `spring`, `noel`, and
  `anniversary`.
- The existing Owner theme workspace at `/admin/khong-khi`, upgraded into a visual
  art-direction picker.

The existing Supabase schema, RLS, theme resolver, schedules, manual override,
Server Actions, domain keys, and preset selection rules are unchanged. The database
continues to store only an approved theme key, never CSS, images, or arbitrary
visual configuration.

## Chosen Direction: Theme Scenes

Each key defines a complete scene rather than a palette alone. The shared
application shell remains recognisable and familiar, but its visual materials,
geometry, and ambient details change enough to feel like a distinct launch-day
interface.

| Theme | Scene | Visual language |
| --- | --- | --- |
| Bordeaux Diary | Writing desk | Embossed paper, ink wash, candle-like warm glow, restrained serif editorial framing. |
| Lời hẹn tháng Hai | Ruby night letters | Deep ruby twilight, soft halo, sweeping letter ribbons, intimate highlights. |
| Mùa xuân dịu dàng | Botanical scrapbook | Collaged paper, gentle sage fragments, petal-like specks, softer rounded frames. |
| Đêm cuối năm | Winter postcard | Dark evergreen night, champagne window-light, postcard border, sparse slow snow-light. |
| Chương kỷ niệm | Memory gallery | Wine-and-gold gallery, fine gilt rules, spotlight wash, ceremonial shimmer. |

No preset uses literal holiday stickers, user-uploaded backgrounds, or noisy
continuous animation. The product remains a personal diary rather than a generic
seasonal storefront.

## Architecture

### SSR theme selection stays unchanged

`RootLayout` already resolves the global theme on the server and places
`data-theme` on `body`. That contract remains the source of truth so the first
paint has the correct scene without a client request, hydration flicker, or new
Supabase access path.

### A static scene layer in the root shell

Add a presentation-only `ThemeAtmosphere` component rendered by `RootLayout` ahead
of route children. It renders a small, constant set of decorative layers: base
backdrop, texture, light, and ornament group. It receives the resolved
`SiteThemeKey` as a prop and writes no state, makes no data request, and handles no
interaction.

Its markup is identical for all keys. CSS selects scene composition through
`body[data-theme="…"]`, so no runtime branching, image download, or duplicated page
tree is needed. The layer stays `aria-hidden`, fixed behind content, and has
`pointer-events: none`.

### Semantic scene tokens

Extend the existing CSS token system instead of adding hard-coded colors to feature
components. Every `data-theme` selector controls:

- page backdrop, texture, highlight glow, and optional ornament mask;
- card/control/header materials, shadows, rules, radii, and hover treatment;
- display detail such as border rhythm, accent pattern, and surface contrast;
- conservative motion duration and ornament transforms.

Shared CSS targets existing semantic anchors such as `body`, `.diary-shell`,
`.paper-card`, `.timeline-entry-card`, the header, and the existing dialog
surfaces. Feature components retain their current data and interaction logic;
targeted class changes occur only when a component needs a semantic surface anchor
that the current tokenized markup cannot reach.

## Full-Site Experience

- **Page frame:** each scene controls the visual field behind content and a subtle
  inner frame or rule system, not just the `body` fill.
- **Header/navigation:** header material, active-nav underline, logo halo, and
  ownership badge align to the active scene while keeping their information layout
  and accessibility unchanged.
- **Cards and forms:** card radius, border treatment, shadow, control surface, and
  focused control styling use scene tokens. Text and semantic status colors remain
  sufficiently distinct from decorative surfaces.
- **Editorial elements:** catalogue rails, timeline dots, future-letter paper and
  dialog surfaces inherit the same scene materials without changing their content
  model or animation state machines.
- **Admin workspace:** management screens use the same scene; Owner controls do
  not revert to an unrelated plain dashboard.

## Owner Theme Picker

Keep the current manual/automatic radio state and `setManualSiteThemeAction`, but
present the presets as a responsive art-direction gallery:

- Each choice has a miniature scene preview built from CSS layers, a theme-specific
  glyph, title, concise scene description, and visible selected state.
- The automatic option remains a first-class card explaining that the active scene
  comes from the schedule.
- Selecting a card still uses the existing radio input and current transition; no
  client-side preview overrides the server-resolved global theme.
- The resolved-theme panel and schedule management keep their present behavior and
  become visually aligned with the selected scene gallery.

## Motion and Accessibility

- Ambient motion is limited to opacity and transform on decorative layers:
  slow float, light drift, sparse shimmer, or occasional speck movement.
- Do not use route `ViewTransition` to change theme; a theme is a scene state, not
  a navigation relationship.
- `prefers-reduced-motion: reduce` freezes all ambient animation while retaining
  the final visual scene, contrast, and structure.
- Ornament layers never receive focus, never intercept pointer events, and remain
  absent from the accessibility tree.
- Preserve existing focus rings, live feedback, buttons, controls, and minimum
  touch target sizes. Decorative motion and contrast must not hide a status,
  selection, error, or destructive confirmation.

## Responsive and Performance Rules

- The atmosphere has a bounded number of fixed pseudo-elements/layers; no canvas,
  video, third-party animation package, remote image, or client polling is added.
- At small widths, scenes reduce large ornaments and active animation while keeping
  the same background material and page-frame identity.
- Use compositor-friendly `transform` and `opacity` only for animated layers;
  avoid layout properties, scroll-linked animation, unbounded filters, and long
  paint-heavy effects.
- Existing server data loading and client component boundaries remain unchanged.

## Explicitly Deferred

- New theme keys, custom theme builder, raw CSS editor, asset uploads, user-specific
  themes, location-driven seasons, realtime previews, cron, notifications, schema
  changes, migrations, or RLS changes.
- Changes to catalogue, timeline, future-letter, authentication, or administration
  business data and behavior.

## Acceptance Criteria

- Switching to each existing key changes more than color: the page frame, backdrop,
  card/control materials, navigation treatment, and scene ornaments have visibly
  distinct art direction on every route.
- The active theme is still resolved at SSR and applied to `body` before first
  render; no new client data request or flash of the default scene is introduced.
- Owner can select manual/automatic mode and schedule themes exactly as before,
  using a visual gallery rather than basic-looking controls.
- Every scene remains readable and operable at 320, 390, 768, 1024, and 1440px;
  the reduced-motion variant has no ambient movement.
- No Supabase schema, RLS, migration, Server Action API, or domain key changes are
  required.
