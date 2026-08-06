import { normalizeAuthNextPath } from "@/features/identity/lib/auth-navigation";
import { MagicalLoginClient } from "@/features/identity/presentation/magical-login-client";

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<{
    error?: string | string[];
    next?: string | string[];
  }>;
}

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = normalizeAuthNextPath(firstSearchParam(params.next));
  const hasCallbackError = firstSearchParam(params.error) === "oauth_callback_failed";

  return <MagicalLoginClient nextPath={nextPath} hasCallbackError={hasCallbackError} />;
}
