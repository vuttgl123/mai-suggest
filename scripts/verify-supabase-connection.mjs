import { writeSync } from "node:fs";

function fail(message) {
  writeSync(process.stderr.fd, `${message}\n`);
  process.exitCode = 1;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    fail("Missing required Supabase environment configuration.");
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
    fail(`Supabase connection check failed: ${error.code ?? "unknown"}.`);
    return;
  }

  console.log("Supabase connection check passed.");
}

await main();
