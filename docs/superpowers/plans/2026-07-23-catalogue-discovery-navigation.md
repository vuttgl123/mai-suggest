# Catalogue Discovery and Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep readers in the Catalogue context while they filter or paginate, and add URL-backed Catalogue search over item title and summary.

**Architecture:** A domain helper normalizes the search term before it crosses the query and data boundaries. The server page parses `q`, passes it through the existing backend use case, and renders the returned page; a small client search form only owns the input value and URL navigation. Existing server-only Supabase reads retain RLS and apply the normalized term before count, order, and range.

**Tech Stack:** Next.js App Router, React, TypeScript strict, Tailwind CSS, Lucide React, Supabase JS server client, Vitest source files (not run by user request).

## Global Constraints

- Do not create a branch, worktree, commit, migration, index, RLS change, or direct browser Supabase query.
- Do not change the landing intro, header route semantics, existing View Transition styles, catalogue image loading, or data model outside the search criteria.
- Catalogue-only links that change `category`, `page`, or `q` must use `scroll={false}` or `router.push(..., { scroll: false })`; inter-page header navigation remains unchanged.
- `q` must be URL-backed, normalized to 80 characters of Unicode letters, numbers, spaces, and hyphens, and preserved by category and pagination URLs.
- Search only title and summary through the existing server-side `items` read, with exact count before pagination; never interpolate unnormalized user text into PostgREST `.or()`.
- Per the user's explicit instruction, do not write/run tests, lint, build, or browser QA. Use static source and scoped-diff inspection only; do not claim runtime verification.

---

## File structure

- Create `src/modules/catalogue/domain/catalogue-search-query.ts`: one reusable, client-safe normalization function for URL handling and server filter safety.
- Create `src/features/catalogue/presentation/catalogue-search.tsx`: client-owned form interaction only; no data fetching or result state.
- Modify `src/features/catalogue/lib/catalogue-navigation.ts`: parse and create all Catalogue URLs consistently.
- Modify `src/modules/catalogue/application/catalogue-reader.ts`, `src/modules/catalogue/application/list-visible-item-page.ts`, and `src/modules/catalogue/infrastructure/supabase-catalogue-reader.ts`: carry and apply the normalized optional query through the existing protected read path.
- Modify `src/app/page.tsx`, `src/features/catalogue/presentation/catalogue-home.tsx`, `src/features/catalogue/presentation/catalogue-chapter-rail.tsx`, and `src/features/catalogue/presentation/catalogue-pagination.tsx`: connect the URL, presentation, and non-scrolling navigation.

### Task 1: Normalized search URL contract

**Files:**
- Create: `src/modules/catalogue/domain/catalogue-search-query.ts`
- Modify: `src/features/catalogue/lib/catalogue-navigation.ts`

**Interfaces:**
- Produces `normalizeCatalogueSearchQuery(value: string | null | undefined): string | null`.
- Produces `parseCatalogueSearchQuery(value: string | string[] | undefined): string | null`.
- Changes `createCataloguePath` to accept `query?: string | null` while retaining `categorySlug` and `page`.

- [x] **Step 1: Add the pure normalization helper**

```ts
const MAX_CATALOGUE_SEARCH_LENGTH = 80;
const UNSAFE_SEARCH_CHARACTERS = /[^\p{L}\p{N}\s-]+/gu;
const REPEATED_WHITESPACE = /\s+/gu;

export function normalizeCatalogueSearchQuery(
  value: string | null | undefined,
): string | null {
  const normalized = value
    ?.replace(UNSAFE_SEARCH_CHARACTERS, " ")
    .replace(REPEATED_WHITESPACE, " ")
    .trim()
    .slice(0, MAX_CATALOGUE_SEARCH_LENGTH)
    .trim();

  return normalized || null;
}
```

This deliberately removes PostgREST operator punctuation, wildcard characters,
and quotes while retaining Vietnamese text.

