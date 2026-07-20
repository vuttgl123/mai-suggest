# Catalogue Detail, Pagination, Owner Workspace and Motion Implementation Plan

> **For agentic workers:** Execute this plan inline, task-by-task. Do not create a worktree, dispatch subagents, commit, or push: the project owner explicitly retains Git control.

**Goal:** Deliver a deep-Bordeaux, paginated live catalogue where each item opens to public keepsakes, with a detailed Owner workspace and smooth, accessible navigation.

**Architecture:** Keep notes in the existing `items.metadata.keepsakes` JSON structure through a domain parser/validator, preserving unrelated metadata. Add paged reader/use-case pairs rather than changing existing non-paged interfaces. Server pages load Supabase data through `createServerBackend`; focused client components only handle form state and server actions. React View Transitions enhance navigation and degrade safely.

**Tech Stack:** Next.js 16 App Router, React ViewTransition, TypeScript strict, Tailwind CSS, Lucide React, Supabase SSR/PostgREST, existing DDD modules and Server Actions.

## Global Constraints

- Use live Supabase data only; do not add mock/JSON catalogue data.
- Do not create migrations, change RLS, use a secret key in browser code, or alter OAuth.
- Google OAuth and existing active-member/Owner guards remain unchanged.
- Do not add or modify automated tests for this UI-focused work.
- Do not commit, push, reset, or change unrelated user work.
- Use `apply_patch` for every repository edit.
- Preserve `prefers-reduced-motion`; all view transition CSS must use the standard recipes.
- Final validation is manual browser QA plus user-run `npx.cmd tsc --noEmit` and `npm.cmd run build` on Windows Node 24.

---

## File structure

| File | Responsibility |
| --- | --- |
| `src/modules/catalogue/domain/item-keepsakes.ts` | Typed keepsake metadata parsing, merge and validation limits. |
| `src/modules/catalogue/domain/catalogue-read-models.ts` | Public paged item read model. |
| `src/modules/catalogue/domain/catalogue-admin-models.ts` | Paged managed-item read model. |
| `src/modules/catalogue/application/catalogue-reader.ts` | Public paged reader contract. |
| `src/modules/catalogue/application/catalogue-admin-reader.ts` | Owner paged reader contract. |
| `src/modules/catalogue/application/list-visible-item-page.ts` | Active-member public pagination use case. |
| `src/modules/catalogue/application/list-managed-item-page.ts` | Owner admin pagination use case. |
| `src/modules/catalogue/application/manage-catalogue.ts` | Validates `metadata.keepsakes` before write. |
| `src/modules/catalogue/infrastructure/supabase-catalogue-reader.ts` | Exact-count public page query and page-only image query. |
| `src/modules/catalogue/infrastructure/supabase-catalogue-admin-reader.ts` | Exact-count Owner item page query. |
| `src/lib/backend/create-server-backend.ts` | Composes the two new use cases. |
| `src/features/catalogue/lib/catalogue-navigation.ts` | URL normalization and safe category/page builders. |
| `src/features/catalogue/presentation/catalogue-pagination.tsx` | Reusable accessible public pagination control. |
| `src/features/catalogue/presentation/catalogue-detail.tsx` | Public romantic item-detail presentation. |
| `src/app/catalogue/[slug]/page.tsx` | Protected server page for one visible item. |
| `src/features/catalogue/presentation/catalogue-home.tsx` | Receives page model, links cards and renders pagination. |
| `src/features/catalogue/presentation/catalogue-item-card.tsx` | Semantic link/card and shared image transition boundary. |
| `src/app/page.tsx` | Normalizes `category`/`page` and loads public paged data. |
| `src/features/catalogue/presentation/admin-catalogue.tsx` | Thin client workspace coordinator, replacing the current oversized create/list screen. |
| `src/features/catalogue/presentation/admin-catalogue-sidebar.tsx` | Category navigation and category creation. |
| `src/features/catalogue/presentation/admin-item-list.tsx` | Owner paginated selectable item list. |
| `src/features/catalogue/presentation/admin-item-editor.tsx` | Item fields, metadata save, image/link controls. |
| `src/features/catalogue/presentation/item-keepsake-editor.tsx` | Add/edit/reorder/remove note cards before item save. |
| `src/app/admin/page.tsx` | URL-driven selected item and paginated Owner data loader. |
| `src/components/ui/page-transition.tsx` | Reusable typed page transition wrappers. |
| `src/components/app-header.tsx` | Persistent header isolation and correct active navigation state. |
| `next.config.ts` | Enables Next view transitions. |
| `src/app/globals.css` | Deep Bordeaux semantic tokens and standard transition recipes. |

