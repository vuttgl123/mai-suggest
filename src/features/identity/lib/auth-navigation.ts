const PUBLIC_AUTH_PATHS = new Set([
  "/login",
  "/auth/callback",
  "/access-denied",
]);

export function normalizeAuthNextPath(
  value: string | null | undefined,
): string {
  if (!value?.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export function isPublicAuthPath(pathname: string): boolean {
  return PUBLIC_AUTH_PATHS.has(pathname);
}

export function createLoginPath(nextPath: string): string {
  const searchParams = new URLSearchParams({ next: nextPath });
  return `/login?${searchParams.toString()}`;
}
