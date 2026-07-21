# Catalogue Emotional Collection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Do not use subagents for this repository.

**Goal:** Refactor the public collection into a calmer editorial journey and let every active member save and share their own rating and comments on an item.

**Architecture:** Keep write operations in `ManageItemEngagement` and the existing Server Actions. Add a server-only engagement reader/view model that decorates existing ratings and comments with profile display names and avatars in one profile query; the item detail page loads it after resolving the item and passes serializable data to one focused client interaction panel. The public catalogue stays a Server Component composition of its existing page data, split into presentational chapter and featured-item components.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Supabase SSR with RLS, Tailwind CSS, Lucide React, React View Transitions.

## Global Constraints

- Use existing `ratings`, `comments`, `profiles` and `user_item_states` only; do not add a migration, modify RLS, seed remote data or change the Supabase dashboard.
- Do not expose a Supabase client, secret, profile email or authorization decision to a Client Component. The browser receives only the rendered view model and calls existing Server Actions.
- Keep one rating per `(item_id, user_id)`, score range 1–5, optional rating note max 1,000 characters and comment content range 1–2,000 characters.
- Active members read shared ratings/comments and Google-derived profile names/avatars. A member changes their own rating/comment; Owner may only delete another member’s comment through existing action and RLS.
- Preserve Bordeaux Diary semantic CSS tokens, 44px minimum interactive targets, keyboard focus, existing View Transitions and reduced-motion behavior. Do not add an animation or UI package.
- Do not add or run unit tests, do not commit or push. The user will run `npx.cmd tsc --noEmit` and `npm.cmd run build` on Windows with Node 24.
- Leave the unrelated untracked `D:\\Code\\mai-suggest/` entry untouched.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/modules/engagement/domain/item-engagement-view.ts` | Serialisable read model for a rating/comment plus its public profile author. |
| `src/modules/engagement/application/item-engagement-reader.ts` | Port used only for loading a decorated item engagement view. |
| `src/modules/engagement/application/get-item-engagement-view.ts` | Active-actor validation and application use case for the read model. |
| `src/modules/engagement/infrastructure/engagement-mappers.ts` | Shared row-to-domain mapping and profile author lookup helpers. |
| `src/modules/engagement/infrastructure/supabase-item-engagement-reader.ts` | Server Supabase implementation: parallel data reads, then one profile lookup. |
| `src/modules/engagement/infrastructure/supabase-engagement-repository.ts` | Reuse the shared basic row mappers without changing its mutation contract. |
| `src/lib/backend/create-server-backend.ts` | Compose and expose `getItemEngagementView`. |
| `src/app/catalogue/[slug]/page.tsx` | Load the engagement view for the resolved visible item and pass it to presentation. |
| `src/features/catalogue/presentation/catalogue-engagement-panel.tsx` | Client-only rating/comment editor and shared discussion display. |
| `src/features/catalogue/presentation/catalogue-detail.tsx` | Mount the engagement panel after keepsakes without changing item detail content. |
| `src/features/catalogue/presentation/catalogue-chapter-rail.tsx` | Real-category navigation in the editorial collection layout. |
| `src/features/catalogue/presentation/catalogue-featured-item-card.tsx` | Larger first-item entry point for the first page of a collection. |
| `src/features/catalogue/presentation/catalogue-home.tsx` | Compose compact hero, chapter rail, featured item, remaining grid and pagination. |
| `src/features/catalogue/presentation/catalogue-item-card.tsx` | Give regular cards a smaller editorial “Mở câu chuyện” affordance. |
| `src/features/catalogue/presentation/catalogue-pagination.tsx` | Add contextual pagination copy while retaining current URLs and controls. |
| `docs/product-direction.md` | Record the shipped shared rating/comment principle as a product decision. |

## Task 1: Create the decorated engagement read boundary

**Files:**
- Create: `src/modules/engagement/domain/item-engagement-view.ts`
- Create: `src/modules/engagement/application/item-engagement-reader.ts`
- Create: `src/modules/engagement/application/get-item-engagement-view.ts`
- Create: `src/modules/engagement/infrastructure/engagement-mappers.ts`
- Create: `src/modules/engagement/infrastructure/supabase-item-engagement-reader.ts`
- Modify: `src/modules/engagement/infrastructure/supabase-engagement-repository.ts`

**Consumes:** `ItemRating`, `ItemComment`, `ItemUserState`, `CurrentActor`, `requireActiveActor`, `Result` and generated `Database` rows.

**Produces:** `GetItemEngagementView.execute(actor, itemId): Promise<Result<ItemEngagementView>>`, with author identity attached to every shared rating and comment.

- [ ] **Step 1: Define view-only author and engagement types**

  Create `item-engagement-view.ts` with these exact public shapes. Keep the raw mutation models in `engagement-models.ts` unchanged.

  ```ts
  import type {
    ItemComment,
    ItemRating,
    ItemUserState,
  } from "@/modules/engagement/domain/engagement-models";

  export interface EngagementAuthor {
    displayName: string;
    avatarUrl: string | null;
  }

  export interface ItemRatingView extends ItemRating {
    author: EngagementAuthor;
  }

  export interface ItemCommentView extends ItemComment {
    author: EngagementAuthor;
  }

  export interface ItemEngagementView {
    state: ItemUserState | null;
    ratings: ItemRatingView[];
    comments: ItemCommentView[];
  }
  ```

- [ ] **Step 2: Define the reader port and actor-validating use case**

  `item-engagement-reader.ts` exports:

  ```ts
  export interface ItemEngagementReader {
    readItemEngagement(
      itemId: string,
      viewerId: string,
    ): Promise<Result<ItemEngagementView>>;
  }
  ```

  `get-item-engagement-view.ts` validates an active actor and a non-empty
  trimmed item ID before calling `reader.readItemEngagement(itemId,
  activeActor.value.userId)`. It returns `ACCESS_DENIED` directly from
  `requireActiveActor`, `VALIDATION_FAILED` for an empty id and otherwise
  preserves the reader result.

- [ ] **Step 3: Move reusable basic row mappings into a focused mapper file**

  Export `toItemState`, `toItemRating`, `toItemComment`, `engagementAuthorsById`
  and `fallbackEngagementAuthor` from `engagement-mappers.ts`. Its profile row
  type is exactly:

  ```ts
  export type EngagementProfileRow = Pick<
    Database["public"]["Tables"]["profiles"]["Row"],
    "id" | "display_name" | "avatar_url"
  >;
  ```

  `engagementAuthorsById` turns a blank `display_name` into `"Thành viên"` and
  preserves `avatar_url`; `fallbackEngagementAuthor` uses the same values. Make
  `supabase-engagement-repository.ts` import the three basic row mappers instead
  of keeping local copies. Do not alter its query columns, `upsert` conflict
  target or mutation return types.

- [ ] **Step 4: Implement the server Supabase reader without an N+1 profile query**

  In `SupabaseItemEngagementReader`, issue these independent queries with
  `Promise.all`:

  ```ts
  const [stateResult, ratingsResult, commentsResult] = await Promise.all([
    this.client.from("user_item_states").select(STATE_COLUMNS)
      .eq("item_id", itemId).eq("user_id", viewerId).maybeSingle(),
    this.client.from("ratings").select(RATING_COLUMNS)
      .eq("item_id", itemId).order("updated_at", { ascending: false }),
    this.client.from("comments").select(COMMENT_COLUMNS)
      .eq("item_id", itemId).order("created_at", { ascending: false }),
  ]);
  ```

  Return `failure("UNEXPECTED_FAILURE")` for any query error. Then derive a
  unique user-id set from rating and comment rows. If the set is empty, use an
  empty profile array; otherwise make exactly one `.from("profiles")`
  `.select("id,display_name,avatar_url").in("id", userIds)` query. Map each row
  with the shared mapper and attach the matching author, falling back to
  `fallbackEngagementAuthor`. Return `success({ state, ratings, comments })`.

- [ ] **Step 5: Check the boundary statically**

  Run `git diff --check` after this task. It must report no whitespace errors;
  no migration, environment file or `NEXT_PUBLIC_*` value may appear in the
  diff.

## Task 2: Compose the read model in the item detail route

**Files:**
- Modify: `src/lib/backend/create-server-backend.ts`
- Modify: `src/app/catalogue/[slug]/page.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-detail.tsx`

**Consumes:** `SupabaseItemEngagementReader`, `GetItemEngagementView`, visible
item detail use case and active page access.

**Produces:** An item detail Server Component that passes an authorised
`ItemEngagementView` to its presentation tree.

- [ ] **Step 1: Add the reader to server backend composition**

  Instantiate `const itemEngagementReader = new SupabaseItemEngagementReader(client);`
  beside `engagementRepository`, then expose:

  ```ts
  getItemEngagementView: new GetItemEngagementView(itemEngagementReader),
  ```

  Keep `manageItemEngagement` intact because it owns write use cases used by
  existing Server Actions.

- [ ] **Step 2: Load engagement only after the item is proven visible**

  In `/catalogue/[slug]/page.tsx`, retain the current parallel item/category
  load and current `notFound` handling. After `itemResult.ok`, start the
  engagement read with `backend.getItemEngagementView.execute(access.actor,
  itemResult.value.id)` and handle a failed result by throwing
  `new Error("Unable to load catalogue engagement.")`. This prevents reading
  engagement for an arbitrary or hidden item id.

- [ ] **Step 3: Extend the detail presentation contract**

  Add `engagement: ItemEngagementView` to `CatalogueDetailProps`, pass the
  successful value from the page and retain all existing `item`, category and
  keepsake rendering. The client boundary will be imported in the next task;
  do not move Supabase calls into `CatalogueDetail`.

## Task 3: Build the shared rating and comment panel

**Files:**
- Create: `src/features/catalogue/presentation/catalogue-engagement-panel.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-detail.tsx`

**Consumes:** `ItemEngagementView`, existing engagement Server Actions,
`Button`, current actor ID and `canManageCatalogue`.

**Produces:** A single client section where a member manages their own rating,
shares comments and reads the other member’s real profile-decorated entries.

- [ ] **Step 1: Keep client state local to the interaction section**

  Mark the new panel `"use client"`. Its props are:

  ```ts
  interface CatalogueEngagementPanelProps {
    itemId: string;
    engagement: ItemEngagementView;
    actorId: string;
    canManage: boolean;
  }
  ```

  Derive `myRating` with `engagement.ratings.find((rating) => rating.userId === actorId)`.
  Initialise score, note, new-comment text, editing comment id/content,
  confirmation id and feedback with React state. Use one `useTransition` for
  writes; on a successful action set a Vietnamese success message and call
  `router.refresh()`. On failed action leave controlled input text intact and
  show a Vietnamese `aria-live="polite"` error.

- [ ] **Step 2: Implement the rating editor as accessible stars plus optional note**

  Render five `button type="button"` controls with labels such as
  `aria-label="Chấm 4 sao"` and `aria-pressed={score === 4}`. Use `Star` with
  fill only as a visual enhancement; show selected score in text, for example
  `"4 trên 5 sao"`, so color is not the only state signal. Submit a form to:

  ```ts
  setMyItemRatingAction({ itemId, score, note: note.trim() || null })
  ```

  Disable submit while pending or score is zero. Add a compact secondary
  `Xóa đánh giá` only when `myRating` exists; it calls
  `deleteMyItemRatingAction(itemId)` and clears local score/note after success.
  The textarea has `maxLength={1000}`, `min-h-28`, visible counter and the same
  focus token as other forms.

- [ ] **Step 3: Render rating authors without calculating an average**

  Map `engagement.ratings` into compact cards showing `AuthorAvatar`, Google
  display name, text star score, optional `note` with `whitespace-pre-line`,
  and `updatedAt` formatted via `Intl.DateTimeFormat("vi-VN", { day: "2-digit",
  month: "short", year: "numeric" })`. If the array is empty, render one calm
  empty message. Never render `externalRating` here and never derive a mean.

  `AuthorAvatar` receives `{ displayName, avatarUrl }`; use a 40px rounded `<img
  alt="">` when an avatar exists, otherwise a 40px semantic-free initial badge.

- [ ] **Step 4: Implement shared comments using the existing action contract**

  Create form calls `createItemCommentAction({ itemId, content })` with trimmed
  non-empty content and `maxLength={2000}`. For each comment, permit edit only
  when `comment.userId === actorId`; permit delete when that expression or
  `canManage` is true. Use:

  ```ts
  updateMyItemCommentAction({ commentId, content })
  deleteItemCommentAction(commentId)
  ```

  Use the existing timeline response panel’s inline confirmation pattern, but
  copy its JSX into the new panel so catalogue copy and state remain isolated.
  Label an Owner removal `"Gỡ lời bình"`; label author removal `"Xóa"`.

- [ ] **Step 5: Mount the panel after keepsakes with clear hierarchy**

  In `CatalogueDetail`, add an outer bordered/wash section after the existing
  keepsake section and render:

  ```tsx
  <CatalogueEngagementPanel
    actorId={actor.userId}
    canManage={actor.canManageCatalogue}
    engagement={engagement}
    itemId={item.id}
  />
  ```

  Its heading is `"Góc nhìn của chúng mình"`; introduce rating first, then the
  shared `"Lời bình giữ lại"` area. Use current theme variables and `min-h-11`
  buttons, not raw palette values or browser confirms.

## Task 4: Refactor the public collection into chapters and a featured entry

**Files:**
- Create: `src/features/catalogue/presentation/catalogue-chapter-rail.tsx`
- Create: `src/features/catalogue/presentation/catalogue-featured-item-card.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-home.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-item-card.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-pagination.tsx`

**Consumes:** Existing categories, paginated item page, image component and
`createCataloguePath` URL builder.

**Produces:** A smaller, more intentional collection view with no new API or
data query.

- [ ] **Step 1: Create a real-data chapter rail**

  `CatalogueChapterRail` accepts `categories: CatalogueCategory[]` and
  `selectedCategorySlug: string | null`. It renders `"Chọn một chương hôm nay"`,
  an `"Tất cả"` link and one Link per category using the current
  `createCataloguePath({ categorySlug, page: 1 })`. Each card shows the actual
  category `name` and optional `description`; when `coverImageUrl` exists,
  render it as a decorative `img alt=""` under a gradient overlay. When absent,
  render only the existing theme wash and actual name—never invent an image or
  description. Keep `aria-current="page"` on the selected Link and existing
  `collection-change` transition type.

- [ ] **Step 2: Create the first-item editorial card**

  `CatalogueFeaturedItemCard` accepts `item: CatalogueItemSummary` and
  `categoryName: string | null`. Use the existing `CatalogueItemImage` inside a
  `ViewTransition` named `item-image-${item.id}` and preserve the no-image
  heart fallback. Beside/below image, render the actual category label, title,
  optional summary and price, then the visible CTA `"Mở câu chuyện"` with
  `ArrowRight`. Its Link uses the current slug route and
  `transitionTypes={["nav-forward"]}`. No copy claims a rating, popularity or
  recommendation that is not present in the database.

- [ ] **Step 3: Compose a compact editorial collection home**

  In `CatalogueHome`, retain current active actor guard/header/skip link and
  category-name map. Use `const isFirstPage = itemPage.page === 1` and only
  extract the first item as `featuredItem` when true; all later pages pass every
  item to the normal grid. Replace the large filter band with the chapter rail,
  place the featured item before the grid and give the remaining grid an
  `aria-labelledby` heading. Keep `ViewTransition` wrapping the changing grid
  with the same key and transition type mappings. Empty state behavior and
  current category reset link remain unchanged.

- [ ] **Step 4: Give standard cards and pagination softer navigation copy**

  In `CatalogueItemCard`, retain image ratio, data and Link semantics but add a
  small visual footer `"Mở câu chuyện"` with `ArrowUpRight`; it remains part of
  the same Link and does not create a nested interactive element. Keep the card
  compact with current padding and line clamps.

  In `CataloguePagination`, add `"Xem thêm những điều đã lưu"` above the
  existing nav when `pageCount > 1`. Preserve all `createCataloguePath` values,
  `page-forward`/`page-back` types, `aria-current`, and 44px controls.

## Task 5: Record the product decision and hand off verification

**Files:**
- Modify: `docs/product-direction.md`
- Inspect: all files in Tasks 1–4

**Consumes:** Completed read model and presentation refactor.

**Produces:** Current product documentation plus a focused handoff for the
user’s Windows verification.

- [ ] **Step 1: Update the existing catalogue description**

  Add two factual bullets under **“Catalogue kỷ niệm và gợi ý”**: the
  collection is organised as emotional chapters with one highlighted entry on
  the first page, and each active member can leave a private-to-the-group
  1–5-star view plus optional note/comment that shows their Google profile name
  and avatar. State that entries are shared among active members; the author
  manages their own content and Owner only moderates removal.

- [ ] **Step 2: Inspect scope and formatting**

  Run `git diff --check` and inspect `git status --short`. Expected: no
  whitespace errors; source changes are limited to the files listed above plus
  the already-approved specification/plan. Do not touch the unrelated untracked
  `D:\\Code\\mai-suggest/` entry.

- [ ] **Step 3: Ask the user to run project verification**

  Ask the user to run exactly:

  ```bat
  npx.cmd tsc --noEmit
  npm.cmd run build
  ```

  Then ask for manual browser QA at 320, 390, 768, 1024 and 1440px for `/` and
  one `/catalogue/[slug]`: category selection, page links, card navigation,
  rating create/update/delete, comment create/edit/delete, Google name/avatar,
  focus and reduced motion. Report any command output before making a claim that
  the work is verified.