- [x] **Step 2: Make `q` parse and URL generation use the helper**

```ts
import { normalizeCatalogueSearchQuery } from "@/modules/catalogue/domain/catalogue-search-query";

export function parseCatalogueSearchQuery(
  value: string | string[] | undefined,
): string | null {
  return normalizeCatalogueSearchQuery(firstSearchParam(value));
}

export function createCataloguePath({
  categorySlug,
  page,
  query,
}: {
  categorySlug: string | null;
  page: number;
  query?: string | null;
}): string {
  const searchParams = new URLSearchParams();
  const normalizedQuery = normalizeCatalogueSearchQuery(query);
  if (categorySlug) searchParams.set("category", categorySlug);
  if (normalizedQuery) searchParams.set("q", normalizedQuery);
  if (page > 1) searchParams.set("page", String(page));
  const serialized = searchParams.toString();
  return serialized ? `/?${serialized}` : "/";
}
```

Keep `firstSearchParam` and `parsePositivePage` unchanged so other callers do
not change behavior.

- [x] **Step 3: Static inspect the contract**

Run: `rtk read src/modules/catalogue/domain/catalogue-search-query.ts && rtk read src/features/catalogue/lib/catalogue-navigation.ts`

Expected: the only public URL builder emits optional `q`, and both URL parsing
and URL writing share one normalizer.

### Task 2: Protected server-side query flow

**Files:**
- Modify: `src/modules/catalogue/application/catalogue-reader.ts`
- Modify: `src/modules/catalogue/application/list-visible-item-page.ts`
- Modify: `src/modules/catalogue/infrastructure/supabase-catalogue-reader.ts`

**Interfaces:**
- Consumes `normalizeCatalogueSearchQuery` from Task 1.
- Adds `query?: string` only to `CatalogueItemPageCriteria`.
- `ListVisibleItemPage.execute(actor, criteria)` returns the same result shape,
  with a normalized `criteria.query` passed to the reader.

- [x] **Step 1: Extend only the paginated read criterion**

```ts
export interface CatalogueItemPageCriteria extends CatalogueItemCriteria {
  page: number;
  pageSize: number;
  query?: string;
}
```

Do not add search to admin readers or to the non-paginated `listItems` path.

- [x] **Step 2: Normalize at the application boundary**

```ts
import { normalizeCatalogueSearchQuery } from "@/modules/catalogue/domain/catalogue-search-query";

return this.catalogueReader.listItemPage({
  ...criteria,
  query: normalizeCatalogueSearchQuery(criteria.query) ?? undefined,
});
```

Place this after the active-actor and positive-integer guards, retaining the
same failure responses for unauthenticated, denied, or invalid page input.

- [x] **Step 3: Apply the safe OR filter before order and range**

Replace the conditional one-expression page request with a mutable `items`
select builder. Then apply category and normalized search in that order:

```ts
let request = this.client
  .from("items")
  .select(ITEM_SUMMARY_COLUMNS, { count: "exact" });

if (categoryId.value) {
  request = request.eq("category_id", categoryId.value);
}

const searchQuery = normalizeCatalogueSearchQuery(criteria.query);
if (searchQuery) {
  request = request.or(
    `title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%`,
  );
}

const { data: itemRows, error: itemError, count } = await request
  .order("title")
  .range(from, to);
```

The second normalization is a defense at the raw PostgREST boundary. Preserve
the existing unknown-category early return, exact count, image batch query,
mapping, and failure code.

- [x] **Step 4: Static inspect the protected path**

Run: `rtk read src/modules/catalogue/application/catalogue-reader.ts && rtk read src/modules/catalogue/application/list-visible-item-page.ts && rtk read src/modules/catalogue/infrastructure/supabase-catalogue-reader.ts`

Expected: `q` is optional, never affects authorization, and the only `.or()`
uses the domain-normalized value on the `items` table.

### Task 3: Server URL consumption and search presentation

