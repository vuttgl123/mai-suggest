# Future Letter Focused Reader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the archive present one full, readable letter at a time while retaining compact previews and explicit close controls for letters already opened during the visit.

**Architecture:** `FutureLettersExperience` becomes the sole owner of the active archive item through transient `activeLetterId`. Each `FutureLetterOpeningCard` keeps its ceremony/read history locally, tells its parent when it becomes active or collapses, and renders either the existing envelope/reader or a compact reread preview. Scoped CSS makes only the active card span the archive grid and styles the preview/close controls without creating an internal scroll container.

**Tech Stack:** Next.js App Router, React client state/effects/refs, TypeScript strict, Tailwind CSS, existing Button and Lucide React.

## Global Constraints

- `activeLetterId` and the in-visit “has been opened” memory are transient UI state only; do not write localStorage, Supabase, actions, routes, schema or migrations.
- Preserve the first-open ceremony, reduced-motion shortcut, opened-reader image backdrop, alt text, music link, article focus and current external URL safety.
- One active reader spans the archive; long content must use document scrolling only, with no dialog or nested scroll area.
- A card that has completed its ceremony becomes a “Đã mở” preview when inactive; “Đọc lại” reopens it directly and never reruns the ceremony.
- Include semantic buttons, visible keyboard focus and focus return to the just-collapsed preview’s reread control.
- Do not add dependencies, tests, lint, build, browser QA, commits or branches. The user explicitly requested source-only work.

---

## File structure

- Modify: `src/features/future-letters/presentation/future-letters-experience.tsx` — own the active ID and wire each card’s activation/close callbacks.
- Modify: `src/features/future-letters/presentation/future-letter-opening-card.tsx` — add preview state, local open history, active coordination and top/bottom collapse actions.
- Modify: `src/app/globals.css` — add scoped archive span, preview and close-control styling.
- Modify: `docs/superpowers/specs/2026-07-24-future-letter-reader-focus-design.md` — mark the approved design as implemented after source review.

## Task 1: Coordinate the one-active-reader archive

**Files:**
- Modify: `src/features/future-letters/presentation/future-letters-experience.tsx:25-57, 117-122`

**Interfaces:**
- Consumes: `FutureLetterOpeningCard` props added in Task 2: `isActive: boolean`, `onActivate: () => void`, `onClose: () => void`.
- Produces: `activeLetterId: string | null`; only the card whose ID equals it receives `isActive={true}`.

- [x] **Step 1: Add the transient active ID state**

  With the existing composer state, add:

  ```tsx
  const [activeLetterId, setActiveLetterId] = useState<string | null>(null);
  ```

  Do not initialize it from a record, URL or storage value. On first arrival all cards remain sealed.

- [x] **Step 2: Pass active state and stable closures to archive cards**

  Replace the current bare card mapping with:

  ```tsx
  {openedLetters.map((letter) => (
    <FutureLetterOpeningCard
      isActive={activeLetterId === letter.id}
      key={letter.id}
      letter={letter}
      onActivate={() => setActiveLetterId(letter.id)}
      onClose={() => setActiveLetterId((currentId) =>
        currentId === letter.id ? null : currentId,
      )}
    />
  ))}
  ```

  The functional close update prevents a stale card from clearing an archive
  item that became active after it was rendered.

- [x] **Step 3: Perform source-only parent review**

  Confirm the parent owns no letter content or ceremony phase: it only selects
  the active card. Opening a new card replaces the previous ID; closing the
  active card returns the ID to `null`.

## Task 2: Add the card preview and collapse state machine

**Files:**
- Modify: `src/features/future-letters/presentation/future-letter-opening-card.tsx:11-168`

**Interfaces:**
- Consumes: parent props from Task 1.
- Produces: phases `"sealed" | "unsealing" | "revealing" | "opened" | "preview"`; classes `.future-letter-preview`, `.future-letter-reader-header`, `.future-letter-reader-closeout`; and the parent callbacks.

