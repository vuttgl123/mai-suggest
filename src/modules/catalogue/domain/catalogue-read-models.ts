export type CatalogueItemKind =
  | "place"
  | "product"
  | "experience"
  | "article"
  | "other";

export type CatalogueLinkType =
  | "website"
  | "map"
  | "menu"
  | "review"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "shopping"
  | "other";

export interface CatalogueCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  coverImageUrl: string | null;
  sortOrder: number;
}

export interface CatalogueImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface CatalogueLink {
  id: string;
  type: CatalogueLinkType;
  title: string;
  url: string;
  sortOrder: number;
}

export interface CatalogueItemSummary {
  id: string;
  categoryId: string;
  slug: string;
  kind: CatalogueItemKind;
  title: string;
  summary: string | null;
  priceLabel: string | null;
  primaryImage: CatalogueImage | null;
}

export interface CatalogueItemDetail extends CatalogueItemSummary {
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  mapUrl: string | null;
  externalRating: number | null;
  externalReviewCount: number | null;
  externalRatingSource: string | null;
  metadata: Record<string, unknown>;
  images: CatalogueImage[];
  links: CatalogueLink[];
}
