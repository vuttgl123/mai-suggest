# Visual and Content Audit

## Evidence

- Baseline browser captures were taken at `390x844` and `1440x1000` on 2026-07-17.
- The initial capture also exposed a runtime error in `PreferenceCatalogue`; the
  smoke test in `tests/e2e/catalogue-smoke.spec.ts` now protects that entry path.
- Visual changes are checked again through Playwright at the five release viewports.

## Findings and Decisions

| Area | Observable symptom | Decision | UX reason |
| --- | --- | --- | --- |
| `src/app/globals.css` and `hero-section.tsx` | Two layered gradients and a decorative inset frame make the hero a dark abstract surface; animated content can be absent in an early paint. | Remove the radial treatment and frame; use a solid readability overlay and static content. | The brand and offer are readable immediately and the hero remains tied to its image. |
| `src/components/decorative-elements.tsx` | Heart divider is repeated in content and error states without carrying state or navigation meaning. | Keep only a quiet horizontal divider; remove unused SVG flourish. | Borders already create section rhythm, so the repeated motif adds visual noise. |
| `catalogue-discovery.tsx` | The filter area creates a surface inside the discovery surface. | Use a bordered, unframed control group. | Search and filters scan as one task instead of a card inside a page band. |
| `collection-picker.tsx` | Collection images are heavily darkened and lift on hover. | Reduce overlay/shadow and remove vertical movement. | The collection image remains inspectable and hover does not shift the layout. |
| `preference-catalogue.tsx` and `filter-controls.tsx` | Utility UI includes phrases such as “câu chuyện phía sau”, “mỉm cười”, and “Dịp của mình”. | Replace with direct task/status copy. | Users can identify the next action faster; intimate copy remains in the hero and item messages. |
| `smart-image.tsx` | Product/thumbnail geometry is already stable, but data lacks a repeatable asset audit. | Add a JSON metadata report for URL, alt, hostname and duplicate URL review. | FE-only content can be checked before browser visual QA without fetching or changing data. |

## Visual Principles

1. Brand is visible, but gift images and names remain the primary signal.
2. A section has one task and one primary command.
3. Borders and spacing define hierarchy before a decorative treatment is added.
4. Utility copy states what the user can do or what just happened.
5. Motion is feedback or continuity, never a prerequisite for reading content.

## Image Direction

No raster asset is replaced in this section. The existing image URLs are retained
until a specific image fails the metadata and browser crop checks. Any new raster
asset requires separate approval before `imagegen` is used.
