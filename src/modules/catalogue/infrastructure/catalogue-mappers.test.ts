import { describe, expect, it } from "vitest";
import {
  toCatalogueCategory,
  toCatalogueImage,
  toCatalogueItemDetail,
  toCatalogueItemSummary,
  toCatalogueLink,
} from "@/modules/catalogue/infrastructure/catalogue-mappers";

describe("catalogue mappers", () => {
  it("maps category rows without exposing snake case", () => {
    expect(
      toCatalogueCategory({
        id: "category-id",
        slug: "dream-trips",
        name: "Dream trips",
        description: "Places to visit",
        icon: "plane",
        cover_image_url: "https://cdn.example/cover.jpg",
        sort_order: 4,
      } as never),
    ).toEqual({
      id: "category-id",
      slug: "dream-trips",
      name: "Dream trips",
      description: "Places to visit",
      icon: "plane",
      coverImageUrl: "https://cdn.example/cover.jpg",
      sortOrder: 4,
    });
  });

  it("maps image and link rows into catalogue values", () => {
    const image = toCatalogueImage({
      id: "image-id",
      item_id: "item-id",
      image_url: "https://cdn.example/item.jpg",
      alt_text: "A favourite place",
      sort_order: 0,
      created_at: "2026-07-20T00:00:00.000Z",
    } as never);
    const link = toCatalogueLink({
      id: "link-id",
      item_id: "item-id",
      link_type: "map",
      title: "Open map",
      url: "https://maps.example/item",
      sort_order: 1,
      created_at: "2026-07-20T00:00:00.000Z",
    } as never);

    expect(image).toEqual({
      id: "image-id",
      url: "https://cdn.example/item.jpg",
      altText: "A favourite place",
      sortOrder: 0,
    });
    expect(link).toEqual({
      id: "link-id",
      type: "map",
      title: "Open map",
      url: "https://maps.example/item",
      sortOrder: 1,
    });
  });

  it("uses the first sorted image as an item primary image", () => {
    const firstImage = {
      id: "image-id",
      url: "https://cdn.example/item.jpg",
      altText: null,
      sortOrder: 0,
    };

    expect(
      toCatalogueItemSummary(
        {
          id: "item-id",
          category_id: "category-id",
          slug: "tea-house",
          kind: "place",
          title: "Tea house",
          summary: "Quiet afternoon tea",
          price_label: null,
        } as never,
        firstImage,
      ),
    ).toEqual({
      id: "item-id",
      categoryId: "category-id",
      slug: "tea-house",
      kind: "place",
      title: "Tea house",
      summary: "Quiet afternoon tea",
      priceLabel: null,
      primaryImage: firstImage,
    });
  });

  it("normalizes malformed metadata to an empty object", () => {
    expect(
      toCatalogueItemDetail(
        {
          id: "item-id",
          category_id: "category-id",
          slug: "tea-house",
          kind: "place",
          title: "Tea house",
          summary: null,
          price_label: null,
          description: null,
          address: null,
          latitude: null,
          longitude: null,
          map_url: null,
          external_rating: null,
          external_review_count: null,
          external_rating_source: null,
          metadata: ["not", "an", "object"],
        } as never,
        [],
        [],
      ).metadata,
    ).toEqual({});
  });
});
