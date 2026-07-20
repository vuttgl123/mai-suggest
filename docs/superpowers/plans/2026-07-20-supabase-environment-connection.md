# Supabase Environment Connection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure the minimum safe Supabase environment and prove this Next.js project can make a read-only database API request.

**Architecture:** A Node-only verification script reads the two public Supabase configuration variables supplied by Next.js's `.env.local` loading mechanism. It creates an unauthenticated Supabase JS client with session persistence disabled and makes a bounded, head-only query to `categories`; the script reports only a sanitized status. This does not connect UI components, bypass RLS, or validate Google OAuth.

**Tech Stack:** Next.js App Router, Node.js 22 `--env-file` and built-in test runner, `@supabase/supabase-js`, `@supabase/ssr`.

## Global Constraints

- Use `.env.local` for local credential values and `.env.example` for blank variable names.
- The only values used in this phase are `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Do not copy Postgres, service-role, JWT or Google secrets into new files.
- The verification query must be read-only and must not disable or alter RLS.
- Do not print credential values, URLs, tokens or returned records.
- Do not change UI, mock-data loading, schema, migration, RLS or Google OAuth in this plan.
- Use `rtk` for discovery and verification output; use `apply_patch` for repository file changes.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `.gitignore` | Exclude local environment values and the existing plaintext secret source from Git. |
| `.env.example` | Document the two required client-safe variable names without values. |
| `.env.local` | Hold the two authorized local values; remain untracked. |
| `scripts/verify-supabase-connection.mjs` | Validate local environment and issue the bounded, head-only Supabase request. |
| `scripts/verify-supabase-connection.test.mjs` | Regression test for missing-environment failure without network access. |
| `package.json` | Declare the Supabase packages and `verify:supabase` command. |

### Task 1: Make the connection check testable and add dependency commands

**Files:**
- Create: `scripts/verify-supabase-connection.test.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: Node executable from `process.execPath`; future script path `scripts/verify-supabase-connection.mjs`.
- Produces: failing test specifying that absent configuration returns exit code `1` and the exact generic error `Missing required Supabase environment configuration.`

- [ ] **Step 1: Add the failing process-level test**

```js
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import test from "node:test";

test("fails without Supabase environment values without starting a network request", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/verify-supabase-connection.mjs"],
    {
      cwd: process.cwd(),
      env: { PATH: process.env.PATH },
      encoding: "utf8",
    },
  );

  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.equal(
    result.stderr,
    "Missing required Supabase environment configuration.\n",
  );
});
```

- [ ] **Step 2: Run the test to prove it fails before the script exists**

Run: `rtk run 'node --test scripts/verify-supabase-connection.test.mjs'`

Expected: FAIL because Node cannot find `scripts/verify-supabase-connection.mjs`, so stderr differs from the specified generic error.

- [ ] **Step 3: Install the approved Supabase dependencies**

Run: `npm install --save-exact @supabase/supabase-js@2.110.7 @supabase/ssr@0.12.3`

Expected: `package.json` pins both runtime dependencies to `2.110.7` and `0.12.3`, and `package-lock.json` resolves their transitive dependencies. Do not add a direct PostgreSQL client.

- [ ] **Step 4: Add explicit npm commands**

Add these entries to `package.json` `scripts`:

```json
"test:verify:supabase": "node --test scripts/verify-supabase-connection.test.mjs",
"verify:supabase": "node --env-file=.env.local scripts/verify-supabase-connection.mjs"
```

- [ ] **Step 5: Run the focused test again**

Run: `rtk npm run test:verify:supabase`

Expected: still FAIL until Task 2 creates the script.

### Task 2: Implement the sanitized read-only verification script

**Files:**
- Create: `scripts/verify-supabase-connection.mjs`
- Test: `scripts/verify-supabase-connection.test.mjs`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from `process.env`.
- Produces: exit code `0` and `Supabase connection check passed.` for a successful request; exit code `1` and a sanitized error otherwise.

- [ ] **Step 1: Create the minimal script**

```js
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    console.error("Missing required Supabase environment configuration.");
    process.exitCode = 1;
    return;
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
  const { error } = await supabase
    .from("categories")
    .select("id", { head: true, count: "exact" })
    .limit(1);

  if (error) {
    console.error(`Supabase connection check failed: ${error.code ?? "unknown"}.`);
    process.exitCode = 1;
    return;
  }

  console.log("Supabase connection check passed.");
}

void main();
```

- [ ] **Step 2: Run the focused test to prove the missing-environment path passes**

Run: `rtk npm run test:verify:supabase`

Expected: PASS with one test; no network call is made because the variables are absent.

- [ ] **Step 3: Run the script without an env file only for the validation path**

Run: `node scripts/verify-supabase-connection.mjs`

Expected: exit code `1` and exactly `Missing required Supabase environment configuration.` on stderr.

### Task 3: Add local environment files and make accidental secret commits impossible

**Files:**
- Modify: `.gitignore`
- Create: `.env.example`
- Create: `.env.local` (untracked)

**Interfaces:**
- Consumes: the user-authorized existing source values named `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`.
- Produces: the exact client-safe variable names required by Task 2; no server secret variables.

- [ ] **Step 1: Add ignore rules**

Append these rules to `.gitignore`:

```gitignore
# local Supabase configuration
.env.local
.env.*.local
docs/secret
```

- [ ] **Step 2: Add the tracked template**

Create `.env.example` exactly as follows:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

- [ ] **Step 3: Create the local file without exposing values**

Map the authorized source values into `.env.local` without printing them in a
command, diff, log, test failure or documentation:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=<value of SUPABASE_URL from the authorized secret source>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<value of SUPABASE_PUBLISHABLE_KEY from the authorized secret source>
```

Do not copy the duplicate anon key, Postgres connection strings, service-role key,
JWT secret or Google credential.

- [ ] **Step 4: Verify Git does not see the local secret file**

Run: `git check-ignore -v .env.local docs/secret && git status --short --ignored .env.local docs/secret`

Expected: both paths resolve to the new ignore rules; no credential value appears.

### Task 4: Prove the database connection and run repository checks

**Files:**
- Verify only: `.env.local`, `scripts/verify-supabase-connection.mjs`, `package.json`

**Interfaces:**
- Consumes: Task 2 script and Task 3 local configuration.
- Produces: evidence that the request reaches Supabase; no claim about Auth or RLS authorization coverage.

- [ ] **Step 1: Run the real read-only connectivity request**

Run: `rtk npm run verify:supabase`

Expected: `Supabase connection check passed.` and exit code `0`. On failure, report only the sanitized error code and investigate configuration/network/RLS separately; do not try a service-role key.

- [ ] **Step 2: Run focused and full unit tests**

Run: `rtk npm run test:verify:supabase` and `rtk test`

Expected: focused test and existing Vitest suite pass.

- [ ] **Step 3: Run lint and production build**

Run: `rtk npm run lint` and `rtk next build`

Expected: both commands exit `0`.

- [ ] **Step 4: Review the delivered diff for secret safety**

Run: `git diff --check && git status --short --ignored .env.local docs/secret`

Expected: no whitespace errors in touched files; `.env.local` and `docs/secret` are ignored; no secret value appears in tracked diff.
