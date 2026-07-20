# Google OAuth and Route Guard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Google OAuth login/logout and cookie-backed Supabase SSR guards for the private catalogue home page.

**Architecture:** A request-scoped Supabase SSR client refreshes cookies in `src/proxy.ts`; it only validates identity and protects route entry. The existing identity DDD use case remains the business authorization boundary in the home page, where inactive accounts are denied. OAuth route and browser controls handle only session lifecycle.

**Tech Stack:** Next.js 16 App Router, React, TypeScript strict, Vitest, `@supabase/ssr`, `@supabase/supabase-js`.

## Global Constraints

- Use Google OAuth through Supabase only; do not add another provider or email/password authentication.
- Keep Supabase secret/service-role and Google client secret out of the repository and client bundle.
- Do not change the existing database schema, migrations, RLS policies, or legacy catalogue data in this slice.
- Do not commit or push changes; the user owns version-control operations.
- Run test commands in Windows CMD with Node 24 as established by the user.

---

## File Structure

- Create `src/features/identity/lib/auth-navigation.ts`: normalizes internal return paths and declares public OAuth paths.
- Create `src/features/identity/lib/auth-navigation.test.ts`: regression tests for open-redirect prevention and public paths.
- Create `src/lib/supabase/proxy.ts`: creates the request-scoped SSR client and returns a session-refreshed response.
- Create `src/proxy.ts`: Next.js proxy entry point and matcher.
- Create `src/modules/identity/presentation/require-active-page-actor.ts`: server page authorization adapter over `createServerBackend`.
- Create `src/app/auth/callback/route.ts`: PKCE code exchange and safe redirect.
- Create `src/app/login/page.tsx`: server login page that sanitizes `next` and renders the browser button.
- Create `src/features/identity/components/google-sign-in-button.tsx`: Google OAuth browser trigger.
- Create `src/app/access-denied/page.tsx`: inactive-member response.
- Create `src/features/identity/components/sign-out-button.tsx`: Google-session logout control.
- Modify `src/app/page.tsx`: make the private home dynamic and require an active actor.
- Modify `src/features/catalogue/components/site-header.tsx`: render the logout control without moving authentication into catalogue state.

### Task 1: Define safe auth navigation rules

**Files:**
- Create: `src/features/identity/lib/auth-navigation.ts`
- Create: `src/features/identity/lib/auth-navigation.test.ts`

**Interfaces:**
- Produces `normalizeAuthNextPath(value: string | null | undefined): string`.
- Produces `isPublicAuthPath(pathname: string): boolean`.

- [ ] **Step 1: Write the failing test**

```ts
expect(normalizeAuthNextPath("/catalogue?tag=gift")).toBe("/catalogue?tag=gift");
expect(normalizeAuthNextPath("https://attacker.example")).toBe("/");
expect(normalizeAuthNextPath("//attacker.example")).toBe("/");
expect(isPublicAuthPath("/auth/callback")).toBe(true);
expect(isPublicAuthPath("/")).toBe(false);
```

- [ ] **Step 2: Run the focused test to verify it fails**

```cmd
npx.cmd vitest run src/features/identity/lib/auth-navigation.test.ts
```

Expected: failure because the navigation module does not exist.

- [ ] **Step 3: Write the minimal implementation**

```ts
const PUBLIC_AUTH_PATHS = new Set(["/login", "/auth/callback", "/access-denied"]);

export function normalizeAuthNextPath(value: string | null | undefined) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export function isPublicAuthPath(pathname: string) {
  return PUBLIC_AUTH_PATHS.has(pathname);
}
```

- [ ] **Step 4: Run the focused test to verify it passes**

```cmd
npx.cmd vitest run src/features/identity/lib/auth-navigation.test.ts
```

Expected: all assertions pass.

### Task 2: Refresh and guard Supabase sessions at the request boundary

**Files:**
- Create: `src/lib/supabase/proxy.ts`
- Create: `src/proxy.ts`

**Interfaces:**
- Consumes `getSupabasePublicConfig`, `Database`, `normalizeAuthNextPath`, and `isPublicAuthPath`.
- Produces `updateSupabaseSession(request: NextRequest): Promise<NextResponse>`.

- [ ] **Step 1: Add the proxy implementation**

Create a request-scoped `createServerClient<Database>` whose cookie `getAll`
reads `request.cookies`. Its `setAll` writes to both the request and a newly
created `NextResponse`. Call `await supabase.auth.getClaims()` before routing,
set `Cache-Control: private, no-store`, and redirect missing claims from every
non-public path to `/login?next=<pathname-and-search>`.

