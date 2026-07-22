# Immersive Seasonal Theme Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Project convention prohibits subagent delegation unless the user explicitly requests it.

**Goal:** Turn the five existing global theme keys into full-site art-direction scenes with a static SSR atmosphere layer, scene-specific shared surfaces, restrained ambient motion, and a visual Owner picker.

**Architecture:** Keep `RootLayout` and `ResolveSiteTheme` as the existing server source of truth. Add a stateless `ThemeAtmosphere` behind all route content, then use `data-theme`-scoped semantic CSS tokens to transform the shell, shared header, cards, controls, and editorial surfaces. The Owner picker stays a Client Component but only calls the existing `setManualSiteThemeAction` through its present callback.

**Tech Stack:** Next.js App Router, React Server Components and Client Components, TypeScript strict, Tailwind CSS, CSS custom properties/keyframes, Lucide React, existing Supabase-backed Server Actions.

## Global Constraints

- Preserve the existing keys `bordeaux`, `valentine`, `spring`, `noel`, and `anniversary`; the resolved `data-theme` attribute on `body`; theme schedule precedence; manual override; Supabase schema; RLS; readers; Server Actions; and all domain types.
- Do not add a new route, dependency, image asset, remote request, client polling, custom theme builder, raw CSS input, migration, or database/RLS change.
- Decorative markup is `aria-hidden`, fixed behind content, and `pointer-events: none`; all interactive behavior remains in the current components.
- Animated scene layers use only `opacity` and `transform`; reduced motion freezes ambient movement and keeps the final readable scene.
- Use `apply_patch`; do not create a commit or branch.
- The user previously requested test, lint, build, type-check, and browser QA be skipped unless they explicitly reverse that choice. Use source/diff checks only and report that verification boundary accurately.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/components/theme/theme-atmosphere.tsx` | Stateless, server-safe root ornament layer with constant decorative markup and an approved theme key prop. |
| `src/app/layout.tsx` | Renders `ThemeAtmosphere` from the existing server-resolved theme before route children. |
| `src/app/globals.css` | Defines full-scene tokens, backdrop/ornament compositions, shared-surface treatment, gallery previews, compositor-only keyframes, and reduced-motion fallbacks. |
| `src/components/app-header.tsx` | Adds semantic class anchors for scene-specific header and mark treatment without changing navigation or actor logic. |
| `src/features/site-theme/presentation/theme-scene-picker.tsx` | Presentation-only visual gallery retaining native radio inputs and invoking the parent’s current `onChange` callback. |
| `src/features/site-theme/presentation/admin-site-theme.tsx` | Replaces the basic preset radio list with `ThemeScenePicker`, preserving all existing state, action, feedback, and schedule behavior. |

### Task 1: Add the server-safe scene layer

**Files:**

- Create: `src/components/theme/theme-atmosphere.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**

- Consumes `SiteThemeKey` from `src/modules/site-theme/domain/site-theme-models.ts`.
- Produces `ThemeAtmosphere({ theme }: { theme: SiteThemeKey })` with no state, effect, data request, callback, or interaction.
- `RootLayout` continues to pass the same `theme.key` to `body[data-theme]` and adds this component before `{children}`.

- [ ] **Step 1: Create the constant decorative scene markup.**

  Add `src/components/theme/theme-atmosphere.tsx`. Do not switch markup by key; CSS composes the scene from `data-theme` and `data-scene`.

  ```tsx
  import type { SiteThemeKey } from "@/modules/site-theme/domain/site-theme-models";

  interface ThemeAtmosphereProps {
    theme: SiteThemeKey;
  }

  export function ThemeAtmosphere({ theme }: ThemeAtmosphereProps) {
    return (
      <div aria-hidden="true" className="theme-atmosphere" data-scene={theme}>
        <span className="theme-atmosphere__wash" />
        <span className="theme-atmosphere__glow theme-atmosphere__glow--one" />
        <span className="theme-atmosphere__glow theme-atmosphere__glow--two" />
        <span className="theme-atmosphere__ornament theme-atmosphere__ornament--one" />
        <span className="theme-atmosphere__ornament theme-atmosphere__ornament--two" />
        <span className="theme-atmosphere__specks" />
      </div>
    );
  }
  ```

