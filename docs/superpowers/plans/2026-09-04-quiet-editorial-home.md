# Quiet Editorial Home Implementation Plan

> **Read this whole preamble before touching a file.** This document is
> self-contained: it assumes you have the repository and nothing else — no
> access to the conversation that produced it, no plugins, no special tooling.
> Work through the tasks in order. Every step is a checkbox; tick it only after
> you have actually run what it says and seen what it says you should see.

**Goal:** Rebuild the authenticated home route as one quiet editorial opening — a single hero, chapter-led discovery — on top of a design foundation the rest of the project can reuse.

**Architecture:** Three sequential phases. Groundwork makes the repository reviewable and gives you eyes on an auth-gated page. Foundation fixes the CSS cascade, finishes an abandoned type scale, and extracts shared primitives. Home replaces three stacked heroes with one journal plus chapter bands, reading chapter previews through the existing ports-and-adapters boundary.

**Tech Stack:** Next.js App Router (Server Components), React 19 `ViewTransition`, TypeScript strict, Tailwind CSS v4, Motion, Three.js, Supabase, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-04-quiet-editorial-home-design.md` — read it once before Task 1. It carries the reasoning; this plan carries the steps. Where they disagree, the spec wins and you should stop and say so.

---

## How to work in this repository

The project root is the repository root. All paths in this document are relative to it.

| Purpose | Command |
| --- | --- |
| Install | `npm install` |
| Dev server | `npm run dev` (http://localhost:3000) |
| Lint | `npm run lint` |
| Type check | `npx tsc --noEmit` |
| Unit tests | `npx vitest run` |
| Production build | `npx next build` |
| Screenshots (added in Task 2) | `npm run qa:shots -- <route> <label>` |

Environment variables live in `.env.local` and already exist. Never print, copy or commit their values.

**Known baseline, so you can tell your noise from the existing noise:** `npm run lint` reports exactly one warning — `src/features/identity/presentation/magical-background.tsx:164`, `react-hooks/exhaustive-deps`. That warning predates this work. Any *other* lint output is yours to fix.

---

## Hard rules

These are not preferences. Breaking one means stopping and reporting, not working around it.

1. **Never create a git commit or a git branch.** Not at the end of a task, not "to be safe", not to checkpoint your own work. The repository owner commits. Each task ends with a **Checkpoint** step: run the verification commands, report their output, and stop.
2. **Never change the database.** No schema change, no migration, no RLS policy, no auth provider, no permission model. This plan is presentation and read-path only.
3. **Never add a runtime dependency.** The allowed set is exactly what `package.json` already lists.
4. **Never invent content.** No placeholder items, no sample data, no lorem ipsum, no fake counts. Empty states say the collection is empty.
5. **Never add a visual effect.** The design language is *quiet editorial*: no 3D hover tilt, no gradient-filled badge, no glow shadow, no `backdrop-blur` on cards, no long staggered reveal. A card hover lifts 2px and shifts its border colour. That is the whole vocabulary.
6. **Never move a Supabase query into a Client Component.** Data is read in Server Components and passed down as plain objects.
7. **Never print a token, cookie or session payload.** `tests/e2e/.auth/` is gitignored and stays that way.
8. **All user-visible copy is Vietnamese**, and comes from strings already in the codebase unless this plan gives you the exact replacement text.
9. **Do not refactor anything this plan does not name.** If you find something else wrong, write it down and report it at the next Checkpoint.

---

## When to stop and ask

Stop, report, and wait for a human whenever any of these happen. Do not improvise past them.

- A verification step produces output different from what the step says to expect, and one re-run does not resolve it.
- You cannot complete a step exactly as written and would need to invent an alternative approach.
- A change you make turns out to require touching a file not listed in that task's **Files** block.
- The spec and this plan contradict each other.
- Anything under Task 5, Task 10 or Task 14 does not behave as described — those three carry the highest risk of silent breakage.
- You are about to do something irreversible that is not explicitly written here.

Reporting a blocker is a successful outcome. Guessing is not.

---

## Risk register

Most tasks are low risk. These five are not, and each says so again in its own body.

| Task | Risk | What goes wrong if you rush |
| --- | --- | --- |
| 2 | **Needs a human.** Opens a browser for a Google login you cannot perform yourself. | Without it, no later task can be visually verified. Ask the repository owner to complete the login. |
| 5 | **Highest blast radius in the plan.** Restructures a 2388-line stylesheet into cascade layers. Nothing tests it. | Wrong layer scope silently breaks all five seasonal themes. The task includes an observable proof; do not skip it. |
| 10 | Generalises a component the timeline already depends on. | A regression here breaks a working page that is otherwise out of scope. |
| 12 | **Deliberately leaves the build red.** | That is correct and expected. Task 14 makes it green again. Do not "fix" it early. |
| 14 | Easy to write as an N+1 query. | The task states the exact query budget. Any per-category query inside a loop is a defect. |

---

## Human-in-the-loop steps

Two steps need a person, not an agent:

- **Task 2, Step 5** — a Google OAuth login in a real browser window.
- **Task 22, Step 5** — the decision about whether to commit.

Everything else you can do yourself.

---

## File Structure

**Created**

| Path | Responsibility |
| --- | --- |
| `.gitattributes` | Force LF line endings so diffs stay readable |
| `scripts/save-auth-state.mjs` | One-time Google login capture into a Playwright storage state |
| `scripts/screenshot-routes.mjs` | Capture a route at the five required widths using that state |
| `scripts/codemod-color-utilities.mjs` | Rewrite `[var(--color-*)]` arbitrary values to theme utilities |
| `src/app/styles/tokens.css` | `:root` design tokens — unlayered on purpose |
| `src/app/styles/themes.css` | `body[data-theme="…"]` seasonal overrides — unlayered on purpose |
| `src/app/styles/base.css` | Element-level defaults inside `@layer base` |
| `src/app/styles/components/*.css` | Component styles inside `@layer components` |
| `src/app/styles/motion.css` | `@keyframes`, view-transition rules, reduced-motion blocks |
| `src/components/ui/media-rail.tsx` | Shared horizontal rail controller, generalised from the timeline |
| `src/components/ui/card.tsx` | Card surface primitive |
| `src/components/ui/section-header.tsx` | Kicker + heading + optional aside |
| `src/features/catalogue/presentation/catalogue-chapter-band.tsx` | One chapter: cover, copy, rail, open link |
| `src/modules/catalogue/application/list-visible-chapter-previews.ts` | Chapter preview use case |

**Modified**

| Path | Change |
| --- | --- |
| `src/app/globals.css` | Becomes an import manifest plus the `@theme` block |
| `src/app/page.tsx` | Branches its reads by render mode |
| `src/features/catalogue/presentation/catalogue-home.tsx` | Mode switch; second hero deleted |
| `src/features/catalogue/presentation/catalogue-chapter-rail.tsx` | Becomes the utility row |
| `src/features/catalogue/presentation/catalogue-search.tsx` | Loses its section wrapper and heading |
| `src/features/catalogue/presentation/cinematic-diary-intro.tsx` | Inert classes removed, phase written to `body`, height reduced |
| `src/features/catalogue/presentation/catalogue-item-card.tsx` | Effects stripped, `<h2>` → `<h3>` |
| `src/features/catalogue/presentation/catalogue-featured-item-card.tsx` | Effects stripped |
| `src/components/app-header.tsx` | Moves above the intro, widens, effects stripped |
| `src/features/timeline/presentation/timeline-film-controls.tsx` | Re-exports the shared rail |
| `src/modules/catalogue/domain/catalogue-read-models.ts` | Adds `CatalogueChapterPreview` |
| `src/modules/catalogue/application/catalogue-reader.ts` | Adds `listChapterPreviews` |
| `src/modules/catalogue/infrastructure/supabase-catalogue-reader.ts` | Implements it |
| `src/lib/backend/create-server-backend.ts` | Registers the use case |

---

# Phase 0 — Groundwork

## Task 1: Line endings and repository junk
**Files:**
- Create: `.gitattributes`
- Delete: `Build`, `diff.txt`, the directory named `D:\Code\mai-suggest`

**Context you need:** `git diff` currently reports 3693 insertions and 3693 deletions across 28 files with no content change. Those files were saved with CRLF line endings. Until this is fixed, every diff in this project is unreadable.

- [ ] **Step 1: Confirm the problem before changing anything**

Run:
```bash
git diff --shortstat
```
Expected: a line reporting 28 files changed with equal insertions and deletions.

- [ ] **Step 2: Create `.gitattributes`**

```
* text=auto eol=lf
*.png binary
*.jpg binary
*.jpeg binary
*.webp binary
*.ico binary
*.woff binary
*.woff2 binary
```

- [ ] **Step 3: Renormalise every tracked file**

Run:
```bash
git add --renormalize .
```

- [ ] **Step 4: Verify the phantom diff is gone**

Run:
```bash
git diff --shortstat && git diff --cached --stat | tail -3
```
Expected: `git diff` reports nothing, and the staged changes are line-ending normalisation only. If any staged file shows a real content change, stop and report it — do not continue.

- [ ] **Step 5: Remove the junk**

Run:
```bash
rm -f Build diff.txt
rm -rf 'D:\Code\mai-suggest'
```

`Build` is an empty file. `diff.txt` is a 55 KB captured diff. The third is a directory accidentally created from a Windows path used as a relative path.

- [ ] **Step 6: Verify nothing referenced them**

Run:
```bash
grep -rn "diff\.txt\|D:.Code" --include='*.ts' --include='*.tsx' --include='*.json' --include='*.mjs' src scripts package.json 2>/dev/null; echo "exit=$?"
```
Expected: no matches (`exit=1`).

- [ ] **Step 7: Checkpoint**

Run:
```bash
npm run lint && npx tsc --noEmit
```
Expected: lint reports exactly one warning — `magical-background.tsx:164`, `react-hooks/exhaustive-deps`. That warning is the known baseline. Type check reports nothing. Report both outputs and stop.

---

## Task 2: Auth state capture and screenshot tooling
**Files:**
- Create: `scripts/save-auth-state.mjs`, `scripts/screenshot-routes.mjs`
- Modify: `.gitignore`, `package.json`

**Interfaces:**
- Produces: `tests/e2e/.auth/state.json`, a Playwright storage state consumed by `scripts/screenshot-routes.mjs` and by every later verification step that needs to see an authenticated page.

**Context you need:** `/` redirects anonymous visitors to `/login` (verified: `307 → /login?next=%2F`). This project requires browser QA at 320, 390, 768, 1024 and 1440px before any visual change is considered done. Without a saved session you cannot open the home page at all, so no later task in this plan can be visually verified.

**This task needs a human.** Step 5 opens a browser window for a Google login you cannot perform. Ask the repository owner to complete it, then continue.

- [ ] **Step 1: Add the ignore rule**

Append to `.gitignore`:
```
# playwright auth state
/tests/e2e/.auth
/tests/e2e/.screenshots
```

- [ ] **Step 2: Write the login capture script**

Create `scripts/save-auth-state.mjs`:

```js
// Opens a real browser so a human can complete Google OAuth once, then stores
// the resulting session for later screenshot runs. Never prints the session.
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { chromium } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const STATE_PATH = "tests/e2e/.auth/state.json";
const TIMEOUT_MS = 5 * 60 * 1000;

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();

await page.goto(`${BASE_URL}/login`);
console.log("Đăng nhập Google trong cửa sổ vừa mở. Script tự lưu khi vào được trang chủ.");

try {
  await page.waitForURL(
    (url) => new URL(url).pathname === "/",
    { timeout: TIMEOUT_MS },
  );
  mkdirSync(dirname(STATE_PATH), { recursive: true });
  await context.storageState({ path: STATE_PATH });
  console.log(`Đã lưu phiên vào ${STATE_PATH}`);
} catch {
  console.error("Hết thời gian chờ đăng nhập. Chưa lưu gì cả.");
  process.exitCode = 1;
} finally {
  await browser.close();
}
```

- [ ] **Step 3: Write the screenshot script**

Create `scripts/screenshot-routes.mjs`:

```js
// Captures one route at the five widths this project requires for visual QA.
import { existsSync, mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const STATE_PATH = "tests/e2e/.auth/state.json";
const WIDTHS = [320, 390, 768, 1024, 1440];

const [routeArg, labelArg] = process.argv.slice(2);
const route = routeArg ?? "/";
const label = labelArg ?? "shot";
const outDir = `tests/e2e/.screenshots/${label}`;

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext(
  existsSync(STATE_PATH) ? { storageState: STATE_PATH } : {},
);

for (const width of WIDTHS) {
  const page = await context.newPage();
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${outDir}/${width}.png`, fullPage: true });
  await page.close();
}

await browser.close();
console.log(`Đã lưu ảnh vào ${outDir}`);
```

- [ ] **Step 4: Register both scripts**

Add to `package.json` `scripts`:
```json
"auth:save": "node scripts/save-auth-state.mjs",
"qa:shots": "node scripts/screenshot-routes.mjs"
```

- [ ] **Step 5: Run the login capture**

Start the dev server, then ask the user to complete the Google login in the window that opens:
```bash
npm run dev &
npm run auth:save
```
Expected: `Đã lưu phiên vào tests/e2e/.auth/state.json`.

- [ ] **Step 6: Verify the session works**

Run:
```bash
npm run qa:shots -- / baseline-home
ls tests/e2e/.screenshots/baseline-home
```
Expected: five PNG files. Open `1440.png` and confirm it shows the home page, not the login page. If it shows login, the state did not save — stop and report.

- [ ] **Step 7: Checkpoint**

Confirm `git status` shows `tests/e2e/.auth` and `tests/e2e/.screenshots` as ignored, not untracked. Report and stop.

---

## Task 3: Baseline capture
**Files:** none modified. This task records the state everything later is compared against.

- [ ] **Step 1: Record the build baseline**

Run:
```bash
npm run lint; npx tsc --noEmit; npx vitest run; npx next build
```
Expected: lint reports the one known `magical-background.tsx:164` warning; type check silent; tests pass; build succeeds. Record the First Load JS figures printed by the build.

- [ ] **Step 2: Record the Three.js chunk size**

Run:
```bash
find .next/static/chunks -name '*.js' -size +200k -exec ls -la {} \; | sort -k5 -n | tail -5
```
Record the largest chunk sizes. Task 22 compares against these numbers.

- [ ] **Step 3: Capture the login page baseline**

Run:
```bash
npm run qa:shots -- /login baseline-login
```
`/login` needs no session, so it stays verifiable even if the saved state expires. It exercises the same tokens as every other page and is the fastest regression check for Task 5.

- [ ] **Step 4: Checkpoint**

Report the build output, the chunk sizes and the screenshot paths. Stop.

---

# Phase 1 — Foundation

## Task 4: Complete the theme palette
**Files:**
- Modify: `src/app/globals.css:3-50` (the `@theme` block)

**Interfaces:**
- Produces: theme utilities `*-positive`, `*-danger`, `*-skeleton`, `*-skeleton-highlight`, which Task 7's codemod allowlist depends on.

**Context you need:** `@theme` currently declares ten colours: `brand`, `brand-strong`, `brand-soft`, `accent`, `paper`, `surface`, `ink`, `muted`, `border`, `focus`. But TSX uses thirteen — it also references `--color-danger`, `--color-positive` and `--color-skeleton` as arbitrary values. If the codemod in Task 8 rewrote those three, it would emit `bg-skeleton` and similar classes that Tailwind never generates: no error, no failing build, just a silently missing style. Declaring them first removes the trap.

The self-referential form (`--color-x: var(--color-x)`) is deliberate and must be preserved. Tailwind emits `@theme` variables inside `@layer theme`; the real values live in an unlayered `:root`, which wins the cascade outright. There is no cycle, and this is what makes the utilities follow the active seasonal theme.

- [ ] **Step 1: Add the four missing declarations**

In the `@theme` block, directly after `--color-focus: var(--color-focus);`:

```css
  --color-positive: var(--color-positive);
  --color-danger: var(--color-danger);
  --color-skeleton: var(--color-skeleton);
  --color-skeleton-highlight: var(--color-skeleton-highlight);
```

`:root` already defines all four real values at `globals.css:57-58` and `:69-70`.

- [ ] **Step 2: Prove the utilities now exist**

Add `<span className="bg-skeleton text-danger" />` temporarily to `src/app/login/page.tsx`, then run:
```bash
npx next build && grep -c "\.bg-skeleton" $(find .next/static/css -name '*.css' | head -1)
```
Expected: at least `1`. Remove the temporary span afterwards.

- [ ] **Step 3: Checkpoint**

Run `npx next build`. Expected: success. Report and stop.

---

## Task 5: Restructure the stylesheet into cascade layers
**Files:**
- Create: `src/app/styles/tokens.css`, `themes.css`, `base.css`, `motion.css`, `components/*.css`
- Modify: `src/app/globals.css`

**Context you need — read this before touching anything.** This is the highest-blast-radius change in the plan and nothing tests it.

`globals.css` is 2388 lines and contains **no `@layer` at all**. Tailwind v4 puts its utilities in `@layer utilities`. In the CSS cascade, unlayered rules beat layered rules regardless of specificity — so every hand-written rule in this file silently overrides the Tailwind utility for the same property. That is why adding a Tailwind class to a component sometimes does nothing.

Three things must stay **unlayered**, or the seasonal theme system breaks:

1. `:root { … }` — the real token values. They must keep beating the `@layer theme` output of `@theme`.
2. `body[data-theme="bordeaux" | "valentine" | "spring" | "noel" | "anniversary"] { … }` — the five seasonal overrides.
3. `@keyframes` and `::view-transition-*` rules — these are not subject to layering and are simplest left at top level.

Everything else moves into `@layer base` (element selectors) or `@layer components` (class selectors).

- [ ] **Step 1: Inventory the file before splitting**

Run:
```bash
grep -n '^@\|^:root\|^body\[\|^html\|^body {\|^\.\|^\*' src/app/globals.css > /tmp/globals-map.txt && wc -l /tmp/globals-map.txt
```
Use this map to assign every top-level rule to exactly one destination file. Do not proceed until every line in the map has a destination.

- [ ] **Step 2: Move tokens, unlayered**

Create `src/app/styles/tokens.css` holding the `:root { … }` block (currently `globals.css:52`–end of that block). **No `@layer` wrapper.**

- [ ] **Step 3: Move seasonal themes, unlayered**

Create `src/app/styles/themes.css` holding all five `body[data-theme="…"]` blocks and their `.theme-atmosphere*` descendants. **No `@layer` wrapper.**

- [ ] **Step 4: Move element defaults into `@layer base`**

Create `src/app/styles/base.css`:
```css
@layer base {
  html { … }
  body { … }
  :focus-visible { … }
}
```
Copy the existing declarations verbatim. `body`'s `overflow-x: clip` must survive exactly — `clip` does not create a scroll container, which is what keeps `position: sticky` working in Task 16. Do not "fix" it to `hidden`.

- [ ] **Step 5: Move component styles into `@layer components`**

Split by feature into `src/app/styles/components/`:

| File | Selectors |
| --- | --- |
| `diary.css` | `.diary-shell`, `.diary-container`, `.diary-section`, `.diary-section-tint`, `.diary-image-frame`, `.diary-rule`, `.diary-kicker`, `.diary-wash` |
| `header.css` | `.app-header`, `.app-header-mark` |
| `cinematic-diary.css` | every `.cinematic-diary-intro*` selector |
| `timeline.css` | every `.timeline-*` selector |
| `future-letters.css` | every `.future-letter*` selector |
| `theme-scene.css` | `.theme-maintenance*`, `.theme-scene*` |
| `typography.css` | `.font-display`, `.text-balance`, `.display-xl`, `.display-lg`, `.heading-md`, `.body-text`, `.caption-text` |

Each file wraps its contents in a single `@layer components { … }`. Media queries go **inside** that wrapper: `@layer components { @media (min-width: 640px) { … } }`.

While moving `diary.css`, merge the two `.diary-shell` blocks (`globals.css:524` and `:676`) into one. While moving `typography.css`, drop the `letter-spacing: 0` group reset — every member overrides it on the next line.

- [ ] **Step 6: Move keyframes and transitions, unlayered**

Create `src/app/styles/motion.css` holding every `@keyframes`, every `::view-transition-*` rule, and both `@media (prefers-reduced-motion: reduce)` blocks. **No `@layer` wrapper.**

- [ ] **Step 7: Rewrite `globals.css` as a manifest**

```css
@import "tailwindcss";
@import "./styles/tokens.css";
@import "./styles/themes.css";
@import "./styles/base.css";
@import "./styles/components/typography.css";
@import "./styles/components/diary.css";
@import "./styles/components/header.css";
@import "./styles/components/cinematic-diary.css";
@import "./styles/components/timeline.css";
@import "./styles/components/future-letters.css";
@import "./styles/components/theme-scene.css";
@import "./styles/motion.css";

@theme {
  /* unchanged from Task 4 */
}
```

Every `@import` must precede `@theme` — CSS requires imports before any other rule.

- [ ] **Step 8: Prove the layering actually works**

Temporarily add `text-danger` to the `<h1>` in `cinematic-diary-intro.tsx`, run the dev server, and confirm the heading turns red. Before this task it would not have, because `.cinematic-diary-intro__copy h1` set `color` from an unlayered rule. Remove the class afterwards. **If the heading does not change colour, the layering is wrong — stop and diagnose before continuing.**

- [ ] **Step 9: Verify no visual regression**

Run:
```bash
npx next build
npm run qa:shots -- /login after-layering
npm run qa:shots -- / after-layering-home
```
Compare `tests/e2e/.screenshots/after-layering/*.png` against `baseline-login/*.png`, and the home shots against `baseline-home/*.png`. They must be visually identical — this task changes cascade mechanics, not appearance. Check all five widths and all five themes are still reachable.

- [ ] **Step 10: Checkpoint**

Run `npm run lint && npx tsc --noEmit && npx vitest run && npx next build`. Report the screenshot comparison in words and stop.

---

## Task 6: Finish the type, elevation and motion scales
**Files:**
- Modify: `src/app/styles/tokens.css`, `src/app/styles/components/typography.css`

**Context you need:** a five-step type scale already exists at `globals.css:608-643` — `display-xl`, `display-lg`, `heading-md`, `body-text`, `caption-text` — but only `display-xl` is used anywhere. The other four are dead. Meanwhile the JSX carries twelve distinct ad-hoc `tracking-[…]` values. This task finishes the abandoned scale rather than inventing a new one.

- [ ] **Step 1: Add the scale tokens**

Append to the `:root` block in `tokens.css`:

```css
  /* Type scale: size, line height and tracking travel together.
     Tracking tightens as size grows. */
  --type-display-xl-size: clamp(2.75rem, 6vw, 4.75rem);
  --type-display-xl-leading: 0.98;
  --type-display-xl-tracking: -0.035em;
  --type-display-lg-size: clamp(2.1rem, 4vw, 3.25rem);
  --type-display-lg-leading: 1.05;
  --type-display-lg-tracking: -0.03em;
  --type-display-md-size: clamp(1.6rem, 2.6vw, 2.25rem);
  --type-display-md-leading: 1.15;
  --type-display-md-tracking: -0.02em;
  --type-title-size: 1.25rem;
  --type-title-leading: 1.3;
  --type-title-tracking: -0.01em;
  --type-body-size: 1rem;
  --type-body-leading: 1.7;
  --type-body-sm-size: 0.875rem;
  --type-body-sm-leading: 1.65;
  --type-kicker-size: 0.6875rem;
  --type-kicker-leading: 1.35;
  --type-kicker-tracking: 0.18em;

  /* Elevation: three steps, warm-tinted, never generic black. */
  --elevation-flat: none;
  --elevation-raised: 0 1px 2px rgb(49 5 12 / 5%), 0 8px 24px -12px rgb(49 5 12 / 12%);
  --elevation-lifted: 0 2px 4px rgb(49 5 12 / 6%), 0 16px 40px -16px rgb(49 5 12 / 16%);

  /* Motion: two durations, one easing. */
  --motion-quick: 160ms;
  --motion-base: 320ms;
  --motion-ease: cubic-bezier(0.2, 0, 0, 1);
