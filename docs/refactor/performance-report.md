# Performance Verification Report

Date: 2026-07-17

## Production Build

- `npm run build`: passed.
- Routes emitted: `/`, `/_not-found`, `/icon.svg`.
- The catalogue is statically prerendered; selection state remains browser-local.
- No bundle or image configuration warnings were emitted by the production build.

## Render and Image Checks

- Hero content no longer relies on an entrance animation before it is readable.
- `SmartImage` keeps fixed geometry for product (`4:5`), thumbnail (square) and
  hero variants, including its error fallback.
- `npm run check:images` validates 59 JSON image references for HTTPS, non-empty
  alt text and configured `next/image` hostnames. The 16 duplicate URLs reported
  are intentional cover/collection reuse and remain a content-review signal.

## Browser Evidence

- Playwright smoke, responsive and accessibility checks run against the local app.
- The responsive suite checks 320, 390, 768, 1024 and 1440px for document-level
  horizontal overflow.
- Axe checks the initial catalogue against WCAG A/AA tags.

## Lighthouse Lab Status

Lighthouse was attempted against the production server but its Chrome launcher in
this WSL environment opened a DevTools port that the CLI could not reconnect to.
No Lighthouse score is recorded; lab scores must not be inferred from the build or
Playwright outcomes. The temporary Lighthouse dependency was removed rather than
left in the dev dependency tree.