- [ ] **Step 2: Render the atmosphere from the existing SSR result.**

  In `src/app/layout.tsx`, add the direct import and render `ThemeAtmosphere` immediately inside `body`, before `{children}`. Leave the existing `createServerBackend`, `resolveSiteTheme`, fonts, metadata, viewport, and `data-theme={theme.key}` unchanged.

  ```tsx
  import { ThemeAtmosphere } from "@/components/theme/theme-atmosphere";

  <body className={`${displayFont.variable} ${bodyFont.variable}`} data-theme={theme.key}>
    <ThemeAtmosphere theme={theme.key} />
    {children}
  </body>
  ```

- [ ] **Step 3: Source-check the server/client boundary.**

  Run:

  ```bash
  rg -n 'ThemeAtmosphere|use client|useState|useEffect|data-theme' src/app/layout.tsx src/components/theme/theme-atmosphere.tsx
  ```

  Expected: `RootLayout` is still async and supplies both `data-theme={theme.key}` and `theme={theme.key}`; `ThemeAtmosphere` contains neither a client directive nor client hooks.

### Task 2: Turn CSS tokens into distinct full-site scenes

**Files:**

- Modify: `src/app/globals.css`
- Modify: `src/components/app-header.tsx`

**Interfaces:**

- Consumes the constant class names from Task 1 and `body[data-theme="…"]` already owned by `RootLayout`.
- Produces CSS-only variations for page frame, shared surfaces, header, controls, ornament layers, gallery previews, and reduced-motion state.
- Preserves all existing feature markup, Tailwind utilities, View Transition styles, focus styles, and future-letter animation selectors.

- [ ] **Step 1: Introduce scene-level semantic tokens in `:root`.**

  Add tokens beside the existing `--theme-*` values; use them as semantic materials rather than theme-specific literals in feature components.

  ```css
  --theme-frame-border: rgb(101 12 28 / 16%);
  --theme-frame-inset: inset 0 0 0 1px rgb(255 249 243 / 44%);
  --theme-header-pattern: linear-gradient(90deg, transparent, rgb(166 91 69 / 18%), transparent);
  --theme-card-highlight: linear-gradient(135deg, rgb(255 255 255 / 44%), transparent 48%);
  --theme-ornament-one: radial-gradient(circle, rgb(166 91 69 / 24%), transparent 68%);
  --theme-ornament-two: linear-gradient(135deg, transparent 45%, rgb(101 12 28 / 13%) 46% 54%, transparent 55%);
  --theme-specks: repeating-radial-gradient(circle at 0 0, rgb(49 5 12 / 10%) 0 0.7px, transparent 0.9px 8px);
  --theme-scene-motion: 18s;
  --theme-scene-scale: 1;
  ```

  Each of the five `body[data-theme="…"]` selectors must override at least
  `--radius-card`, `--radius-dialog`, `--theme-frame-border`,
  `--theme-header-pattern`, `--theme-card-highlight`, both ornament tokens,
  `--theme-specks`, and scene motion values. Use the approved scene table from the
  design: writing desk, ruby letters, botanical scrapbook, winter postcard, and
  memory gallery.

- [ ] **Step 2: Replace the former two pseudo-element atmosphere with the scene layer.**

  Keep `body` as the document background, but make the new layer the only fixed
  atmosphere owner. Add these shared rules after the base `body` block and remove
  the old `body::before`/`body::after` fixed-layer rules so the page does not paint
  duplicate grain.

  ```css
  .theme-atmosphere {
    position: fixed;
    z-index: -1;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .theme-atmosphere > span {
    position: absolute;
    pointer-events: none;
  }

  .theme-atmosphere__wash {
    inset: 0;
    background: var(--theme-atmosphere);
  }

  .theme-atmosphere__glow {
    width: min(44rem, 92vw);
    aspect-ratio: 1;
    border-radius: 999px;
    background: var(--theme-ornament-one);
    opacity: 0.78;
    will-change: transform;
  }

  .theme-atmosphere__glow--one { top: -18rem; left: -15rem; }
  .theme-atmosphere__glow--two { right: -18rem; bottom: -20rem; background: var(--theme-ornament-two); }
  .theme-atmosphere__ornament { width: 22rem; aspect-ratio: 1; background: var(--theme-ornament-two); opacity: 0.54; }
  .theme-atmosphere__ornament--one { top: 18%; right: -8rem; }
  .theme-atmosphere__ornament--two { bottom: 8%; left: -9rem; transform: rotate(24deg); }
  .theme-atmosphere__specks { inset: 0; background-image: var(--theme-specks); opacity: 0.32; mix-blend-mode: multiply; }
  ```