```

- [ ] **Step 2: Re-point the existing classes and add the missing steps**

Replace the type block in `typography.css`:

```css
@layer components {
  .display-xl {
    font-size: var(--type-display-xl-size);
    line-height: var(--type-display-xl-leading);
    letter-spacing: var(--type-display-xl-tracking);
  }
  .display-lg {
    font-size: var(--type-display-lg-size);
    line-height: var(--type-display-lg-leading);
    letter-spacing: var(--type-display-lg-tracking);
  }
  .display-md {
    font-size: var(--type-display-md-size);
    line-height: var(--type-display-md-leading);
    letter-spacing: var(--type-display-md-tracking);
  }
  .title-text {
    font-size: var(--type-title-size);
    line-height: var(--type-title-leading);
    letter-spacing: var(--type-title-tracking);
  }
  .body-text {
    font-size: var(--type-body-size);
    line-height: var(--type-body-leading);
  }
  .body-text-sm {
    font-size: var(--type-body-sm-size);
    line-height: var(--type-body-sm-leading);
  }
  .diary-kicker {
    color: var(--color-accent);
    font-size: var(--type-kicker-size);
    font-weight: 700;
    line-height: var(--type-kicker-leading);
    letter-spacing: var(--type-kicker-tracking);
    text-transform: uppercase;
  }
}
```

`heading-md` and `caption-text` are dropped; `title-text` and `body-text-sm` replace them. `caption-text` had no call sites, and `heading-md` had none either — verified in the spec's deletion list. `.diary-kicker` moves here from `diary.css` because it is a type style, and `.text-balance` and `.font-display` stay where they are.

- [ ] **Step 3: Migrate the two live call sites**

`display-xl` is used at `catalogue-home.tsx:68` and `catalogue-detail-hero.tsx:67`. Both keep working unchanged — the class name is stable, only its implementation moved. Confirm with:
```bash
grep -rn "display-xl\|display-lg\|heading-md\|body-text\|caption-text" src --include='*.tsx'
```
Expected: exactly the two `display-xl` hits above. Any other hit is a call site the deletion assumption missed — stop and report it.

- [ ] **Step 4: Checkpoint**

Run:
```bash
npx next build && npm run qa:shots -- / after-typescale
```
Compare against `baseline-home`. `display-xl` shifts slightly (from `clamp(2.8rem, 9vw, 5.6rem)`/`-0.055em` to the new values) — that change is intended. Nothing else may move. Report and stop.

---

## Task 7: Write and verify the colour codemod
**Files:**
- Create: `scripts/codemod-color-utilities.mjs`

**Interfaces:**
- Produces: a script Task 8 runs. Task 8's implementer does not write it.

**Context you need:** 743 arbitrary values of the form `text-[var(--color-brand-strong)]` appear across the TSX. Tailwind already generates the equivalent utility for each of the fourteen colours declared in `@theme` after Task 4. Twenty-eight other call sites nest `var(--color-*)` inside `color-mix()`, `calc()` or `linear-gradient()`; those have no utility equivalent and must be left alone. The regex below cannot match them, because it requires the bracket to open with `var(`.

- [ ] **Step 1: Write the script**

Create `scripts/codemod-color-utilities.mjs`:

```js
// Rewrites `text-[var(--color-brand)]` to `text-brand` for colours that exist
// in the @theme block. Anything nested inside color-mix(), calc() or a gradient
// is left untouched: the opening `var(` in the pattern cannot match those.
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Must match the @theme block in src/app/globals.css exactly.
const THEME_COLORS = new Set([
  "accent", "border", "brand", "brand-soft", "brand-strong", "danger",
  "focus", "ink", "muted", "paper", "positive", "skeleton",
  "skeleton-highlight", "surface",
]);

const COLOR_PREFIXES = [
  "accent", "bg", "border", "caret", "decoration", "divide", "fill", "from",
  "outline", "placeholder", "ring", "stroke", "text", "to", "via",
];

const PATTERN = new RegExp(
  `(^|[\\s:"'\`])(${COLOR_PREFIXES.join("|")})-\\[var\\(--color-([a-z-]+)\\)\\]`,
  "g",
);

const write = process.argv.includes("--write");
const skipped = new Map();
let filesChanged = 0;
let replacements = 0;

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      yield* walk(path);
    } else if (/\.tsx?$/.test(path) && !/\.test\.tsx?$/.test(path)) {
      yield path;
    }
  }
}

