# Scheduled Future Letters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Supabase-protected scheduled-letter experience where active members can write a letter for a future Vietnam time and every active member can read it only after that time through a romantic envelope-opening ceremony.

**Architecture:** A new `future-letters` bounded context follows the existing timeline layering: typed domain/application contracts, Supabase adapters, server actions and an App Router Server Component. The `future_letters` table and RLS are the source of truth for both scheduling and visibility; client code receives only rows the current session may read, and supplies form interaction, countdowns and the opening ceremony.

**Tech Stack:** Next.js App Router, React 19, TypeScript strict, Tailwind CSS, CSS keyframe animation, Lucide React, Supabase Postgres/Auth/RLS, `@supabase/ssr`.

## Global Constraints

- Store `opens_at` as `timestamptz`; accept and display date/time in `Asia/Ho_Chi_Minh` and let the database clock decide access.
- Only the author may see, update or delete an unopened letter; all active members may read it from `opens_at` onward.
- Owner has no early-read, edit, delete or moderation privilege for another member’s letter.
- Use Supabase/RLS as the permission boundary; never mask a readable secret row only in client UI.
- Keep Google OAuth unchanged. Show author identity from `profiles`, never use Google user metadata for authorization.
- Do not add test files or mock data. The user owns commit/push and runs `npx.cmd tsc --noEmit` and `npm.cmd run build` locally.
- Do not apply the remote migration. Create and review the SQL file; the user applies it manually in Supabase.
- Respect `prefers-reduced-motion`: opening content must become immediate, keyboard accessible and free of particle/flap motion.

---

## File structure

| Path | Responsibility |
| --- | --- |
| `docs/migrations/2026-07-21-scheduled-future-letters.sql` | User-applied schema, indexes, grants and RLS policies for scheduled letters. |
| `docs/database` | Human-readable schema reference kept in sync with the migration. |
| `src/lib/supabase/database.types.ts` | Strict hand-written Database row type for `future_letters`. |
| `src/modules/future-letters/domain/*` | Stable models, input shape, timezone conversion and validation. |
| `src/modules/future-letters/application/*` | Reader/repository contracts and actor-checked use cases. |
| `src/modules/future-letters/infrastructure/*` | Typed Supabase mapping, profile decoration, reads and mutations. |
| `src/modules/future-letters/presentation/future-letter-actions.ts` | Server Action boundary that revalidates only after successful mutations. |
| `src/app/thu-hen-ngay-mo/page.tsx` | Protected Server Component route and parallel data load. |
| `src/features/future-letters/presentation/*` | Composer, own-scheduled list, opened-letter cards and ceremonial UI state. |
| `src/components/app-header.tsx` | Active-member navigation link and selected-section type. |
| `src/lib/backend/create-server-backend.ts` | Request-scoped composition of the new bounded context. |
| `src/app/globals.css` | Scoped envelope, paper, particle and reduced-motion styles. |

## Task 1: Add the database contract and strict generated boundary

**Files:**
- Create: `docs/migrations/2026-07-21-scheduled-future-letters.sql`
- Modify: `docs/database`
- Modify: `src/lib/supabase/database.types.ts`

**Consumes:** Existing `public.profiles`, `public.set_updated_at()`, `private.is_active_member()` and active Google-authenticated sessions.

**Produces:** A RLS-protected `public.future_letters` table and `Database["public"]["Tables"]["future_letters"]` for all following tasks.

- [ ] **Step 1: Define the strict TypeScript row contract.**

  Add the following row type beside `TimelineResponseRow`, then register it in
  `Database.public.Tables`:

  ```ts
  type FutureLetterRow = {
    id: string;
    author_id: string;
    title: string;
    content: string;
    opens_at: string;
    image_url: string | null;
    image_alt_text: string | null;
    music_url: string | null;
    created_at: string;
    updated_at: string;
  };

  // Inside Database.public.Tables
  future_letters: Table<FutureLetterRow>;
  ```

  The hand-written `Table<T>` convention intentionally exposes only the row
  shape; `Insert` and `Update` remain `Partial<Row>` like all existing tables.

