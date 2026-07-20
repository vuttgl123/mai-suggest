export interface AdminCataloguePathInput {
  categoryId: string | null;
  itemId: string | null;
  page: number;
}

export function createAdminCataloguePath({
  categoryId,
  itemId,
  page,
}: AdminCataloguePathInput): string {
  const searchParams = new URLSearchParams();
  if (categoryId) searchParams.set("category", categoryId);
  if (itemId) searchParams.set("item", itemId);
  if (page > 1) searchParams.set("page", String(page));

  const query = searchParams.toString();
  return query ? `/admin?${query}` : "/admin";
}