for (const path of walk("src")) {
  const source = readFileSync(path, "utf8");
  let count = 0;

  const output = source.replace(PATTERN, (match, lead, prefix, name) => {
    if (!THEME_COLORS.has(name)) {
      skipped.set(name, (skipped.get(name) ?? 0) + 1);
      return match;
    }
    count += 1;
    return `${lead}${prefix}-${name}`;
  });

  if (count > 0) {
    filesChanged += 1;
    replacements += count;
    if (write) writeFileSync(path, output);
  }
}

console.log(
  `${write ? "Rewrote" : "Would rewrite"} ${replacements} value(s) in ${filesChanged} file(s).`,
);
if (skipped.size > 0) {
  console.log("Left alone (not declared in @theme):");
  for (const [name, n] of [...skipped].sort()) console.log(`  --color-${name}: ${n}`);
}
if (!write) console.log("Dry run. Pass --write to apply.");
```

- [ ] **Step 2: Dry-run it and read the report**

Run:
```bash
node scripts/codemod-color-utilities.mjs
```
Expected: a rewrite count in the hundreds, and an **empty** "Left alone" section. If any colour is listed as skipped, Task 4 missed it — add it to `@theme` and to `THEME_COLORS` before continuing.

- [ ] **Step 3: Prove the nested cases are untouched**

Run:
```bash
grep -roc "\[\(color-mix\|linear-gradient\|calc\)[^]]*var(--color" src --include='*.tsx' | awk -F: '{s+=$2} END {print s}'
```
Record this number. It is 28 today, and Task 8 verifies it is still 28 afterwards.

- [ ] **Step 4: Checkpoint**

Report the dry-run output and the nested-case count. Do not apply the codemod here — Task 8 does that. Stop.

---

## Task 8: Apply the colour codemod
**Files:** every `.tsx` under `src/` that the script reports.

**Context you need:** the script already exists and is already verified. Run it; do not edit it, and do not make any of these replacements by hand.

- [ ] **Step 1: Record the before count**

Run:
```bash
grep -roc "\[\(color-mix\|linear-gradient\|calc\)[^]]*var(--color" src --include='*.tsx' | awk -F: '{s+=$2} END {print s}'
```
Expected: `28`. If it is not 28, stop and report.

- [ ] **Step 2: Apply**

Run:
```bash
node scripts/codemod-color-utilities.mjs --write
```
Expected: `Rewrote N value(s) in M file(s).` and an empty "Left alone" section.

- [ ] **Step 3: Verify the nested cases survived unchanged**

Run the same command as Step 1. Expected: still `28`. If the number moved, the codemod damaged a nested value — run `git checkout -- src` and report.

- [ ] **Step 4: Verify no arbitrary theme colours remain**

Run:
```bash
grep -ron "\(text\|bg\|border\|from\|via\|to\|fill\|stroke\|outline\|ring\)-\[var(--color-" src --include='*.tsx' | wc -l
```
Expected: `0`.

- [ ] **Step 5: Checkpoint**

Run:
```bash
npm run lint && npx tsc --noEmit && npx vitest run && npx next build
```
Expected: the one known `magical-background.tsx:164` warning, nothing else; tests pass; build succeeds. Report all four outputs and stop.

---

## Task 9: Delete the dead code, CSS and tokens
**Files:**
- Delete: `src/modules/catalogue/application/list-visible-items.ts`
- Modify: `src/modules/catalogue/application/catalogue-reader.ts`, `src/modules/catalogue/infrastructure/supabase-catalogue-reader.ts`, `src/lib/backend/create-server-backend.ts`, `src/modules/catalogue/application/catalogue-use-cases.test.ts`, `src/lib/backend/create-server-backend.test.ts`, `src/modules/catalogue/infrastructure/supabase-catalogue-reader.test.ts`, `src/app/styles/tokens.css`, `src/app/styles/components/*.css`

**Context you need:** every item below was verified unused before this plan was written. `ListVisibleItems` is production code kept alive only by its own tests — no page or component calls `backend.listVisibleItems`. `listItemPage` serves every real caller.

- [ ] **Step 1: Confirm `listVisibleItems` has no real caller**

Run:
```bash
grep -rn "listVisibleItems\|ListVisibleItems\|\.listItems(" src --include='*.ts' --include='*.tsx' | grep -v "\.test\." | grep -v "catalogue-reader.ts"
```
Expected: only `create-server-backend.ts` (the registration) and `list-visible-items.ts` (the file itself). If a component or page appears, stop and report.

- [ ] **Step 2: Remove the use case and its registration**

- Delete `src/modules/catalogue/application/list-visible-items.ts`.
- In `create-server-backend.ts`, remove the `ListVisibleItems` import and the `listVisibleItems: new ListVisibleItems(catalogueReader),` entry.
- In `catalogue-reader.ts`, remove the `listItems` method from the `CatalogueReader` interface and the now-unused `CatalogueItemCriteria` import if nothing else uses it.
- In `supabase-catalogue-reader.ts`, remove the `listItems` method (`:50-101`).

- [ ] **Step 3: Update the tests that referenced it**

- `catalogue-use-cases.test.ts`: remove the `ListVisibleItems` import, remove `listItems: vi.fn(...)` from the `createReader` helper, and remove the two tests that construct `ListVisibleItems`.
- `create-server-backend.test.ts`: remove the `ListVisibleItems` import and its assertion.
- `supabase-catalogue-reader.test.ts:101`: remove the `reader.listItems({})` expectation.

- [ ] **Step 4: Remove the unused CSS classes**

Delete these six class definitions entirely — none has a call site:
`catalogue-surface` (and its `::before { content: none }`, a rule with no effect), `glass-dock`, `hero-overlay`, `hide-scrollbar`, `paper-card`, `summary-scroll`.

`display-lg`, `heading-md`, `body-text` and `caption-text` are **not** deleted here — Task 6 already replaced them.

- [ ] **Step 5: Remove the dead compatibility aliases**

In `tokens.css`, delete these six — each has zero uses:
`--wine`, `--burgundy`, `--ivory`, `--champagne`, `--paper`, `--muted`.

Two more have one use each. Migrate then delete:
```bash
grep -rn "var(--deep-wine)\|var(--ink)" src
```
Replace `var(--deep-wine)` with `var(--color-brand-strong)` and `var(--ink)` with `var(--color-ink)` at the sites found, then delete both aliases.

- [ ] **Step 6: Verify nothing still references what you deleted**

Run:
```bash
grep -rn "var(--wine)\|var(--burgundy)\|var(--ivory)\|var(--champagne)\|var(--paper)\|var(--muted)\|var(--deep-wine)\|var(--ink)" src; echo "exit=$?"
grep -rn "catalogue-surface\|glass-dock\|hero-overlay\|hide-scrollbar\|paper-card\|summary-scroll" src; echo "exit=$?"
```
Expected: both report `exit=1` (no matches).

- [ ] **Step 7: Checkpoint**

Run:
```bash
npm run lint && npx tsc --noEmit && npx vitest run && npx next build
```
Expected: all pass, one known warning. Report and stop.

---

## Task 10: Promote the rail controller to a shared primitive
**Files:**
- Create: `src/components/ui/media-rail.tsx`, `src/components/ui/media-rail.test.tsx`
- Modify: `src/features/timeline/presentation/timeline-film-controls.tsx`, `src/app/styles/components/timeline.css`

**Interfaces:**
- Produces: `MediaRailControls({ viewportId, frameClassName, previousLabel, nextLabel, groupLabel })`. Task 19 consumes it for chapter rails.

**Context you need:** `timeline-film-controls.tsx` is already well built — `requestAnimationFrame`-throttled bounds, a `ResizeObserver`, `prefers-reduced-motion` honoured inside `scrollToFilmFrame`, and correct ARIA (`role="group"`, `aria-controls`, disabled edge states). Only two things bind it to the timeline: the hard-coded `.timeline-film-frame` selector at line 23 and the Vietnamese labels at lines 121 and 131. **Timeline behaviour must not change.**

- [ ] **Step 1: Write the failing test**

Create `src/components/ui/media-rail.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MediaRailControls } from "@/components/ui/media-rail";

function renderRail(frameClassName: string) {
  document.body.innerHTML = `
    <div id="rail-viewport">
      <div class="${frameClassName}">một</div>
      <div class="${frameClassName}">hai</div>
    </div>
  `;

  return render(
    <MediaRailControls
      frameClassName={frameClassName}
      groupLabel="Điều hướng chương"
      nextLabel="Chương tiếp theo"
      previousLabel="Chương trước"
      viewportId="rail-viewport"
    />,
  );
}

describe("MediaRailControls", () => {
  it("labels its group and buttons from props", () => {
    renderRail("chapter-rail-frame");

    expect(screen.getByRole("group", { name: "Điều hướng chương" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Chương trước" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Chương tiếp theo" })).toBeInTheDocument();
  });

  it("points both buttons at the viewport it controls", () => {
    renderRail("chapter-rail-frame");

    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAttribute("aria-controls", "rail-viewport");
    }
  });

  it("disables both directions when the viewport does not overflow", () => {
    renderRail("chapter-rail-frame");

    expect(screen.getByRole("button", { name: "Chương trước" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Chương tiếp theo" })).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/components/ui/media-rail.test.tsx`
Expected: FAIL — cannot resolve `@/components/ui/media-rail`.

- [ ] **Step 3: Move the component**

Create `src/components/ui/media-rail.tsx` with the full body of `timeline-film-controls.tsx`, changing exactly four things:

1. Rename the component to `MediaRailControls`.
2. Extend the props: `{ viewportId: string; frameClassName: string; groupLabel: string; previousLabel: string; nextLabel: string }`.
3. `getFilmFrames` becomes `getFrames(viewport, frameClassName)` and queries `` `.${frameClassName}` `` instead of the literal `.timeline-film-frame`.
4. The three hard-coded Vietnamese strings become the three label props. The root `className` becomes `media-rail-controls`, and the buttons `media-rail-control`.

Everything else — the `requestAnimationFrame` throttle, the `ResizeObserver`, the reduced-motion branch, the bounds comparison that avoids redundant `setState` — is copied verbatim.

- [ ] **Step 4: Run the test again**

Run: `npx vitest run src/components/ui/media-rail.test.tsx`
Expected: PASS, three tests.

- [ ] **Step 5: Re-point the timeline**

Replace the body of `timeline-film-controls.tsx` with a thin adapter that preserves today's exact behaviour and labels:

```tsx
"use client";

import { MediaRailControls } from "@/components/ui/media-rail";

export function TimelineFilmControls({ viewportId }: { viewportId: string }) {
  return (
    <MediaRailControls
      frameClassName="timeline-film-frame"
      groupLabel="Điều hướng cuộn phim"
      nextLabel="Xem chương tiếp theo"
      previousLabel="Xem chương trước"
      viewportId={viewportId}
    />
  );
}
```

- [ ] **Step 6: Generalise the CSS**

In `timeline.css`, rename `.timeline-film-controls` to `.media-rail-controls` and `.timeline-film-control` to `.media-rail-control`, and move both into a new `src/app/styles/components/media-rail.css` with the viewport rules from `.timeline-film-viewport` generalised to `.media-rail-viewport`. Keep `.timeline-film-viewport` and `.timeline-film-frame` as timeline-specific layout on top. Register the new file in `globals.css`.

- [ ] **Step 7: Verify the timeline did not regress**

Run:
```bash
npx vitest run && npx next build && npm run qa:shots -- /hanh-trinh after-media-rail
```
Compare against a fresh baseline of `/hanh-trinh` taken before this task. The filmstrip must look and behave identically. Check the arrow buttons still disable at both ends.

- [ ] **Step 8: Checkpoint**

Report the test output and the timeline comparison. Stop.

---

## Task 11: Card and section-header primitives
**Files:**
- Create: `src/components/ui/card.tsx`, `src/components/ui/section-header.tsx`

**Interfaces:**
- Produces: `Card({ as, href, className, children, interactive })` and `SectionHeader({ kicker, title, headingId, headingLevel, aside })`. Tasks 18, 19 and 21 consume both.

**Context you need:** the project has only two shared UI primitives today (`button.tsx`, `page-transition.tsx`), so every card, badge and section heading is re-implemented inline. That is why surfaces drift apart. Build only what the home page needs — no `Badge`, no `Surface` until something asks for them.

- [ ] **Step 1: Write the card primitive**

Create `src/components/ui/card.tsx`:

```tsx
import Link from "next/link";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  href?: string;
  /** Adds the quiet hover treatment: a 2px lift and a border colour shift. */
  interactive?: boolean;
  transitionTypes?: string[];
}

