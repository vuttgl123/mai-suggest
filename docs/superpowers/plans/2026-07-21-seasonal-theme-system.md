# Seasonal Theme System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Work inline in the current workspace; do not create worktrees, dispatch subagents, commit, or push.

**Goal:** Let an Owner schedule or manually select a curated site atmosphere while every route renders the resolved Bordeaux-family theme on its first server paint.

**Architecture:** A `site-theme` bounded context owns theme keys, schedule validation, resolution rules and Supabase access. The root Server Component resolves a safe preset and writes a `data-theme` attribute to `body`; CSS owns the visual tokens. An owner-only page reads and mutates the same context through Server Actions, while Supabase RLS authorizes every database write.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS 4, CSS custom properties, Lucide React, Supabase Postgres + RLS, `@supabase/ssr`.

## Global Constraints

- Preserve Bordeaux Diary as the fallback and visual identity; all presets use curated source-controlled tokens, never arbitrary CSS, raw colors from the database, uploaded backgrounds, or member-specific settings.
- Implement exactly `bordeaux`, `valentine`, `spring`, `noel`, and `anniversary` in the initial registry.
- Store schedule instants as `timestamptz`; the Owner form accepts and renders `Asia/Ho_Chi_Minh` date/time values.
- Resolve manual override first, then the highest-priority active schedule, then newest `starts_at`, then ascending `id`, then `bordeaux`.
- Keep the root rendering resilient: missing rows, a malformed stored key, a read error, or a migration not yet applied must render `bordeaux`, not fail the page.
- Enable RLS for both new public tables. `anon` and `authenticated` may select only the non-sensitive visual configuration; only an active Owner may mutate it.
- Do not expose a service-role/secret key or make authorization decisions from Google user metadata.
- Do not create automated test files in this feature: the user explicitly does not want tests at this stage. Do not delete existing tests.
- Do not apply SQL to Supabase, seed remote data, commit, push, or create a worktree. The user applies the reviewed migration and runs checks in Windows CMD.
- Respect `prefers-reduced-motion`; decorative motion must use opacity/transform only and must never block clicks or focus.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `docs/migrations/2026-07-21-site-theme-system.sql` | Tables, constraints, index, triggers, RLS policies and grants for visual configuration. |
| `src/lib/supabase/database.types.ts` | Strict local row types for the two tables. |
| `src/modules/site-theme/domain/site-theme-models.ts` | Curated keys, domain records, inputs and resolver result types. |
| `src/modules/site-theme/domain/site-theme-validation.ts` | Normalizes keys, IDs, priority and schedule instants. |
| `src/modules/site-theme/domain/site-theme-time.ts` | Converts and formats `Asia/Ho_Chi_Minh` date/time values. |
| `src/modules/site-theme/application/site-theme-reader.ts` | Read port for settings, current schedule and management list. |
| `src/modules/site-theme/application/site-theme-repository.ts` | Write port for override and schedules. |
| `src/modules/site-theme/application/resolve-site-theme.ts` | Non-throwing resolver for root layout. |
| `src/modules/site-theme/application/get-managed-site-theme.ts` | Owner dashboard read use case. |
| `src/modules/site-theme/application/manage-site-theme.ts` | Owner-only write use case. |
| `src/modules/site-theme/infrastructure/site-theme-mappers.ts` | Maps Supabase rows into domain records. |
| `src/modules/site-theme/infrastructure/supabase-site-theme-reader.ts` | Typed public/select queries, including active-schedule ordering. |
| `src/modules/site-theme/infrastructure/supabase-site-theme-repository.ts` | Typed owner mutation queries. |
| `src/modules/site-theme/presentation/site-theme-actions.ts` | Authenticated Server Actions and layout revalidation. |
| `src/features/site-theme/presentation/admin-site-theme.tsx` | Owner dashboard shell, feedback and mutation coordination. |
| `src/features/site-theme/presentation/theme-schedule-form.tsx` | Create/edit form with Vietnam-local date/time inputs. |
| `src/features/site-theme/presentation/theme-schedule-list.tsx` | Accessible editable schedule list and conflict hint. |
| `src/app/admin/khong-khi/page.tsx` | Owner-protected server page. |
| `src/lib/backend/create-server-backend.ts` | Composes the new DDD use cases with the server Supabase client. |
| `src/app/layout.tsx` | Resolves the theme before emitting `<body>`. |
| `src/app/globals.css` | Semantic colors, each preset override and non-interactive atmosphere layers. |
| `src/features/catalogue/presentation/admin-catalogue.tsx` | Adds a discoverable Owner link to the atmosphere dashboard. |
| `docs/database` | Documents the two tables, access model and resolver order. |
| `docs/product-direction.md` | Already records the product decision; keep it aligned only if final copy differs. |