**Files:**
- Create: `src/features/catalogue/presentation/catalogue-search.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-home.tsx`

**Interfaces:**
- Consumes `createCataloguePath` and `normalizeCatalogueSearchQuery` from Task 1.
- `CatalogueSearch` props are `{ categorySlug: string | null; query: string | null; resultCount: number }`.
- `CatalogueHome` receives `searchQuery: string | null` in addition to its
  existing props.

- [x] **Step 1: Parse and retain `q` in the server page**

Add `q?: string | string[]` to `HomePageProps.searchParams`, derive
`const searchQuery = parseCatalogueSearchQuery(params.q)`, and include
`query: searchQuery ?? undefined` in both `listVisibleItemPage.execute` calls.
Pass `searchQuery={searchQuery}` into `CatalogueHome`. The fallback request for
an out-of-range page must keep the same `categorySlug`, `query`, and page size.

- [x] **Step 2: Add the focused client search form**

```tsx
"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createCataloguePath } from "@/features/catalogue/lib/catalogue-navigation";

interface CatalogueSearchProps {
  categorySlug: string | null;
  query: string | null;
  resultCount: number;
}

export function CatalogueSearch({
  categorySlug,
  query,
  resultCount,
}: CatalogueSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState(query ?? "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => setValue(query ?? ""), [query]);

  function navigate(nextQuery: string) {
    startTransition(() => {
      router.push(
        createCataloguePath({ categorySlug, page: 1, query: nextQuery }),
        { scroll: false },
      );
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(value);
  }

  function handleClear() {
    setValue("");
    navigate("");
  }

  return (
    <section
      aria-labelledby="catalogue-search-heading"
      className="diary-wash rounded-[var(--radius-card)] border border-[var(--color-border)] p-4 shadow-[var(--shadow-soft)] sm:p-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="diary-kicker">Tìm trong những điều đã lưu</p>
          <h2
            className="font-display mt-1 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-brand-strong)]"
            id="catalogue-search-heading"
          >
            Điều em đang tìm
          </h2>
        </div>
        <p
          aria-atomic="true"
          aria-live="polite"
          className="text-sm leading-6 text-[var(--color-muted)]"
        >
          {query
            ? `${resultCount} điều cho “${query}”`
            : "Tìm theo tiêu đề hoặc lời giới thiệu ngắn."}
        </p>
      </div>

      <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={handleSubmit} role="search">
        <label className="sr-only" htmlFor="catalogue-search-input">
          Tìm trong Bộ sưu tập
        </label>
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
            size={17}
            aria-hidden="true"
          />
          <input
            className="min-h-11 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] py-2 pl-11 pr-4 text-sm text-[var(--color-brand-strong)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-focus)]"
            id="catalogue-search-input"
            onChange={(event) => setValue(event.target.value)}
            placeholder="Ví dụ: cà phê, một chuyến đi..."
            type="search"
            value={value}
          />
        </div>
        <div className="flex gap-2">
          <button
            className="min-h-11 rounded-full bg-[var(--color-brand)] px-5 text-sm font-semibold text-white shadow-[var(--theme-button-shadow)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            Tìm
          </button>
          {query ? (
            <button
              aria-label="Xóa tìm kiếm"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] px-4 text-[var(--color-brand)] transition hover:-translate-y-0.5 hover:border-[var(--color-accent)] disabled:cursor-wait disabled:opacity-60"
              disabled={isPending}
              onClick={handleClear}
              type="button"
            >
              <X size={17} aria-hidden="true" />
              <span className="ml-1.5 text-sm font-semibold">Xóa</span>
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
```

Use a `<form role="search">` with a visible `h2`/label, a `Search` icon,
submit button labelled “Tìm”, and a native button labelled “Xóa tìm kiếm” only
when `query` exists. Its submit handler prevents the default, calls
`navigate(value)`, and does not fetch on input. Disable only the action buttons
while `isPending`; keep the input responsive. Render a polite status message
that includes the normalized query and `resultCount` when searching.