- [x] **Step 1: Define the controlled props and preview-capable phase**

  Replace the prop/type declarations with:

  ```tsx
  type OpeningPhase = "sealed" | "unsealing" | "revealing" | "opened" | "preview";

  interface FutureLetterOpeningCardProps {
    isActive: boolean;
    letter: FutureLetter;
    onActivate: () => void;
    onClose: () => void;
  }

  export function FutureLetterOpeningCard({
    isActive,
    letter,
    onActivate,
    onClose,
  }: FutureLetterOpeningCardProps) {
    const [phase, setPhase] = useState<OpeningPhase>("sealed");
    const [hasBeenOpened, setHasBeenOpened] = useState(false);
    const articleRef = useRef<HTMLElement>(null);
    const previewButtonRef = useRef<HTMLButtonElement>(null);
    const phaseTimersRef = useRef<number[]>([]);
  ```

  Add this module-level helper below the phase type so the cleanup effect has
  no unstable function dependency:

  ```tsx
  function clearPhaseTimers(timerRefs: { current: number[] }) {
    timerRefs.current.forEach((timer) => window.clearTimeout(timer));
    timerRefs.current = [];
  }
  ```

  Replace the cleanup effect body with
  `return () => clearPhaseTimers(phaseTimersRef);` so inactive/close
  transitions can cancel unfinished ceremony timers too.

- [x] **Step 2: Synchronize local phase when another card becomes active**

  Add this effect after the timer cleanup effect:

  ```tsx
  useEffect(() => {
    if (isActive) return;

    clearPhaseTimers(phaseTimersRef);
    setPhase(hasBeenOpened ? "preview" : "sealed");
  }, [hasBeenOpened, isActive]);
  ```

  This makes a completed reader collapse to preview when another card is
  activated, while an interrupted first ceremony safely returns to its sealed
  envelope. Do not call parent callbacks in this synchronization effect.

- [x] **Step 3: Preserve ceremony once, then support reread and close actions**

  Update the existing opening helpers to match this behavior:

  ```tsx
  function schedulePhase(nextPhase: OpeningPhase, delay: number) {
    phaseTimersRef.current.push(
      window.setTimeout(() => {
        if (nextPhase === "opened") setHasBeenOpened(true);
        setPhase(nextPhase);
      }, delay),
    );
  }

  function openLetter() {
    if (phase !== "sealed") return;

    onActivate();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setHasBeenOpened(true);
      setPhase("opened");
      return;
    }

    setPhase("unsealing");
    schedulePhase("revealing", 460);
    schedulePhase("opened", 1_020);
  }

  function readAgain() {
    onActivate();
    setPhase("opened");
  }

  function collapseLetter() {
    clearPhaseTimers(phaseTimersRef);
    setPhase("preview");
    onClose();
  }
  ```

  Keep `hasBeenOpened` true after the first completion. This is the single
  guard that prevents the ceremony from replaying on `readAgain`.

- [x] **Step 4: Manage focus and render the compact preview first**

  Replace the current phase focus effect with:

  ```tsx
  useEffect(() => {
    if (phase === "opened") articleRef.current?.focus();
    if (phase === "preview") previewButtonRef.current?.focus();
  }, [phase]);
  ```

  Before the normal article return, add this preview branch:

  ```tsx
  if (phase === "preview") {
    return (
      <article
        aria-label={`Thư đã mở từ ${letter.author.displayName}`}
        className="future-letter-opening future-letter-opening--preview"
        data-active={isActive ? "true" : "false"}
      >
        <div className="future-letter-preview">
          <div>
            <p className="diary-kicker">Đã mở</p>
            <h3 className="font-display mt-2 break-words text-2xl font-semibold tracking-[-0.045em] text-[var(--color-brand-strong)]">
              {letter.title}
            </h3>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {letter.author.displayName} · {formatFutureLetterDateTime(letter.opensAt)}
            </p>
          </div>
          <Button className="future-letter-preview__action" onClick={readAgain} ref={previewButtonRef} size="compact" type="button" variant="quiet">
            <MailOpen size={15} aria-hidden="true" />
            Đọc lại
          </Button>
        </div>
      </article>
    );
  }
  ```

  On the normal article, add `data-active={isActive ? "true" : "false"}`.
  Extend the existing screen-reader status with `phase === "preview" ? "Lá
  thư đã được thu gọn." : ""` after its `opened` case.

- [x] **Step 5: Add the two close actions to the opened reader only**

  In the paper content, give the current top metadata wrapper the class
  `future-letter-reader-header`. Replace its right-side sparkle with:

  ```tsx
  <div className="flex items-center gap-2">
    <Sparkles className="text-[var(--color-accent)]" size={18} strokeWidth={1.35} aria-hidden="true" />
    <Button className="future-letter-reader-header__action" onClick={collapseLetter} size="compact" type="button" variant="quiet">
      <ChevronsUp size={15} aria-hidden="true" />
      Thu gọn thư
    </Button>
  </div>
  ```

  Import `ChevronsUp` from `lucide-react`. After the letter content paragraph,
  append:

  ```tsx
  <div className="future-letter-reader-closeout">
    <p>Đã đọc xong lá thư này?</p>
    <Button className="future-letter-reader-closeout__action" onClick={collapseLetter} size="compact" type="button" variant="quiet">
      <ChevronsUp size={15} aria-hidden="true" />
      Thu gọn thư
    </Button>
  </div>
  ```

  Do not render either action in `sealed`, `unsealing`, `revealing` or
  `preview`; the actions belong only to the full opened reader.