## Task 1: Add typed keepsakes and paged DDD contracts

**Files:**
- Create: `src/modules/catalogue/domain/item-keepsakes.ts`
- Create: `src/modules/catalogue/application/list-visible-item-page.ts`
- Create: `src/modules/catalogue/application/list-managed-item-page.ts`
- Modify: `src/modules/catalogue/domain/catalogue-read-models.ts`
- Modify: `src/modules/catalogue/domain/catalogue-admin-models.ts`
- Modify: `src/modules/catalogue/application/catalogue-reader.ts`
- Modify: `src/modules/catalogue/application/catalogue-admin-reader.ts`
- Modify: `src/modules/catalogue/application/manage-catalogue.ts`
- Modify: `src/lib/backend/create-server-backend.ts`

**Consumes:** `CurrentActor`, `requireActiveActor`, `requireCatalogueOwner`, existing `Result`, `CatalogueMetadata` and non-paged reader interfaces.

**Produces:**

```ts
export type ItemKeepsakeKind = "message" | "poem" | "memory";
export interface ItemKeepsake {
  id: string;
  kind: ItemKeepsakeKind;
  title: string | null;
  content: string;
}

export function readItemKeepsakes(metadata: Record<string, unknown>): ItemKeepsake[];
export function mergeItemKeepsakes(
  metadata: CatalogueMetadata,
  keepsakes: ItemKeepsake[],
): CatalogueMetadata;
export function isValidItemKeepsakeMetadata(metadata: CatalogueMetadata): boolean;

export interface CatalogueItemPage {
  items: CatalogueItemSummary[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}
export interface ManagedCatalogueItemPage {
  items: ManagedCatalogueItem[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}
```

- [ ] **Step 1: Define keepsake parser and validator.**

  Implement the reader defensively: inspect `metadata.keepsakes` only if it is an
  array; for every object, require a trimmed id/content, one of three kinds, and a
  nullable trimmed title. Return only valid entries in original order. The writer
  spreads existing metadata and replaces only `keepsakes`; `isValid…` accepts a
  missing `keepsakes`, otherwise requires 1–24 valid unique IDs, title ≤120 and
  content ≤2,000 characters. Keep the function independent from React/Supabase.

- [ ] **Step 2: Add page types and additive reader contracts.**

  Keep `listItems` and `listManagedItems` unchanged for compatibility. Add:

  ```ts
  export interface CatalogueItemPageCriteria {
    categorySlug?: string;
    page: number;
    pageSize: number;
  }
  listItemPage(criteria: CatalogueItemPageCriteria): Promise<Result<CatalogueItemPage>>;

  export interface ManagedCatalogueItemPageCriteria {
    categoryId?: string;
    page: number;
    pageSize: number;
  }
  listManagedItemPage(
    criteria: ManagedCatalogueItemPageCriteria,
  ): Promise<Result<ManagedCatalogueItemPage>>;
  ```

  `ListVisibleItemPage.execute(actor, criteria)` must call `requireActiveActor`
  before the reader. `ListManagedItemPage.execute(actor, criteria)` must call
  `requireCatalogueOwner` before the reader. Both return validation failure when
  page or pageSize is not a positive integer.

- [ ] **Step 3: Enforce keepsake validation at the mutation boundary.**

  Extend `normalizeItem` with `isValidItemKeepsakeMetadata(input.metadata)` in
  the existing condition. Do not mutate metadata in `ManageCatalogue`; the editor
  will send a merged value. This preserves current category/item action APIs.

