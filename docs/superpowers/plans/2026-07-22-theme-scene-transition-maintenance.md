# Theme Scene Transition and Maintenance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Project convention prohibits subagent delegation unless the user explicitly requests it.

**Goal:** Add a durable, timeout-safe global scene-transition state so Owners see four-stage progress and fresh public requests see a server-rendered maintenance gate until the chosen theme is committed.

**Architecture:** Extend the existing `site_theme_settings` singleton rather than add a new table. The Site Theme reader/resolver derives an optional transition alongside the existing resolved theme; root layout uses that result to replace children with a maintenance screen. Owner Client UI starts, stages, commits, or cancels the existing Server Action workflow without Realtime, polling, or a new client data path.

**Tech Stack:** Next.js App Router, React, TypeScript strict, Supabase Postgres/RLS, existing `@supabase/ssr` server client, Server Actions, Tailwind CSS, Lucide React.

## Global Constraints

- Do not change theme keys, manual/schedule precedence, schedule CRUD, existing routes, external assets, dependencies, Realtime, polling, service-role usage, or the existing Owner authorization model.
- Transition fields live only on the `site_theme_settings` singleton. The migration preserves its public select policy, Owner-only update policy, RLS, grants, and singleton check.
- New public maintenance rendering occurs only for a non-expired valid transition on a fresh request; already-open tabs remain unchanged until navigation or refresh.
- All transition actions authenticate through `runServerAction` and enforce `requireCatalogueOwner`; no client component talks to Supabase directly.
- `start` deliberately does not revalidate the Owner’s mounted page; `commit` and `cancel` use the existing layout revalidation convention.
- Use `apply_patch`; do not apply SQL to Supabase, create a commit, or create a branch.
- The user previously requested tests, lint, build, type-check, and browser QA be skipped unless explicitly reversed. Use source/diff checks only and report that boundary honestly.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `docs/migrations/2026-07-22-theme-scene-transition-maintenance.sql` | Approved-but-not-applied migration that extends the existing settings singleton and preserves RLS/grants. |
| `src/lib/supabase/database.types.ts` | Local generated-shape update for three settings columns. |
| `src/modules/site-theme/domain/site-theme-models.ts` | Typed transition state, settings fields, resolved transition result, and timeout constant. |
| `src/modules/site-theme/domain/site-theme-validation.ts` | Validates transition state/key pairing from database rows. |
| `src/modules/site-theme/infrastructure/site-theme-mappers.ts` | Maps settings rows defensively into safe typed settings. |
| `src/modules/site-theme/infrastructure/supabase-site-theme-reader.ts` | Selects extended settings fields. |
| `src/modules/site-theme/infrastructure/supabase-site-theme-repository.ts` | Performs conditional start/commit/cancel singleton updates. |
| `src/modules/site-theme/application/site-theme-repository.ts` | Declares transition repository operations. |
| `src/modules/site-theme/application/manage-site-theme.ts` | Owner-guards and validates start/commit/cancel use cases. |
| `src/modules/site-theme/application/resolve-site-theme.ts` | Returns normal resolved theme plus an optional non-expired transition. |
| `src/modules/site-theme/presentation/site-theme-actions.ts` | Exposes three authenticated Server Actions; start intentionally omits revalidation. |
| `src/components/theme/theme-maintenance-screen.tsx` | Static accessible maintenance screen, rendered only by the root layout gate. |
| `src/app/layout.tsx` | Uses target scene and renders maintenance screen instead of children during a transition. |
| `src/features/site-theme/presentation/theme-scene-transition-progress.tsx` | Stateless Owner progress presentation for the four stages. |
| `src/features/site-theme/presentation/theme-scene-picker.tsx` | The visual picker from the already-approved immersive-theme plan; receives the transition-disabled state from its parent. |
| `src/features/site-theme/presentation/admin-site-theme.tsx` | Orchestrates start → local stage pacing → commit/cancel while preserving automatic schedule selection. |

