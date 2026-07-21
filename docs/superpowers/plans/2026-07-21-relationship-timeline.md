# Relationship Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Do not use subagents for this repository.

**Goal:** Build a beautiful shared relationship timeline where active members read published milestones and publicly add their own responses, while Owner manages milestones and moderates responses.

**Architecture:** Add two protected Postgres tables and an independent `timeline` DDD module. Server Components load timeline data through typed readers; small Client Components submit Server Actions and refresh the route. Profile display names and avatars are resolved in bulk from the existing `profiles` table, never accepted as response input and never used for authorization.

**Tech Stack:** Next.js 16 App Router, React, TypeScript strict, Tailwind CSS, Lucide React, Motion/ViewTransition, Supabase Postgres/Auth/RLS, `@supabase/ssr`.

## Global Constraints

- Every active member can read published entries and responses; only Owner manages entries; each member creates, edits and deletes only their own response while Owner can delete for moderation.
- Use `profiles.display_name` and `profiles.avatar_url` for Google identity display; never make permissions decisions with Google/user metadata.
- Enable RLS and explicit authenticated grants on every new public-schema table; revoke `anon`; use existing `private.is_active_member()` and `private.is_owner()` helpers with `(select ...)`.
- Keep response ownership immutable with `UPDATE ... USING` and `WITH CHECK`; response insert must verify the parent entry is published.
- No mock/seed data, Storage upload, realtime, notification, reaction, mention, emoji picker or catalogue changes.
- Keep existing Google OAuth, routes and role model intact. Do not expose a secret/service key or query Supabase server-only code from a Client Component.
- Follow the compact Bordeaux design system, 44px interactive targets, keyboard focus and `prefers-reduced-motion` behavior.
- Do not add unit tests or commit/push changes, per user request. The user applies the reviewed migration SQL to Supabase and runs Windows verification commands.

## File Structure

| File | Responsibility |
| --- | --- |
| `docs/migrations/2026-07-21-relationship-timeline.sql` | Additive SQL to apply to the existing hosted database: tables, constraints, indexes, updated-at triggers, grants and RLS policies. |
| `docs/database` | Fresh-schema reference updated with the same two tables, indexes, triggers, RLS, policies and grants. |
| `src/lib/supabase/database.types.ts` | Typed table contracts for timeline rows, inserts and updates. |
| `src/modules/timeline/domain/timeline-models.ts` | Public/admin read models and mutation input contracts. |
| `src/modules/timeline/domain/timeline-validation.ts` | Deterministic validation and normalization for entry and response input. |
| `src/modules/timeline/application/timeline-reader.ts` | Public reader interface. |
| `src/modules/timeline/application/timeline-admin-reader.ts` | Owner reader interface. |
| `src/modules/timeline/application/timeline-repository.ts` | Owner/member mutation interface. |
| `src/modules/timeline/application/list-visible-timeline.ts` | Active-member public use case. |
| `src/modules/timeline/application/list-managed-timeline.ts` | Owner admin list use case. |
| `src/modules/timeline/application/get-managed-timeline-entry.ts` | Owner selected-entry use case. |
| `src/modules/timeline/application/manage-timeline.ts` | Validation plus actor/owner rules for entries and responses. |
| `src/modules/timeline/infrastructure/timeline-mappers.ts` | Typed mapping from Supabase rows to domain models. |
| `src/modules/timeline/infrastructure/supabase-timeline-reader.ts` | Batched public reads and profile decoration. |
| `src/modules/timeline/infrastructure/supabase-timeline-admin-reader.ts` | Owner list/detail reads including drafts and response counts. |
| `src/modules/timeline/infrastructure/supabase-timeline-repository.ts` | RLS-backed entry/response mutations. |
| `src/modules/timeline/presentation/timeline-actions.ts` | Server Action boundary for mutations. |
| `src/lib/backend/create-server-backend.ts` | Compose timeline use cases/repositories into server backend. |
| `src/app/hanh-trinh/page.tsx` | Active-member public timeline route. |
| `src/app/admin/hanh-trinh/page.tsx` | Owner timeline workspace route. |
| `src/components/app-header.tsx` | Add `journey` active section and navigation link. |
| `src/features/timeline/presentation/relationship-timeline.tsx` | Public visual story, milestone cards and response area composition. |
| `src/features/timeline/presentation/timeline-response-panel.tsx` | Client-only create/edit/delete controls for the caller's response. |
| `src/features/timeline/presentation/admin-timeline.tsx` | Owner workspace shell, feedback and selection state. |
| `src/features/timeline/presentation/admin-timeline-list.tsx` | Owner milestone list and selection links. |
| `src/features/timeline/presentation/admin-timeline-editor.tsx` | Owner entry editor and response moderation panel. |
| `src/features/timeline/lib/timeline-navigation.ts` | Safe public/admin query-path builders. |

