import type {
  CatalogueMetadata,
  ManagedCatalogueCategory,
  ManagedCatalogueItem,
  ManagedItemImage,
  ManagedItemLink,
} from "@/modules/catalogue/domain/catalogue-admin-models";
import type { Database, Json } from "@/lib/supabase/database.types";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type ItemRow = Database["public"]["Tables"]["items"]["Row"];
type ItemImageRow = Database["public"]["Tables"]["item_images"]["Row"];
type ItemLinkRow = Database["public"]["Tables"]["item_links"]["Row"];

export function toManagedCategory(row: CategoryRow): ManagedCatalogueCategory {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    icon: row.icon,
    coverImageUrl: row.cover_image_url,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toManagedItem(row: ItemRow): ManagedCatalogueItem {
  return {
    id: row.id,
    categoryId: row.category_id,
    slug: row.slug,
    kind: row.kind,
    title: row.title,
    summary: row.summary,
    description: row.description,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    mapUrl: row.map_url,
    priceLabel: row.price_label,
    externalRating: row.external_rating,
    externalReviewCount: row.external_review_count,
    externalRatingSource: row.external_rating_source,
    metadata: toMetadata(row.metadata),
    isPublished: row.is_published,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toManagedItemImage(row: ItemImageRow): ManagedItemImage {
  return {
    id: row.id,
    itemId: row.item_id,
    imageUrl: row.image_url,
    altText: row.alt_text,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export function toManagedItemLink(row: ItemLinkRow): ManagedItemLink {
  return {
    id: row.id,
    itemId: row.item_id,
    type: row.link_type,
    title: row.title,
    url: row.url,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

function toMetadata(value: Json): CatalogueMetadata {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return value;
}