- [ ] **Step 4: Compose new use cases.**

  Construct both new use cases from existing readers in `createBackendForClient`:

  ```ts
  listVisibleItemPage: new ListVisibleItemPage(catalogueReader),
  listManagedItemPage: new ListManagedItemPage(catalogueAdminReader),
  ```

  Keep all existing backend properties intact so existing routes and actions keep
  their type signatures.

## Task 2: Query only a real page from Supabase

**Files:**
- Modify: `src/modules/catalogue/infrastructure/supabase-catalogue-reader.ts`
- Modify: `src/modules/catalogue/infrastructure/supabase-catalogue-admin-reader.ts`

**Consumes:** Task 1 page contracts; current select column constants and mappers.

**Produces:** Exact-count Supabase pagination for public and Owner lists without
client-side slicing.

- [ ] **Step 1: Implement the public `listItemPage` query.**

  Reuse `findVisibleCategoryId`. If a requested category is absent, return:

  ```ts
  success({ items: [], page: criteria.page, pageSize: criteria.pageSize, total: 0, pageCount: 0 })
  ```

  Otherwise calculate `from = (page - 1) * pageSize` and `to = from + pageSize - 1`.
  Request `ITEM_SUMMARY_COLUMNS` with `{ count: "exact" }`, category equality
  when applicable, `.order("title")`, and `.range(from, to)`. Query images only
  for returned IDs, map the first ordered image as `primaryImage`, then return
  `pageCount = Math.ceil(total / pageSize)`. Map Supabase errors to
  `failure("UNEXPECTED_FAILURE")` exactly as existing reader methods do.

- [ ] **Step 2: Implement Owner `listManagedItemPage`.**

  Use the same `from`/`to` calculation with `ITEM_COLUMNS`, `{ count: "exact" }`,
  category equality when present, and `.order("created_at", { ascending: false })`.
  Return `ManagedCatalogueItemPage` after mapping; no image/link joins are needed
  for the compact list. Retain the existing full `listManagedItems` method.

- [ ] **Step 3: Inspect page-boundary behavior manually in code.**

  Confirm the root and admin callers will normalize/clamp positive pages before
  querying. An empty last-page result after a concurrent deletion must render the
  page control safely instead of attempting image `.in` with an empty array.

## Task 3: Build public pagination and the item-detail experience

**Files:**
- Create: `src/features/catalogue/lib/catalogue-navigation.ts`
- Create: `src/features/catalogue/presentation/catalogue-pagination.tsx`
- Create: `src/features/catalogue/presentation/catalogue-detail.tsx`
- Create: `src/app/catalogue/[slug]/page.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-home.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-item-card.tsx`

**Consumes:** `CatalogueItemPage`, `readItemKeepsakes`, `getVisibleItemDetail`,
`listVisibleCategories`, active-page guard, `CatalogueItemImage`.

**Produces:** Shareable `?category=&page=` pagination and public detail pages.

- [ ] **Step 1: Centralize public catalogue URL logic.**

  Export a `PUBLIC_PAGE_SIZE = 6`, `parsePositivePage(value): number`, and
  `createCataloguePath({ categorySlug, page }): string`. Parsing accepts the first
  string value only, defaults invalid/zero/negative values to one and does not
  expose arbitrary query parameters. `createCataloguePath` uses `URLSearchParams`,
  omits page one and encodes the category.

- [ ] **Step 2: Load the paged model in `src/app/page.tsx`.**

  Extend `searchParams` with `page`. Await params and backend in parallel, guard
  actor, call `backend.listVisibleItemPage.execute(actor, { categorySlug,
  page: requestedPage, pageSize: PUBLIC_PAGE_SIZE })`, then clamp an out-of-range
  requested page to `pageCount` (or one for zero total) by repeating only the page
  query with the corrected page. Pass `itemPage`, selected category and categories
  to `CatalogueHome`.

- [ ] **Step 3: Render pagination without losing filters.**

  Change the hero count to `itemPage.total`, grid source to `itemPage.items`, and
  category links to `createCataloguePath({ categorySlug, page: 1 })`. Add
  `CataloguePagination` below the grid only when `pageCount > 1`; it renders
  semantic `<nav aria-label="Phân trang bộ sưu tập">`, disabled text for unavailable
  previous/next, current page via `aria-current="page"`, and links generated by
  the URL utility. Preserve the category when moving page.