---

### Task 1: Define and apply the additive timeline database contract

**Files:**
- Create: `docs/migrations/2026-07-21-relationship-timeline.sql`
- Modify: `docs/database`
- Modify: `src/lib/supabase/database.types.ts:1-150`

**Consumes:** Existing `public.profiles`, `private.is_active_member()`, `private.is_owner()`, `set_updated_at()` and existing authenticated grants.

**Produces:** RLS-protected timeline tables and typed generated-style contracts for every later repository.

- [ ] **Step 1: Write the idempotent additive migration SQL**

  Create tables and constraints exactly around the approved contract:

  ```sql
  create table if not exists public.timeline_entries (
    id uuid primary key default gen_random_uuid(),
    date_label text not null,
    occurred_on date,
    title text not null,
    story text not null,
    lesson text,
    image_url text,
    image_alt_text text,
    sort_order integer not null default 0,
    is_published boolean not null default false,
    created_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint timeline_entries_date_label_check check (char_length(trim(date_label)) between 1 and 80),
    constraint timeline_entries_title_check check (char_length(trim(title)) between 1 and 160),
    constraint timeline_entries_story_check check (char_length(trim(story)) between 1 and 8000),
    constraint timeline_entries_lesson_check check (lesson is null or char_length(trim(lesson)) between 1 and 1000),
    constraint timeline_entries_image_alt_check check (image_url is null or char_length(trim(coalesce(image_alt_text, ''))) between 1 and 280),
    constraint timeline_entries_sort_order_check check (sort_order >= 0)
  );

  create table if not exists public.timeline_responses (
    id uuid primary key default gen_random_uuid(),
    timeline_entry_id uuid not null references public.timeline_entries(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    content text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint timeline_responses_content_check check (char_length(trim(content)) between 1 and 2000)
  );
  ```

- [ ] **Step 2: Add indexes, update timestamps, grants and RLS policies**

  Create `timeline_entries_visible_order_idx` on `(is_published, sort_order, occurred_on)`, `timeline_responses_entry_created_idx` on `(timeline_entry_id, created_at)`, and `timeline_responses_user_idx` on `(user_id)`. Attach the existing `public.set_updated_at()` trigger to both tables.

  Grant only `authenticated` and `service_role`; revoke `anon`. Enable RLS. Add these policy rules:

  ```sql
  create policy "timeline_entries_member_select"
  on public.timeline_entries for select to authenticated
  using (
    (select private.is_active_member())
    and (is_published = true or (select private.is_owner()))
  );

  create policy "timeline_entries_owner_manage"
  on public.timeline_entries for all to authenticated
  using ((select private.is_owner()))
  with check ((select private.is_owner()));

  create policy "timeline_responses_member_insert"
  on public.timeline_responses for insert to authenticated
  with check (
    (select private.is_active_member())
    and user_id = (select auth.uid())
    and exists (
      select 1 from public.timeline_entries
      where id = timeline_entry_id and is_published = true
    )
  );
  ```

  Add response select for active members whose parent entry is visible; update only where `user_id = auth.uid()` with the same ownership predicate in `WITH CHECK`; delete where caller owns the response or is Owner. Use `drop policy if exists` before every create so the script is rerunnable.

- [ ] **Step 3: Keep the fresh-schema reference equivalent**

  Insert the tables near catalogue/engagement table definitions in `docs/database`, their indexes in section 12, their updated-at triggers alongside existing updated-at triggers, their RLS enable statements/policies in the matching sections, and their grant/revoke lines in the final grant section. Do not reorganize unrelated SQL.

- [ ] **Step 4: Extend strict TypeScript database contracts**

  Add these row types to `src/lib/supabase/database.types.ts` and include both table names in `Database.public.Tables`:

  ```ts
  type TimelineEntryRow = {
    id: string;
    date_label: string;
    occurred_on: string | null;
    title: string;
    story: string;
    lesson: string | null;
    image_url: string | null;
    image_alt_text: string | null;
    sort_order: number;
    is_published: boolean;
    created_by: string | null;
    created_at: string;
    updated_at: string;
  };

  type TimelineResponseRow = {
    id: string;
    timeline_entry_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
  };
  ```

- [ ] **Step 5: Hand the reviewed SQL to the user before any hosted mutation**

  The application code may be written against the types, but do not run SQL against the hosted project. Tell the user to apply `docs/migrations/2026-07-21-relationship-timeline.sql` in Supabase SQL Editor and report the result before data-dependent browser checks.