## Task 1: Add the reviewed Supabase schema, access control and local types

**Files:**
- Create: `docs/migrations/2026-07-21-site-theme-system.sql`
- Modify: `src/lib/supabase/database.types.ts`
- Modify: `docs/database`

**Consumes:** Existing `public.set_updated_at()`, `private.is_owner()` and `public.profiles` from the applied base schema.

**Produces:** `site_theme_settings` singleton and `site_theme_schedules` with safe Data API grants and exact TypeScript row contracts.

- [ ] **Step 1: Write the migration without applying it**

  Create the migration with this SQL. The singleton is seeded once, so code never needs privileged insertion; the partial index matches the active-schedule query shape and the schedule count remains small.

  ```sql
  begin;

  create table if not exists public.site_theme_settings (
    id boolean primary key default true,
    manual_theme_key text,
    updated_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint site_theme_settings_singleton_check check (id = true),
    constraint site_theme_settings_theme_key_check check (
      manual_theme_key is null
      or manual_theme_key in ('bordeaux', 'valentine', 'spring', 'noel', 'anniversary')
    )
  );

  insert into public.site_theme_settings (id)
  values (true)
  on conflict (id) do nothing;

  create table if not exists public.site_theme_schedules (
    id uuid primary key default gen_random_uuid(),
    theme_key text not null,
    starts_at timestamptz not null,
    ends_at timestamptz not null,
    priority integer not null default 0,
    is_enabled boolean not null default true,
    created_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint site_theme_schedules_theme_key_check check (
      theme_key in ('bordeaux', 'valentine', 'spring', 'noel', 'anniversary')
    ),
    constraint site_theme_schedules_window_check check (ends_at > starts_at),
    constraint site_theme_schedules_priority_check check (priority >= 0)
  );

  create index if not exists idx_site_theme_schedules_active_resolution
    on public.site_theme_schedules (priority desc, starts_at desc, id asc)
    where is_enabled = true;

  drop trigger if exists set_site_theme_settings_updated_at
    on public.site_theme_settings;
  create trigger set_site_theme_settings_updated_at
  before update on public.site_theme_settings
  for each row execute function public.set_updated_at();

  drop trigger if exists set_site_theme_schedules_updated_at
    on public.site_theme_schedules;
  create trigger set_site_theme_schedules_updated_at
  before update on public.site_theme_schedules
  for each row execute function public.set_updated_at();

  alter table public.site_theme_settings enable row level security;
  alter table public.site_theme_schedules enable row level security;

  drop policy if exists "site_theme_settings_public_select" on public.site_theme_settings;
  create policy "site_theme_settings_public_select"
  on public.site_theme_settings for select to anon, authenticated using (true);

  drop policy if exists "site_theme_settings_owner_update" on public.site_theme_settings;
  create policy "site_theme_settings_owner_update"
  on public.site_theme_settings for update to authenticated
  using ((select private.is_owner()))
  with check (
    (select private.is_owner())
    and updated_by = (select auth.uid())
  );

  drop policy if exists "site_theme_schedules_public_select" on public.site_theme_schedules;
  create policy "site_theme_schedules_public_select"
  on public.site_theme_schedules for select to anon, authenticated using (true);

  drop policy if exists "site_theme_schedules_owner_insert" on public.site_theme_schedules;
  create policy "site_theme_schedules_owner_insert"
  on public.site_theme_schedules for insert to authenticated
  with check (
    (select private.is_owner())
    and created_by = (select auth.uid())
  );

  drop policy if exists "site_theme_schedules_owner_update" on public.site_theme_schedules;
  create policy "site_theme_schedules_owner_update"
  on public.site_theme_schedules for update to authenticated
  using ((select private.is_owner()))
  with check ((select private.is_owner()));

  drop policy if exists "site_theme_schedules_owner_delete" on public.site_theme_schedules;
  create policy "site_theme_schedules_owner_delete"
  on public.site_theme_schedules for delete to authenticated
  using ((select private.is_owner()));

  revoke all on table public.site_theme_settings, public.site_theme_schedules
    from anon, authenticated;
  grant select on table public.site_theme_settings, public.site_theme_schedules
    to anon, authenticated;
  grant update on table public.site_theme_settings to authenticated;
  grant insert, update, delete on table public.site_theme_schedules to authenticated;
  grant all on table public.site_theme_settings, public.site_theme_schedules
    to service_role;

  commit;
  ```

