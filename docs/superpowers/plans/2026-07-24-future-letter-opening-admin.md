# Future Letter Opening and Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make opening a future letter a richer Bordeaux ritual and give Owners a dedicated workspace to review and remove any future letter safely.

**Architecture:** Keep the public reader and the Owner workspace separate. Extend the existing typed future-letter reader/repository/application layers with explicit Owner-only list/delete operations, enforce the same boundary in RLS, then build a small Owner route and an enhanced CSS-driven public opening state machine without adding runtime dependencies.

**Tech Stack:** Next.js App Router, React Client Components, TypeScript strict, Tailwind CSS, native CSS animation, Lucide React, Server Actions, Supabase Postgres/RLS.

## Global Constraints

- Do not create a branch/worktree, commit, run migration, test, lint, build or browser QA. Use source/diff review only, by explicit user request.
- Keep `/thu-hen-ngay-mo` for active members to read opened letters; it must never expose Owner delete controls.
- Keep the public opening interaction as a real native `<button>`, retain focus handling, and make `prefers-reduced-motion` reveal the full letter immediately.
- Use only CSS and existing React state for the ritual. Do not add Motion dependencies, canvas, WebGL, raster assets or a new animation library.
- Create `/admin/thu-hen-ngay-mo` behind `requireCatalogueOwnerPageAccess`; only Owners may load the list or invoke its delete action.
- Owner may read/delete every future letter. A member may only read opened letters or their own scheduled letters, and may only update/delete their own scheduled letter before `opens_at`.
- Preserve RLS, use `(select private.is_owner())` and `(select auth.uid())` in policies, and do not expose a service-role key or use client-only authorization.
- Do not add edit-after-opening, bulk deletion, search, pagination, audit/recovery, uploads, emails or notifications.

---

## File structure

- Create `docs/migrations/2026-07-24-owner-manage-future-letters.sql`: replace only the `future_letters` SELECT/DELETE policies to admit Owner moderation.
- Create `src/modules/future-letters/application/list-managed-future-letters.ts`: Owner-gated use case for the full letter archive.
- Create `src/app/admin/thu-hen-ngay-mo/page.tsx`: Owner-only server route that loads the managed archive.
- Create `src/features/future-letters/presentation/admin-future-letters.tsx`: client workspace with status grouping, confirmation and deletion feedback.
- Modify `src/modules/future-letters/application/future-letter-reader.ts`, `src/modules/future-letters/application/future-letter-repository.ts`, `src/modules/future-letters/application/manage-future-letters.ts`, `src/modules/future-letters/infrastructure/supabase-future-letter-reader.ts`, `src/modules/future-letters/infrastructure/supabase-future-letter-repository.ts`, `src/modules/future-letters/presentation/future-letter-actions.ts` and `src/lib/backend/create-server-backend.ts`: add typed Owner operations without changing member contracts.
- Modify `src/components/admin/admin-workspace-switcher.tsx`: add the Owner workspace link.
- Modify `src/features/future-letters/presentation/future-letter-opening-card.tsx` and `src/app/globals.css`: add the four-phase public opening ritual.
- Modify `docs/product-direction.md`, the approved spec and this plan: record the moderation policy and implementation status.

### Task 1: Add Owner-only future-letter data operations and RLS

**Files:**
- Create: `docs/migrations/2026-07-24-owner-manage-future-letters.sql`
- Create: `src/modules/future-letters/application/list-managed-future-letters.ts`
- Modify: `src/modules/future-letters/application/future-letter-reader.ts`
- Modify: `src/modules/future-letters/application/future-letter-repository.ts`
- Modify: `src/modules/future-letters/application/manage-future-letters.ts`
- Modify: `src/modules/future-letters/infrastructure/supabase-future-letter-reader.ts`
- Modify: `src/modules/future-letters/infrastructure/supabase-future-letter-repository.ts`
- Modify: `src/modules/future-letters/presentation/future-letter-actions.ts`
- Modify: `src/lib/backend/create-server-backend.ts`
- Modify: `docs/product-direction.md`

