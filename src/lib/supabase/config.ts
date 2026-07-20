export interface SupabasePublicConfig {
  url: string;
  publishableKey: string;
}

type PublicEnvironment = Readonly<Record<string, string | undefined>>;

export function getSupabasePublicConfig(
  environment: PublicEnvironment = process.env,
): SupabasePublicConfig {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Missing required Supabase public configuration.");
  }

  return { url, publishableKey };
}
