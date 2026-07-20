import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import {
  createLoginPath,
  isPublicAuthPath,
} from "@/features/identity/lib/auth-navigation";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";

function createPrivateResponse(request: NextRequest): NextResponse {
  const response = NextResponse.next({ request });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

function redirectWithSessionCookies(
  url: URL,
  sessionResponse: NextResponse,
): NextResponse {
  const redirectResponse = NextResponse.redirect(url);

  sessionResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "set-cookie") {
      redirectResponse.headers.set(key, value);
    }
  });
  sessionResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}

export async function updateSupabaseSession(
  request: NextRequest,
): Promise<NextResponse> {
  let supabaseResponse = createPrivateResponse(request);
  const { url, publishableKey } = getSupabasePublicConfig();
  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = createPrivateResponse(request);
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([name, value]) => {
          supabaseResponse.headers.set(name, value);
        });
      },
    },
  });

  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  const { pathname, search } = request.nextUrl;

  if (!claims && !isPublicAuthPath(pathname)) {
    const loginUrl = new URL(
      createLoginPath(`${pathname}${search}`),
      request.url,
    );
    return redirectWithSessionCookies(loginUrl, supabaseResponse);
  }

  return supabaseResponse;
}