- [ ] **Step 2: Write the user-applied SQL migration.**

  Use this migration shape. Keep the policy names exact, include the transaction
  and do not create a view or a security-definer function.

  ```sql
  begin;

  create table if not exists public.future_letters (
    id uuid primary key default gen_random_uuid(),
    author_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    content text not null,
    opens_at timestamptz not null,
    image_url text,
    image_alt_text text,
    music_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint future_letters_title_check
      check (char_length(trim(title)) between 1 and 160),
    constraint future_letters_content_check
      check (char_length(trim(content)) between 1 and 8000),
    constraint future_letters_image_alt_check
      check (
        image_url is null
        or char_length(trim(coalesce(image_alt_text, ''))) between 1 and 280
      ),
    constraint future_letters_opens_after_creation_check
      check (opens_at > created_at)
  );

  create index if not exists idx_future_letters_opened_at
    on public.future_letters(opens_at desc);

  create index if not exists idx_future_letters_author_schedule
    on public.future_letters(author_id, opens_at);

  drop trigger if exists set_future_letters_updated_at on public.future_letters;
  create trigger set_future_letters_updated_at
  before update on public.future_letters
  for each row execute function public.set_updated_at();

  alter table public.future_letters enable row level security;

  drop policy if exists "future_letters_member_select" on public.future_letters;
  create policy "future_letters_member_select"
  on public.future_letters for select to authenticated
  using (
    (select private.is_active_member())
    and (
      opens_at <= now()
      or author_id = (select auth.uid())
    )
  );

  drop policy if exists "future_letters_member_insert" on public.future_letters;
  create policy "future_letters_member_insert"
  on public.future_letters for insert to authenticated
  with check (
    (select private.is_active_member())
    and author_id = (select auth.uid())
    and opens_at > now()
  );

  drop policy if exists "future_letters_member_update" on public.future_letters;
  create policy "future_letters_member_update"
  on public.future_letters for update to authenticated
  using (
    (select private.is_active_member())
    and author_id = (select auth.uid())
    and opens_at > now()
  )
  with check (
    (select private.is_active_member())
    and author_id = (select auth.uid())
    and opens_at > now()
  );

  drop policy if exists "future_letters_member_delete" on public.future_letters;
  create policy "future_letters_member_delete"
  on public.future_letters for delete to authenticated
  using (
    (select private.is_active_member())
    and author_id = (select auth.uid())
    and opens_at > now()
  );

  revoke all on table public.future_letters from anon;
  grant select, insert, update, delete on table public.future_letters to authenticated;
  grant all on table public.future_letters to service_role;

  commit;
  ```

  The SELECT policy is intentionally also the prerequisite for UPDATE. The
  matching `USING` and `WITH CHECK` clauses prevent ownership reassignment and
  prevent moving an already-open letter back into a hidden scheduled state.

- [ ] **Step 3: Extend the human-readable schema reference.**

  Append the same table, indexes, trigger and policies to `docs/database` using
  the repository’s existing SQL-reference format. Record that `opens_at` is a
  UTC-capable `timestamptz` even though form labels use Vietnam time.

- [ ] **Step 4: Review the migration without applying it.**

  Confirm the migration has `enable row level security`, `TO authenticated`,
  `revoke ... from anon`, both indexes and no policy based on profile/Google
  metadata. Inspect whitespace with:

  ```bash
  git diff --check -- docs/migrations/2026-07-21-scheduled-future-letters.sql docs/database src/lib/supabase/database.types.ts
  ```

  Expected: exit code `0`; no remote database changes occur.

## Task 2: Add the future-letter domain and actor-checked use cases

**Files:**
- Create: `src/modules/future-letters/domain/future-letter-models.ts`
- Create: `src/modules/future-letters/domain/future-letter-validation.ts`
- Create: `src/modules/future-letters/domain/future-letter-time.ts`
- Create: `src/modules/future-letters/application/future-letter-reader.ts`
- Create: `src/modules/future-letters/application/future-letter-repository.ts`
- Create: `src/modules/future-letters/application/list-opened-future-letters.ts`
- Create: `src/modules/future-letters/application/list-own-scheduled-future-letters.ts`
- Create: `src/modules/future-letters/application/manage-future-letters.ts`

**Consumes:** `Result`, `CurrentActor`, `ActiveActor` and `requireActiveActor` from the existing core/identity contexts.

