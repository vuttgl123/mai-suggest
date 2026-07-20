import type {
  CatalogueCategory,
  CatalogueImage,
  CatalogueItemDetail,
  CatalogueItemSummary,
  CatalogueLink,
} from "@/modules/catalogue/domain/catalogue-read-models";
import type { Database, Json } from "@/lib/supabase/database.types";

type CategoryRow = Pick<
  Database["public"]["Tables"]["categories"]["Row"],
  "id" | "slug" | "name" | "description" | "icon" | "cover_image_url" | "sort_order"
>;

type ItemSummaryRow = Pick<
  Database["public"]["Tables"]["items"]["Row"],
  "id" | "category_id" | "slug" | "kind" | "title" | "summary" | "price_label"
>;

type ItemDetailRow = ItemSummaryRow &
  Pick<
    Database["public"]["Tables"]["items"]["Row"],
    | "description"
    | "address"
    | "latitude"
    | "longitude"
    | "map_url"
    | "external_rating"
    | "external_review_count"
    | "external_rating_source"
    | "metadata"
  >;

type ItemImageRow = Database["public"]["Tables"]["item_images"]["Row"];
type ItemLinkRow = Database["public"]["Tables"]["item_links"]["Row"];

function toMetadata(value: Json): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return value;
}

export function toCatalogueCategory(row: CategoryRow): CatalogueCategory {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    icon: row.icon,
    coverImageUrl: row.cover_image_url,
    sortOrder: row.sort_order,
  };
}

export function toCatalogueImage(row: ItemImageRow): CatalogueImage {
  return {
    id: row.id,
    url: row.image_url,
    altText: row.alt_text,
    sortOrder: row.sort_order,
  };
}

export function toCatalogueLink(row: ItemLinkRow): CatalogueLink {
  return {
    id: row.id,
    type: row.link_type,
    title: row.title,
    url: row.url,
    sortOrder: row.sort_order,
  };
}

export function toCatalogueItemSummary(
  row: ItemSummaryRow,
  primaryImage: CatalogueImage | null,
): CatalogueItemSummary {
  return {
    id: row.id,
    categoryId: row.category_id,
    slug: row.slug,
    kind: row.kind,
    title: row.title,
    summary: row.summary,
    priceLabel: row.price_label,
    primaryImage,
  };
}

export function toCatalogueItemDetail(
  row: ItemDetailRow,
  images: CatalogueImage[],
  links: CatalogueLink[],
): CatalogueItemDetail {
  return {
    ...toCatalogueItemSummary(row, images[0] ?? null),
    description: row.description,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    mapUrl: row.map_url,
    externalRating: row.external_rating,
    externalReviewCount: row.external_review_count,
    externalRatingSource: row.external_rating_source,
    metadata: toMetadata(row.metadata),
    images,
    links,
  };
}