- [ ] **Step 2: Extend the generated-style local database contract**

  Add the following row types beside `FutureLetterRow`, then add both table names to `Database["public"]["Tables"]`. The existing generic `Table<Row>` derives `Insert` and `Update` from these exact fields.

  ```ts
  type SiteThemeSettingsRow = {
    id: boolean;
    manual_theme_key: string | null;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
  };

  type SiteThemeScheduleRow = {
    id: string;
    theme_key: string;
    starts_at: string;
    ends_at: string;
    priority: number;
    is_enabled: boolean;
    created_by: string | null;
    created_at: string;
    updated_at: string;
  };
  ```

  ```ts
  site_theme_settings: Table<SiteThemeSettingsRow>;
  site_theme_schedules: Table<SiteThemeScheduleRow>;
  ```

- [ ] **Step 3: Document the data contract**

  Add a `SITE THEME` section to `docs/database` that states: `site_theme_settings` has exactly one `id = true` row; `manual_theme_key = null` means automatic; schedules use `timestamptz`; any visitor may read only the configuration; Owner-only writes are enforced by `private.is_owner()`; and the order is manual override, priority, newest start, UUID, Bordeaux fallback.

- [ ] **Step 4: Request explicit migration review**

  Present `docs/migrations/2026-07-21-site-theme-system.sql` to the user. Do not apply it or create a seed schedule. The user decides when to execute it in Supabase SQL Editor.

## Task 2: Build the site-theme domain and application boundaries

**Files:**
- Create: `src/modules/site-theme/domain/site-theme-models.ts`
- Create: `src/modules/site-theme/domain/site-theme-validation.ts`
- Create: `src/modules/site-theme/domain/site-theme-time.ts`
- Create: `src/modules/site-theme/application/site-theme-reader.ts`
- Create: `src/modules/site-theme/application/site-theme-repository.ts`
- Create: `src/modules/site-theme/application/resolve-site-theme.ts`
- Create: `src/modules/site-theme/application/get-managed-site-theme.ts`
- Create: `src/modules/site-theme/application/manage-site-theme.ts`

**Consumes:** `Result`, `CurrentActor`, `requireCatalogueOwner`, and the resolver rules from the approved design.

**Produces:** Stable ports and use cases that do not know about React, Server Actions or Supabase query syntax.