### Task 2: Build the timeline DDD boundary and Supabase adapters

**Files:**
- Create: `src/modules/timeline/domain/timeline-models.ts`
- Create: `src/modules/timeline/domain/timeline-validation.ts`
- Create: `src/modules/timeline/application/timeline-reader.ts`
- Create: `src/modules/timeline/application/timeline-admin-reader.ts`
- Create: `src/modules/timeline/application/timeline-repository.ts`
- Create: `src/modules/timeline/application/list-visible-timeline.ts`
- Create: `src/modules/timeline/application/list-managed-timeline.ts`
- Create: `src/modules/timeline/application/get-managed-timeline-entry.ts`
- Create: `src/modules/timeline/application/manage-timeline.ts`
- Create: `src/modules/timeline/infrastructure/timeline-mappers.ts`
- Create: `src/modules/timeline/infrastructure/supabase-timeline-reader.ts`
- Create: `src/modules/timeline/infrastructure/supabase-timeline-admin-reader.ts`
- Create: `src/modules/timeline/infrastructure/supabase-timeline-repository.ts`
- Modify: `src/lib/backend/create-server-backend.ts:1-52`

**Consumes:** Task 1 row contracts; `Result`, `requireActiveActor`, `requireCatalogueOwner` and existing typed Supabase server client.

**Produces:** Server-side timeline operations with explicit public/Owner boundaries and batched profile decoration.

- [ ] **Step 1: Define domain contracts and validation limits**

  Export `TimelineEntry`, `TimelineEntrySummary`, `ManagedTimelineEntry`, `TimelineResponse`, `TimelineResponseInput` and `TimelineEntryInput`. Public response data has:

  ```ts
  interface TimelineResponse {
    id: string;
    entryId: string;
    userId: string;
    author: { displayName: string; avatarUrl: string | null };
    content: string;
    createdAt: string;
    updatedAt: string;
  }
  ```

  `normalizeTimelineEntryInput` trims text, changes blank optional text to `null`, rejects date labels above 80, titles above 160, stories outside 1–8,000, lessons above 1,000, response content outside 1–2,000, negative sort order, invalid ISO date and `imageUrl` without `imageAltText`. Return `Result` failure codes; do not throw raw user validation errors.

- [ ] **Step 2: Define reader/repository interfaces before adapters**

  Public reader exposes `listVisible(): Promise<Result<TimelineEntry[]>>`. Owner reader exposes `listManaged(): Promise<Result<ManagedTimelineEntry[]>>` and `findManagedById(id: string): Promise<Result<ManagedTimelineEntry | null>>`. Repository exposes entry create/update/delete and response create/update/delete methods with caller `userId` included in response commands.

  `ManageTimeline` calls `requireCatalogueOwner` for entries, `requireActiveActor` for response create/update/delete, and gives `canManageAll: actor.canManageCatalogue` only to the delete command. It never trusts a client author name or user id.

- [ ] **Step 3: Map and read entries without N+1 profile calls**

  `SupabaseTimelineReader` selects visible entry columns ordered by `sort_order` then `occurred_on`; it selects all matching response rows ordered by `created_at`; it derives a de-duplicated `userId` array and runs one `.from("profiles").select("id,display_name,avatar_url").in("id", userIds)` query. Map missing names to `"Thành viên"` and missing avatars to `null`.

  `SupabaseTimelineAdminReader` includes drafts and calculates response counts from one response read; selected detail includes decorated responses. Reader errors return `failure("UNEXPECTED_FAILURE")`, never leak database messages.

- [ ] **Step 4: Implement RLS-backed repository mutations**

  Entry writes select exact columns and map results. Response write methods force `user_id` from the use-case command:

  ```ts
  await this.client.from("timeline_responses").insert({
    timeline_entry_id: command.entryId,
    user_id: command.userId,
    content: command.content,
  });
  ```

  Update filters by `id` and `user_id`; delete adds `user_id` unless `canManageAll` is true. Return `NOT_FOUND` for zero-row mutation and `UNEXPECTED_FAILURE` for Supabase errors.

- [ ] **Step 5: Compose all use cases in the backend factory**

  Create one timeline reader, owner reader and repository from the passed client and return:

  ```ts
  listVisibleTimeline: new ListVisibleTimeline(timelineReader),
  listManagedTimeline: new ListManagedTimeline(timelineAdminReader),
  getManagedTimelineEntry: new GetManagedTimelineEntry(timelineAdminReader),
  manageTimeline: new ManageTimeline(timelineRepository),
  ```

  Keep existing catalogue, identity and engagement construction untouched.