**Produces:** Server-side contracts used by Supabase adapters and presentation, with no React or Supabase import in `domain`/`application`.

- [ ] **Step 1: Define models and timezone helpers.**

  Use these stable model shapes:

  ```ts
  export const FUTURE_LETTER_TIME_ZONE = "Asia/Ho_Chi_Minh";

  export interface FutureLetterAuthor {
    displayName: string;
    avatarUrl: string | null;
  }

  export interface FutureLetterRecord {
    id: string;
    authorId: string;
    title: string;
    content: string;
    opensAt: string;
    imageUrl: string | null;
    imageAltText: string | null;
    musicUrl: string | null;
    createdAt: string;
    updatedAt: string;
  }

  export interface FutureLetter extends FutureLetterRecord {
    author: FutureLetterAuthor;
  }

  export interface FutureLetterInput {
    title: string;
    content: string;
    opensAt: string;
    imageUrl: string | null;
    imageAltText: string | null;
    musicUrl: string | null;
  }
  ```

  `future-letter-time.ts` must contain a pure conversion from separate
  `YYYY-MM-DD` / `HH:mm` form values into an ISO instant using `+07:00`, plus
  an `Intl.DateTimeFormat` formatter that always passes
  `timeZone: FUTURE_LETTER_TIME_ZONE`. Do not use the browser’s local timezone
  to decide what 20:00 means.

  ```ts
  export function toVietnamScheduledInstant(date: string, time: string): string | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
      return null;
    }

    const instant = new Date(`${date}T${time}:00+07:00`);
    return Number.isNaN(instant.getTime()) ? null : instant.toISOString();
  }
  ```

- [ ] **Step 2: Normalize every mutation input on the server.**

  `normalizeFutureLetterInput(input)` must trim optional text, require a valid
  HTTP(S) URL for image/music, require 1–280 character alt text when an image is
  present, parse `opensAt`, and reject an instant not strictly after `Date.now()`.
  It returns `Result<FutureLetterInput>` with a normalized ISO timestamp:

  ```ts
  if (
    !hasLength(title, 1, 160) ||
    !hasLength(content, 1, 8000) ||
    !isFutureIsoInstant(input.opensAt) ||
    !isOptionalHttpUrl(imageUrl) ||
    !isOptionalHttpUrl(musicUrl) ||
    (imageUrl !== null && !hasLength(imageAltText ?? "", 1, 280))
  ) {
    return failure("VALIDATION_FAILED");
  }
  ```

  Also export `hasFutureLetterId(value: string): boolean` with the same
  nonempty-trim convention used by timeline IDs.

- [ ] **Step 3: Define reader, repository and use-case interfaces.**

  ```ts
  export interface FutureLetterReader {
    listOpened(serverNow: string): Promise<Result<FutureLetter[]>>;
    listOwnScheduled(authorId: string, serverNow: string): Promise<Result<FutureLetterRecord[]>>;
  }

  export interface FutureLetterRepository {
    create(authorId: string, input: FutureLetterInput): Promise<Result<FutureLetterRecord>>;
    update(letterId: string, authorId: string, input: FutureLetterInput): Promise<Result<FutureLetterRecord>>;
    delete(letterId: string, authorId: string): Promise<Result<void>>;
  }
  ```

  `ListOpenedFutureLetters.execute(actor)` and
  `ListOwnScheduledFutureLetters.execute(actor)` call `requireActiveActor` before
  passing a freshly created server ISO time to their reader. `ManageFutureLetters`
  exposes `create`, `update` and `delete`, calls `requireActiveActor`, validates
  IDs/inputs, then passes only `activeActor.userId` to the repository. It must not
  accept an author ID from browser input.

- [ ] **Step 4: Check layer boundaries.**

  Verify no file in `domain` or `application` imports React, Next.js or a
  Supabase client. Verify every create/update path reaches
  `normalizeFutureLetterInput` and every operation first checks active access.

## Task 3: Implement typed Supabase readers, mutations and backend composition

**Files:**
- Create: `src/modules/future-letters/infrastructure/future-letter-mappers.ts`
- Create: `src/modules/future-letters/infrastructure/supabase-future-letter-reader.ts`
- Create: `src/modules/future-letters/infrastructure/supabase-future-letter-repository.ts`
- Modify: `src/lib/backend/create-server-backend.ts`

