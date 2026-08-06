import { NextResponse } from "next/server";
import { normalizeAuthNextPath } from "@/features/identity/lib/auth-navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function createPrivateRedirect(url: URL): NextResponse {
  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function GET(request: Request): Promise<NextResponse> {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = normalizeAuthNextPath(requestUrl.searchParams.get("next"));

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  
  const origin = host ? `${protocol}://${host}` : requestUrl.origin;

  if (!code) {
    return createPrivateRedirect(
      new URL("/login?error=oauth_callback_failed", origin),
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return createPrivateRedirect(
      new URL("/login?error=oauth_callback_failed", origin),
    );
  }

  return createPrivateRedirect(new URL(nextPath, origin));
}