### Task 3: Add server action and safe route navigation boundary

**Files:**
- Create: `src/modules/timeline/presentation/timeline-actions.ts`
- Create: `src/features/timeline/lib/timeline-navigation.ts`

**Consumes:** Task 2 backend methods and existing `runServerAction`/`revalidateAfterMutation` conventions.

**Produces:** Browser-safe action calls and URL construction without direct browser Supabase mutations.

- [ ] **Step 1: Add typed Server Actions**

  Export `createTimelineEntryAction`, `updateTimelineEntryAction`, `deleteTimelineEntryAction`, `createTimelineResponseAction`, `updateTimelineResponseAction` and `deleteTimelineResponseAction`. Every action follows:

  ```ts
  const result = await runServerAction((backend, actor) =>
    backend.manageTimeline.createResponse(actor, input),
  );
  return revalidateAfterMutation(result);
  ```

  Entry actions pass the entry ID/input to Owner use cases; response actions accept only `{ entryId, content }` or `{ responseId, content }`, leaving actor ID resolution to the server.

- [ ] **Step 2: Build query paths with controlled IDs**

  `createAdminTimelinePath({ entryId })` returns `/admin/hanh-trinh` with an encoded `entry` query only when a non-empty ID exists. `createTimelineEntryAnchor(id)` returns `#timeline-entry-${encodeURIComponent(id)}` for navigation only. No external redirect input or raw query string concatenation.

- [ ] **Step 3: Confirm mutation error mapping remains user-safe**

  Reuse the existing action result shape and show only Vietnamese validation/access/error copy in components. Do not surface Supabase error text, row data or auth tokens.

### Task 4: Build the public relationship timeline and member response controls

**Files:**
- Create: `src/app/hanh-trinh/page.tsx`
- Create: `src/features/timeline/presentation/relationship-timeline.tsx`
- Create: `src/features/timeline/presentation/timeline-response-panel.tsx`
- Modify: `src/components/app-header.tsx:8-83`
- Modify: `src/app/globals.css:100-210`

**Consumes:** Task 2 public models, Task 3 actions/navigation and active actor.

**Produces:** A responsive, accessible public story route where members respond under a published milestone.

- [ ] **Step 1: Load public route on the server**

  In `src/app/hanh-trinh/page.tsx`, start `backend.getCurrentActor.execute()` and `backend.listVisibleTimeline.execute(actor)` in the appropriate dependency order; require an active actor with existing `requireActivePageActor`; render `RelationshipTimeline` with the actor and `TimelineEntry[]`. Do not use a browser Supabase client or static mock entries.

- [ ] **Step 2: Add a compact `Hành trình` navigation item**

  Extend `AppHeaderProps.activeSection` to `"catalogue" | "journey" | "admin"`; add a middle navigation Link to `/hanh-trinh` with the existing border/focus styling. Do not show Owner-only navigation to members except existing `/admin` link.

- [ ] **Step 3: Compose visual story cards**

  `RelationshipTimeline` renders an introductory section followed by an ordered list. Use semantic `<ol>`/`<li>`, an `article` per entry and an `id={\`timeline-entry-${entry.id}\`}`. Desktop cards alternate via `index % 2`; the timeline rule remains central. On mobile use a single column with the rule positioned at the left. Image is rendered only when `imageUrl` exists and always uses supplied alt text. `lesson` gets a smaller bordered quotation block.

  Add CSS recipe classes in `globals.css` for `.timeline-rail`, `.timeline-entry`, `.timeline-entry-card`, `.timeline-entry-card--right` and a mobile breakpoint. Avoid JS layout measurement and keep reduced-motion overrides intact.

- [ ] **Step 4: Implement response UI as a small Client Component**

  `TimelineResponsePanel` receives the entry ID, decorated response list, current actor ID and `canManage`. It uses `useTransition`, `useState` and Server Actions. Show a textarea only to active actors; validation prevents blank content before action. For each response, only its author sees Sửa/Xóa; Owner also sees a delete moderation action. After an action succeeds, clear edit/create state and call `router.refresh()`; feedback uses `aria-live="polite"`.

  Avatar fallback is a 40px Bordeaux monogram from the first visible character of `displayName`; it has `aria-hidden` and visible adjacent name text. Keep response text `whitespace-pre-line` and no line clamp.

- [ ] **Step 5: Cover public empty/error boundaries visually**

  With zero entries, render a compact Bordeaux paper empty state that says the journey is waiting for its first page; do not fabricate example milestones. Preserve existing route guards for anonymous/inactive visitors.