**Consumes:** Task 1 database type and Task 2 interfaces; the existing profile
reader pattern in `src/modules/timeline/infrastructure/timeline-mappers.ts`.

**Produces:** Request-scoped use cases `listOpenedFutureLetters`,
`listOwnScheduledFutureLetters` and `manageFutureLetters`.

- [ ] **Step 1: Map database rows without exposing raw Supabase types.**

  Define `FutureLetterRow` and `FutureLetterProfileRow` from `Database`, map
  snake case to domain case, and decorate opened letters by batching profile IDs:

  ```ts
  const PROFILE_COLUMNS = "id,display_name,avatar_url";

  export function toFutureLetter(row: FutureLetterRow, author: FutureLetterAuthor): FutureLetter {
    return {
      id: row.id,
      authorId: row.author_id,
      title: row.title,
      content: row.content,
      opensAt: row.opens_at,
      imageUrl: row.image_url,
      imageAltText: row.image_alt_text,
      musicUrl: row.music_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      author,
    };
  }
  ```

  Query all necessary profiles with one `.in("id", authorIds)` request. Map a
  missing name to `"Thành viên"` and a missing avatar to `null`; do not issue one
  profile request per letter.

- [ ] **Step 2: Implement reads with explicit time criteria.**

  Use a narrow column string containing only fields in `FutureLetterRow`.
  `listOpened(serverNow)` must filter and order exactly as follows before profile
  decoration:

  ```ts
  const { data, error } = await this.client
    .from("future_letters")
    .select(FUTURE_LETTER_COLUMNS)
    .lte("opens_at", serverNow)
    .order("opens_at", { ascending: false });
  ```

  `listOwnScheduled(authorId, serverNow)` must add both
  `.eq("author_id", authorId)` and `.gt("opens_at", serverNow)`, order ascending
  by `opens_at`, and return `FutureLetterRecord[]` without a profile round trip.
  RLS remains mandatory even though the query repeats its business predicates.

- [ ] **Step 3: Implement ownership-bound mutations.**

  The insert payload sets `author_id` from the use case and never from UI state.
  Update/delete include both primary key and author ID, select the changed ID/row,
  and map no returned row to `failure("NOT_FOUND")`:

  ```ts
  const { data, error } = await this.client
    .from("future_letters")
    .update({
      title: input.title,
      content: input.content,
      opens_at: input.opensAt,
      image_url: input.imageUrl,
      image_alt_text: input.imageAltText,
      music_url: input.musicUrl,
    })
    .eq("id", letterId)
    .eq("author_id", authorId)
    .select(FUTURE_LETTER_COLUMNS)
    .maybeSingle();
  ```

  Treat Supabase errors as `UNEXPECTED_FAILURE`; do not infer permission failures
  from error strings or return any concealed row metadata.

- [ ] **Step 4: Compose the bounded context once per request.**

  Instantiate one `SupabaseFutureLetterReader` and one
  `SupabaseFutureLetterRepository` inside `createBackendForClient`, import the
  three use cases and expose only:

  ```ts
  listOpenedFutureLetters: new ListOpenedFutureLetters(futureLetterReader),
  listOwnScheduledFutureLetters: new ListOwnScheduledFutureLetters(futureLetterReader),
  manageFutureLetters: new ManageFutureLetters(futureLetterRepository),
  ```

  Keep the existing factory’s catalogue, engagement and timeline composition
  unchanged.

## Task 4: Add the Server Action boundary

**Files:**
- Create: `src/modules/future-letters/presentation/future-letter-actions.ts`

**Consumes:** Task 3 backend methods, `runServerAction` and `revalidateAfterMutation`.

**Produces:** Safe create/update/delete actions that Task 5 client components can invoke; no client-side Supabase query.

