/*
 * The catalogue lives on the home route, so a return path is only valid when it
 * is "/" optionally followed by a query string. Anything else (other routes,
 * protocol-relative URLs, absolute URLs, backslashes) is rejected so `?back=`
 * can never become an open redirect.
 */
export function sanitizeCatalogueReturnPath(
  value: string | string[] | null | undefined,
): string | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) return null;
  if (!/^\/(\?[^\\]*)?$/.test(candidate)) return null;

  return candidate;
}

export function createItemDetailPath(
  slug: string,
  returnPath: string | null,
): string {
  const path = `/catalogue/${encodeURIComponent(slug)}`;
  const safeReturn = sanitizeCatalogueReturnPath(returnPath);
  if (!safeReturn || safeReturn === "/") return path;

  return `${path}?${new URLSearchParams({ back: safeReturn }).toString()}`;
}