### Task 1: Define and migrate the timeout-safe singleton state

**Files:**

- Create: `docs/migrations/2026-07-22-theme-scene-transition-maintenance.sql`
- Modify: `src/lib/supabase/database.types.ts`
- Modify: `src/modules/site-theme/domain/site-theme-models.ts`
- Modify: `src/modules/site-theme/domain/site-theme-validation.ts`
- Modify: `src/modules/site-theme/infrastructure/site-theme-mappers.ts`

**Interfaces:**

- Produces `ThemeTransitionState = "idle" | "transitioning"` and `ThemeSceneTransition`.
- Extends `SiteThemeSettings` with `transitionState`, `transitionTargetThemeKey`, and `transitionStartedAt`.
- Keeps invalid database values safe: mapper emits an idle/null transition rather than trusting malformed data.

- [ ] **Step 1: Write the non-applied migration.**

  Add a transactional migration that extends the current singleton and preserves its policies/grants. The check permits exactly two valid states.

  ```sql
  begin;

  alter table public.site_theme_settings
    add column if not exists transition_state text not null default 'idle',
    add column if not exists transition_target_theme_key text,
    add column if not exists transition_started_at timestamptz;

  alter table public.site_theme_settings
    drop constraint if exists site_theme_settings_transition_check;

  alter table public.site_theme_settings
    add constraint site_theme_settings_transition_check check (
      (transition_state = 'idle'
        and transition_target_theme_key is null
        and transition_started_at is null)
      or
      (transition_state = 'transitioning'
        and transition_target_theme_key in ('bordeaux', 'valentine', 'spring', 'noel', 'anniversary')
        and transition_started_at is not null)
    );

  commit;
  ```

  Do not change RLS/policies/grants because the existing `SELECT` and Owner-only
  `UPDATE` policy already applies to added columns. Do not execute this file.

- [ ] **Step 2: Extend local row and domain types.**

  Add fields to `SiteThemeSettingsRow` in `database.types.ts`:

  ```ts
  transition_state: "idle" | "transitioning";
  transition_target_theme_key: string | null;
  transition_started_at: string | null;
  ```

  Add these domain declarations in `site-theme-models.ts`:

  ```ts
  export type ThemeTransitionState = "idle" | "transitioning";

  export interface ThemeSceneTransition {
    targetThemeKey: SiteThemeKey;
    startedAt: string;
    expiresAt: string;
  }

  export const THEME_SCENE_TRANSITION_DURATION_MS = 90_000;
  ```

  Extend `SiteThemeSettings` with the three camel-cased transition fields and
  extend `ResolvedSiteTheme` with `transition: ThemeSceneTransition | null`.

- [ ] **Step 3: Validate and map transition fields defensively.**

  In `site-theme-validation.ts`, export a predicate that accepts only the exact
  pair `transitioning` plus an approved theme key plus a timestamp whose
  `new Date(value).getTime()` is not `NaN`. In
  `toSiteThemeSettings`, map all three fields; any invalid/partial row becomes:

  ```ts
  {
    transitionState: "idle",
    transitionTargetThemeKey: null,
    transitionStartedAt: null,
  }
  ```

  Update the reader's `AUTOMATIC_SETTINGS` fallback with this same idle/null
  triple. Update `SETTINGS_COLUMNS` in both reader and repository to select
  `manual_theme_key,transition_state,transition_target_theme_key,transition_started_at,updated_at`.

- [ ] **Step 4: Source-check model/migration correspondence.**

  Run:

  ```bash
  rg -n 'transition_(state|target_theme_key|started_at)|ThemeSceneTransition|THEME_SCENE_TRANSITION_DURATION_MS' docs/migrations/2026-07-22-theme-scene-transition-maintenance.sql src/lib/supabase/database.types.ts src/modules/site-theme
  ```

  Expected: all three SQL columns have matching database type fields and mapper/domain references; only the migration contains SQL.