- [ ] **Step 1: Add three Server Actions.**

  Keep the action module server-only and use these exact action shapes:

  ```ts
  "use server";

  export async function createFutureLetterAction(input: FutureLetterInput) {
    return revalidateAfterMutation(
      await runServerAction((backend, actor) =>
        backend.manageFutureLetters.create(actor, input),
      ),
    );
  }

  export async function updateFutureLetterAction(
    letterId: string,
    input: FutureLetterInput,
  ) {
    return revalidateAfterMutation(
      await runServerAction((backend, actor) =>
        backend.manageFutureLetters.update(actor, letterId, input),
      ),
    );
  }

  export async function deleteFutureLetterAction(letterId: string) {
    return revalidateAfterMutation(
      await runServerAction((backend, actor) =>
        backend.manageFutureLetters.delete(actor, letterId),
      ),
    );
  }
  ```

## Task 5: Build the composer, personal schedule shelf and ceremonial opening UI

**Files:**
- Create: `src/features/future-letters/presentation/future-letters-experience.tsx`
- Create: `src/features/future-letters/presentation/future-letter-composer.tsx`
- Create: `src/features/future-letters/presentation/scheduled-letter-list.tsx`
- Create: `src/features/future-letters/presentation/future-letter-opening-card.tsx`
- Modify: `src/components/app-header.tsx`
- Modify: `src/app/globals.css`

**Consumes:** Task 2 models/timezone helpers, Task 4 actions, existing `Button`,
`AppHeader` and `CatalogueItemImage` presentation utilities.

**Produces:** A compact, responsive Bordeaux Diary experience that has no mock
rows, client Supabase client or authority over the open time.

- [ ] **Step 1: Create the server-data presentation shell.**

  `FutureLettersExperience` receives exactly this boundary:

  ```ts
  interface FutureLettersExperienceProps {
    actor: ActiveActor;
    openedLetters: FutureLetter[];
    scheduledLetters: FutureLetterRecord[];
  }
  ```

  It renders the skip link, `<AppHeader activeSection="letters" />`, a compact
  hero (`Một cuộc hẹn với tương lai`), the composer trigger, a personal scheduled
  section only when `scheduledLetters.length > 0`, and an opened archive. Use an
  honest empty state when both arrays are empty. Do not render a generic sealed
  card for another author’s hidden letter because the server deliberately has no
  such data.

- [ ] **Step 2: Add the active-member navigation destination.**

  Extend `AppHeaderProps.activeSection` to include `"letters"`, add a link to
  `/thu-hen-ngay-mo` between Hành trình and Quản trị, and use the existing active
  border/text styling. The visible label is `Thư hẹn ngày mở`.

- [ ] **Step 3: Implement an accessible composer for create and edit.**

  Use a native `<dialog>` or the project’s existing dialog primitive if one is
  present. It receives `letter: FutureLetterRecord | null`, owns text/date/time
  draft state, and submits an ISO instant built through
  `toVietnamScheduledInstant(date, time)`. On a valid success response, close
  the dialog and call `router.refresh()`; on failure, retain fields and put a
  concise Vietnamese message in an `aria-live="polite"` status region.

  The button copy is `Hẹn một lá thư` for create and `Sửa lá thư` for edit. Form
  labels are `Tiêu đề`, `Lá thư`, `Ngày mở`, `Giờ mở`, `Ảnh minh họa`, `Mô tả ảnh`
  and `Bài hát`. Disable submit while a `useTransition` is pending. Never log
  `content`.

- [ ] **Step 4: Render the author-only schedule shelf.**

  `ScheduledLetterList` formats each `opensAt` in Vietnam time, shows a concise
  non-live countdown, and supplies Sửa/Hủy controls. The delete path first
  enters an inline confirmation state; the confirmation calls
  `deleteFutureLetterAction(letter.id)` inside `startTransition`, then refreshes
  on success. When the browser timer crosses the scheduled instant, refresh the
  route once so RLS-backed server data, rather than browser time, decides whether
  the letter moves into the opened archive.

- [ ] **Step 5: Create the envelope-opening card.**

  `FutureLetterOpeningCard` owns only visual state:

  ```ts
  type OpeningPhase = "sealed" | "opening" | "opened";
  ```

  The CTA is a real `button`. On normal motion it changes phase to `opening`,
  waits for the 720 ms CSS sequence, sets phase to `opened`, then focuses the
  letter article (`tabIndex={-1}`). If
  `matchMedia("(prefers-reduced-motion: reduce)").matches`, set `opened`
  synchronously and focus immediately. Keep this state in component memory only:
  a reload may intentionally replay the ritual, and no “seen” data is persisted.

  In `opened`, render author avatar/initial fallback, Google/profile display
  name, scheduled Vietnam timestamp, title, whitespace-preserved content, optional
  image with required alt text, and optional external music link with
  `target="_blank" rel="noreferrer"`. Do not autoplay or embed media.