const BASE =
  "relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-paper shadow-[var(--elevation-raised)]";

const INTERACTIVE =
  "transition-[transform,border-color,box-shadow] duration-[var(--motion-base)] ease-[var(--motion-ease)] hover:-translate-y-0.5 hover:border-accent hover:shadow-[var(--elevation-lifted)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-focus";

export function Card({
  children,
  className = "",
  href,
  interactive = false,
  transitionTypes,
}: CardProps) {
  const classes = `${BASE} ${interactive ? INTERACTIVE : ""} ${className}`.trim();

  if (href) {
    return (
      <Link className={classes} href={href} transitionTypes={transitionTypes}>
        {children}
      </Link>
    );
  }

  return <div className={classes}>{children}</div>;
}
```

There is no rotate, no scale, no glow, and no `backdrop-blur`. That is the point of the primitive: the quiet treatment is defined once and cannot drift.

- [ ] **Step 2: Write the section-header primitive**

Create `src/components/ui/section-header.tsx`:

```tsx
import type { ReactNode } from "react";

interface SectionHeaderProps {
  aside?: ReactNode;
  headingId?: string;
  headingLevel?: 2 | 3;
  kicker?: string;
  title: string;
}

export function SectionHeader({
  aside,
  headingId,
  headingLevel = 2,
  kicker,
  title,
}: SectionHeaderProps) {
  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {kicker ? <p className="diary-kicker">{kicker}</p> : null}
        <Heading
          className="font-display display-md mt-2 font-semibold text-brand-strong"
          id={headingId}
        >
          {title}
        </Heading>
      </div>
      {aside ? <div className="body-text-sm text-muted">{aside}</div> : null}
    </div>
  );
}
```

- [ ] **Step 3: Checkpoint**

Run `npx tsc --noEmit && npm run lint && npx next build`. Nothing consumes these yet, so no visual change is expected. Report and stop.

---

# Phase 2 — Chapter preview data

## Task 12: Chapter preview read model and port
**Files:**
- Modify: `src/modules/catalogue/domain/catalogue-read-models.ts`, `src/modules/catalogue/application/catalogue-reader.ts`

**Interfaces:**
- Produces: `CatalogueChapterPreview` and `CatalogueReader.listChapterPreviews(criteria)`. Tasks 13, 14 and 19 all depend on these exact names and shapes.

- [ ] **Step 1: Add the read model**

Append to `catalogue-read-models.ts`:

```ts
export interface CatalogueChapterPreview {
  category: CatalogueCategory;
  items: CatalogueItemSummary[];
  totalItems: number;
}
```

`items` holds at most `itemsPerChapter` entries. `totalItems` is the chapter's full count, which the band renders as "N điều được giữ lại" — so a chapter showing five previews can still say it holds twelve.

- [ ] **Step 2: Add the port method**

In `catalogue-reader.ts`, add the criteria type and the method:

```ts
export interface CatalogueChapterPreviewCriteria {
  itemsPerChapter: number;
}
```

and inside `interface CatalogueReader`:

```ts
  listChapterPreviews(
    criteria: CatalogueChapterPreviewCriteria,
  ): Promise<Result<CatalogueChapterPreview[]>>;
