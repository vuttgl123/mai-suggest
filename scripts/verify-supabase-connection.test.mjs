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
