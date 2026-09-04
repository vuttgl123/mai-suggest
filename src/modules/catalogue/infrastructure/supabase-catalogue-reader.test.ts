import { describe, expect, it, vi } from "vitest";
import { SupabaseCatalogueReader } from "@/modules/catalogue/infrastructure/supabase-catalogue-reader";

function createCategoriesClient() {
  const order = vi.fn(async () => ({
    data: [
      {
        id: "category-id",
        slug: "dream-trips",
        name: "Dream trips",
        description: null,
        icon: null,
        cover_image_url: null,
        sort_order: 2,
      },
    ],
    error: null,
  }));
  const select = vi.fn(() => ({ order }));
  const from = vi.fn(() => ({ select }));

  return { client: { from } as never, from, select, order };
}

function createMissingItemClient() {
  const maybeSingle = vi.fn(async () => ({ data: null, error: null }));
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));

  return { client: { from } as never, from, select, eq };
}

describe("SupabaseCatalogueReader", () => {
  it("maps visible categories ordered by sort order", async () => {
    const fixture = createCategoriesClient();
    const reader = new SupabaseCatalogueReader(fixture.client);

    await expect(reader.listCategories()).resolves.toEqual({
      ok: true,
      value: [
        {
          id: "category-id",
          slug: "dream-trips",
          name: "Dream trips",
          description: null,
          icon: null,
          coverImageUrl: null,
          sortOrder: 2,
        },
      ],
    });
    expect(fixture.from).toHaveBeenCalledWith("categories");
    expect(fixture.order).toHaveBeenCalledWith("sort_order");
  });

  it("returns null when no visible item matches a detail slug", async () => {
    const fixture = createMissingItemClient();
    const reader = new SupabaseCatalogueReader(fixture.client);

    await expect(reader.findItemDetailBySlug("private-item")).resolves.toEqual({
      ok: true,
      value: null,
    });
    expect(fixture.eq).toHaveBeenCalledWith("slug", "private-item");
  });
});