### Task 2: Resolve and mutate transitions through the existing Site Theme boundary

**Files:**

- Modify: `src/modules/site-theme/application/site-theme-repository.ts`
- Modify: `src/modules/site-theme/infrastructure/supabase-site-theme-reader.ts`
- Modify: `src/modules/site-theme/infrastructure/supabase-site-theme-repository.ts`
- Modify: `src/modules/site-theme/application/manage-site-theme.ts`
- Modify: `src/modules/site-theme/application/resolve-site-theme.ts`
- Modify: `src/modules/site-theme/presentation/site-theme-actions.ts`

**Interfaces:**

- Consumes the extended `SiteThemeSettings`, `ThemeSceneTransition`, timeout constant, and existing Owner guard.
- Produces three use cases/actions: `startSceneTransition`, `commitSceneTransition`, and `cancelSceneTransition`.
- Keeps `setManualTheme`, schedule methods, `ResolveSiteTheme.execute`, and public reader behavior intact except for the added transition result.

- [ ] **Step 1: Add conditional repository operations.**

  Extend `SiteThemeRepository` with:

  ```ts
  startSceneTransition(ownerId: string, targetThemeKey: SiteThemeKey, startedAt: string): Promise<Result<SiteThemeSettings>>;
  commitSceneTransition(ownerId: string): Promise<Result<SiteThemeSettings>>;
  cancelSceneTransition(ownerId: string): Promise<Result<SiteThemeSettings>>;
  ```

  Implement each in `SupabaseSiteThemeRepository` on `site_theme_settings` with
  `.eq("id", true)`, `updated_by: ownerId`, and extended `SETTINGS_COLUMNS`.

  - `setManualTheme` clears `transition_state`, `transition_target_theme_key`, and
    `transition_started_at` in its existing update alongside `manual_theme_key`.
    This keeps direct manual/automatic writes valid and guarantees they cannot
    leave the public gate stranded.
  - Start writes `transition_state: "transitioning"`, the validated target, and the
    passed server timestamp.
  - Commit first selects the singleton's persisted transitioning target with the
    extended settings columns and validates it on the server. It then conditionally
    updates with `.eq("id", true)`, `.eq("transition_state", "transitioning")`, and
    `.eq("transition_target_theme_key", persistedTarget)`, writing
    `manual_theme_key: persistedTarget`, `updated_by: ownerId`, and cleared
    transition fields in the same statement. A stale start/cancel/second commit
    returns `NOT_FOUND`; it cannot commit a client-supplied key.
  - Cancel matches `transition_state = "transitioning"`, then clears all
    transition fields without changing `manual_theme_key`.

  A missing conditional match returns the existing `NOT_FOUND` result; database
  errors return `UNEXPECTED_FAILURE`.

- [ ] **Step 2: Add Owner-guarded use cases and Server Actions.**

  `ManageSiteTheme` receives three methods that call `requireCatalogueOwner`, validate
  `SiteThemeKey`, then delegate to Task 2 Step 1. `startSceneTransition` passes
  `new Date().toISOString()` from the server use case.

  In `site-theme-actions.ts`, expose:

  ```ts
  export async function startThemeSceneTransitionAction(themeKey: SiteThemeKey) {
    return runServerAction((backend, actor) =>
      backend.manageSiteTheme.startSceneTransition(actor, themeKey),
    );
  }

  export async function commitThemeSceneTransitionAction() {
    return revalidateAfterMutation(await runServerAction((backend, actor) =>
      backend.manageSiteTheme.commitSceneTransition(actor),
    ));
  }
  ```

  Add `cancelThemeSceneTransitionAction` with the same `revalidateAfterMutation`
  wrapper as commit. Start intentionally does not call revalidation, keeping the
  Owner page mounted while public fresh requests see the persisted gate.