- [x] **Step 3: Compose it into the existing server presentation**

Import and render `<CatalogueSearch categorySlug={selectedCategorySlug}
query={searchQuery} resultCount={itemPage.total} />` at the top of the existing
results section. Add `searchQuery` to the View Transition key so a changed query
does not reuse stale result visuals. Pass `searchQuery` to `CataloguePagination`.

Update the empty state signature to receive `searchQuery`; with a query, show a
search-specific title and a short suggestion to change keywords. Without a
query, retain the current owner/member empty-copy exactly.

- [x] **Step 4: Static inspect client/server separation**

Run: `rg -n "createClient|from\\(\\\"items\\\"|router\.push|role=\\\"search\\\"|aria-live" src/features/catalogue/presentation/catalogue-search.tsx src/app/page.tsx src/features/catalogue/presentation/catalogue-home.tsx`

Expected: the search component has only URL navigation, while `items` remains
queried only in server-side infrastructure.

### Task 4: Context-preserving category and pagination links

**Files:**
- Modify: `src/features/catalogue/presentation/catalogue-chapter-rail.tsx`
- Modify: `src/features/catalogue/presentation/catalogue-pagination.tsx`

**Interfaces:**
- `CatalogueChapterRailProps` gains `query: string | null`.
- `CataloguePaginationProps` gains `query: string | null`.
- Both call `createCataloguePath({ categorySlug, page, query })` and set
  `scroll={false}` on every active Catalogue `Link`.

- [x] **Step 1: Preserve a search across chapter changes**

Add `query` to `CatalogueChapterRail` props and every `createCataloguePath`
call. Each active `Link` in this component must receive `scroll={false}`;
category switches continue using page `1` and `collection-change` transition
type.

- [x] **Step 2: Preserve a search across pagination**

Add `query` to `CataloguePagination` props and every generated page, previous,
and next URL. Set `scroll={false}` on each active pagination link while retaining
the existing forward/back transition types and disabled spans.

- [x] **Step 3: Static inspect every scoped navigation link**

Run: `rg -n "createCataloguePath|scroll=\\{false\\}" src/features/catalogue/presentation/catalogue-chapter-rail.tsx src/features/catalogue/presentation/catalogue-pagination.tsx`

Expected: all URL-producing Catalogue links preserve `q` and prevent the default
route-top scroll; header links are not modified.

### Task 5: Scope review and source-only handoff

**Files:**
- Modify: `docs/superpowers/plans/2026-07-23-catalogue-discovery-navigation.md` (mark completed task boxes)
- Inspect: all files listed in Tasks 1–4 and `docs/superpowers/specs/2026-07-23-catalogue-discovery-navigation-design.md`

**Interfaces:**
- Consumes the completed URL, server reader, presentation, and link interfaces.
- Produces a scoped source-review record without claiming runtime verification.

- [x] **Step 1: Re-read the specification against the completed source**

Check every requirement: local scroll retention, route-header exception,
URL/history behavior, title-or-summary query, category+query combination,
search-specific empty state, active actor path, no schema/RLS change, and no
new route animation.

- [x] **Step 2: Inspect the scoped semantic diff**

Run: `git diff --ignore-space-at-eol -- src/app/page.tsx src/features/catalogue src/modules/catalogue docs/superpowers/specs/2026-07-23-catalogue-discovery-navigation-design.md docs/superpowers/plans/2026-07-23-catalogue-discovery-navigation.md`

Expected: only the approved Catalogue navigation/search implementation and its
documentation appear. Do not use `git diff --check`, because the workspace has
pre-existing line-ending noise.

- [x] **Step 3: Record verification limits in the handoff**

State that static source and scoped-diff inspection were performed, while tests,
lint, build, and browser QA were intentionally not run by explicit user request.
Do not claim the application was built, tested, or runtime-verified.