**Interfaces:**
- Consumes existing `FutureLetter`, `FutureLetterRecord`, `CurrentActor`, `requireActiveActor`, `requireCatalogueOwner`, `revalidateAfterMutation` and current profile decoration mapper.
- Produces `FutureLetterReader.listManaged(): Promise<Result<FutureLetter[]>>`, `ListManagedFutureLetters.execute(actor)`, `FutureLetterRepository.deleteOwnScheduled()` / `deleteManaged()`, `ManageFutureLetters.deleteOwnScheduled()` / `deleteManaged()`, and `deleteManagedFutureLetterAction()`.

- [x] **Step 1: Add the narrowly scoped RLS migration**

Create this file; it intentionally leaves INSERT and UPDATE policies unchanged and does not execute SQL:

```sql
begin;

drop policy if exists "future_letters_member_select"
  on public.future_letters;

create policy "future_letters_member_select"
on public.future_letters
for select
to authenticated
using (
  (select private.is_active_member())
  and (
    opens_at <= now()
    or author_id = (select auth.uid())
    or (select private.is_owner())
  )
);

drop policy if exists "future_letters_member_delete"
  on public.future_letters;

create policy "future_letters_member_delete"
on public.future_letters
for delete
to authenticated
using (
  (select private.is_active_member())
  and (
    (select private.is_owner())
    or (
      author_id = (select auth.uid())
      and opens_at > now()
    )
  )
);

commit;
```

The existing `idx_future_letters_opened_at` supports chronological Owner review,
and `idx_future_letters_author_schedule` continues to support author schedules;
do not introduce a duplicate index.

- [x] **Step 2: Extend the reader contract and add the Owner-gated use case**

Append `listManaged` to `FutureLetterReader`, returning decorated `FutureLetter`
objects so the UI never queries profiles itself:

```ts
export interface FutureLetterReader {
  listOpened(serverNow: string): Promise<Result<FutureLetter[]>>;
  listManaged(): Promise<Result<FutureLetter[]>>;
  listOwnScheduled(
    authorId: string,
    serverNow: string,
  ): Promise<Result<FutureLetterRecord[]>>;
}
```

Implement `ListManagedFutureLetters` as a focused class:

```ts
export class ListManagedFutureLetters {
  constructor(private readonly reader: FutureLetterReader) {}

  async execute(actor: CurrentActor): Promise<Result<FutureLetter[]>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;

    return this.reader.listManaged();
  }
}
```

In `SupabaseFutureLetterReader`, select `FUTURE_LETTER_COLUMNS`, order by
`opens_at` descending, return `success([])` for no rows, then reuse
`loadAuthors` and `toFutureLetter` exactly as `listOpened` does. Do not select
profiles from the Client Component.

- [x] **Step 3: Split author cancellation from Owner moderation in the repository and service**

Replace the ambiguous repository delete method with two explicit methods:

```ts
export interface FutureLetterRepository {
  create(authorId: string, input: FutureLetterInput): Promise<Result<FutureLetterRecord>>;
  update(letterId: string, authorId: string, input: FutureLetterInput): Promise<Result<FutureLetterRecord>>;
  deleteOwnScheduled(letterId: string, authorId: string): Promise<Result<void>>;
  deleteManaged(letterId: string): Promise<Result<void>>;
}
```

Implement `deleteOwnScheduled` with `.eq("id", letterId).eq("author_id",
authorId)` and `deleteManaged` with `.eq("id", letterId)`. Both must select
`"id"`, use `maybeSingle`, return `UNEXPECTED_FAILURE` on Supabase errors and
`NOT_FOUND` when no row is returned. RLS, not the client, enforces the opening
time and Owner conditions.

Give `ManageFutureLetters` parallel guards:

