import { normalizeCatalogueSearchQuery } from "@/modules/catalogue/domain/catalogue-search-query";

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

export function parseCatalogueSearchQuery(
  value: string | string[] | undefined,
): string | null {
  return normalizeCatalogueSearchQuery(firstSearchParam(value));
}

export function createCataloguePath({
  categorySlug,
  page,
  query,
}: {
  categorySlug: string | null;
  page: number;
  query?: string | null;
}): string {
  const searchParams = new URLSearchParams();
  const normalizedQuery = normalizeCatalogueSearchQuery(query);

  if (categorySlug) searchParams.set("category", categorySlug);
  if (normalizedQuery) searchParams.set("q", normalizedQuery);
  if (page > 1) searchParams.set("page", String(page));

  const serialized = searchParams.toString();
  return serialized ? `/?${serialized}` : "/";
}
