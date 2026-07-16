export interface SiteContent {
  title: string;
  recipientName: string;
  eyebrow: string;
  heroMessage: string;
  heroSubMessage: string;
  heroImage: string;
  summaryEmail: string;
}

export type BudgetTier =
  | "duoi-500k"
  | "500k-1m"
  | "1m-3m"
  | "3m-10m"
  | "tren-10m"
  | "linh-hoat";

export type GiftType =
  | "vat-pham"
  | "trai-nghiem"
  | "ca-nhan-hoa"
  | "tu-lam";

export interface PreferenceItem {
  id: string;
  name: string;
  description: string;
  whyItFits: string;
  imageUrl: string;
  imageAlt: string;
  referencePrice?: string;
  priceUpdatedAt?: string;
  brand?: string;
  sourceName?: string;
  sourceUrl?: string;
  messageTitle: string;
  message: string;
  tags: string[];
  occasions: string[];
  styles: string[];
  budgetTier: BudgetTier;
  giftType: GiftType;
  featured?: boolean;
  editorialOrder?: number;
}

export interface PreferenceCategory {
  id: string;
  name: string;
  description: string;
  notePlaceholder: string;
  coverImage?: string;
  coverAlt?: string;
  items: PreferenceItem[];
}

export interface TaxonomyOption {
  id: string;
  label: string;
}

export interface PreferenceTaxonomy {
  occasions: TaxonomyOption[];
  styles: TaxonomyOption[];
  budgets: TaxonomyOption[];
  giftTypes: TaxonomyOption[];
}

export interface PreferenceCollection {
  id: string;
  name: string;
  description: string;
  occasionIds: string[];
  itemIds: string[];
  imageUrl: string;
  imageAlt: string;
}

export interface PreferenceData {
  site: SiteContent;
  categories: PreferenceCategory[];
  taxonomy: PreferenceTaxonomy;
  collections: PreferenceCollection[];
}

export interface PreferenceManifest {
  site: string;
  categories: string[];
  taxonomy?: PreferenceTaxonomy;
  collections?: PreferenceCollection[];
}

export interface PreferenceSelectionStateV1 {
  schemaVersion: 1;
  likedItemIds: string[];
  favoriteByCategory: Record<string, string>;
  notesByCategory: Record<string, string>;
  updatedAt: string | null;
}

export interface PreferenceSelectionState {
  schemaVersion: 2;
  likedItemIds: string[];
  favoriteByCategory: Record<string, string>;
  notesByCategory: Record<string, string>;
  lastViewedCategoryId: string | null;
  updatedAt: string | null;
}