- [ ] **Step 1: Define the curated key registry and immutable records**

  In `site-theme-models.ts`, make the key union the source of truth and export both display metadata and data contracts. Do not put raw CSS colors in this file.

  ```ts
  export const SITE_THEME_KEYS = [
    "bordeaux", "valentine", "spring", "noel", "anniversary",
  ] as const;

  export type SiteThemeKey = (typeof SITE_THEME_KEYS)[number];
  export const DEFAULT_SITE_THEME_KEY: SiteThemeKey = "bordeaux";

  export const SITE_THEME_PRESETS: ReadonlyArray<{
    key: SiteThemeKey;
    label: string;
    description: string;
  }> = [
    { key: "bordeaux", label: "Bordeaux Diary", description: "Đỏ Bordeaux, giấy ngà và đồng tiết chế." },
    { key: "valentine", label: "Lời hẹn tháng Hai", description: "Ruby sâu và ánh đồng ấm." },
    { key: "spring", label: "Mùa xuân dịu dàng", description: "Berry trầm và sage kín đáo." },
    { key: "noel", label: "Đêm cuối năm", description: "Bordeaux, evergreen và champagne." },
    { key: "anniversary", label: "Chương kỷ niệm", description: "Wine đậm và ánh vàng cổ." },
  ];

  export interface SiteThemeSettings {
    manualThemeKey: SiteThemeKey | null;
    updatedAt: string;
  }

  export interface SiteThemeSchedule {
    id: string;
    themeKey: SiteThemeKey;
    startsAt: string;
    endsAt: string;
    priority: number;
    isEnabled: boolean;
    createdAt: string;
    updatedAt: string;
  }

  export interface SiteThemeScheduleInput {
    themeKey: SiteThemeKey;
    startsAt: string;
    endsAt: string;
    priority: number;
    isEnabled: boolean;
  }

  export interface ResolvedSiteTheme {
    key: SiteThemeKey;
    source: "manual" | "schedule" | "default" | "fallback";
    scheduleId: string | null;
  }

  export interface SiteThemeManagement {
    settings: SiteThemeSettings;
    schedules: SiteThemeSchedule[];
    resolved: ResolvedSiteTheme;
  }
  ```

- [ ] **Step 2: Normalize all owner input at the domain boundary**

  `isSiteThemeKey(value: string | null | undefined): value is SiteThemeKey` uses `SITE_THEME_KEYS.includes`. `normalizeSiteThemeScheduleInput` rejects a key outside that union, a non-finite/non-integer `priority` outside `0..1000`, invalid ISO values, or `endsAt <= startsAt`; it returns `failure("VALIDATION_FAILED")` otherwise a normalized ISO input. `hasSiteThemeScheduleId` accepts a non-empty trimmed ID. Keep user-facing Vietnam parsing in `site-theme-time.ts` with the same exact `+07:00` round-trip strategy used by future letters, but name its exports `toVietnamThemeInstant`, `toVietnamThemeDateTimeParts`, and `formatThemeScheduleDateTime`.

- [ ] **Step 3: Define thin read and write ports**

  ```ts
  export interface SiteThemeReader {
    getSettings(): Promise<Result<SiteThemeSettings>>;
    findActiveSchedule(now: string): Promise<Result<SiteThemeSchedule | null>>;
    listSchedules(): Promise<Result<SiteThemeSchedule[]>>;
  }

  export interface SiteThemeRepository {
    setManualTheme(
      ownerId: string,
      themeKey: SiteThemeKey | null,
    ): Promise<Result<SiteThemeSettings>>;
    createSchedule(
      ownerId: string,
      input: SiteThemeScheduleInput,
    ): Promise<Result<SiteThemeSchedule>>;
    updateSchedule(
      scheduleId: string,
      input: SiteThemeScheduleInput,
    ): Promise<Result<SiteThemeSchedule>>;
    deleteSchedule(scheduleId: string): Promise<Result<void>>;
  }
  ```

- [ ] **Step 4: Implement the non-throwing resolver and management use cases**

  `ResolveSiteTheme.execute(now = new Date().toISOString())` uses `Promise.all` for `getSettings()` and `findActiveSchedule(now)`. It returns the manual key only when the reader succeeded and `isSiteThemeKey` accepts it; otherwise it returns the valid active schedule; otherwise `{ key: DEFAULT_SITE_THEME_KEY, source: settingsResult.ok && scheduleResult.ok ? "default" : "fallback", scheduleId: null }`. It deliberately returns `ResolvedSiteTheme`, not `Result`, so the layout always has a safe visual answer.

  `GetManagedSiteTheme.execute(actor)` first calls `requireCatalogueOwner(actor)`, then reads settings, schedules and resolved theme concurrently. It returns `Result<SiteThemeManagement>` and uses `UNEXPECTED_FAILURE` when either management read fails.

  `ManageSiteTheme` calls `requireCatalogueOwner` before every mutation. Its public methods are `setManualTheme(actor, themeKey)`, `createSchedule(actor, input)`, `updateSchedule(actor, scheduleId, input)`, and `deleteSchedule(actor, scheduleId)`. It validates the nullable preset or schedule input before delegating, and never accepts a caller-provided owner ID.