```

Import `CatalogueChapterPreview` alongside the existing read-model imports.

- [ ] **Step 3: Verify the type error appears where you expect**

Run: `npx tsc --noEmit`
Expected: FAIL — `SupabaseCatalogueReader` no longer satisfies `CatalogueReader`. That is correct; Task 14 fixes it. Record the error text.

- [ ] **Step 4: Checkpoint**

Report the expected type error and stop. This task deliberately leaves the tree red.

---

## Task 13: Chapter preview use case
**Files:**
- Create: `src/modules/catalogue/application/list-visible-chapter-previews.ts`
- Modify: `src/modules/catalogue/application/catalogue-use-cases.test.ts`

**Interfaces:**
- Consumes: `CatalogueReader.listChapterPreviews` from Task 12.
- Produces: `class ListVisibleChapterPreviews { execute(actor: CurrentActor, criteria: CatalogueChapterPreviewCriteria): Promise<Result<CatalogueChapterPreview[]>> }`. Task 17 registers it; Task 20 calls it.

**Context you need:** every public use case in this module guards the actor first and returns before touching the reader. `ListVisibleCategories` is the closest model. Access is decided here, never in a component.

- [ ] **Step 1: Write the failing tests**

Add to `catalogue-use-cases.test.ts`. First extend the `createReader` helper with the new port method:

```ts
    listChapterPreviews: vi.fn(async () => success([])),
```

Then add the import and the tests:

```ts
import { ListVisibleChapterPreviews } from "@/modules/catalogue/application/list-visible-chapter-previews";

  it("does not query chapter previews for an anonymous actor", async () => {
    const reader = createReader();
    const useCase = new ListVisibleChapterPreviews(reader);

    await expect(
      useCase.execute(anonymousActor, { itemsPerChapter: 5 }),
    ).resolves.toEqual({ ok: false, error: { code: "UNAUTHENTICATED" } });
    expect(reader.listChapterPreviews).not.toHaveBeenCalled();
  });

  it("does not query chapter previews for an inactive actor", async () => {
    const reader = createReader();
    const useCase = new ListVisibleChapterPreviews(reader);

    await expect(
      useCase.execute(inactiveActor, { itemsPerChapter: 5 }),
    ).resolves.toEqual({ ok: false, error: { code: "ACCESS_DENIED" } });
    expect(reader.listChapterPreviews).not.toHaveBeenCalled();
  });

  it("rejects a non-positive preview size before reading", async () => {
    const reader = createReader();
    const useCase = new ListVisibleChapterPreviews(reader);

    await expect(
      useCase.execute(activeActor, { itemsPerChapter: 0 }),
    ).resolves.toEqual({ ok: false, error: { code: "VALIDATION_FAILED" } });
    expect(reader.listChapterPreviews).not.toHaveBeenCalled();
  });

  it("passes the preview size through for an active actor", async () => {
    const reader = createReader();
    const useCase = new ListVisibleChapterPreviews(reader);

    await expect(
      useCase.execute(activeActor, { itemsPerChapter: 5 }),
    ).resolves.toEqual({ ok: true, value: [] });
    expect(reader.listChapterPreviews).toHaveBeenCalledWith({ itemsPerChapter: 5 });
  });
```

Confirm the inactive-actor error code by reading `requireActiveActor` in `src/modules/identity/domain/current-actor.ts` before running — use whatever it actually returns.

- [ ] **Step 2: Run them and watch them fail**

Run: `npx vitest run src/modules/catalogue/application/catalogue-use-cases.test.ts`
Expected: FAIL — cannot resolve `list-visible-chapter-previews`.

- [ ] **Step 3: Write the use case**

Create `src/modules/catalogue/application/list-visible-chapter-previews.ts`:

```ts
import { failure, type Result } from "@/core/application/result";
import type {
  CatalogueChapterPreviewCriteria,
  CatalogueReader,
} from "@/modules/catalogue/application/catalogue-reader";
import type { CatalogueChapterPreview } from "@/modules/catalogue/domain/catalogue-read-models";
import type { CurrentActor } from "@/modules/identity/domain/current-actor";
import { requireActiveActor } from "@/modules/identity/domain/current-actor";

export class ListVisibleChapterPreviews {
  constructor(private readonly catalogueReader: CatalogueReader) {}