- [ ] **Step 3: Return only a non-expired valid transition from the resolver.**

  In `ResolveSiteTheme.execute`, preserve current manual/schedule key logic and add
  a pure helper:

  ```ts
  function resolveSceneTransition(settings: SiteThemeSettings, now: string): ThemeSceneTransition | null {
    if (settings.transitionState !== "transitioning" || !settings.transitionTargetThemeKey || !settings.transitionStartedAt) return null;
    const expiresAt = new Date(new Date(settings.transitionStartedAt).getTime() + THEME_SCENE_TRANSITION_DURATION_MS).toISOString();
    return new Date(expiresAt).getTime() > new Date(now).getTime()
      ? { targetThemeKey: settings.transitionTargetThemeKey, startedAt: settings.transitionStartedAt, expiresAt }
      : null;
  }
  ```

  Every `ResolvedSiteTheme` return includes `transition`, including fallback paths.

- [ ] **Step 4: Source-check security and action boundaries.**

  Run:

  ```bash
  rg -n 'startSceneTransition|commitSceneTransition|cancelSceneTransition|requireCatalogueOwner|runServerAction|revalidateAfterMutation|transition_state' src/modules/site-theme
  ```

  Expected: only `ManageSiteTheme` authorizes transition methods; only the three
  new Server Actions call them; start lacks revalidation; commit/cancel keep it.

### Task 3: Render the maintenance gate and Owner progress ritual

**Files:**