## Task 3: Implement typed Supabase adapters and compose the backend

**Files:**
- Create: `src/modules/site-theme/infrastructure/site-theme-mappers.ts`
- Create: `src/modules/site-theme/infrastructure/supabase-site-theme-reader.ts`
- Create: `src/modules/site-theme/infrastructure/supabase-site-theme-repository.ts`
- Modify: `src/lib/backend/create-server-backend.ts`

**Consumes:** Domain ports from Task 2 and `Database` types from Task 1.

**Produces:** A single backend composition point that exposes `resolveSiteTheme`, `getManagedSiteTheme` and `manageSiteTheme`.

- [ ] **Step 1: Map database field names once**

  Keep the select lists local and narrow:

  ```ts
  const SETTINGS_COLUMNS = "manual_theme_key,updated_at";
  const SCHEDULE_COLUMNS =
    "id,theme_key,starts_at,ends_at,priority,is_enabled,created_at,updated_at";
  ```

  `toSiteThemeSettings` returns `{ manualThemeKey: isSiteThemeKey(row.manual_theme_key) ? row.manual_theme_key : null, updatedAt: row.updated_at }`. `toSiteThemeSchedule` is called only after `isSiteThemeKey(row.theme_key)` is true; otherwise the reader treats the row as invalid and falls back rather than casting it.

- [ ] **Step 2: Use the public reader for first-paint resolution**

  Implement `SupabaseSiteThemeReader` with a `SupabaseClient<Database>`. `getSettings()` selects the singleton with `.eq("id", true).maybeSingle()` and returns an empty automatic settings record when no row exists. `findActiveSchedule(now)` uses this exact query ordering and returns `null` when no row matches:

  ```ts
  const { data, error } = await this.client
    .from("site_theme_schedules")
    .select(SCHEDULE_COLUMNS)
    .eq("is_enabled", true)
    .lte("starts_at", now)
    .gt("ends_at", now)
    .order("priority", { ascending: false })
    .order("starts_at", { ascending: false })
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();
  ```

  `listSchedules()` returns every schedule newest-first for the Owner UI using `.order("starts_at", { ascending: false }).order("id", { ascending: true })`. Any Supabase error returns `failure("UNEXPECTED_FAILURE")`; a malformed key is skipped from a list and produces `null` from the active query.

- [ ] **Step 3: Keep write mutations narrow and identity-stamped**

  `SupabaseSiteThemeRepository.setManualTheme` updates the seeded singleton with `.eq("id", true)`, writes both `manual_theme_key` and `updated_by: ownerId`, selects `SETTINGS_COLUMNS`, and returns `NOT_FOUND` if the singleton unexpectedly disappeared. `createSchedule` inserts `created_by: ownerId` plus normalized input fields. `updateSchedule` never changes `created_by`. Both mutation methods select `SCHEDULE_COLUMNS` and use `maybeSingle()` so a RLS-denied or removed row becomes a safe `NOT_FOUND`/`UNEXPECTED_FAILURE` result rather than an exception. `deleteSchedule` selects `id` after delete and returns `NOT_FOUND` when no row was deleted.

- [ ] **Step 4: Extend backend composition without client leakage**

  Add direct imports, construct exactly one `SupabaseSiteThemeReader` and `SupabaseSiteThemeRepository`, then add these fields to the returned object:

  ```ts
  resolveSiteTheme: new ResolveSiteTheme(siteThemeReader),
  getManagedSiteTheme: new GetManagedSiteTheme(siteThemeReader),
  manageSiteTheme: new ManageSiteTheme(siteThemeRepository),
  ```

  Do not import these adapters from a Client Component and do not add a second Supabase client factory.

