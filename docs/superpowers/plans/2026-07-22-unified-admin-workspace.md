# Unified Admin Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Project convention prohibits subagent delegation unless the user explicitly requests it.

**Goal:** Make the catalogue, journey, and atmosphere owner screens feel like one compact, information-dense management workspace without altering management behavior.

**Architecture:** Add two presentation-only admin primitives: a shared workbench header and a route-based workspace switcher. Integrate those primitives into each existing client workspace, then make the local navigation/list and editor panels denser within their existing feature boundaries. Server pages remain responsible for loading and access checks; existing Client Components retain their state, Server Actions, URL-driven selection, and transition behavior.

**Tech Stack:** Next.js App Router, React, TypeScript strict, Tailwind CSS, Lucide React, native React `ViewTransition`, existing Server Actions.

## Global Constraints

- Preserve every existing Supabase reader, Server Action, authorization check, URL parameter, pagination behavior, form field name, validation rule, mutation, confirmation step, and `ViewTransition` key/type.
- Add no routes, database fields, migrations, RLS changes, dependencies, analytics, search, bulk operations, sorting behavior, or public-experience changes.
- Use `apply_patch` for edits; do not create a commit or branch.
- The user explicitly asked to skip tests, lint, build, and browser QA. Do not run them unless the user reverses that direction; use source and diff checks only for handoff.
- Keep essential actions keyboard accessible, retain existing live regions and pending states, and never depend on hover for an essential control.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/components/admin/admin-workspace-header.tsx` | Reusable visual header that accepts owner context, summary chips, and optional header actions. It owns no state and makes no data request. |
| `src/components/admin/admin-workspace-switcher.tsx` | Reusable three-route navigation with one active workspace and accessible `aria-current` semantics. |
| `src/features/catalogue/presentation/admin-catalogue.tsx` | Composes the shared frame and reshapes catalogue into a two-level master area plus a dominant item editor. |
| `src/features/catalogue/presentation/admin-catalogue-sidebar.tsx` | Makes category navigation compact; keeps category deletion behind its existing explicit confirmation flow. |
| `src/features/catalogue/presentation/admin-item-list.tsx` | Makes item rows easy to scan, keeps context and creation next to the list, and reduces always-visible destructive copy. |
| `src/features/catalogue/presentation/admin-item-editor.tsx` | Visually anchors item save/delete-adjacent controls and separates dense editorial data from attachments without changing forms. |
| `src/features/timeline/presentation/admin-timeline.tsx` | Composes the shared frame around existing journey management. |
| `src/features/timeline/presentation/admin-timeline-list.tsx` | Aligns chapter rows with catalogue list treatment and foregrounds date, state, replies, and order. |
| `src/features/timeline/presentation/admin-timeline-editor.tsx` | Makes current editorial sections and destructive confirmation easier to scan in the detailed work surface. |
| `src/features/site-theme/presentation/admin-site-theme.tsx` | Composes the shared frame and separates current resolution, manual override, and schedule work areas. |
| `src/features/site-theme/presentation/theme-schedule-form.tsx` | Densifies schedule editing while preserving draft, validation, and mutation behavior. |
| `src/features/site-theme/presentation/theme-schedule-list.tsx` | Makes a schedule’s time window, preset, enabled state, and priority readable at a glance. |

### Task 1: Add the presentation-only admin frame

**Files:**

- Create: `src/components/admin/admin-workspace-header.tsx`
- Create: `src/components/admin/admin-workspace-switcher.tsx`

**Interfaces:**

- Produces `AdminWorkspaceHeader`, which accepts `eyebrow`, `title`, `description`, `summary`, and optional `actions` as renderable values.
- Produces `AdminWorkspaceSwitcher`, which accepts `active: "catalogue" | "timeline" | "theme"` and owns the fixed `/admin`, `/admin/hanh-trinh`, and `/admin/khong-khi` links.
- Consumed by the three existing client workspaces in Tasks 2, 3, and 4.

- [ ] **Step 1: Create the shared header with only visual props.**

  Add `src/components/admin/admin-workspace-header.tsx` with this API and markup shape. Keep it a stateless component so importing it from the existing client workspaces cannot move server work into the client bundle.

  ```tsx
  import type { ReactNode } from "react";
  import { Sparkles } from "lucide-react";

  interface AdminWorkspaceHeaderProps {
    actions?: ReactNode;
    description: string;
    eyebrow: string;
    summary: ReactNode;
    title: string;
  }

  export function AdminWorkspaceHeader({
    actions,
    description,
    eyebrow,
    summary,
    title,
  }: AdminWorkspaceHeaderProps) {
    return (
      <section className="relative overflow-hidden rounded-[var(--radius-dialog)] border border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-6 shadow-[var(--shadow-card)] sm:px-7 sm:py-7">
        <Sparkles aria-hidden="true" className="absolute right-6 top-6 text-[var(--color-accent)] opacity-65" size={22} strokeWidth={1.2} />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-3xl">
            <p className="diary-kicker">{eyebrow}</p>
            <h1 className="font-display mt-2 text-balance text-4xl font-semibold tracking-[-0.06em] text-[var(--color-brand-strong)] sm:text-5xl">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-[var(--color-muted)] sm:text-base">{description}</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">{summary}{actions}</div>
        </div>
      </section>
    );
  }
  ```

- [ ] **Step 2: Create the shared workspace switcher.**

  Add `src/components/admin/admin-workspace-switcher.tsx`. Do not derive active state from client navigation hooks; the parent already knows its route and passes it explicitly.

  ```tsx
  import Link from "next/link";
  import { BookHeart, Palette, Shapes, type LucideIcon } from "lucide-react";

  export type AdminWorkspace = "catalogue" | "timeline" | "theme";

  interface AdminWorkspaceSwitcherProps {
    active: AdminWorkspace;
  }

  const workspaces: Array<{
    href: string;
    icon: LucideIcon;
    key: AdminWorkspace;
    label: string;
  }> = [
    { href: "/admin", icon: Shapes, key: "catalogue", label: "Bộ sưu tập" },
    { href: "/admin/hanh-trinh", icon: BookHeart, key: "timeline", label: "Hành trình" },
    { href: "/admin/khong-khi", icon: Palette, key: "theme", label: "Không khí" },
  ];

  export function AdminWorkspaceSwitcher({ active }: AdminWorkspaceSwitcherProps) {
    return (
      <nav aria-label="Khu vực quản trị" className="mt-4 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--theme-control-surface)] p-1.5 shadow-[var(--shadow-soft)]">
        <div className="flex min-w-max gap-1">
          {workspaces.map(({ href, icon: Icon, key, label }) => {
            const isActive = key === active;
            return (
              <Link aria-current={isActive ? "page" : undefined} className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition ${isActive ? "bg-[var(--color-brand)] text-white shadow-[0_6px_16px_rgb(49_5_12_/_20%)]" : "text-[var(--color-muted)] hover:bg-[var(--color-paper)] hover:text-[var(--color-brand)]"}`} href={href} key={key}>
                <Icon aria-hidden="true" size={16} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }
  ```

- [ ] **Step 3: Source-check the new primitives.**

  Run `rg -n "AdminWorkspace(Header|Switcher)|aria-current|/admin/hanh-trinh|/admin/khong-khi" src/components/admin`.

  Expected: both exported components are present; the switcher has exactly the three current owner routes and assigns `aria-current` only to the active route.

### Task 2: Integrate the common frame and catalogue workbench composition

**Files:**

- Modify: `src/features/catalogue/presentation/admin-catalogue.tsx`
- Modify: `src/features/catalogue/presentation/admin-catalogue-sidebar.tsx`
- Modify: `src/features/catalogue/presentation/admin-item-list.tsx`
- Modify: `src/features/catalogue/presentation/admin-item-editor.tsx`

**Interfaces:**

- Consumes `AdminWorkspaceHeader` and `AdminWorkspaceSwitcher` from Task 1.
- Preserves `AdminCatalogueProps`, `AdminCatalogueSidebarProps`, `AdminItemListProps`, `AdminItemEditorProps`, all current Server Action calls, `createAdminCataloguePath`, `ViewTransition`, and feedback callbacks.
- Produces the catalogue master/detail composition used only within the existing `/admin` client entry point.

- [ ] **Step 1: Replace the catalogue-specific hero and cross-links with the common frame.**

  In `AdminCatalogue`, replace the current hero section and the two owner-area links with `AdminWorkspaceHeader` followed by `AdminWorkspaceSwitcher active="catalogue"`. Keep the public collection link as a secondary `actions` link, preserve the existing category/item count copy, and leave `createLetter`-style behavior out of this screen because creation remains contextual in `AdminItemList`.

  Use this composition around the unchanged feedback region:

  ```tsx
  <AdminWorkspaceHeader
    actions={
      <Link className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] px-4 text-sm font-semibold text-[var(--color-brand)] transition hover:-translate-y-0.5 hover:border-[var(--color-accent)]" href="/">
        Xem bộ sưu tập
        <ExternalLink aria-hidden="true" size={16} />
      </Link>
    }
    description="Sắp xếp bộ sưu tập, viết những lời riêng tư và chọn cách chúng xuất hiện với người em yêu."
    eyebrow="Quản trị · bộ sưu tập"
    summary={
      <>
        <span className="rounded-full bg-[var(--color-brand-soft)] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-brand)]">
          {categories.length} danh mục
        </span>
        <span className="rounded-full bg-[rgb(166_91_69_/_12%)] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-accent)]">
          {itemPage.total} item{selectedCategory ? ` · ${selectedCategory.name}` : ""}
        </span>
      </>
    }
    title="Những điều đẹp đẽ được chăm chút ở đây."
  />
  <AdminWorkspaceSwitcher active="catalogue" />
  ```

- [ ] **Step 2: Make catalogue’s category and item navigation one compact master area.**

  Replace the existing three-column outer grid with a two-column workspace. Nest `AdminCatalogueSidebar` and `AdminItemList` inside the left master area so they remain related at desktop widths, while the existing editor stays the dominant right-side detail surface.

  ```tsx
  <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(23rem,0.82fr)_minmax(34rem,1.18fr)] xl:items-start">
    <div className="grid gap-5 lg:grid-cols-[13rem_minmax(0,1fr)] xl:items-start">
      <AdminCatalogueSidebar
        categories={categories}
        onFeedback={setFeedback}
        selectedCategoryId={selectedCategoryId}
      />
      <AdminItemList
        categoryId={selectedCategoryId}
        itemPage={itemPage}
        onFeedback={setFeedback}
        selectedItemId={selectedItem?.id ?? null}
      />
    </div>
    <ViewTransition
      default="none"
      enter={{ "admin-select": "fade-in", default: "none" }}
      exit={{ "admin-select": "fade-out", default: "none" }}
      key={selectedItem?.id ?? `new-${defaultCategoryId ?? "none"}`}
    >
      <AdminItemEditor
        categories={categories}
        defaultCategoryId={defaultCategoryId}
        onFeedback={setFeedback}
        selectedItem={selectedItem}
      />
    </ViewTransition>
  </section>
  ```

- [ ] **Step 3: Tighten list density without removing capability.**

  In the category sidebar and item list:

  - Keep current category/item links, selection state, list order, pagination, mutations, and confirmations.
  - Use the existing status chips, but put their metadata on one compact second line and reserve row padding for title readability.
  - Keep a delete request control only in the selected row’s utility area. It must still open the same inline confirmation before any destructive Server Action runs.
  - Keep `Item mới` next to the item total/filter context and `Thêm danh mục` next to the category heading.

  The selected row class must retain visible contrast without relying on hover:

  ```tsx
  const selectedRowClassName =
    "border-[var(--color-brand)] bg-[var(--color-brand-soft)] shadow-[var(--shadow-soft)]";
  const idleRowClassName =
    "border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-paper)]";
  ```

- [ ] **Step 4: Anchor dense item editing actions in the detail surface.**

  In `AdminItemEditor`, keep every existing input, `name`, `defaultValue`, validation branch, action call, attachment form, and confirmation state. Change only container hierarchy and classes:

  - Give the main item form a distinct editorial panel surface.
  - Keep its existing save button in a bottom action row with `border-t`, `bg-[var(--color-paper)]`, and `sticky bottom-0` at `lg` widths.
  - Keep attachments as the second clearly labelled detail group below the primary item form.

  ```tsx
  <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-[var(--color-border)] bg-[var(--color-paper)]/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
    <Button disabled={isPending} type="submit">
      <Save aria-hidden="true" size={16} />
      {isPending ? "Đang lưu…" : isEditing ? "Lưu item" : "Tạo item"}
    </Button>
  </div>
  ```

- [ ] **Step 5: Source-check catalogue behavior boundaries.**

  Run `rg -n "createCatalogue|updateCatalogue|deleteCatalogue|createAdminCataloguePath|ViewTransition|name=\"" src/features/catalogue/presentation/admin-catalogue.tsx src/features/catalogue/presentation/admin-catalogue-sidebar.tsx src/features/catalogue/presentation/admin-item-list.tsx src/features/catalogue/presentation/admin-item-editor.tsx`.

  Expected: all existing create/update/delete action references, path construction, transition wrapper, and form-field names remain in the feature files; the only newly imported cross-feature UI is the two shared admin primitives.

### Task 3: Align journey list and editor with the workbench

**Files:**

- Modify: `src/features/timeline/presentation/admin-timeline.tsx`
- Modify: `src/features/timeline/presentation/admin-timeline-list.tsx`
- Modify: `src/features/timeline/presentation/admin-timeline-editor.tsx`

**Interfaces:**

- Consumes the two Task 1 primitives.
- Preserves `AdminTimelineProps`, `AdminTimelineListProps`, `AdminTimelineEditorProps`, `createAdminTimelinePath`, all timeline actions, response moderation, feedback, and the existing `ViewTransition` props.
- Produces a journey workspace with catalogue-equivalent header, switcher, selected-row state, and master/detail hierarchy.

- [ ] **Step 1: Integrate the common header and switcher in `AdminTimeline`.**

  Replace the journey-specific hero plus its scattered owner-area link with `AdminWorkspaceHeader` and `AdminWorkspaceSwitcher active="timeline"`. Preserve the `publishedCount` derivation and public journey link as the secondary header action.

  ```tsx
  <AdminWorkspaceHeader
    actions={
      <Link className="inline-flex min-h-11 items-center rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] px-4 text-sm font-semibold text-[var(--color-brand)] transition hover:-translate-y-0.5 hover:border-[var(--color-accent)]" href="/hanh-trinh">
        Xem hành trình
      </Link>
    }
    description="Viết các cột mốc, giữ chúng ở dạng nháp cho đến khi sẵn sàng, và gìn giữ những lời hồi đáp được gửi lại."
    eyebrow="Quản trị · hành trình"
    summary={
      <span className="rounded-full bg-[var(--color-brand-soft)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.11em] text-[var(--color-brand)]">
        {publishedCount}/{entries.length} công khai
      </span>
    }
    title="Chăm chút những chương mình đã cùng đi qua."
  />
  <AdminWorkspaceSwitcher active="timeline" />
  ```

  Keep the existing two-column `AdminTimelineList` + `ViewTransition` editor relationship; adjust only its margin to begin after the switcher.

- [ ] **Step 2: Make chapter rows denser and consistently scannable.**

  In `AdminTimelineList`, retain the current `entries.map`, hrefs, selection semantics, and `transitionTypes`. Reorder the existing row content into:

  1. date label and Live/Draft status on the first compact line;
  2. non-truncated title area with `text-balance` on the second line;
  3. one metadata line with sort order and response count.

  Keep the `Mốc mới` action next to the list heading. Its essential markup remains a link so URL-driven “new entry” selection is unchanged.

  ```tsx
  <p className="mt-2 flex flex-wrap gap-x-2 text-xs leading-5 text-[var(--color-muted)]">
    <span>Thứ tự {entry.sortOrder}</span>
    <span aria-hidden="true">·</span>
    <span>{entry.responseCount} hồi đáp</span>
  </p>
  ```

- [ ] **Step 3: Separate timeline editor sections visually, not behaviorally.**

  In `AdminTimelineEditor`, retain the current `submitEntry`, `deleteEntry`, `deleteResponse`, `createEntryInput`, and all input `name` values. Place the existing “Thời điểm và câu chuyện” section in the primary editorial panel, retain “Ảnh và hiển thị” as a secondary settings panel, and give the unchanged save/delete row a sticky detail action surface matching Task 2.

  ```tsx
  <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex flex-wrap gap-2 border-t border-[var(--color-border)] bg-[var(--color-paper)]/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
    <Button disabled={isPending} type="submit">
      <Save aria-hidden="true" size={16} />
      {isPending ? "Đang lưu…" : isEditing ? "Lưu mốc" : "Tạo mốc"}
    </Button>
    {selectedEntry ? <Button disabled={isPending} onClick={() => setConfirmingDelete(true)} type="button" variant="quiet"><Trash2 aria-hidden="true" size={15} />Xóa mốc</Button> : null}
  </div>
  ```

  Do not move the response moderation section into the form and do not change its confirmation sequence.

- [ ] **Step 4: Source-check journey behavior boundaries.**

  Run `rg -n "createTimelineEntryAction|updateTimelineEntryAction|deleteTimelineEntryAction|deleteTimelineResponseAction|createAdminTimelinePath|ViewTransition|name=\"" src/features/timeline/presentation/admin-timeline.tsx src/features/timeline/presentation/admin-timeline-list.tsx src/features/timeline/presentation/admin-timeline-editor.tsx`.

  Expected: the full existing action set, current transition wrapper, navigation builder, and form-field names remain present.

### Task 4: Recompose atmosphere into ranked operational panels

**Files:**

- Modify: `src/features/site-theme/presentation/admin-site-theme.tsx`
- Modify: `src/features/site-theme/presentation/theme-schedule-form.tsx`
- Modify: `src/features/site-theme/presentation/theme-schedule-list.tsx`

**Interfaces:**

- Consumes the Task 1 primitives.
- Preserves `AdminSiteThemeProps`, `ThemeScheduleFormProps`, `ThemeScheduleListProps`, `chooseMode`, `startEditing`, `closeComposer`, all draft validation, Server Actions, and theme schedule order.
- Produces three ranked operational panels: current resolved state, manual override controls, and schedules.

- [ ] **Step 1: Replace the atmosphere hero with the common frame and switcher.**

  In `AdminSiteTheme`, move the current resolved preset summary into the `summary` slot of `AdminWorkspaceHeader` and use `AdminWorkspaceSwitcher active="theme"` below it. Do not alter `sourceMessage`, `resolvedPreset`, or the `chooseMode` transition.

  ```tsx
  <AdminWorkspaceHeader
    description="Chọn một không khí cho hôm nay hoặc hẹn những khoảng chuyển mình dịu dàng cho các ngày đặc biệt."
    eyebrow="Quản trị · không khí"
    summary={
      <div className="min-w-[13rem] rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--theme-control-surface)] px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[var(--color-muted)]">Đang hiển thị</p>
        <p className="font-display mt-1 text-xl font-semibold tracking-[-0.04em] text-[var(--color-brand-strong)]">{resolvedPreset.label}</p>
        <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">{sourceMessage(resolved)}</p>
      </div>
    }
    title="Để mỗi mùa kể lại một chương thật riêng."
  />
  <AdminWorkspaceSwitcher active="theme" />
  ```

- [ ] **Step 2: Maintain the three operational ranks in the body.**

  Restructure only layout wrappers in `AdminSiteTheme`:

  - left sticky column: the existing manual/automatic preset fieldset;
  - right first panel: existing schedule explanation and `Hẹn lịch mới` action;
  - right second panel: the unchanged conditional `ThemeScheduleForm`;
  - right final panel: the unchanged `ThemeScheduleList`.

  Use the same `mt-5 grid gap-5 xl:grid-cols-[minmax(19rem,0.72fr)_minmax(0,1.28fr)]` workbench proportions as the other screens. Keep `showComposer` and `editingSchedule` state exactly as they are.

- [ ] **Step 3: Densify the schedule form and schedule rows.**

  In `ThemeScheduleForm` and `ThemeScheduleList`, preserve all state, effects, refs, memoized overlap detection, field names, callbacks, and action calls. Change only visual grouping:

  - Put preset and status information in a compact top band.
  - Keep start/end fields paired and priority/enabled fields on one short operational row.
  - Render each schedule row with time range first, then preset/enabled chip and priority, followed by existing edit/delete buttons.
  - Keep the existing explicit delete confirmation block directly under its schedule row.

  ```tsx
  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
    <p className="text-sm font-semibold text-[var(--color-brand-strong)]">
      {formatThemeScheduleDateTime(schedule.startsAt)} → {formatThemeScheduleDateTime(schedule.endsAt)}
    </p>
    <span className="text-xs font-semibold text-[var(--color-accent)]">Ưu tiên {schedule.priority}</span>
  </div>
  ```

- [ ] **Step 4: Source-check atmosphere behavior boundaries.**

  Run `rg -n "setManualSiteThemeAction|createSiteThemeScheduleAction|updateSiteThemeScheduleAction|deleteSiteThemeScheduleAction|useTransition|useEffect|useMemo|name=\"" src/features/site-theme/presentation/admin-site-theme.tsx src/features/site-theme/presentation/theme-schedule-form.tsx src/features/site-theme/presentation/theme-schedule-list.tsx`.

  Expected: all existing actions, draft/overlap hooks, pending state, and form field names remain in place.

### Task 5: Perform the allowed source-only handoff checks

**Files:**

- Modify: no files expected
- Inspect: every file listed in the File Structure table

**Interfaces:**

- Consumes the completed presentation components from Tasks 1–4.
- Produces evidence that the diff is syntactically clean at whitespace level and remains within the approved visual scope. It does not claim a test, lint, build, type-check, or browser result.

- [ ] **Step 1: Inspect the changed-file list.**

  Run:

  ```bash
  git diff --name-only -- src/components/admin src/features/catalogue/presentation src/features/timeline/presentation src/features/site-theme/presentation
  ```

  Expected: only the two new admin presentation primitives and the ten approved management presentation files appear. If a data reader, Server Action, domain model, route, migration, or public feature appears, stop and remove the out-of-scope edit.

- [ ] **Step 2: Check diff whitespace.**

  Run:

  ```bash
  git diff --check
  ```

  Expected: no output and exit code `0`.

- [ ] **Step 3: Re-read preservation boundaries.**

  Run:

  ```bash
  rg -n "createCatalogue|updateCatalogue|deleteCatalogue|createTimeline|updateTimeline|deleteTimeline|setManualSiteThemeAction|createSiteThemeScheduleAction|updateSiteThemeScheduleAction|deleteSiteThemeScheduleAction" src/features/catalogue/presentation src/features/timeline/presentation src/features/site-theme/presentation
  ```

  Expected: existing management mutations still reside in their original feature presentation files. Review the output before reporting the work as source-checked.

- [ ] **Step 4: State the verification boundary accurately.**

  In the handoff, report the source/diff evidence from Steps 1–3 and explicitly state that tests, lint, build, type-check, and browser QA were not run because the user requested they be skipped. Do not claim functional, responsive, accessibility, or type-check success without that evidence.
