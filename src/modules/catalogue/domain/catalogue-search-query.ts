const MAX_CATALOGUE_SEARCH_LENGTH = 80;
const UNSAFE_SEARCH_CHARACTERS = /[^\p{L}\p{N}\s-]+/gu;
const REPEATED_WHITESPACE = /\s+/gu;

export function normalizeCatalogueSearchQuery(
  value: string | null | undefined,
): string | null {
  const normalized = value
    ?.replace(UNSAFE_SEARCH_CHARACTERS, " ")
    .replace(REPEATED_WHITESPACE, " ")
    .trim()
    .slice(0, MAX_CATALOGUE_SEARCH_LENGTH)
    .trim();

  return normalized || null;
}
