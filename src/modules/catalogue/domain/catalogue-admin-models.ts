import type { Json } from "@/lib/supabase/database.types";
import type {
  CatalogueItemKind,
  CatalogueLinkType,
} from "@/modules/catalogue/domain/catalogue-read-models";

export type CatalogueMetadata = { [key: string]: Json | undefined };

export interface CatalogueCategoryInput {
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  coverImageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface ManagedCatalogueCategory extends CatalogueCategoryInput {
  id: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogueItemInput {
  categoryId: string;
  slug: string;
  kind: CatalogueItemKind;
  title: string;
  summary: string | null;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  mapUrl: string | null;
  priceLabel: string | null;
  externalRating: number | null;
  externalReviewCount: number | null;
  externalRatingSource: string | null;
  metadata: CatalogueMetadata;
  isPublished: boolean;
}

export interface ManagedCatalogueItem extends CatalogueItemInput {
  id: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ItemImageInput {
  itemId: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
}

export interface ItemImageUpdateInput {
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
}

export interface ManagedItemImage extends ItemImageInput {
  id: string;
  createdAt: string;
}

export interface ItemLinkInput {
  itemId: string;
  type: CatalogueLinkType;
  title: string;
  url: string;
  sortOrder: number;
}

export interface ItemLinkUpdateInput {
  type: CatalogueLinkType;
  title: string;
  url: string;
  sortOrder: number;
}

export interface ManagedItemLink extends ItemLinkInput {
  id: string;
  createdAt: string;
}

export interface ManagedCatalogueItemDetail extends ManagedCatalogueItem {
  images: ManagedItemImage[];
  links: ManagedItemLink[];
}