  async execute(
    actor: CurrentActor,
    criteria: CatalogueChapterPreviewCriteria,
  ): Promise<Result<CatalogueChapterPreview[]>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) return activeActor;

    if (
      !Number.isInteger(criteria.itemsPerChapter)
      || criteria.itemsPerChapter <= 0
    ) {
      return failure("VALIDATION_FAILED");
    }

    return this.catalogueReader.listChapterPreviews(criteria);
  }
}
```

- [ ] **Step 4: Run the tests again**

Run: `npx vitest run src/modules/catalogue/application/catalogue-use-cases.test.ts`
Expected: PASS, including the four new tests.

- [ ] **Step 5: Checkpoint**

Report the test output. `npx tsc --noEmit` still fails on the missing adapter method — that is expected until Task 14. Stop.

---

## Task 14: Supabase chapter preview adapter
**Files:**
- Modify: `src/modules/catalogue/infrastructure/supabase-catalogue-reader.ts`, `src/modules/catalogue/infrastructure/supabase-catalogue-reader.test.ts`

**Interfaces:**
- Consumes: `CatalogueChapterPreviewCriteria` from Task 12.
- Produces: `SupabaseCatalogueReader.listChapterPreviews`.

**Context you need:** the current reader spends two queries per page — items, then images for those items. The chapter preview must keep that budget. Reading `items` first without images, grouping in memory, then fetching images for only the selected ids achieves it. Ordering follows the existing `listItems` convention (`order("title")`) so previews are stable between renders.

Accepted trade-off, recorded in the spec: this reads every `items` row. For a private two-person diary that is correct. Past a few hundred items it should become a `top_n_per_category` RPC, which is a separate change needing migration approval.

- [ ] **Step 1: Write the failing test**

Follow the mocking style already used in `supabase-catalogue-reader.test.ts`. Add:

```ts
  it("returns at most the requested number of items per chapter", async () => {
    const reader = createReader({
      categories: [
        { id: "c1", slug: "ngay-thuong", name: "Ngày thường", description: null,
          icon: null, cover_image_url: null, sort_order: 1 },
      ],
      items: [
        { id: "i1", category_id: "c1", slug: "a", kind: "place", title: "A",
          summary: null, price_label: null },
        { id: "i2", category_id: "c1", slug: "b", kind: "place", title: "B",
          summary: null, price_label: null },
        { id: "i3", category_id: "c1", slug: "c", kind: "place", title: "C",
          summary: null, price_label: null },
      ],
      images: [],
    });

    const result = await reader.listChapterPreviews({ itemsPerChapter: 2 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toHaveLength(1);
    expect(result.value[0].items.map((item) => item.id)).toEqual(["i1", "i2"]);
    expect(result.value[0].totalItems).toBe(3);
  });

  it("returns a chapter with no items rather than dropping it", async () => {
    const reader = createReader({
      categories: [
        { id: "c1", slug: "trong", name: "Trống", description: null,
          icon: null, cover_image_url: null, sort_order: 1 },
      ],
      items: [],
      images: [],
    });

    const result = await reader.listChapterPreviews({ itemsPerChapter: 5 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toHaveLength(1);
    expect(result.value[0].items).toEqual([]);
    expect(result.value[0].totalItems).toBe(0);
  });
```

Adapt `createReader` to whatever fixture helper the existing file already defines; do not invent a second mocking style.

- [ ] **Step 2: Run and watch it fail**

Run: `npx vitest run src/modules/catalogue/infrastructure/supabase-catalogue-reader.test.ts`
Expected: FAIL — `listChapterPreviews is not a function`.

- [ ] **Step 3: Implement the adapter method**

Add to `SupabaseCatalogueReader`:

```ts
  async listChapterPreviews(
    criteria: CatalogueChapterPreviewCriteria,
  ): Promise<Result<CatalogueChapterPreview[]>> {
    const categories = await this.listCategories();
    if (!categories.ok) return categories;

    const { data: itemRows, error: itemError } = await this.client
      .from("items")
      .select(ITEM_SUMMARY_COLUMNS)
      .order("title");

    if (itemError) return failure("UNEXPECTED_FAILURE");

    const rowsByCategory = new Map<string, typeof itemRows>();
    for (const row of itemRows ?? []) {
      const bucket = rowsByCategory.get(row.category_id);
      if (bucket) bucket.push(row);
      else rowsByCategory.set(row.category_id, [row]);
    }

    const selectedRows = categories.value.flatMap((category) =>
      (rowsByCategory.get(category.id) ?? []).slice(0, criteria.itemsPerChapter),
    );

    const primaryImages = new Map<string, CatalogueImage>();
    if (selectedRows.length > 0) {
      const { data: imageRows, error: imageError } = await this.client
        .from("item_images")
        .select(ITEM_IMAGE_COLUMNS)
        .in("item_id", selectedRows.map((row) => row.id))
        .order("sort_order");

      if (imageError) return failure("UNEXPECTED_FAILURE");

      for (const imageRow of imageRows ?? []) {
        if (!primaryImages.has(imageRow.item_id)) {
          primaryImages.set(imageRow.item_id, toCatalogueImage(imageRow));
        }
      }
    }

    return success(
      categories.value.map((category) => {
        const rows = rowsByCategory.get(category.id) ?? [];
        return {
          category,
          items: rows
            .slice(0, criteria.itemsPerChapter)
            .map((row) => toCatalogueItemSummary(row, primaryImages.get(row.id) ?? null)),
          totalItems: rows.length,
        };
      }),
    );
  }
```

Add `CatalogueChapterPreview` and `CatalogueChapterPreviewCriteria` to the imports at the top of the file.

- [ ] **Step 4: Run the tests again**

Run: `npx vitest run src/modules/catalogue/infrastructure/supabase-catalogue-reader.test.ts`
Expected: PASS.

- [ ] **Step 5: Verify the query budget**

Read your implementation and confirm it issues exactly three Supabase calls in the worst case — categories, items, images — and only two when no chapter has any item. Any per-category query inside a loop is a defect; rewrite it.

- [ ] **Step 6: Checkpoint**

Run `npx tsc --noEmit && npx vitest run`. The type error from Task 12 is now resolved. Report and stop.

---

## Task 15: Register the use case
**Files:**
- Modify: `src/lib/backend/create-server-backend.ts`, `src/lib/backend/create-server-backend.test.ts`

**Interfaces:**
- Produces: `backend.listVisibleChapterPreviews`. Task 20 calls it.

- [ ] **Step 1: Write the failing assertion**

In `create-server-backend.test.ts`, alongside the existing assertions:

```ts
import { ListVisibleChapterPreviews } from "@/modules/catalogue/application/list-visible-chapter-previews";

  expect(backend.listVisibleChapterPreviews).toBeInstanceOf(ListVisibleChapterPreviews);
```

- [ ] **Step 2: Run and watch it fail**

Run: `npx vitest run src/lib/backend/create-server-backend.test.ts`
Expected: FAIL — `listVisibleChapterPreviews` is undefined.

- [ ] **Step 3: Register it**

In `create-server-backend.ts`, import the class and add to the returned object, next to `listVisibleCategories`:

```ts
    listVisibleChapterPreviews: new ListVisibleChapterPreviews(catalogueReader),
```

- [ ] **Step 4: Run again**

Run: `npx vitest run`
Expected: PASS, whole suite.

- [ ] **Step 5: Checkpoint**

Run `npm run lint && npx tsc --noEmit && npx vitest run && npx next build`. Report and stop.

---

# Phase 3 — The home page

## Task 16: Header above the journal
**Files:**
- Modify: `src/features/catalogue/presentation/catalogue-home.tsx`, `src/features/catalogue/presentation/cinematic-diary-intro.tsx`, `src/components/app-header.tsx`, `src/app/styles/components/header.css`

**Context you need:** `2026-07-22-cinematic-diary-intro-landing-design.md` deliberately placed `AppHeader` *after* the intro so the opening viewport had no navigation. Combined with a `200svh` intro that means two full screens with no way out. The spec supersedes that rule but keeps its intent: the header exists from the start and stays hidden only while the journal is still closed.

Verified safe: `body` uses `overflow-x: clip`, which — unlike `hidden` — creates no scroll container, so `position: sticky` keeps working. `html` already sets `scroll-padding-top: 5rem`. React's `ViewTransition` renders no DOM element. The intro's theme `MutationObserver` filters on `data-theme` only, so writing a second data attribute to `body` will not trigger it.

- [ ] **Step 1: Reorder the two components**

In `catalogue-home.tsx`, move `<AppHeader …/>` above `<CinematicDiaryIntro />`. The skip link stays first.

- [ ] **Step 2: Publish the phase to `body`**

In `cinematic-diary-intro.tsx`, inside the existing `useMotionValueEvent` handler, after `section.dataset.phase = getPhase(progress);` add:

```ts
    document.body.dataset.introPhase = getPhase(progress);
```

Set the same value in the initialisation path where `section.dataset.phase` is first assigned, and clear it in the effect's cleanup:

```ts
      delete document.body.dataset.introPhase;
```

Add the initial value on mount so the header starts hidden before the first scroll event:

```ts
    document.body.dataset.introPhase = "closed";
```

- [ ] **Step 3: Hide the header only while closed**

In `header.css`, inside `@layer components`:

```css
  .app-header {
    transition: opacity var(--motion-base) var(--motion-ease),
                transform var(--motion-base) var(--motion-ease);
  }

  body[data-intro-phase="closed"] .app-header {
    opacity: 0;
    transform: translateY(-0.75rem);
    pointer-events: none;
  }
```

The default state is visible, so every other route and the reduced-motion path are unaffected without any extra rule.

- [ ] **Step 4: Widen the header to match the content**

In `app-header.tsx`, replace `max-w-5xl` with the shared container width so the header stops being narrower than the content beneath it: use `className="app-header diary-container sticky top-4 z-40 …"` and drop `mx-auto max-w-5xl px-4`. Remove `animate-luxury-reveal` — the phase transition now handles the entrance.

- [ ] **Step 5: Strip the header effects**

Per the global constraint, remove from `app-header.tsx`: `shadow-[var(--shadow-luxury-card)]`, `shadow-[var(--shadow-luxury-glow)]` and its `-strong` hover variant, `group-hover:rotate-12`, `group-hover:scale-105`, `group-hover:scale-110`, and the gradient owner badge background. Replace the card shadow with `shadow-[var(--elevation-raised)]` and the owner badge background with `bg-brand-soft`.

- [ ] **Step 6: Verify at every width and with reduced motion**

Run:
```bash
npm run qa:shots -- / after-header
```
Then manually: load `/`, confirm no header at the very top, confirm it slides in as the journal starts opening, confirm it stays for the rest of the page. Enable `prefers-reduced-motion` in devtools, reload, and confirm the header is visible immediately. Load `/hanh-trinh` and confirm the header is visible there with no intro present.

- [ ] **Step 7: Checkpoint**

Run `npm run lint && npx tsc --noEmit && npx next build`. Report the manual checks explicitly — screenshots alone do not prove the phase transition. Stop.

---

## Task 17: Restage the journal
**Files:**
- Modify: `src/features/catalogue/presentation/cinematic-diary-intro.tsx`, `src/app/styles/components/cinematic-diary.css`

**Context you need:** `cinematic-diary-scene.ts` and `cinematic-diary-geometry.ts` are **not touched**. The 3D model is sound and the geometry has tests; the problem is the staging around it.

The `<h1>` at `cinematic-diary-intro.tsx:176` currently carries `text-5xl md:text-7xl font-bold bg-gradient-to-r from-brandStrong via-brand to-accent bg-clip-text text-transparent drop-shadow-sm`. Every one of those was inert before Task 5, because the unlayered `.cinematic-diary-intro__copy h1` rule won. After Task 5 they are live — which means leaving them in place would now actively break the heading. They must go.

`from-brandStrong`, `via-brand`, `to-accent` and `text-brandStrong/70` reference a colour named `brandStrong` that has never existed: `@theme` declares `--color-brand-strong`, so only `*-brand-strong` was ever generated.

- [ ] **Step 1: Remove every inert and invalid class**

In `cinematic-diary-intro.tsx`, reduce the overlay elements to their BEM class plus layout-only utilities. Concretely:

- `__kicker`: drop `tracking-[0.2em] uppercase text-brand/70 font-semibold text-xs md:text-sm mb-4`.
- `__title`: drop `text-5xl md:text-7xl font-bold bg-gradient-to-r from-brandStrong via-brand to-accent bg-clip-text text-transparent drop-shadow-sm pb-2 pt-4 overflow-visible`.
- `__description`: drop `text-lg md:text-xl text-brandStrong/70 mt-6 max-w-xl mx-auto leading-relaxed`.
- `__reading-line`: drop `italic text-brand/60 mt-8 text-xl`.
- `__cta`: drop `mt-12 inline-flex items-center gap-2 px-8 py-3 rounded-full border border-accent/40 bg-white/40 hover:bg-white/70 hover:shadow-[…] hover:-translate-y-1 transition-all duration-500 text-brandStrong backdrop-blur-md`.

Keep `font-display` on the title and the BEM classes on all five. The CSS in `cinematic-diary.css` already styles each one completely.

- [ ] **Step 2: Retune the CTA to the quiet language**

In `cinematic-diary.css`, replace the `.cinematic-diary-intro__cta` background and shadow:

```css
  .cinematic-diary-intro__cta {
    border: 1px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
    background: color-mix(in srgb, var(--color-paper) 88%, transparent);
    box-shadow: var(--elevation-raised);
    transition: transform var(--motion-base) var(--motion-ease),
                border-color var(--motion-base) var(--motion-ease),
                box-shadow var(--motion-base) var(--motion-ease);
  }

  .cinematic-diary-intro__cta:hover {
    border-color: var(--color-accent);
    box-shadow: var(--elevation-lifted);
    transform: translateY(-0.125rem);
  }
```

The `scale(1.02)` and the copper glow are gone; the 2px lift replaces them. Keep the existing `:focus-visible` rule untouched.

- [ ] **Step 3: Shorten the scroll**

In `cinematic-diary.css`:
- `.cinematic-diary-intro { min-height: 140svh; }` (was `200svh`)
- inside the `@media (max-width: 639px)` block: `min-height: 120svh;` (was `160svh`)

The four phase thresholds in `getPhase` stay at 0.16 / 0.72 / 0.9 — they are proportions of the section, so the acts keep their relative pacing over a shorter distance.

- [ ] **Step 4: Point the CTA at the first chapter**

Change the anchor's `href` from `#collection` to `#chapter-1`, and its label from "Khám phá chương đầu" to "Mở chương đầu". Task 19 gives the first band that id. Remove the stray `group-hover:translate-y-1` on the arrow span — there is no `group` on any ancestor, so it has never done anything.

- [ ] **Step 5: Verify the heading is now actually styled**

Load `/` and inspect the `<h1>` in devtools. Its computed `color` must be `--color-brand-strong` and its `font-size` must come from `.cinematic-diary-intro__copy h1`. There must be no `background-clip: text` and no `color: transparent` anywhere on it.

- [ ] **Step 6: Verify the journal still opens correctly**

Scroll `/` slowly from top to bottom and confirm all four phases still read: closed volume, cover opening toward the camera, the quiet reading line, then handoff. Enable `prefers-reduced-motion` and confirm the static CSS fallback still appears with the canvas hidden.

- [ ] **Step 7: Checkpoint**

Run:
```bash
npm run lint && npx tsc --noEmit && npx next build && npm run qa:shots -- / after-journal
```
Report the devtools inspection and the four-phase check in words. Stop.

---

## Task 18: The utility row
**Files:**
- Modify: `src/features/catalogue/presentation/catalogue-chapter-rail.tsx`, `src/features/catalogue/presentation/catalogue-search.tsx`

**Interfaces:**
- Consumes: `createCataloguePath` from `catalogue-navigation.ts`, unchanged.
- Produces: `CatalogueUtilityRow({ categories, mode, query, selectedCategorySlug, resultCount })` exported from `catalogue-chapter-rail.tsx`, consumed by Task 20.

**Context you need:** today the chapter rail is a three-column grid of large cards with its own `<h2>` ("Chọn một chương hôm nay"), and the search is a separate washed card with its own `<h2>` ("Điều em đang tìm"). Two headings and two full-width blocks stand between the journal and the first real content. Both collapse into one slim row with no heading of its own.

`catalogue-search.tsx` keeps all of its client logic — `useState`, `useTransition`, `router.push`, the clear handler, the `aria-live` result count. Only its wrapper, kicker and heading are removed.

- [ ] **Step 1: Strip the search component down to a control**

In `catalogue-search.tsx`, replace the outer `<section>` with a `<form role="search">` at the top level. Delete the `<div>` holding `.diary-kicker` and the `<h2 id="catalogue-search-heading">`. Keep the `aria-live` count as a `<p>` beside the field. Keep the label, the input, the submit button and the conditional clear button exactly as they are, but restyle the buttons with `shadow-[var(--elevation-raised)]` and remove `hover:-translate-y-0.5` from the submit in favour of a border/background shift.

- [ ] **Step 2: Rewrite the chapter rail as the utility row**

Replace the contents of `catalogue-chapter-rail.tsx` with a component that renders one row containing, in order:

- in `overview` mode, one small anchor per category pointing at `#chapter-<n>`, plus an "Xem tất cả" state that is simply the current page;
- in `chapter` and `search` modes, the existing category `Link`s built with `createCataloguePath`, each keeping `aria-current={isActive ? "page" : undefined}`, plus the "Xem tất cả" link back to `/`;
- `<CatalogueSearch …/>` at the end of the row.

Wrap the links in `<nav aria-label="Chọn chương bộ sưu tập">` so the existing landmark survives. Use `Card`'s quiet treatment only if a link needs a surface; a plain pill with `border-border`, `hover:border-accent` and no shadow is preferred here. Export it as `CatalogueUtilityRow` and keep a named re-export of the old symbol only if something outside the home page imports it — check with:

```bash
grep -rn "CatalogueChapterRail" src --include='*.tsx'
```

- [ ] **Step 3: Delete the removed strings from the codebase**

The headings "Chọn một chương hôm nay", "Khám phá theo tâm trạng", "Điều em đang tìm" and "Tìm trong những điều đã lưu" are gone. Confirm none survives:
```bash
grep -rn "Chọn một chương hôm nay\|Khám phá theo tâm trạng\|Điều em đang tìm" src; echo "exit=$?"
```
Expected: `exit=1`.

- [ ] **Step 4: Verify the search still works end to end**

With the dev server running: type a query, submit, confirm the URL becomes `/?q=…` and results narrow. Click clear, confirm the URL returns to `/`. Select a category, confirm `aria-current="page"` lands on it. Tab through the whole row and confirm every control is reachable with a visible focus ring.

- [ ] **Step 5: Checkpoint**

Run `npm run lint && npx tsc --noEmit && npx next build`. Report the four interaction checks. Stop.

---

## Task 19: The chapter band
**Files:**
- Create: `src/features/catalogue/presentation/catalogue-chapter-band.tsx`
- Modify: `src/app/styles/components/diary.css`

**Interfaces:**
- Consumes: `CatalogueChapterPreview` (Task 12), `MediaRailControls` (Task 10), `Card` and `SectionHeader` (Task 11), `CatalogueItemCard` (Task 21).
- Produces: `CatalogueChapterBand({ chapter, index })`, consumed by Task 20.

**Context you need:** this is the component that carries the whole "chương dẫn lối" (chapter-led) direction the spec describes, and the reason the old flat grid is being retired. Each chapter is a block with a large cover, editorial copy and a horizontal rail of up to five items. Bands alternate which side the cover sits on, which gives the page rhythm without asymmetric grid maths — that alternation is the *only* source of asymmetry on the page, so do not add more.

- [ ] **Step 1: Write the component**

Create `catalogue-chapter-band.tsx`:

```tsx
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MediaRailControls } from "@/components/ui/media-rail";
import { CatalogueItemCard } from "@/features/catalogue/presentation/catalogue-item-card";
import { createCataloguePath } from "@/features/catalogue/lib/catalogue-navigation";
import type { CatalogueChapterPreview } from "@/modules/catalogue/domain/catalogue-read-models";

interface CatalogueChapterBandProps {
  chapter: CatalogueChapterPreview;
  index: number;
}

export function CatalogueChapterBand({ chapter, index }: CatalogueChapterBandProps) {
  const { category, items, totalItems } = chapter;
  const number = String(index + 1).padStart(2, "0");
  const bandId = `chapter-${index + 1}`;
  const headingId = `${bandId}-heading`;
  const viewportId = `${bandId}-rail`;
  const isReversed = index % 2 === 1;

  return (
    <section aria-labelledby={headingId} className="diary-container diary-section" id={bandId}>
      <div
        className={`grid gap-8 md:items-center md:gap-12 ${
          isReversed
            ? "md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]"
            : "md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
        }`}
      >
        <div className={isReversed ? "md:order-2" : ""}>
          <div className="diary-image-frame">
            {category.coverImageUrl ? (
              <img
                alt=""
                className="aspect-[5/4] w-full object-cover"
                decoding="async"
                height={760}
                loading={index === 0 ? "eager" : "lazy"}
                src={category.coverImageUrl}
                width={960}
              />
            ) : (
              <div className="aspect-[5/4] w-full bg-brand-soft" aria-hidden="true" />
            )}
          </div>
        </div>

        <div className={isReversed ? "md:order-1" : ""}>
          <div className="flex items-center gap-3">
            <span className="diary-kicker">Chương {number}</span>
            <span className="diary-rule" aria-hidden="true" />
          </div>
          <h2
            className="font-display display-md mt-3 font-semibold text-brand-strong"
            id={headingId}
          >
            {category.name}
          </h2>
          <p className="body-text-sm mt-2 text-muted">
            {totalItems} điều được giữ lại
          </p>
          {category.description ? (
            <p className="body-text mt-4 max-w-prose text-muted">{category.description}</p>
          ) : null}
          {totalItems > 0 ? (
            <Link
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold text-brand transition-[transform,border-color] duration-[var(--motion-base)] ease-[var(--motion-ease)] hover:-translate-y-0.5 hover:border-accent focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus"
              href={createCataloguePath({ categorySlug: category.slug, page: 1, query: null })}
              scroll={false}
              transitionTypes={["collection-change"]}
            >
              Mở chương
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>

      {items.length > 0 ? (
        <div className="media-rail-stage relative mt-8">
          <div className="media-rail-viewport" id={viewportId}>
            <ul className="flex gap-5">
              {items.map((item) => (
                <li className="chapter-rail-frame w-[17rem] shrink-0" key={item.id}>
                  <CatalogueItemCard categoryName={category.name} item={item} />
                </li>
              ))}
            </ul>
          </div>
          <MediaRailControls
            frameClassName="chapter-rail-frame"
            groupLabel={`Điều hướng chương ${category.name}`}
            nextLabel="Điều tiếp theo"
            previousLabel="Điều trước"
            viewportId={viewportId}
          />
        </div>
      ) : null}
    </section>
  );
}
```

- [ ] **Step 2: Add the rail viewport styles**

In `media-rail.css`, inside `@layer components`:

```css
  .media-rail-viewport {
    margin-inline: -1.25rem;
    padding-inline: 1.25rem;
    padding-bottom: 0.65rem;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x proximity;
    scrollbar-color: var(--color-accent) transparent;
  }

  .chapter-rail-frame {
    scroll-snap-align: start;
  }
```

- [ ] **Step 3: Verify the empty-chapter branch**

A chapter with `totalItems === 0` must render its band with the cover and copy but **no rail and no "Mở chương" link**. Confirm by reading the two conditionals above, then verify in the browser once Task 20 wires real data.

- [ ] **Step 4: Checkpoint**

Run `npx tsc --noEmit && npm run lint`. Nothing renders this yet. Report and stop.

---

## Task 20: Mode switch and the second hero's removal
**Files:**
- Modify: `src/app/page.tsx`, `src/features/catalogue/presentation/catalogue-home.tsx`

**Interfaces:**
- Consumes: `backend.listVisibleChapterPreviews` (Task 15), `CatalogueChapterBand` (Task 19), `CatalogueUtilityRow` (Task 18).

**Context you need:** this is the task that removes the duplication. `catalogue-home.tsx:58-115` is a full editorial hero whose `<h1>` is character-for-character identical to the journal's, whose image is `featuredItem.primaryImage` — the same image the featured card renders below it — and whose title is the same `featuredItem.title`. All 58 lines go.

Two `<h1>` on one page is also an accessibility defect; after this task the journal holds the only one.

- [ ] **Step 1: Branch the server reads**

In `page.tsx`, after parsing the parameters:

```tsx
  const isOverview = !categorySlug && !searchQuery;

  if (isOverview) {
    const [categoriesResult, chaptersResult] = await Promise.all([
      backend.listVisibleCategories.execute(actor),
      backend.listVisibleChapterPreviews.execute(actor, { itemsPerChapter: 5 }),
    ]);

    if (!categoriesResult.ok || !chaptersResult.ok) {
      throw new Error("Unable to load catalogue.");
    }

    return (
      <PageTransition>
        <CatalogueHome
          actor={actor}
          categories={categoriesResult.value}
          chapters={chaptersResult.value}
          mode="overview"
          searchQuery={null}
          selectedCategorySlug={null}
        />
      </PageTransition>
    );
  }
```

The existing paged branch stays exactly as it is — including the re-read when the requested page exceeds `pageCount` — and passes `mode={searchQuery ? "search" : "chapter"}` with `itemPage`.

- [ ] **Step 2: Give `CatalogueHome` a discriminated props type**

```tsx
type CatalogueHomeProps =
  | {
      actor: ActiveActor;
      categories: CatalogueCategory[];
      chapters: CatalogueChapterPreview[];
      mode: "overview";
      searchQuery: null;
      selectedCategorySlug: null;
    }
  | {
      actor: ActiveActor;
      categories: CatalogueCategory[];
      itemPage: CatalogueItemPage;
      mode: "chapter" | "search";
      searchQuery: string | null;
      selectedCategorySlug: string | null;
    };
```

A discriminated union means the compiler rejects reading `itemPage` in overview mode, rather than leaving a runtime `undefined`.

- [ ] **Step 3: Delete the second hero**

Remove `catalogue-home.tsx:58-115` in full — the entire `<section>` containing the kicker, the duplicate `<h1>`, the duplicate description, the item count line and the `<aside>` with the rotated image frame and its caption card. Do not relocate the line "Dành riêng cho những điều dịu dàng": the journal's kicker "Một chương dành riêng cho hai người" already says the same thing more specifically.

- [ ] **Step 4: Render the three modes**

Overview renders the utility row, then `chapters.map((chapter, index) => <CatalogueChapterBand chapter={chapter} index={index} key={chapter.category.id} />)`, and `EmptyCollection` when every chapter has `totalItems === 0`.

Chapter mode renders the utility row, a `SectionHeader` naming the chapter, the featured card for page 1 only, the uniform grid, and `CataloguePagination`.

Search mode renders the utility row, a `SectionHeader` reporting the result count, the uniform grid with **no** featured card, and `CataloguePagination`.

- [ ] **Step 5: Replace the modulo grid**

Delete the `index % 5 === 0 ? "lg:col-span-5" : index % 3 === 0 ? "lg:col-span-4" : "lg:col-span-3"` expression and its wrapper `div` with the staggered `animationDelay`. Replace with:

```tsx
<div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(17rem,1fr))]">
  {gridItems.map((item) => (
    <CatalogueItemCard
      categoryName={categoryNames.get(item.categoryId) ?? null}
      item={item}
      key={item.id}
    />
  ))}
</div>
```

The old sequence produced 5+3+3 = 11 of 12 columns, then 4+3+3 = 10 of 12 — guaranteed holes. A uniform auto-fill grid cannot leave one. The per-item `animate-luxury-reveal` with `animationDelay: (index + 2) * 100ms` goes with it: twelve items cost 1.4 seconds of staggered waiting, which is the opposite of quiet.

- [ ] **Step 6: Verify all three modes**

With the dev server running, check in order: `/` shows the journal, the utility row and one band per chapter with no repeated headline and no repeated featured image; `/?category=<slug>` shows one chapter with the featured card and pagination; `/?q=<text>` shows a flat grid with no featured card. Then run:

```bash
grep -c "<h1" src/features/catalogue/presentation/catalogue-home.tsx
```
Expected: `0`.

- [ ] **Step 7: Checkpoint**

Run `npm run lint && npx tsc --noEmit && npx vitest run && npx next build && npm run qa:shots -- / after-chapters`. Report the three-mode check. Stop.

---

## Task 21: Quiet the cards
**Files:**
- Modify: `src/features/catalogue/presentation/catalogue-item-card.tsx`, `src/features/catalogue/presentation/catalogue-featured-item-card.tsx`

**Context you need:** both cards currently carry
`hover:[transform:perspective(1000px)_translateY(-6px)_rotateX(2deg)_rotateY(-2deg)]`,
`hover:shadow-[var(--shadow-luxury-card)]`, `backdrop-blur-sm`, and gradient-filled badges. That vocabulary belongs to a commercial landing page and is what the user asked to remove.

- [ ] **Step 1: Rebuild `catalogue-item-card.tsx` on the primitive**

Replace the hand-rolled root `<Link>` class string with `<Card href={…} interactive transitionTypes={["nav-forward"]}>`. Delete the perspective transform, the `backdrop-blur-sm`, and `hover:shadow-[var(--shadow-luxury-card)]` — `Card` supplies the quiet hover.

Change the category badge from the gradient-and-blur pill to a plain one: `border border-border bg-paper text-brand-strong`, no `Sparkles` icon, no `shadow`. Keep the `absolute left-3 top-3` placement.

Demote the title from `<h2>` to `<h3>` and move it onto the scale: `font-display title-text font-semibold text-brand-strong`. Drop `group-hover:text-brand` — colour-on-hover for a title inside an already-interactive card is noise.

On the "Mở câu chuyện" affordance, keep the arrow but drop `group-hover:translate-x-1` and `group-hover:rotate-12`.

- [ ] **Step 2: Apply the same treatment to the featured card**

Same removals. Keep its two-column `md:grid-cols-[…]` layout and its "Mở ra trước" badge, but restyle that badge as `border border-accent bg-paper text-brand-strong` with no gradient and no blur. Its heading stays `<h3>` and moves to `display-md`.

- [ ] **Step 3: Verify no banned effect survives anywhere**

Run:
```bash
grep -rn "rotateX\|rotateY\|perspective(\|luxury-glow\|animate-luxury-reveal" src --include='*.tsx' --include='*.css'; echo "exit=$?"
```
Expected: `exit=1`. If `--shadow-luxury-*` tokens are now unreferenced, delete them from `tokens.css` too.

- [ ] **Step 4: Verify hover and focus by hand**

Hover a card: it must lift slightly and change border colour, with no tilt and no glow. Tab to it: the focus ring must be visible against both `--color-paper` and `--color-surface`. Check both at 1024px and at 390px, where hover does not exist and the card must still read correctly.

- [ ] **Step 5: Checkpoint**

Run `npm run lint && npx tsc --noEmit && npx next build && npm run qa:shots -- / after-quiet-cards`. Report and stop.

---

## Task 22: Full verification and the Three.js measurement
**Files:** possibly `src/features/catalogue/presentation/cinematic-diary-scene.ts`, `cinematic-diary-geometry.ts`, `src/features/identity/presentation/magical-background.tsx` — only if Step 3 justifies it.

**Context you need:** the spec proposed converting `import * as THREE` to named imports for tree-shaking. That is the weakest item in the spec and it is being treated as a measurement, not a foregone conclusion. Modern bundlers can often tree-shake a namespace import from an ESM package on their own, in which case the change costs 122 careful edits across three files for no benefit — and a wrong edit fails silently, because the scene has no visual test.

**Measure first. Convert only if the measurement justifies it.**

- [ ] **Step 1: Run the full verification suite**

```bash
npm run lint
npx tsc --noEmit
npx vitest run
npx next build
```
Expected: the one known `magical-background.tsx:164` warning and nothing else; type check silent; all tests pass; build succeeds.

- [ ] **Step 2: Browser QA at all five widths, on every touched route**

```bash
npm run qa:shots -- / final-home
npm run qa:shots -- /login final-login
npm run qa:shots -- /hanh-trinh final-timeline
npm run qa:shots -- /thu-hen-ngay-mo final-letters
```
Inspect every image for text overflow, overlap, clipped images and broken columns. Then check by hand, at 390px and 1440px: hover states, focus rings, the mobile navigation menu, and the reduced-motion path with the setting enabled.

- [ ] **Step 3: Measure the Three.js chunk**

Compare the chunk sizes from Task 3 Step 2 against the current build:
```bash
find .next/static/chunks -name '*.js' -size +200k -exec ls -la {} \; | sort -k5 -n | tail -5
```

Then convert **one** file as a probe — `cinematic-diary-geometry.ts`, which has only 7 references — and rebuild. If the chunk does not shrink measurably, the bundler is already tree-shaking the namespace import: revert the probe, record the finding, and skip the conversion. Note it in the spec so a later phase does not retry it blindly.

If it does shrink, convert all three files using this exact list of the 36 symbols in use, and remember `RoundedBoxGeometry` is imported separately from `three/addons` and does not change:

```
AdditiveBlending AmbientLight BufferAttribute BufferGeometry CanvasTexture
CatmullRomCurve3 Color DirectionalLight DoubleSide ExtrudeGeometry
Float32BufferAttribute FogExp2 Group LinearFilter LinearMipmapLinearFilter
Material MathUtils Mesh MeshBasicMaterial MeshPhysicalMaterial
MeshStandardMaterial PCFShadowMap PerspectiveCamera PlaneGeometry PointLight
Points PointsMaterial RepeatWrapping SRGBColorSpace Scene ShaderMaterial
Shape Texture TubeGeometry Vector3 WebGLRenderer
```

After converting, scroll the whole journal animation and watch the browser console — a missed symbol shows up as a runtime `undefined`, not a build error.

- [ ] **Step 4: Confirm the acceptance criteria**

Walk the spec's "Acceptance criteria" section item by item and record evidence for each:
one `<h1>`; navigation reachable inside the first opening movement; no tilt, gradient badge or glow anywhere touched; the grid fills its rows at every item count; no inert Tailwind class on the intro; chapter previews arriving through the use-case boundary in the same query budget; `git diff` free of line-ending noise; all four commands green; QA at five widths done.

- [ ] **Step 5: Checkpoint**

Report every command's output and the acceptance walk-through. Do not create a commit — ask the user whether they want one.

---

## Self-Review

Checked after writing:

**Spec coverage.** Every spec section maps to a task: the two supersessions land in Tasks 16 and 17; the design language in Tasks 16, 17 and 21; the foundation in Tasks 4–11; home architecture and its three modes in Task 20; the header reveal in Task 16; the intro in Task 17; chapter bands in Task 19; the data layer in Tasks 12–15; the shared rail in Task 10; deletions in Tasks 1, 9, 17, 20 and 21; hygiene in Task 1; visual verification access in Task 2; accessibility and responsive contract in Tasks 16, 18, 21 and 22.

**Two gaps found and closed.** The spec assumed the codemod was safe for all `--color-*` names; it is not, because `danger`, `positive` and `skeleton` are absent from `@theme` — Task 4 was added ahead of the codemod to close that. The spec also stated the Three.js conversion as settled; Task 22 Step 3 turns it into a measurement with a revert path, because the benefit is unproven and the failure mode is silent.

**Type consistency.** `CatalogueChapterPreview` carries `category`, `items`, `totalItems` in Tasks 12, 14, 19 and 20 alike. `listChapterPreviews(criteria: CatalogueChapterPreviewCriteria)` is spelled the same in the port, the use case, the adapter and the registration. `MediaRailControls` takes `viewportId`, `frameClassName`, `groupLabel`, `previousLabel`, `nextLabel` in its definition (Task 10), its test, the timeline adapter and the chapter band (Task 19).

**Placeholders.** None. Every code step carries the code; every verification step carries the command and its expected output.