- [ ] **Step 4: Make cards accessible entry points.**

  Wrap each full card in a `Link` to `/catalogue/${encodeURIComponent(item.slug)}`.
  Preserve image alt/fallback. The title must remain the card heading; provide a
  visible focus ring and use `transitionTypes={["nav-forward"]}`. Do not make a
  nested interactive element inside the card.

- [ ] **Step 5: Add server detail route and presentation.**

  The route takes `params: Promise<{ slug: string }>`, gets backend and params in
  parallel, resolves active access, then loads `getVisibleItemDetail` and category
  list in parallel. A `NOT_FOUND` result calls `notFound()`, other failure throws
  the route error. `CatalogueDetail` receives only serializable domain data,
  derives keepsakes with `readItemKeepsakes`, renders the hero/info/link and the
  ordered keepsake cards. The back link points to `/` and uses
  `transitionTypes={["nav-back"]}`. Omit sections whose data is absent; use an
  honest empty state for no keepsakes.

## Task 4: Replace the basic admin screen with a detailed Owner workspace

**Files:**
- Create: `src/features/catalogue/presentation/admin-catalogue-sidebar.tsx`
- Create: `src/features/catalogue/presentation/admin-item-list.tsx`
- Create: `src/features/catalogue/presentation/item-keepsake-editor.tsx`
- Create: `src/features/catalogue/presentation/admin-item-editor.tsx`
- Modify: `src/features/catalogue/presentation/admin-catalogue.tsx`
- Modify: `src/app/admin/page.tsx`

**Consumes:** Owner guard, `ManagedCatalogueItemPage`, `ManagedCatalogueItemDetail`,
existing category/image/link Server Actions, `updateCatalogueItemAction`, and
Task 1 keepsake helpers.

**Produces:** URL-addressable category/item/page workspace and detailed item edit
flow with safe metadata persistence.

- [ ] **Step 1: Make the admin server route URL-driven.**

  Accept `category`, `item` and `page` search params. After the current Owner
  guard, load categories and `listManagedItemPage` in parallel with a normalized
  `pageSize` of 10 and optional category ID. If `item` exists, load
  `getManagedItemDetail` after guard and return the editor empty state if it is not
  found or outside the selected category. Pass page metadata and selected detail
  into `AdminCatalogue`; never fetch Supabase in a client component.

- [ ] **Step 2: Split the client workspace by responsibility.**

  `AdminCatalogue` owns one feedback state and routes refresh after successful
  Server Actions. It lays out the three regions on large screens and stacks them
  on mobile. Sidebar renders category links that reset page to one and a small
  create-category form. Item list renders item status, selection link,
  `CataloguePagination`-style Owner controls and a compact new-item entry point.
  Deletion must use a focusable inline confirmation panel, not `window.confirm`.

- [ ] **Step 3: Build the metadata-aware item editor.**

  Initialize the edit form from selected item and use `readItemKeepsakes` for a
  local ordered state. `ItemKeepsakeEditor` supports buttons for each kind,
  title/content fields, move earlier/later and inline remove confirmation. On
  submit build:

  ```ts
  const input: CatalogueItemInput = {
    categoryId: values.categoryId,
    slug: values.slug,
    kind: values.kind,
    title: values.title,
    summary: values.summary,
    description: values.description,
    address: values.address,
    latitude: values.latitude,
    longitude: values.longitude,
    mapUrl: values.mapUrl,
    priceLabel: values.priceLabel,
    externalRating: values.externalRating,
    externalReviewCount: values.externalReviewCount,
    externalRatingSource: values.externalRatingSource,
    metadata: mergeItemKeepsakes(selectedItem.metadata, keepsakes),
    isPublished: values.isPublished,
  };
  ```

  Send `createCatalogueItemAction` for a new item and
  `updateCatalogueItemAction(selectedItem.id, input)` for an existing one. After
  an item create succeeds, navigate to `/admin?item=<created-id>` inside
  `startTransition`; after update, refresh while retaining query context. Map
  `VALIDATION_FAILED` to an explanation mentioning the required keepsake text and
  allowed length.