## Task 4: Resolve the theme in the root layout and add tokenized atmosphere

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/components/app-header.tsx`
- Modify: `src/components/ui/button.tsx`

**Consumes:** `resolveSiteTheme` from Task 3 and the preset key union from Task 2.

**Produces:** Correct theme tokens before hydration, with shared shell controls using semantic values rather than hard-coded Bordeaux RGB values.

- [ ] **Step 1: Make the root layout resolve before emitting `<body>`**

  Change `RootLayout` to `async`, create the server backend once, await `backend.resolveSiteTheme.execute()`, and render the key as a body attribute:

  ```tsx
  export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const backend = await createServerBackend();
    const theme = await backend.resolveSiteTheme.execute();

    return (
      <html lang="vi">
        <body
          className={`${displayFont.variable} ${bodyFont.variable}`}
          data-theme={theme.key}
        >
          {children}
        </body>
      </html>
    );
  }
  ```

  Retain the static `viewport.themeColor` as Bordeaux in this first version. It keeps the browser chrome stable and avoids a client-side meta-tag mutation.

- [ ] **Step 2: Convert the global palette to semantic base and atmosphere tokens**

  Keep current Bordeaux values under `:root`, then add `--theme-glow-one`, `--theme-glow-two`, `--theme-wash`, `--theme-hairline`, and `--theme-shadow-color`. Define all five `[data-theme="key"]` blocks, where each block changes `--color-brand`, `--color-brand-strong`, `--color-brand-soft`, `--color-accent`, `--color-paper`, `--color-surface`, `--color-ink`, `--color-muted`, `--color-border`, shadows and atmosphere tokens as a coherent set. `bordeaux` must reproduce the current palette.

  Replace fixed background colors in `body`, `.diary-wash`, `.timeline-rail`, timeline entry shadow, header surfaces and shared buttons with variables derived from these tokens. Preserve `--color-danger`, focus visibility and success semantics; never make status text depend on a decorative seasonal color.

- [ ] **Step 3: Add only non-interactive decorative layers**

  Add a fixed `body::before` wash and `body::after` subtle grain/pattern. Both use `pointer-events: none`, `position: fixed`, `inset: 0`, a safe negative/behind-content stacking context, and no layout-affecting properties. Use `--theme-glow-*` and `--theme-wash` so one CSS layer works for all presets. The default visual remains quiet; Valentine can have a soft radial bloom, Spring a faint petal-like texture, Noel sparse star points and Anniversary an antique-gold wash without literal clip-art.

- [ ] **Step 4: Respect reduced motion and current route transitions**

  If a decorative pulse is added, animate only `opacity` and `transform`, never run it indefinitely at high contrast, and disable it in the existing `@media (prefers-reduced-motion: reduce)` block. Do not add `ViewTransition` for theme switching; route transitions already have a clear directional purpose and remain untouched.

## Task 5: Add owner-only actions and the atmosphere management route

**Files:**
- Create: `src/modules/site-theme/presentation/site-theme-actions.ts`
- Create: `src/app/admin/khong-khi/page.tsx`
- Modify: `src/features/catalogue/presentation/admin-catalogue.tsx`

**Consumes:** `runServerAction`, `revalidateAfterMutation`, management use cases and existing Owner access guard pattern.

**Produces:** A protected page and four actions that use the same RLS-protected client as every other module.

- [ ] **Step 1: Add authenticated Server Actions**

  Follow `timeline-actions.ts`. Export exactly these functions:

  ```ts
  "use server";

  import { revalidateAfterMutation, runServerAction } from "@/lib/backend/run-server-action";
  import type { SiteThemeKey, SiteThemeScheduleInput } from "@/modules/site-theme/domain/site-theme-models";

  export async function setManualSiteThemeAction(themeKey: SiteThemeKey | null) {
    return revalidateAfterMutation(
      await runServerAction((backend, actor) =>
        backend.manageSiteTheme.setManualTheme(actor, themeKey),
      ),
    );
  }

  export async function createSiteThemeScheduleAction(input: SiteThemeScheduleInput) {
    return revalidateAfterMutation(
      await runServerAction((backend, actor) =>
        backend.manageSiteTheme.createSchedule(actor, input),
      ),
    );
  }

  export async function updateSiteThemeScheduleAction(
    scheduleId: string,
    input: SiteThemeScheduleInput,
  ) {
    return revalidateAfterMutation(
      await runServerAction((backend, actor) =>
        backend.manageSiteTheme.updateSchedule(actor, scheduleId, input),
      ),
    );
  }

  export async function deleteSiteThemeScheduleAction(scheduleId: string) {
    return revalidateAfterMutation(
      await runServerAction((backend, actor) =>
        backend.manageSiteTheme.deleteSchedule(actor, scheduleId),
      ),
    );
  }
  ```

  Do not receive an actor ID from the browser.

- [ ] **Step 2: Build the protected Server Component page**

  Set `export const dynamic = "force-dynamic"`. Create the backend, resolve actor access with `resolveActivePageAccess`, redirect to `access.to` when needed, redirect non-Owners to `/access-denied`, then call `backend.getManagedSiteTheme.execute(access.actor)`. Throw `new Error("Unable to load owner site theme management.")` only for a failed Owner management query. Wrap the header and `AdminSiteTheme` in the same `PageTransition`, `.diary-shell`, and skip-link convention as `/admin/hanh-trinh`.

- [ ] **Step 3: Make the page discoverable from existing owner workspaces**

  Add a secondary `Link` in the action group of `AdminCatalogue` to `/admin/khong-khi` with text `Không khí giao diện`. Keep the existing collection and timeline links. Do not add this owner-only route to the public header navigation.

## Task 6: Build the compact, accessible Owner dashboard

**Files:**
- Create: `src/features/site-theme/presentation/admin-site-theme.tsx`
- Create: `src/features/site-theme/presentation/theme-schedule-form.tsx`
- Create: `src/features/site-theme/presentation/theme-schedule-list.tsx`

**Consumes:** `SiteThemeManagement` returned by Task 2, presets, Vietnam time helpers and Server Actions from Task 5.

**Produces:** A polished Owner experience for automatic/manual mode and schedule CRUD without client-side Supabase calls.

- [ ] **Step 1: Render the server-provided effective-state summary**

  `AdminSiteTheme` is a Client Component only because it coordinates form state. Its props are:

  ```ts
  interface AdminSiteThemeProps {
    settings: SiteThemeSettings;
    schedules: SiteThemeSchedule[];
    resolved: ResolvedSiteTheme;
  }
  ```

  Render a paper-card hero with title `Không khí giao diện`, the resolved preset label, and an explicit source sentence: `Đang ghi đè thủ công`, `Đang theo lịch đã hẹn`, `Đang dùng Bordeaux mặc định`, or `Đang dùng Bordeaux an toàn vì chưa đọc được cấu hình`. Use `aria-live="polite"` for save feedback.

- [ ] **Step 2: Implement manual versus automatic selection without optimistic color mutation**

  Render an accessible `fieldset` with a radio for `Tự động theo lịch` and one radio card per `SITE_THEME_PRESETS` entry. Submitting automatic calls `setManualSiteThemeAction(null)`; a selected preset calls its key. Use `useTransition`, disable the group while pending, show the error mapping below, then call `router.refresh()` after success. Do not change `document.body.dataset.theme` optimistically; the next server render is the authoritative state.

  ```ts
  function siteThemeFeedbackFor(code: string): string {
    if (code === "UNAUTHENTICATED") return "Phiên đăng nhập đã hết. Hãy đăng nhập lại.";
    if (code === "ACCESS_DENIED") return "Chỉ Owner có thể đổi không khí giao diện.";
    if (code === "VALIDATION_FAILED") return "Lịch hoặc preset chưa hợp lệ.";
    if (code === "NOT_FOUND") return "Lịch này không còn tồn tại.";
    return "Chưa thể lưu thay đổi lúc này. Hãy thử lại sau.";
  }
  ```

- [ ] **Step 3: Implement the schedule form around local Vietnam values**

  `ThemeScheduleForm` accepts `schedule: SiteThemeSchedule | null`, `schedules`, `onSaved`, and `onCancel`. Its draft has `themeKey`, `startDate`, `startTime`, `endDate`, `endTime`, `priority`, and `isEnabled`. Seed edit values with `toVietnamThemeDateTimeParts`; on submit, turn both pairs into ISO instants with `toVietnamThemeInstant`, then call `createSiteThemeScheduleAction` or `updateSiteThemeScheduleAction`.

  Required fields are preset, start date/time and end date/time. Use a numeric input `min={0}`, `max={1000}`, `step={1}` for priority. Before submit, show `Ngày giờ kết thúc phải muộn hơn ngày giờ bắt đầu.` when parsing fails or the end is not later. Show a non-blocking warning when any enabled existing schedule overlaps the draft and has priority greater than or equal to the draft; saving remains allowed because the documented resolver handles it deterministically.

- [ ] **Step 4: Implement the schedule list and edit/delete flow**

  `ThemeScheduleList` presents a compact ordered list. Each row displays preset label, `formatThemeScheduleDateTime(startsAt)` through `formatThemeScheduleDateTime(endsAt)`, priority and `Bật`/`Tắt`. Provide one clearly labelled edit button and a two-step inline delete confirmation using the existing `Button` variants. Delete calls `deleteSiteThemeScheduleAction`, reports its result via the parent, then refreshes. Do not use a modal, browser confirm dialog, or client Supabase query.

- [ ] **Step 5: Keep the visual density aligned with the product direction**

  Use one responsive two-column grid on large displays (preset/mode at about 22rem, schedule workspace flexible), collapse to one column below `xl`, use existing radius/shadow variables, and preserve `min-h-11` touch targets. Preview cards use only token swatches and descriptive text; no images, excessive hearts or animation are needed.

## Task 7: Verify the SQL, behavior and visual system before handoff

**Files:**
- Modify only if a verification issue reveals an in-scope defect: files from Tasks 1–6.

**Consumes:** User-approved migration and finished implementation.

**Produces:** Evidence that the code is type-safe, builds, follows RLS policy intent and remains usable across layouts.

- [ ] **Step 1: Have the user apply the reviewed SQL once**

  The user runs the migration in Supabase SQL Editor. Do not run it remotely. Confirm only the success/failure message; never request or print keys, JWTs or records.

- [ ] **Step 2: Check the resolver’s visible states**

  As Owner, verify: default Bordeaux with automatic/no active schedule; a manual Valentine override; automatic selection after clearing override; an enabled active schedule; two overlapping schedules where higher priority wins; equal priority where newer `starts_at` wins; and an invalid/missing read safely showing Bordeaux. Reload `/login`, `/`, `/hanh-trinh`, `/thu-hen-ngay-mo`, `/admin`, and `/admin/khong-khi` for each relevant state to ensure there is no Bordeaux flash.

- [ ] **Step 3: Check authorization in four roles**

  Verify anonymous can load the login page and read no content beyond its page; active member can view the resolved atmosphere but has no owner route/action access; inactive member is redirected by existing guards; Owner can create, update, disable and delete schedules. Confirm denied writes are blocked by Supabase RLS as well as the server action—not merely absent controls.

- [ ] **Step 4: Run the user-owned Windows CMD checks**

  ```cmd
  npx.cmd tsc --noEmit
  npm.cmd run build
  ```

  Expected: both commands exit with code `0`. If the repository’s existing lint command is clean after excluding generated `.next` files, also run `npm.cmd run lint`; do not use lint output from generated Turbopack chunks as source-code feedback.

- [ ] **Step 5: Perform browser QA for visual acceptance**

  At 320, 390, 768, 1024 and 1440 px, check the login page, catalogue, timeline, future letters and owner dashboard. Confirm the header remains readable, page backgrounds do not cover controls, focus outlines are visible, text does not overflow, cards remain compact, and keyboard users can operate the radio group, form, edit and delete controls. Repeat once with reduced motion enabled: decoration stays visible but no looping/pulse animation or page-transition animation distracts.

## Plan Self-Review

- **Spec coverage:** Tasks 1–3 cover preset whitelist, schedule persistence, RLS, resolution ordering and safe fallback. Task 4 covers first-paint tokens, shared colors and reduced motion. Tasks 5–6 cover Owner-only management. Task 7 covers migration approval, role behavior, responsive and accessibility validation.
- **No-test direction:** The plan intentionally adds no unit/integration tests because the user asked to defer tests; it preserves all existing tests and replaces nothing with mock data.
- **Scope:** The plan does not introduce a custom builder, external assets, member preferences, location inference, cron, notifications, OAuth changes or an independent backend service.
- **Consistency:** Every action, use case and component name referenced in later tasks is introduced in an earlier task; the only fallback key is `bordeaux`.