### Task 5: Build the Owner timeline workspace and moderation controls

**Files:**
- Create: `src/app/admin/hanh-trinh/page.tsx`
- Create: `src/features/timeline/presentation/admin-timeline.tsx`
- Create: `src/features/timeline/presentation/admin-timeline-list.tsx`
- Create: `src/features/timeline/presentation/admin-timeline-editor.tsx`
- Modify: `src/features/catalogue/presentation/admin-catalogue.tsx:37-104`

**Consumes:** Task 2 owner use cases, Task 3 actions/navigation, existing owner page guard and compact form/button patterns.

**Produces:** Owner-only entry CRUD, draft/publish state, ordering and response moderation separated from catalogue editing.

- [ ] **Step 1: Add guarded Owner route**

  `src/app/admin/hanh-trinh/page.tsx` creates server backend, obtains current actor, applies the existing Owner guard, loads managed entries and optional selected entry by safe `entry` search parameter. An unknown ID renders the new-entry editor instead of leaking data. It passes all data to `AdminTimeline`.

- [ ] **Step 2: Add a journey shortcut in existing admin masthead**

  In `AdminCatalogue`, add a compact secondary Link to `/admin/hanh-trinh` near “Xem bộ sưu tập”. Preserve the current catalogue route, three-column grid, item actions and selection ViewTransition.

- [ ] **Step 3: Build Owner list with safe selection**

  `AdminTimelineList` shows all entries in `sortOrder` order with date label, title, `Published`/`Draft` badge and response count. Link selection uses `createAdminTimelinePath`; one explicit “Mốc mới” link clears selection. Never put response content in a list row.

- [ ] **Step 4: Build entry editor with complete field handling**

  `AdminTimelineEditor` has labels/fields for `dateLabel`, `occurredOn`, `title`, `story`, optional `lesson`, `imageUrl`, `imageAltText`, `sortOrder` and `isPublished`. It uses the same `min-h-11`, input class, textarea readability and pending feedback conventions as `AdminItemEditor`. Create success navigates to its selected entry; update refreshes; delete is a two-step inline confirmation and routes back to the empty editor.

  Do not accept `createdBy` from the form. Form submits `TimelineEntryInput` only.

- [ ] **Step 5: Add response moderation without impersonation**

  Below the editor, list decorated responses with avatar/name/date/content. Owner sees only a delete confirmation control. There is no Owner edit form, no response create form in admin, and no mutation that changes another author’s `user_id` or content.

- [ ] **Step 6: Preserve compact responsive hierarchy**

  Use a two-column owner workspace at `xl`, stacking list before editor below `xl`. At 320/390px, all text wraps and buttons retain 44px hit areas; at 1024/1440px, the editor receives the wider column. Use existing Bordeaux tokens and no new global color palette.

### Task 6: Apply migration, verify access matrix and hand off

**Files:**
- Inspect: `docs/migrations/2026-07-21-relationship-timeline.sql`
- Inspect: all Task 1–5 files

**Consumes:** Completed migration SQL and application implementation.

**Produces:** Evidence of syntax/build status and verified authorization behavior after user applies the migration.

- [ ] **Step 1: Check only intended paths changed**

  Run: `git diff --check`

  Expected: no whitespace errors. Confirm no `.env*`, Google OAuth, catalogue domain or unrelated mock files changed.

- [ ] **Step 2: Apply the reviewed migration once**

  User action in Supabase SQL Editor: paste/run `docs/migrations/2026-07-21-relationship-timeline.sql`. Expected: tables, indexes, triggers and policies create without error. If an existing policy/table causes an error, stop and provide the exact SQL error before changing code.

- [ ] **Step 3: Validate database authorization with four actors**

  Verify anonymous cannot query either table; inactive member cannot read/insert; active member reads only published entries and all responses, creates/updates/deletes only own response; Owner reads drafts, manages entries and deletes another response but cannot update its content. Also delete one Owner entry and confirm its responses cascade.

- [ ] **Step 4: Validate application behavior and presentation**

  Run in Windows CMD:

  ```bat
  npx.cmd tsc --noEmit
  npm.cmd run build
  ```

  Then browser-test `/hanh-trinh` and `/admin/hanh-trinh` at 320, 390, 768, 1024 and 1440px: long story/reply wrapping, focus, keyboard form flow, image fallback, navigation transitions, reduced motion and draft invisibility.

- [ ] **Step 5: Hand off without Git operations**

  Report the migration path, user commands, authorization results and remaining optional enhancements. Do not commit, push, seed data, alter Supabase dashboard settings or add any unapproved feature.