- Create: `src/components/theme/theme-maintenance-screen.tsx`
- Modify: `src/app/layout.tsx`
- Create: `src/features/site-theme/presentation/theme-scene-transition-progress.tsx`
- Modify: `src/features/site-theme/presentation/theme-scene-picker.tsx`
- Modify: `src/features/site-theme/presentation/admin-site-theme.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**

- Consumes `ThemeSceneTransition` and target key from Task 2.
- Produces a server-only maintenance screen and a Client-owned progress presentation.
- Preserves existing `ThemeAtmosphere`, `ThemeScenePicker`, manual automatic mode,
  schedule components, feedback live region, and `chooseMode(null)` behavior.

- [ ] **Step 1: Create the static maintenance screen.**

  Add `ThemeMaintenanceScreen` accepting `{ targetThemeKey: SiteThemeKey }`. It
  renders only scene label, title, short copy, and static progress motif; it has no
  button, client directive, timer, fetch, or personal information.

  ```tsx
  export function ThemeMaintenanceScreen({ targetThemeKey }: { targetThemeKey: SiteThemeKey }) {
    const preset = getSiteThemePreset(targetThemeKey);
    return (
      <main className="theme-maintenance-screen diary-shell" role="status">
        <section className="theme-maintenance-card">
          <p className="diary-kicker">{preset.label}</p>
          <h1 className="font-display">Không gian đang thay áo mới</h1>
          <p>Chúng mình đang hoàn thiện một chương mới. Trang sẽ trở lại trong giây lát.</p>
          <span aria-hidden="true" className="theme-maintenance-meter"><i /><i /><i /></span>
        </section>
      </main>
    );
  }
  ```

- [ ] **Step 2: Gate root children with the resolver transition.**

  In `RootLayout`, derive `activeThemeKey` from
  `theme.transition?.targetThemeKey ?? theme.key`; use it for `data-theme` and
  `ThemeAtmosphere`. Render maintenance instead of `{children}` only when
  `theme.transition` is non-null.

  ```tsx
  const activeThemeKey = theme.transition?.targetThemeKey ?? theme.key;

  <body data-theme={activeThemeKey} className={`${displayFont.variable} ${bodyFont.variable}`}>
    <ThemeAtmosphere theme={activeThemeKey} />
    {theme.transition ? <ThemeMaintenanceScreen targetThemeKey={activeThemeKey} /> : children}
  </body>
  ```

- [ ] **Step 3: Add local Owner pacing with cleanup-safe timers.**

  Create a stateless `ThemeSceneTransitionProgress` with props `targetThemeKey`,
  `step: 0 | 1 | 2 | 3`, and `onCancel`. In `AdminSiteTheme`, own timer refs,
  cleanup effect, `transitionTarget`, and `transitionStep`.

  Complete the already-approved visual-picker task before this integration so
  `AdminSiteTheme` renders `ThemeScenePicker`. Its existing `disabled` prop is the
  sole control point; do not add a second picker or retain the former inline radio
  list. Manual `chooseMode(themeKey)` behavior then becomes:

  1. `null` continues to call current `setManualSiteThemeAction(null)`.
  2. A key calls `startThemeSceneTransitionAction(key)`; on success, sets target
     and starts local step timers at 0ms, 420ms, and 900ms.
  3. At 1,350ms, call `commitThemeSceneTransitionAction()` with no theme argument;
     on success set step
     3, clear local transition state, announce success, then `router.refresh()`.
  4. Any failure invokes `cancelThemeSceneTransitionAction()`, clears timers/state,
     and reports existing-style feedback.

  Pass `disabled={transitionTarget !== null || isPending}` to `ThemeScenePicker`.
  Disable the schedule trigger using the same expression. The explicit cancel
  control clears the persisted state before restoring the picker. If the initial
  start action fails, do not call cancel because no transition was persisted.

- [ ] **Step 4: Add static maintenance and reduced-motion CSS.**

  Add styles for `.theme-maintenance-screen`, `.theme-maintenance-card`, and
  `.theme-maintenance-meter` using existing scene tokens. The meter may animate
  opacity/transform only; the existing reduced-motion block disables it. Add
  progress styles that make the current Owner step visible through text and a
  completed/current/pending state, not color alone.

- [ ] **Step 5: Source-check root gate and UI action wiring.**

  Run:

  ```bash
  rg -n 'ThemeMaintenanceScreen|transition\?|startThemeSceneTransitionAction|commitThemeSceneTransitionAction|cancelThemeSceneTransitionAction|theme-maintenance|prefers-reduced-motion' src/app src/components/theme src/features/site-theme/presentation
  ```

  Expected: root layout is the only global gate; the Owner component imports all
  three actions; maintenance markup has no interactive control; reduced motion
  covers both maintenance meter and scene layers.

### Task 4: Perform the allowed source-only handoff checks

**Files:**

- Modify: no files expected
- Inspect: all files listed in this plan’s File Structure table

**Interfaces:**

- Consumes the migration text, typed settings mapping, resolver result, actions,
  root gate, and Owner ritual.
- Produces source/diff evidence only; it does not claim migration application,
  RLS runtime behavior, tests, type-check, build, browser QA, or live transition verification.

- [ ] **Step 1: Inspect the migration and source scope.**

  Run:

  ```bash
  git diff --name-only -- docs/migrations src/lib/supabase/database.types.ts src/modules/site-theme src/app/layout.tsx src/components/theme src/features/site-theme/presentation
  ```

  Expected: only the approved migration, Site Theme boundary, root presentation,
  maintenance/progress components, and Owner theme presentation paths appear.

- [ ] **Step 2: Check whitespace and invariants.**

  Run:

  ```bash
  git diff --check
  ```

  Expected: no output and exit code `0`.

  Then run:

  ```bash
  rg -n 'transition_state|transition_target_theme_key|transition_started_at|ThemeMaintenanceScreen|requireCatalogueOwner|startThemeSceneTransitionAction|commitThemeSceneTransitionAction|cancelThemeSceneTransitionAction' docs/migrations src/lib/supabase/database.types.ts src/modules/site-theme src/app src/components/theme src/features/site-theme/presentation
  ```

  Expected: all three fields have migration/type/domain/mapper coverage; all
  transition writes stay behind Owner guard and Server Actions; only root layout
  renders the maintenance gate.

- [ ] **Step 3: State the verification boundary accurately.**

  Report source and diff evidence, and explicitly state that the migration was not
  applied, RLS was not exercised, and test/lint/build/type-check/browser QA were
  not run under the user’s standing instruction. Do not claim runtime success.