- [ ] **Step 3: Add scene composition, frame, and shared-surface treatments.**

  Define one `body[data-theme="…"] .theme-atmosphere` rule per key. The rules use
  the same static spans but assign distinctive geometry: Bordeaux ink lines and
  warm glow; Valentine ribbon diagonals and ruby halo; Spring soft collage blocks
  and petal specks; Noel window-light/postcard geometry; Anniversary gilt rules
  and gallery spotlight. Do not add image URLs.

  Add these common anchors so every existing page inside `.diary-shell` inherits
  scene framing without business-component changes:

  ```css
  .diary-shell {
    position: relative;
    isolation: isolate;
  }

  .diary-shell::before {
    position: fixed;
    z-index: -1;
    inset: 0.65rem;
    border: 1px solid var(--theme-frame-border);
    border-radius: calc(var(--radius-dialog) + 0.35rem);
    box-shadow: var(--theme-frame-inset);
    pointer-events: none;
    content: "";
  }

  .app-header {
    position: relative;
    background-image: var(--theme-header-pattern);
  }

  .app-header::after {
    position: absolute;
    right: 8%;
    bottom: 0;
    left: 8%;
    height: 1px;
    background: var(--theme-header-pattern);
    content: "";
  }

  .app-header-mark { box-shadow: var(--theme-button-shadow-strong); }
  .paper-card, .timeline-entry-card { background-image: var(--theme-card-highlight); }
  ```

  In `src/components/app-header.tsx`, append `app-header` to the existing header
  class and `app-header-mark` to the existing circular Heart mark class. Keep every
  link, `activeSection`, actor condition, text, and `viewTransitionName` unchanged.

- [ ] **Step 4: Add bounded compositor motion and mobile/reduced-motion rules.**

  Add only transform/opacity animations for the glow, ornament, and sparse-speck
  layers. The scene is fully visible without them.

  ```css
  @keyframes theme-drift {
    50% { transform: translate3d(2.5rem, 1.25rem, 0) scale(var(--theme-scene-scale)); }
  }

  @keyframes theme-shimmer {
    50% { opacity: 0.54; transform: translate3d(-1.5rem, 1rem, 0) rotate(8deg); }
  }

  .theme-atmosphere__glow--one { animation: theme-drift var(--theme-scene-motion) ease-in-out infinite; }
  .theme-atmosphere__ornament--one { animation: theme-shimmer calc(var(--theme-scene-motion) * 1.2) ease-in-out infinite; }

  @media (max-width: 639px) {
    .theme-atmosphere__ornament--two { display: none; }
    .theme-atmosphere__glow { width: 30rem; }
    .diary-shell::before { inset: 0.35rem; }
  }
  ```

  Extend the existing `prefers-reduced-motion` block with `.theme-atmosphere,
  .theme-atmosphere * { animation: none !important; transform: none !important; }`.
  Do not weaken the current global reduced-motion rule or delete future-letter
  behavior.

- [ ] **Step 5: Source-check scene completeness.**

  Run:

  ```bash
  rg -n 'theme-atmosphere|theme-frame|theme-ornament|data-theme="(bordeaux|valentine|spring|noel|anniversary)"|prefers-reduced-motion|app-header-mark' src/app/globals.css src/components/app-header.tsx
  ```

  Expected: all five key selectors define scene tokens; the scene layer has no
  interactive property; the reduced-motion block includes the new layer; and the
  shared header exposes both semantic class anchors.

### Task 3: Replace the basic Owner radios with a visual scene gallery

**Files:**