- [x] **Step 6: Perform source-only state review**

  Check these exact transitions in source: sealed → ceremony → opened sets
  `hasBeenOpened`; opened → close becomes preview and clears `activeLetterId`;
  preview → reread becomes opened without timers; active card A → activation of
  card B collapses A; interrupted initial ceremony returns to sealed.

## Task 3: Style the active reader, preview and close controls

**Files:**
- Modify: `src/app/globals.css:949-964, 1145-1232`

**Interfaces:**
- Consumes: `data-active`, `.future-letter-opening--preview`, `.future-letter-preview`, `.future-letter-reader-header` and `.future-letter-reader-closeout` from Task 2.
- Produces: one full-width active reader and responsive controls without nested scrolling.

- [x] **Step 1: Make only the active card span the archive**

  Add next to `.future-letter-archive`:

  ```css
  .future-letter-archive > .future-letter-opening[data-active="true"] {
    grid-column: 1 / -1;
  }
  ```

  Do not set a fixed height, `max-height`, `overflow-y` or `position: fixed`
  on the reader. Its content must grow and use page scrolling.

- [x] **Step 2: Style the compact “Đã mở” preview**

  Add CSS scoped to the new classes:

  ```css
  .future-letter-opening--preview {
    min-height: 12rem;
    background:
      radial-gradient(circle at 86% 10%, rgb(166 91 69 / 18%), transparent 10rem),
      var(--theme-card-surface);
  }

  .future-letter-preview {
    display: flex;
    min-height: inherit;
    flex-wrap: wrap;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.25rem;
  }

  .future-letter-preview__action,
  .future-letter-reader-closeout__action {
    min-height: 2.75rem;
  }
  ```

- [x] **Step 3: Style the reader header and end-of-letter closeout**

  Add:

  ```css
  .future-letter-reader-header {
    position: relative;
  }

  .future-letter-reader-closeout {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-top: 2rem;
    border-top: 1px solid var(--color-border);
    padding-top: 1rem;
    color: var(--color-muted);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  @media (max-width: 639px) {
    .future-letter-preview,
    .future-letter-reader-closeout {
      align-items: stretch;
    }

    .future-letter-preview__action,
    .future-letter-reader-closeout__action {
      width: 100%;
      justify-content: center;
    }
  }
  ```

  Keep the action minimum height at 44px and allow title/action wrapping.

- [x] **Step 4: Perform source-only stylesheet review**

  Confirm all new rules are in the `future-letter-*` namespace, no existing
  envelope/reveal selector changes, and no rule introduces an overflow clip or
  scroll container for the reader.

## Task 4: Update the design record and review the scoped diff

**Files:**
- Modify: `docs/superpowers/specs/2026-07-24-future-letter-reader-focus-design.md:3`

**Interfaces:**
- Consumes: the completed Tasks 1–3.
- Produces: an accurate design status and static evidence without overstating runtime verification.

- [x] **Step 1: Update the design status**

  Change the status line to: `**Trạng thái:** Đã được người dùng duyệt, triển khai và rà soát tĩnh theo đặc tả này.`

- [x] **Step 2: Inspect the full scoped source change**

  Run only static inspection commands:

  ```bash
  git diff --check -- src/features/future-letters/presentation/future-letters-experience.tsx src/features/future-letters/presentation/future-letter-opening-card.tsx src/app/globals.css
  rg -n "activeLetterId|hasBeenOpened|phase === \"preview\"|future-letter-preview|future-letter-reader-closeout" src/features/future-letters/presentation/future-letters-experience.tsx src/features/future-letters/presentation/future-letter-opening-card.tsx src/app/globals.css
  git diff -- src/features/future-letters/presentation/future-letters-experience.tsx src/features/future-letters/presentation/future-letter-opening-card.tsx src/app/globals.css
  ```

  Expected source evidence: `git diff --check` has no output; the active ID is
  parent-owned; preview, reread and both collapse actions exist; the old
  full-reader CSS still has no nested scroll rule; only the three scoped source
  files are in the reviewed diff.

- [x] **Step 3: Report the verification boundary**

  State that the work received static source/diff review only. Do not claim
  test, lint, build or browser verification because the user explicitly
  excluded those checks.