- [ ] **Step 4: Expose existing image/link management within the selected editor.**

  List images and links from `ManagedCatalogueItemDetail`, each with edit/delete
  affordances that call the existing Server Actions. New image/link forms must
  include URL, title/alt text and sort order. Keep these controls separate from
  the item metadata save so one failed image URL cannot discard unsaved text.

## Task 5: Apply Bordeaux and meaningful View Transitions

**Files:**
- Create: `src/components/ui/page-transition.tsx`
- Modify: `next.config.ts`
- Modify: `src/app/globals.css`
- Modify: `src/components/app-header.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/catalogue/[slug]/page.tsx`
- Modify: `src/app/admin/page.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-item-card.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-detail.tsx`

**Consumes:** Task 3/4 routes and React's `ViewTransition` component.

**Produces:** Deep-red visual system and graceful, route-aware movement.

- [ ] **Step 1: Enable and isolate transitions.**

  Add `experimental: { viewTransition: true }` without discarding current image
  configuration. `PageTransition` wraps page content, not root layout:

  ```tsx
  <ViewTransition
    default="none"
    enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
    exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
  >
    {children}
  </ViewTransition>
  ```

  The header gets `style={{ viewTransitionName: "persistent-nav" }}` and accepts
  `activeSection: "catalogue" | "admin"` so its active link is correct on each page.

- [ ] **Step 2: Use standard recipes exactly.**

  Update semantic color tokens to the spec values. Replace hard-coded old red RGB
  utility values with token-compatible styles in touched components. Copy the
  complete timing, fade, vertical slide, directional navigation, morph, persistent
  nav and reduced-motion recipes from the View Transition skill into `globals.css`.
  Retain the existing general reduced-motion rule and ensure it also covers
  `::view-transition-*`.

- [ ] **Step 3: Connect navigation semantics.**

  Put `PageTransition` in `/`, `/catalogue/[slug]` and `/admin` page components.
  Card/detail links use forward/back types. Named image boundaries use a globally
  unique `item-image-${item.id}` with `share="morph"` only on source/target image
  pairs; image-less cards use normal directional entry/exit. Use a keyed fade
  boundary for public category changes, page changes and admin item selection so
  lateral changes do not falsely imply forward depth.

- [ ] **Step 4: Check visual and accessibility invariants in source.**

  Ensure `default="none"` on all view transitions, no page-wide motion uses a
  layout wrapper, navigation focus rings remain visible, cards retain text contrast,
  and animation CSS is zero-duration for reduced motion.

## Task 6: Scope review and handoff checks

**Files:**
- Modify only files listed in Tasks 1–5 when implementation requires it.

**Consumes:** Completed application, UI and styling tasks.

**Produces:** A concise verification handoff without claiming unrun commands pass.

- [ ] **Step 1: Inspect changed paths and whitespace.**

  Run `git diff --check` and inspect the diff so no secret, mock data, migration,
  unrelated cleanup or test file was added.

- [ ] **Step 2: Provide exact user-run verification commands.**

  Ask the user to run these separately from `D:\\Code\\mai-suggest` with their
  Windows Node 24 path active:

  ```bat
  npx.cmd tsc --noEmit
  npm.cmd run build
  npm.cmd run dev
  ```

  Then manually check Owner and member flows described in the design at 320, 390,
  768, 1024 and 1440 px, including a reduced-motion browser setting. Do not report
  a build or type-check as passing until the user supplies the output.

## Self-review

- Spec coverage: Task 1 covers structured notes and validation; Task 2 covers real
  public/Owner pagination; Task 3 covers public catalogue/detail display; Task 4
  covers detailed admin management; Task 5 covers Bordeaux and all motion paths;
  Task 6 covers safety and handoff.
- Constraints: the plan explicitly excludes migrations, RLS change, mock data,
  tests, commits and pushes.
- Interface consistency: all new backend property names, reader methods, page
  types and metadata helper names are defined in Task 1 before later tasks use
  them.
