# Future Letter Image Backdrop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make a valid letter image the atmospheric, accessible backdrop of the opened letter and move the optional music link beside its title.

**Architecture:** Keep `FutureLetterOpeningCard` as the single client presentation boundary. It will conditionally add an image layer and paper scrim only when the existing URL/alt pair is present, then place the existing reading markup in a foreground wrapper. Local CSS establishes deterministic stacking, contrast, sizing and responsive title/action wrapping without changing data contracts or the opening ceremony state machine.

**Tech Stack:** Next.js App Router, React, TypeScript strict, Tailwind CSS, existing `CatalogueItemImage`, CSS custom properties and Lucide React.

## Global Constraints

- Modify only the opened-letter presentation and ceremony CSS; do not change Supabase, schema, migration, actions, compose form, routes or animation timings.
- Reuse `CatalogueItemImage` with its native lazy loading, fade-in, error fallback and author-provided `alt`; do not replace it with a CSS background image.
- Preserve the DOM reading order, opened-letter focus behavior and `prefers-reduced-motion` behavior.
- Keep keyboard focus visible and the external music URL safe with `target="_blank"` plus `rel="noreferrer"`.
- Do not add dependencies, tests, runtime checks, browser QA, commits or branches. The user explicitly requested source-only work.

---

## File structure

- Modify: `src/features/future-letters/presentation/future-letter-opening-card.tsx` — decide whether a backdrop exists, place the image/scrim layers, and own the responsive title/music action grouping.
- Modify: `src/app/globals.css` — style the backdrop layer, paper scrim, reading foreground and wrapping title/action layout within the future-letter namespace.
- Modify: `docs/superpowers/specs/2026-07-24-future-letter-image-backdrop-design.md` — mark the approved design as implemented after source review.

## Task 1: Restructure the opened-letter presentation

**Files:**
- Modify: `src/features/future-letters/presentation/future-letter-opening-card.tsx:81-112`

**Interfaces:**
- Consumes: existing `FutureLetter` fields `imageUrl`, `imageAltText`, `musicUrl`, `title` and existing `CatalogueItemImage` props `{ src: string; alt: string; variant?: "portrait" | "content-fill" }`.
- Produces: `.future-letter-paper-image`, `.future-letter-paper-scrim`, `.future-letter-paper-content` and `.future-letter-title-row` hooks used only by the CSS in Task 2.

- [x] **Step 1: Derive the image backdrop condition once**

  Directly above `return`, add a Boolean that requires both existing image fields:

  ```tsx
  const hasImageBackdrop = Boolean(letter.imageUrl && letter.imageAltText);
  ```

  Use this same condition for every image-specific element. This prevents an empty visual layer if a legacy record has only a URL or only alt text.

- [x] **Step 2: Add semantic backdrop and scrim layers inside the paper**

  Replace the current opening of the paper container with the following shape, preserving `id`, `aria-hidden` and all pre-existing article state behavior:

  ```tsx
  <div
    aria-hidden={phase !== "opened"}
    className="future-letter-paper"
    id={`future-letter-${letter.id}`}
  >
    {hasImageBackdrop ? (
      <div className="future-letter-paper-image">
        <CatalogueItemImage
          alt={letter.imageAltText!}
          src={letter.imageUrl!}
          variant="content-fill"
        />
      </div>
    ) : null}
    {hasImageBackdrop ? (
      <span aria-hidden="true" className="future-letter-paper-scrim" />
    ) : null}
    <div className="future-letter-paper-content">
      <div className="border-b border-[var(--color-border)] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[var(--color-accent)]">
            <span className="diary-rule" aria-hidden="true" />
            <p className="diary-kicker text-[var(--color-accent)]">Gửi lại đúng ngày hẹn</p>
          </div>
          <Sparkles className="text-[var(--color-accent)]" size={18} strokeWidth={1.35} aria-hidden="true" />
        </div>
        <div className="mt-4 flex min-w-0 items-center gap-3">
          <Avatar displayName={letter.author.displayName} imageUrl={letter.author.avatarUrl} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[var(--color-brand-strong)]">{letter.author.displayName}</p>
            <time className="mt-0.5 block text-xs text-[var(--color-muted)]" dateTime={letter.opensAt}>
              Hẹn mở {formatFutureLetterDateTime(letter.opensAt)}
            </time>
          </div>
        </div>
      </div>
      <p className="diary-kicker mt-5">Đã mở ra</p>
      <div className="future-letter-title-row">
        <h3 className="font-display min-w-0 break-words text-3xl font-semibold tracking-[-0.045em] text-[var(--color-brand-strong)]">
          {letter.title}
        </h3>
        {letter.musicUrl ? (
          <a
            aria-label={`Nghe bài hát đi cùng thư: ${letter.title}`}
            className="future-letter-music-link"
            href={letter.musicUrl}
            rel="noreferrer"
            target="_blank"
          >
            <Music2 size={16} aria-hidden="true" />
            <span>Bài hát</span>
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        ) : null}
      </div>
      <p className="mt-5 break-words whitespace-pre-line text-[15px] leading-8 text-[var(--color-ink)]">
        {letter.content}
      </p>
    </div>
  </div>
  ```

  Do not set `aria-hidden` on the image wrapper: the image `alt` must remain in the accessibility tree. Non-null assertions are safe because the condition requires both strings.