- Create: `src/features/site-theme/presentation/theme-scene-picker.tsx`
- Modify: `src/features/site-theme/presentation/admin-site-theme.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**

- Consumes `SiteThemeKey` and `SITE_THEME_PRESETS` from the unchanged domain
  registry.
- Produces `ThemeScenePicker` with native radio input semantics and the exact
  callback `onChange(themeKey: SiteThemeKey | null): void`.
- `AdminSiteTheme` passes its current `settings.manualThemeKey`, `isPending`, and
  existing `chooseMode` function; no action is imported by the new picker.

- [ ] **Step 1: Create a presentation-only scene choice registry.**

  Add `src/features/site-theme/presentation/theme-scene-picker.tsx`. Keep display
  icons and preview copy in this presentation file, not in the domain model.

  ```tsx
  import { BookOpenText, CalendarClock, Flower2, HeartHandshake, Snowflake, Sparkles, type LucideIcon } from "lucide-react";
  import { SITE_THEME_PRESETS, type SiteThemeKey } from "@/modules/site-theme/domain/site-theme-models";

  interface ThemeScenePickerProps {
    disabled: boolean;
    manualThemeKey: SiteThemeKey | null;
    onChange: (themeKey: SiteThemeKey | null) => void;
  }

  const sceneIcons: Record<SiteThemeKey, LucideIcon> = {
    anniversary: Sparkles,
    bordeaux: BookOpenText,
    noel: Snowflake,
    spring: Flower2,
    valentine: HeartHandshake,
  };

  export function ThemeScenePicker({ disabled, manualThemeKey, onChange }: ThemeScenePickerProps) {
    return (
      <fieldset className="theme-scene-picker mt-5 grid gap-3" disabled={disabled}>
        <legend className="sr-only">Chế độ không khí giao diện</legend>
        <label className={`theme-scene-choice theme-scene-choice--automatic ${manualThemeKey === null ? "is-selected" : ""}`}>
          <input checked={manualThemeKey === null} name="site-theme-mode" onChange={() => onChange(null)} type="radio" />
          <span className="theme-scene-choice__preview" aria-hidden="true"><CalendarClock size={18} /></span>
          <span><strong>Tự động theo lịch</strong><small>Không có lịch thì dùng Bordeaux Diary.</small></span>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          {SITE_THEME_PRESETS.map((preset) => {
            const Icon = sceneIcons[preset.key];
            const isSelected = manualThemeKey === preset.key;
            return (
              <label className={`theme-scene-choice ${isSelected ? "is-selected" : ""}`} key={preset.key}>
                <input checked={isSelected} name="site-theme-mode" onChange={() => onChange(preset.key)} type="radio" />
                <span className="theme-scene-choice__preview" data-theme-preview={preset.key} aria-hidden="true"><Icon size={20} /></span>
                <span><strong>{preset.label}</strong><small>{preset.description}</small></span>
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }
  ```

  The picker needs no client directive because it owns no React state; it is imported by the existing Client
  Component and receives the callback as a prop.

- [ ] **Step 2: Integrate the gallery without changing management behavior.**

  In `AdminSiteTheme`, remove the current manual/automatic `fieldset` and preset
  `.map` only. Keep `chooseMode`, `isPending`, `settings`, feedback, resolved
  panel, schedule controls, `showComposer`, and `editingSchedule` exactly as they
  are. Import and render:

  ```tsx
  <ThemeScenePicker
    disabled={isPending}
    manualThemeKey={settings.manualThemeKey}
    onChange={chooseMode}
  />
  ```

  Remove the now-unused `SITE_THEME_PRESETS` import. Keep the existing `Palette`
  heading and explanatory copy above the picker.

- [ ] **Step 3: Style gallery previews with static scene materials.**

  Add these CSS anchors to `globals.css`; then define a `data-theme-preview` rule
  for each of the five current keys using a small static composition that mirrors
  its root scene without animation.

  ```css
  .theme-scene-choice {
    display: grid;
    grid-template-columns: 5.5rem minmax(0, 1fr);
    gap: 0.85rem;
    align-items: center;
    min-height: 7rem;
    cursor: pointer;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    padding: 0.75rem;
    color: var(--color-brand-strong);
    background: var(--theme-control-surface);
    transition: border-color var(--duration-fast), box-shadow var(--duration-fast), transform var(--duration-fast);
  }

  .theme-scene-choice:has(input:focus-visible) { outline: 3px solid var(--color-focus); outline-offset: 3px; }
  .theme-scene-choice:hover, .theme-scene-choice.is-selected { border-color: var(--color-accent); box-shadow: var(--shadow-soft); }
  .theme-scene-choice.is-selected { background: var(--color-brand-soft); }
  .theme-scene-choice input { position: absolute; inline-size: 1px; block-size: 1px; opacity: 0; }
  .theme-scene-choice__preview { position: relative; display: grid; min-height: 5.25rem; place-items: center; overflow: hidden; border: 1px solid rgb(255 255 255 / 44%); border-radius: calc(var(--radius-card) - 0.5rem); color: white; background: var(--color-brand); }
  .theme-scene-choice strong, .theme-scene-choice small { display: block; }
  .theme-scene-choice small { margin-top: 0.3rem; color: var(--color-muted); font-size: 0.75rem; font-weight: 500; line-height: 1.35; }
  ```

  Ensure the auto choice spans the gallery width and remains visually distinct from
  manual scene choices. The native radio inputs retain group semantics despite the
  custom visual preview.

- [ ] **Step 4: Source-check the action and accessibility boundary.**

  Run:

  ```bash
  rg -n 'ThemeScenePicker|setManualSiteThemeAction|chooseMode|site-theme-mode|aria-hidden|data-theme-preview' src/features/site-theme/presentation src/app/globals.css
  ```

  Expected: `setManualSiteThemeAction` remains only in `AdminSiteTheme`; each
  visual choice has a native `site-theme-mode` radio; preview layers are hidden
  from assistive technology; and all five preview keys are declared.

### Task 4: Perform the allowed source-only handoff checks

**Files:**

- Modify: no files expected
- Inspect: `src/app/layout.tsx`, `src/app/globals.css`, `src/components/app-header.tsx`, `src/components/theme/theme-atmosphere.tsx`, `src/features/site-theme/presentation/theme-scene-picker.tsx`, and `src/features/site-theme/presentation/admin-site-theme.tsx`

**Interfaces:**

- Consumes the scene layer, CSS selectors, shared header anchors, and picker from Tasks 1–3.
- Produces evidence limited to source scope and diff hygiene. It does not claim a
  test, type-check, build, browser, performance, or accessibility result.

- [ ] **Step 1: Inspect changed paths.**

  Run:

  ```bash
  git diff --name-only -- src/app/layout.tsx src/app/globals.css src/components/app-header.tsx src/components/theme src/features/site-theme/presentation/admin-site-theme.tsx src/features/site-theme/presentation/theme-scene-picker.tsx
  ```

  Expected: only the approved root presentation, shared header, and site-theme
  presentation paths appear. If a domain, action, repository, migration, RLS, or
  route file appears, remove that out-of-scope change.

  Then run:

  ```bash
  git status --short -- src/components/theme src/features/site-theme/presentation/theme-scene-picker.tsx
  ```

  Expected: the two newly created presentation files appear as untracked until the
  user expressly asks for staging or a commit; no domain or database file appears.

- [ ] **Step 2: Check whitespace and semantic scene coverage.**

  Run:

  ```bash
  git diff --check
  ```

  Expected: no output and exit code `0`.

  Then run:

  ```bash
  rg -n 'data-theme="(bordeaux|valentine|spring|noel|anniversary)"|data-theme-preview="(bordeaux|valentine|spring|noel|anniversary)"|prefers-reduced-motion|ThemeAtmosphere' src/app src/components src/features/site-theme
  ```

  Expected: all five root scenes and all five gallery previews exist; the reduced
  motion override includes the atmosphere; and `RootLayout` renders the scene layer.

- [ ] **Step 3: State the verification boundary accurately.**

  Report the changed-path, whitespace, and source-coverage results. Explicitly
  state that tests, lint, build, type-check, browser QA, and visual performance
  profiling were not run because the user asked to skip them. Do not claim they
  passed.
