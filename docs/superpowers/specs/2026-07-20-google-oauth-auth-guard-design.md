# Google OAuth and route guard design

## Goal

Add Google-only authentication through Supabase SSR so that the catalogue home
page is private, sessions are refreshed through Next.js `proxy.ts`, and a
member must be active in the existing `profiles`/RLS model before accessing the
application.

## Scope

- Anonymous visitors requesting `/` are redirected to `/login?next=/`.
- `/login` provides a Google OAuth button only. It starts Supabase's PKCE OAuth
  flow and uses `/auth/callback` as the allowed redirect URL.
- `/auth/callback` exchanges the authorization code for a cookie-backed session
  and redirects only to a validated internal path.
- `src/proxy.ts` refreshes sessions with `auth.getClaims()` and preserves the
  resulting cookie updates on its response.
- The home page verifies the current actor through the existing identity
  application layer. An active `member` or `owner` may continue. An inactive
  or profile-less signed-in account is redirected to `/access-denied`.
- A small client logout control calls `auth.signOut()` and returns to `/login`.

## Boundaries

- The feature uses `@supabase/ssr` and the existing typed public Supabase
  clients. No service-role key, Google client secret, migration, RLS change, or
  new provider is introduced.
- The existing preference catalogue stays unchanged apart from its page being
  protected and its header gaining a logout control. Replacing legacy catalogue
  data with Supabase data is a later vertical slice.
- `proxy.ts` checks a verified Supabase claim only. Business status is evaluated
  by `GetCurrentActor` in the server page, rather than trusting client state or
  JWT user metadata.

## Request flow

1. A protected request passes through `src/proxy.ts`. The proxy creates a
   request-scoped SSR client, calls `auth.getClaims()`, and returns a response
   carrying any refreshed session cookies. Missing or invalid claims redirect to
   `/login` unless the path is an OAuth public path.
2. The login button creates the browser client and invokes
   `signInWithOAuth({ provider: "google" })` with the current origin's
   `/auth/callback` route and a sanitized `next` path.
3. Supabase returns an authorization code to the callback. The route handler
   exchanges it with `exchangeCodeForSession`, which writes the session cookies,
   then redirects to the validated internal path. A failed exchange returns the
   visitor to `/login?error=oauth_callback_failed`.
4. The protected home page gets `CurrentActor` through the composition root.
   Active actors render the existing catalogue; inactive actors are redirected
   to `/access-denied`.
5. Logout uses the browser client, clears the session through Supabase, then
   replaces the route with `/login` and refreshes React Server Components.

## Security and caching

- Internal redirect values must start with one slash and must not start with
  `//`; all other values resolve to `/` to prevent open redirects.
- The proxy uses `getClaims()`, not `getSession()`, to validate identity.
- The home page is explicitly dynamic; authenticated routes and auth responses
  use `Cache-Control: private, no-store` so a session cookie cannot be cached
  and served to another visitor.
- Google OAuth configuration remains external: Supabase has the Google client
  secret; the browser only receives the Supabase URL and publishable key.

## Verification

- Unit tests cover safe internal redirect normalization and public OAuth-path
  classification.
- Run TypeScript, the Vitest suite, the Node Supabase configuration test, lint
  excluding `.next`, and production build.
- Manually test production and local OAuth flows: anonymous redirect, Google
  approval, callback/session persistence, inactive access denial, active access,
  owner access, and logout.
