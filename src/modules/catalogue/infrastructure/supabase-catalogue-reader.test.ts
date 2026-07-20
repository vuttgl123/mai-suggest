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

function createItemsClient() {
  const itemOrder = vi.fn(async () => ({
    data: [
      {
        id: "item-id",
        category_id: "category-id",
        slug: "tea-house",
        kind: "place",
        title: "Tea house",
        summary: "Quiet afternoon tea",
        price_label: null,
      },
    ],
    error: null,
  }));
  const imageOrder = vi.fn(async () => ({
    data: [
      {
        id: "image-id",
        item_id: "item-id",
        image_url: "https://cdn.example/tea-house.jpg",
        alt_text: "Tea house",
        sort_order: 0,
        created_at: "2026-07-20T00:00:00.000Z",
      },
    ],
    error: null,
  }));
  const imageIn = vi.fn(() => ({ order: imageOrder }));
  const from = vi.fn((table: string) => {
    if (table === "items") {
      return { select: vi.fn(() => ({ order: itemOrder })) };
    }

    return { select: vi.fn(() => ({ in: imageIn })) };
  });

  return { client: { from } as never, from, imageIn };
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

  it("batches primary image lookup for listed items", async () => {
    const fixture = createItemsClient();
    const reader = new SupabaseCatalogueReader(fixture.client);

    await expect(reader.listItems({})).resolves.toEqual({
      ok: true,
      value: [
        {
          id: "item-id",
          categoryId: "category-id",
          slug: "tea-house",
          kind: "place",
          title: "Tea house",
          summary: "Quiet afternoon tea",
          priceLabel: null,
          primaryImage: {
            id: "image-id",
            url: "https://cdn.example/tea-house.jpg",
            altText: "Tea house",
            sortOrder: 0,
          },
        },
      ],
    });
    expect(fixture.imageIn).toHaveBeenCalledWith("item_id", ["item-id"]);
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