- [x] **Step 3: Place the music action beside the title**

  Inside `.future-letter-paper-content`, keep the existing kicker and replace the standalone title with this grouped structure:

  ```tsx
  <div className="future-letter-title-row">
    <h3 className="font-display min-w-0 break-words text-3xl font-semibold tracking-[-0.045em] text-[var(--color-brand-strong)]">
      {letter.title}
    </h3>
    {letter.musicUrl ? (
      <a
        aria-label={`Nghe bài hát đi cùng thư: ${letter.title}`}
        className="future-letter-music-link"
        href={letter.musicUrl}
        rel="noreferrer"
        target="_blank"
      >
        <Music2 size={16} aria-hidden="true" />
        <span>Bài hát</span>
        <ExternalLink size={14} aria-hidden="true" />
      </a>
    ) : null}
  </div>
  ```

  Put this group directly after the kicker in Step 2, before the full text
  paragraph shown there. Delete both the old separate image card below the
  paragraph and the old music link below it, so neither image nor URL is
  duplicated.

- [x] **Step 4: Perform source-only component review**

  Inspect the modified component and confirm all four render states are structurally represented:

  - image + music: image layer, scrim and one music link in the title group;
  - image only: image layer/scrim but no empty music wrapper;
  - music only: standard paper and one music link in the title group;
  - neither: standard paper with no empty image/music elements.

## Task 2: Add scoped paper-background and title-action styling

**Files:**
- Modify: `src/app/globals.css:1145-1157` and the responsive future-letter section near `@media (min-width: 640px)`

**Interfaces:**
- Consumes: class hooks produced in Task 1.
- Produces: a backdrop that never overlays reading content and a title row that wraps without clipping at narrow widths.

- [x] **Step 1: Preserve the existing paper as the no-image baseline**

  Keep `.future-letter-paper` positioned relative with its existing margin, border, radius, padding, paper-line background and shadow. Add `isolation: isolate` so negative/positive stacking remains enclosed within the paper card.

- [x] **Step 2: Add the image and Bordeaux readability layers**

  Add CSS directly after `.future-letter-paper`:

  ```css
  .future-letter-paper-image,
  .future-letter-paper-scrim {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: inherit;
  }

  .future-letter-paper-image {
    z-index: -2;
    background: var(--color-paper);
  }

  .future-letter-paper-image > div {
    height: 100%;
    min-height: 100%;
  }

  .future-letter-paper-scrim {
    z-index: -1;
    background:
      linear-gradient(180deg, rgb(255 249 243 / 91%) 0%, rgb(255 249 243 / 76%) 34%, rgb(255 249 243 / 86%) 100%),
      linear-gradient(90deg, rgb(101 12 28 / 30%), transparent 38%, rgb(101 12 28 / 15%));
  }

  .future-letter-paper-content {
    position: relative;
    z-index: 0;
  }
  ```

  Keep the image inside the paper's stacking context and below all readable content. Its own `object-cover` comes from `CatalogueItemImage`; do not add separate image loading code.

- [x] **Step 3: Style the title/action pair for wrap and focus**

  Add:

  ```css
  .future-letter-title-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1rem;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.5rem;
  }

  .future-letter-title-row > h3 {
    flex: 1 1 15rem;
    margin-top: 0;
  }

  .future-letter-music-link {
    display: inline-flex;
    min-height: 2.75rem;
    flex: 0 0 auto;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    padding: 0.625rem 0.875rem;
    color: var(--color-brand);
    background: rgb(255 249 243 / 76%);
    font-size: 0.875rem;
    font-weight: 700;
    transition: transform var(--duration-fast), background var(--duration-fast);
  }

  .future-letter-music-link:hover {
    transform: translateY(-0.125rem);
    background: rgb(255 249 243 / 92%);
  }

  .future-letter-music-link:focus-visible {
    outline: 3px solid var(--color-focus);
    outline-offset: 3px;
  }

  @media (prefers-reduced-motion: reduce) {
    .future-letter-music-link {
      transition: none;
    }

    .future-letter-music-link:hover {
      transform: none;
    }
  }
  ```

  Do not use `overflow: hidden` on the title/action row. The title may span several lines and the action must move to its own line on a narrow viewport.

- [x] **Step 4: Perform source-only stylesheet review**

  Check that the CSS uses only the new `.future-letter-*` namespace, retains `.future-letter-paper`'s existing reveal animation selector, and has no broad reset or rule that affects catalogue images.

## Task 3: Mark the design record and review the final diff

**Files:**
- Modify: `docs/superpowers/specs/2026-07-24-future-letter-image-backdrop-design.md:3`

**Interfaces:**
- Consumes: the completed source changes from Tasks 1–2.
- Produces: an accurate design record that distinguishes source review from unrun runtime verification.

- [x] **Step 1: Update the design status**

  Change the status line to: `**Trạng thái:** Đã được người dùng duyệt, triển khai và rà soát tĩnh theo đặc tả này.`

- [x] **Step 2: Inspect the scoped diff and whitespace**

  Run only static inspection commands:

  ```bash
  git diff --check -- src/features/future-letters/presentation/future-letter-opening-card.tsx src/app/globals.css docs/superpowers/specs/2026-07-24-future-letter-image-backdrop-design.md
  rg -n "Nghe bài hát đi cùng lá thư|future-letter-title-row|future-letter-paper-image" src/features/future-letters/presentation/future-letter-opening-card.tsx src/app/globals.css
  git diff -- src/features/future-letters/presentation/future-letter-opening-card.tsx src/app/globals.css docs/superpowers/specs/2026-07-24-future-letter-image-backdrop-design.md
  ```

  Expected source evidence: no whitespace diagnostics; the deprecated music copy has zero matches; title-row and image-layer hooks each appear in both the component and CSS; only the three scoped files are reviewed.

- [x] **Step 3: Report boundaries honestly**

  State that the code received static source/diff review only. Do not claim browser, lint, test or build verification, because the user explicitly excluded those checks.