- [ ] **Step 2: Add the Next.js entry point**

```ts
import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

- [ ] **Step 3: Verify type-check and build integration**

```cmd
npx.cmd tsc --noEmit
npm.cmd run build
```

Expected: Next.js recognizes `src/proxy.ts`; type-check and build complete.

### Task 3: Exchange OAuth code and authorize protected Server Components

**Files:**
- Create: `src/app/auth/callback/route.ts`
- Create: `src/modules/identity/presentation/require-active-page-actor.ts`
- Modify: `src/app/page.tsx`
- Create: `src/app/access-denied/page.tsx`

**Interfaces:**
- Consumes `createServerSupabaseClient`, `normalizeAuthNextPath`, and the server backend composition root.
- Produces a `GET` callback handler and `requireActivePageActor(): Promise<ActiveActor>`.

- [ ] **Step 1: Implement the callback route**

Read `code` and `next` from `request.url`; normalize `next`; exchange a present
code using `exchangeCodeForSession`; redirect the success response to the same
request origin plus the normalized path. On missing code or exchange error,
redirect to `/login?error=oauth_callback_failed`. Set `Cache-Control: private,
no-store` on both redirects.

- [ ] **Step 2: Implement the server authorization adapter**

Call `createServerBackend()` then `getCurrentActor.execute()`. Redirect an
anonymous or unsuccessful result to `/login`; redirect `inactive` to
`/access-denied`; return an `ActiveActor` for active member and owner. Do not
read `user_metadata` or query Supabase from a client component.

- [ ] **Step 3: Protect the home page**

Add `export const dynamic = "force-dynamic";` and await
`requireActivePageActor()` before the existing preference-data read. Do not
change the current catalogue component or data model.

- [ ] **Step 4: Add the inactive page**

Create a small Vietnamese server page explaining that the signed-in Google
account has not been granted access. It must not disclose allow-list entries,
roles, or internal errors.

### Task 4: Add login and logout controls

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/features/identity/components/google-sign-in-button.tsx`
- Create: `src/features/identity/components/sign-out-button.tsx`
- Modify: `src/features/catalogue/components/site-header.tsx`

**Interfaces:**
- Consumes `normalizeAuthNextPath` on the server page and `createBrowserSupabaseClient` in client controls.
- Produces a Google-only login trigger and a sign-out control.

- [ ] **Step 1: Implement the server login page**

Read `searchParams.next` and `searchParams.error`, normalize `next`, then pass
only the normalized path to the client Google button. Render a concise error
message only for `oauth_callback_failed`.

- [ ] **Step 2: Implement the Google button**

On click, create the browser Supabase client and invoke
`auth.signInWithOAuth({ provider: "google", options: { redirectTo } })`, where
`redirectTo` is `new URL("/auth/callback", window.location.origin)` with its
`next` query parameter. Disable while pending and show a generic Vietnamese
error without logging or rendering provider credentials.

- [ ] **Step 3: Implement logout**

On click, call `auth.signOut()` through the browser client; on success use
`router.replace("/login")` and `router.refresh()`. Preserve a visible generic
error if sign-out fails.

- [ ] **Step 4: Render the logout control in the existing client header**

Import `SignOutButton` directly in `SiteHeader`; leave existing catalogue
selection props and interactions unchanged.

### Task 5: Verify the OAuth slice

**Files:**
- Verify: auth navigation test, existing DDD tests, build output.

- [ ] **Step 1: Run automated verification**

```cmd
npx.cmd tsc --noEmit
npm.cmd test
npm.cmd run test:verify:supabase
npm.cmd run lint -- --ignore-pattern .next
npm.cmd run build
```

Expected: all commands exit successfully.

- [ ] **Step 2: Run manual OAuth verification**

1. Visit `/` while signed out and confirm the redirect to `/login?next=/`.
2. Complete Google login and confirm `/auth/callback` returns to `/`.
3. Test a Google account that has no active profile and confirm `/access-denied`.
4. Test an active member and an owner; both must enter `/`.
5. Click logout and confirm a new request to `/` returns to login.

## Plan Self-Review

- Every feature requirement maps to a task: PKCE callback (Task 3), session
  refresh and anonymous guard (Task 2), business-role guard (Task 3), login and
  logout UI (Task 4), and automated/manual checks (Task 5).
- Redirect normalization is defined once and consumed at each untrusted
  boundary. No schema, RLS, secret, or data-migration work is in scope.
- All paths and public interfaces are explicit; no placeholders remain.