```ts
async deleteOwnScheduled(actor: CurrentActor, letterId: string): Promise<Result<void>> {
  const activeActor = requireActiveActor(actor);
  if (!activeActor.ok) return activeActor;
  if (!hasFutureLetterId(letterId)) return failure("VALIDATION_FAILED");
  return this.repository.deleteOwnScheduled(letterId.trim(), activeActor.value.userId);
}

async deleteManaged(actor: CurrentActor, letterId: string): Promise<Result<void>> {
  const owner = requireCatalogueOwner(actor);
  if (!owner.ok) return owner;
  if (!hasFutureLetterId(letterId)) return failure("VALIDATION_FAILED");
  return this.repository.deleteManaged(letterId.trim());
}
```

- [x] **Step 4: Wire Server Actions, backend and product policy**

Keep `deleteFutureLetterAction` as the public author-cancellation entry point,
but make it call `deleteOwnScheduled`. Add this separate Owner-only entry point:

```ts
export async function deleteManagedFutureLetterAction(letterId: string) {
  const result = await runServerAction((backend, actor) =>
    backend.manageFutureLetters.deleteManaged(actor, letterId),
  );

  return revalidateAfterMutation(result);
}
```

In `create-server-backend.ts`, construct and expose:

```ts
listManagedFutureLetters: new ListManagedFutureLetters(futureLetterReader),
```

Add its import alongside `ListOpenedFutureLetters`. Update the product-direction
sentence so it reads: “sau giờ mở mọi active member đều đọc được; Owner có thể
gỡ thư khi cần điều tiết nội dung, còn tác giả không thể sửa/xóa nữa.”

### Task 2: Build the dedicated Owner workspace for future letters

**Files:**
- Create: `src/app/admin/thu-hen-ngay-mo/page.tsx`
- Create: `src/features/future-letters/presentation/admin-future-letters.tsx`
- Modify: `src/components/admin/admin-workspace-switcher.tsx`

**Interfaces:**
- Consumes `requireCatalogueOwnerPageAccess`, `backend.listManagedFutureLetters.execute`, `FutureLetter`, `deleteManagedFutureLetterAction`, `formatFutureLetterDateTime`, `AdminWorkspaceHeader` and `AdminWorkspaceSwitcher`.
- Produces the Owner-only `/admin/thu-hen-ngay-mo` screen with a `letters` and `serverNow` prop boundary; the browser receives only already-authorized letter data.

- [x] **Step 1: Add the server route with the existing admin shell**

Create the route using the same guard, shell and skip-link pattern as the
timeline admin route:

```tsx
export const dynamic = "force-dynamic";

export default async function AdminFutureLettersPage() {
  const { actor, backend } = await requireCatalogueOwnerPageAccess();
  const lettersResult = await backend.listManagedFutureLetters.execute(actor);

  if (!lettersResult.ok) {
    throw new Error("Unable to load owner future-letter management.");
  }

  return (
    <PageTransition>
      <div className="diary-shell">
        <a className="sr-only absolute left-5 top-4 z-50 rounded-full bg-[var(--color-brand-strong)] px-4 py-2 text-sm font-semibold text-white focus:not-sr-only" href="#admin-future-letters-content">
          Đi tới quản trị thư hẹn
        </a>
        <AppHeader activeSection="admin" actor={actor} />
        <AdminFutureLetters
          letters={lettersResult.value}
          serverNow={new Date().toISOString()}
        />
      </div>
    </PageTransition>
  );
}
```

- [x] **Step 2: Add the “Thư hẹn” admin workspace destination**

Extend the switcher union and list without changing existing keys:

```ts
export type AdminWorkspace = "catalogue" | "timeline" | "theme" | "letters";

{
  href: "/admin/thu-hen-ngay-mo",
  icon: MailOpen,
  key: "letters",
  label: "Thư hẹn",
},
```

Import `MailOpen` from Lucide React. The new workspace component passes
`active="letters"` so the active state remains semantic.

- [x] **Step 3: Implement the Owner list, two status groups and confirmation**

Make `AdminFutureLetters` a Client Component. Derive status from the stable
server timestamp, then render “Đang hẹn” and “Đã mở” in chronological groups:

