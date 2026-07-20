export const PUBLIC_PAGE_SIZE = 6;

export function firstSearchParam(
  value: string | string[] | undefined,
): string | null {
  const firstValue = Array.isArray(value) ? value[0] : value;
  const normalized = firstValue?.trim();
  return normalized || null;
}

export function parsePositivePage(value: string | string[] | undefined): number {
  const rawPage = firstSearchParam(value);
  if (!rawPage || !/^\d+$/.test(rawPage)) return 1;

  const page = Number(rawPage);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function createCataloguePath({
  categorySlug,
  page,
}: {
  categorySlug: string | null;
  page: number;
}): string {
  const searchParams = new URLSearchParams();
  if (categorySlug) searchParams.set("category", categorySlug);
  if (page > 1) searchParams.set("page", String(page));

  const query = searchParams.toString();
  return query ? `/?${query}` : "/";
}
