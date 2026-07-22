# Theme Scene Transition and Maintenance Design

**Date:** 2026-07-22  
**Status:** Approved design; awaiting written-spec review before implementation planning

## Goal

Make a global theme change feel deliberate and trustworthy: the Owner sees a short
four-step scene-transition progress ritual, while new visitor requests receive a
minimal maintenance screen until the new scene is committed.

## Scope

- Extend the existing singleton `site_theme_settings` record with global transition
  metadata.
- Extend the existing Site Theme domain, reader, repository, use cases, Server
  Actions, and root resolver only as needed to expose and manage that metadata.
- Add an Owner-only transition progress UI to `/admin/khong-khi`.
- Add a server-rendered maintenance gate in `RootLayout` for transitioning scenes.

This work does not add Realtime, client polling, a new table, new theme keys,
user-specific maintenance, a custom CSS editor, deployment orchestration, or a
schema change outside the existing settings singleton.

## Product Contract

Theme CSS is already shipped with the application; switching a key is not a server
build or asset deployment. The visible progress is an intentional, bounded scene
handoff, not a fake compilation message.

- The Owner invokes a scene handoff from the existing visual theme picker.
- A new page request made during the handoff sees a maintenance screen instead of
  normal application content.
- A tab that was already open remains unchanged until its next navigation or
  refresh. No Realtime subscription or polling is introduced.
- The Owner’s current admin page stays mounted during the handoff so it can show
  progress. The page refresh occurs only after successful commit or cancellation.

## Data Model

Add three fields to the `site_theme_settings` singleton:

| Column | Type | Meaning |
| --- | --- | --- |
| `transition_state` | non-null text | `idle` or `transitioning`; defaults to `idle`. |
| `transition_target_theme_key` | nullable text | Approved theme key that will be committed after the handoff. |
| `transition_started_at` | nullable `timestamptz` | Server timestamp when the handoff began. |

The database constraint requires either a fully idle record (both transition fields
null) or a fully transitioning record (both transition fields non-null and target
key in the existing approved key set). The singleton rule, current select policy,
and Owner-only update policy remain in force.

No transition is considered active after its bounded timeout window, even if a
browser closed before clearing it. The resolver treats an expired record as idle,
so the public site cannot remain in maintenance indefinitely. A later Owner action
can overwrite an expired record safely.

## Domain and Resolver

Introduce a `ThemeSceneTransition` read model with `targetThemeKey`, `startedAt`,
and `expiresAt`; represent no active transition as `null`.

The existing resolver keeps its manual override and schedule precedence unchanged:

1. Read settings and active schedule in parallel as it does today.
2. Derive the normal resolved theme with the existing order.
3. Derive a transition only when settings are internally valid, state is
   `transitioning`, and `transition_started_at + timeout` is in the future.
4. Return the normal resolved theme plus the optional transition. An expired or
   malformed transition becomes `null`; it does not alter normal theme resolution.

## Owner Actions

All actions authenticate the current actor through the existing server-action
boundary and apply the same Owner guard as current site-theme writes.

1. `startThemeSceneTransition(targetThemeKey)` validates the key and writes the
   transitioning fields with a server timestamp. It does not change the manual
   theme key and does not request an Owner page refresh.
2. `commitThemeSceneTransition()` reads the active transition, writes its target to
   `manual_theme_key`, clears transition metadata atomically, then revalidates the
   existing application paths/tags using the current mutation convention.
3. `cancelThemeSceneTransition()` clears only transition metadata and revalidates
   the current mutation paths. The Owner UI calls it after an action error or an
   explicit cancellation.

The repository only updates the singleton settings row. It never bypasses RLS,
uses a service-role key, writes theme CSS, or changes schedules.

## Owner Progress Experience

Replacing a manual theme starts a local four-step ritual:

1. **Chuẩn bị không gian** — persist global transitioning state.
2. **Thay khung và nền** — progress advances within the mounted Owner UI.
3. **Đồng bộ trải nghiệm** — progress approaches completion while the public gate
   is active.
4. **Mở ra chương mới** — commit target key, clear transition, refresh Owner UI.

The component uses the existing `useTransition` for Server Actions and a single
cleanup-safe timer sequence for visual step pacing. Buttons are disabled during the
handoff. If start, commit, or cancellation fails, feedback is announced through
the current live region and the UI offers a clear recovery action.

The automatic schedule radio continues to set `manual_theme_key` to null directly;
it does not run the manual scene handoff. Schedule CRUD behavior is unchanged.

## Maintenance Gate

`RootLayout` always renders the decorative `ThemeAtmosphere` for the transition
target. When the resolver reports an active transition, it renders a new
presentation-only `ThemeMaintenanceScreen` instead of route children.

The screen is accessible and intentionally concise:

- title: “Không gian đang thay áo mới”;
- short explanation that the page will return shortly;
- static progress motif with target scene label;
- no login status, personal data, admin control, route content, or interaction.

It has no client state, no timers, no polling, and no Supabase client query. It is
rendered on the server from the same resolver result as the `body[data-theme]`
attribute.

## Security and RLS

- Public and active members retain read access only to the minimal global settings
  values needed to resolve the scene and transition gate.
- Owner remains the only actor allowed to start, commit, or cancel a handoff.
- Migration changes preserve RLS and its existing Owner-only write policy; no
  temporary policy, `SECURITY DEFINER`, service-role key, or client-exposed secret
  is used.
- Root layout treats invalid transition values as inactive and uses the normal safe
  theme fallback.

## Acceptance Criteria

- An Owner manual-theme selection shows the four named progress steps, blocks
  duplicate theme writes, then refreshes into the committed scene.
- A fresh public request while a non-expired handoff is active renders only the
  maintenance gate and target scene atmosphere.
- A fresh request after commit or cancel renders normal route content and correct
  global theme.
- An abandoned transition expires safely and normal requests continue rendering.
- Automatic scheduling, manual override outside the new handoff, existing theme
  CRUD, RLS, and theme fallback behavior remain unchanged.
- The maintenance gate and Owner progress respect reduced motion; no new polling,
  Realtime, image asset, dependency, route, or service is introduced.