```ts
const serverNowTime = new Date(serverNow).getTime();
const openedLetters = letters.filter(
  (letter) => new Date(letter.opensAt).getTime() <= serverNowTime,
);
const scheduledLetters = letters.filter(
  (letter) => new Date(letter.opensAt).getTime() > serverNowTime,
);
```

Use `AdminWorkspaceHeader` with the eyebrow `Quản trị · thư hẹn`, title
`Giữ gìn những điều đã được gửi đi.`, a “Xem trang thư” link to
`/thu-hen-ngay-mo`, and summary chips for both counts. Render the switcher,
then a dedicated semantic `<section>`/`<ol>` for each status. Each row includes
the title, `letter.author.displayName`, `formatFutureLetterDateTime`, a status
badge and a `Trash2` “Gỡ thư” button.

Own local state only for feedback, `confirmingLetterId` and `isPending`. On the
second confirmation button call:

```ts
startTransition(async () => {
  const result = await deleteManagedFutureLetterAction(letterId);
  if (!result.ok) {
    setFeedback(feedbackFor(result.error.code));
    return;
  }

  setConfirmingLetterId(null);
  setFeedback("Đã gỡ lá thư khỏi không gian chung.");
  router.refresh();
});
```

Map `UNAUTHENTICATED`, `ACCESS_DENIED` and `NOT_FOUND` to specific Vietnamese
messages; map all other errors to one retry message. Disable both confirmation
buttons while pending and render an empty-state note for each empty group.

### Task 3: Expand the public opening into a four-phase Bordeaux ritual

**Files:**
- Modify: `src/features/future-letters/presentation/future-letter-opening-card.tsx`
- Modify: `src/app/globals.css` near `.future-letter-opening`

**Interfaces:**
- Consumes the existing `FutureLetter`, article focus, `CatalogueItemImage`, `formatFutureLetterDateTime` and reduced-motion preference.
- Produces four local presentation states: `sealed`, `unsealing`, `revealing`, `opened`; no new network request, persistent state or dependency.

- [x] **Step 1: Make phase scheduling explicit and cleanup-safe**

Replace the three-state union and one timer ref with this local contract:

```ts
type OpeningPhase = "sealed" | "unsealing" | "revealing" | "opened";

const phaseTimersRef = useRef<number[]>([]);

function clearPhaseTimers() {
  phaseTimersRef.current.forEach((timer) => window.clearTimeout(timer));
  phaseTimersRef.current = [];
}

function schedulePhase(phase: OpeningPhase, delay: number) {
  phaseTimersRef.current.push(window.setTimeout(() => setPhase(phase), delay));
}
```

Use one effect cleanup to call `clearPhaseTimers`. In `openLetter`, keep the
guard and reduced-motion short circuit; otherwise set `unsealing`, schedule
`revealing` after `460` milliseconds and `opened` after `1020` milliseconds.
The existing focus effect stays keyed to `phase === "opened"`.

- [x] **Step 2: Add decorative layers without hiding real content**

Inside the envelope stage, keep the envelope and semantic “Mở thư” control.
Add only `aria-hidden` decoration:

```tsx
<span className="future-letter-light" aria-hidden="true" />
<span className="future-letter-envelope-liner" aria-hidden="true" />
<span className="future-letter-seal-fragments" aria-hidden="true">
  {Array.from({ length: 12 }, (_, index) => <i key={index} />)}
</span>
<p aria-live="polite" className="sr-only">
  {phase === "unsealing"
    ? "Triện sáp đang mở."
    : phase === "revealing"
      ? "Lá thư đang hiện ra."
      : phase === "opened"
        ? "Lá thư đã mở."
        : ""}
</p>
```

Keep the envelope stage through `revealing`; render the paper only for
`revealing` and `opened`, so it physically appears after the seal/flap motion:

```tsx
const isPaperVisible = phase === "revealing" || phase === "opened";

{isPaperVisible ? <div className="future-letter-paper" /* existing content */ /> : null}
```