- [ ] **Step 6: Add scoped visual styles and responsive behavior.**

  Add CSS classes prefixed `future-letter-` only. Use Bordeaux for the envelope,
  paper/ivory for the letter, a low-opacity gold halo, and 8–12 `aria-hidden`
  particle spans. Animate only `transform` and `opacity`:

  ```css
  .future-letter-opening[data-phase="opening"] .future-letter-flap {
    animation: future-letter-unseal 420ms cubic-bezier(.22, .7, .24, 1) forwards;
  }

  .future-letter-opening[data-phase="opening"] .future-letter-paper {
    animation: future-letter-paper-rise 520ms 190ms cubic-bezier(.2, .8, .2, 1) both;
  }
  ```

  The mobile layout is a single column with a 44 px minimum action size; desktop
  may put the personal schedule shelf and opened archive in a restrained two
  column rhythm only when content remains readable. Add a
  `prefers-reduced-motion` override for the new classes in the existing media
  query so the phase change does not delay content/focus.

## Task 6: Add the protected route

**Files:**
- Create: `src/app/thu-hen-ngay-mo/page.tsx`

**Consumes:** Task 3 backend methods, the Task 5 presentation shell,
`PageTransition` and `resolveActivePageAccess`.

**Produces:** An active-member-only URL that loads all permitted data in one
request-scoped server flow.

- [ ] **Step 1: Implement the Server Component route.**

  Copy the active-page access flow from `/hanh-trinh`, set
  `export const dynamic = "force-dynamic"`, and load both independent lists in
  parallel only after access has resolved:

  ```ts
  const [openedResult, scheduledResult] = await Promise.all([
    backend.listOpenedFutureLetters.execute(access.actor),
    backend.listOwnScheduledFutureLetters.execute(access.actor),
  ]);

  if (!openedResult.ok || !scheduledResult.ok) {
    throw new Error("Unable to load scheduled future letters.");
  }

  return (
    <PageTransition>
      <FutureLettersExperience
        actor={access.actor}
        openedLetters={openedResult.value}
        scheduledLetters={scheduledResult.value}
      />
    </PageTransition>
  );
  ```

  Anonymous users go through the existing login redirect, inactive users through
  existing access denial; no new access model is introduced.

## Task 7: User-applied migration and final handoff checks

**Files:**
- Modify only if review exposes a concrete issue in the files from Tasks 1–6.

**Consumes:** The completed migration and application code.

**Produces:** Evidence that the user can safely apply and validate the feature; no agent-run remote mutation or commit.

- [ ] **Step 1: Ask the user to apply the migration manually.**

  Direct the user to run the contents of
  `docs/migrations/2026-07-21-scheduled-future-letters.sql` in the Supabase SQL
  Editor against the intended project. Do not use a service key, remote CLI
  command, MCP `execute_sql` or dashboard mutation from the agent.

- [ ] **Step 2: Validate the four authorization cases with real accounts.**

  Use two active Google accounts and one inactive/anonymous session:

  1. Author schedules a future letter; only that author sees it and can edit or
     cancel it.
  2. The second active member cannot discover its row, title, time or content
     before `opens_at`, including by a direct Data API request.
  3. At or after `opens_at`, both active members see and open the same letter;
     neither can edit/delete it.
  4. Inactive and anonymous sessions cannot read/create/mutate it.

- [ ] **Step 3: Run user-owned build and visual checks.**

  The user runs:

  ```bat
  npx.cmd tsc --noEmit
  npm.cmd run build
  ```

  Then inspect `/thu-hen-ngay-mo` at 320, 390, 768, 1024 and 1440 px: long
  Vietnamese content, empty state, create/edit/delete confirmation, date/time
  conversion, keyboard dialog flow, focus after opening, image/link behavior and
  reduced-motion. Do not report the feature as verified until the user shares the
  relevant command results and the migration has actually been applied.