The author/title/content/image/music markup inside paper stays unchanged.

- [x] **Step 3: Replace the small opening animations with bounded CSS phases**

Retain the Bordeaux gradients and paper texture but add selectors that use
only `opacity`, `transform` and `filter` for animation. Align the durations to
the scheduler: flap/seal work during the first `460ms`; light, fragments and
paper rising begin in `revealing`; paper settles in `opened`.

```css
.future-letter-opening[data-phase="unsealing"] .future-letter-flap {
  animation: future-letter-unseal 460ms cubic-bezier(.2, .78, .2, 1) forwards;
}

.future-letter-opening[data-phase="unsealing"] .future-letter-seal {
  animation: future-letter-seal-break 360ms ease-out forwards;
}

.future-letter-opening[data-phase="revealing"] .future-letter-light {
  animation: future-letter-light-bloom 560ms ease-out both;
}

.future-letter-opening[data-phase="revealing"] .future-letter-seal-fragments i {
  animation: future-letter-seal-fragment 440ms cubic-bezier(.2, .8, .2, 1) both;
}

.future-letter-opening[data-phase="revealing"] .future-letter-paper {
  animation: future-letter-paper-reveal 560ms cubic-bezier(.18, .82, .2, 1) both;
}
```

Define the new fragment offsets with `nth-child` custom properties and add
keyframes for `future-letter-seal-break`, `future-letter-light-bloom`,
`future-letter-seal-fragment` and `future-letter-paper-reveal`. Preserve the
existing reduced-motion global rule; extend it only if a new phase selector
needs an explicit `animation: none` fallback.

### Task 4: Record the completed policy/design and conduct source-only handoff

**Files:**
- Modify: `docs/superpowers/specs/2026-07-24-future-letter-opening-admin-design.md`
- Modify: `docs/superpowers/plans/2026-07-24-future-letter-opening-admin.md`
- Inspect: all files from Tasks 1–3

**Interfaces:**
- Consumes the final Owner RLS/application/UI contracts and public opening state machine.
- Produces documentary status and source-only evidence; it deliberately does not execute the migration or any test command.

- [x] **Step 1: Mark the approved design as implemented**

Set the spec status exactly to:

```md
**Trạng thái:** Đã được người dùng duyệt và triển khai theo đặc tả này.
```

- [x] **Step 2: Inspect explicit security, route and animation contracts**

Run these read-only checks:

```bash
rg -n "listManaged|deleteManaged|requireCatalogueOwner|admin/thu-hen-ngay-mo|future_letters_member_(select|delete)|private.is_owner|deleteOwnScheduled" \
  src docs/migrations/2026-07-24-owner-manage-future-letters.sql

rg -n "type OpeningPhase|unsealing|revealing|prefers-reduced-motion|future-letter-(light|seal-fragments|paper-reveal)" \
  src/features/future-letters/presentation/future-letter-opening-card.tsx src/app/globals.css
```

Expected: Owner authorization exists in application and RLS; public author
cancellation remains time-limited by RLS; the admin route is separate; all four
opening phases and reduced-motion path remain present.

- [x] **Step 3: Review the scoped diff and hand off the SQL file**

Run:

```bash
git diff --ignore-space-at-eol -- \
  src/modules/future-letters \
  src/features/future-letters \
  src/app/admin/thu-hen-ngay-mo/page.tsx \
  src/components/admin/admin-workspace-switcher.tsx \
  src/lib/backend/create-server-backend.ts \
  src/app/globals.css \
  docs/migrations/2026-07-24-owner-manage-future-letters.sql \
  docs/product-direction.md \
  docs/superpowers/specs/2026-07-24-future-letter-opening-admin-design.md \
  docs/superpowers/plans/2026-07-24-future-letter-opening-admin.md
```

Confirm the diff contains no service-role key, no RLS disablement and no member
delete-after-open bypass. Tell the user the migration path that they must run
themselves; do not apply it, run test/lint/build/browser QA, commit or create a
branch.
