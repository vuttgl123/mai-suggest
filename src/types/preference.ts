export interface SiteContent {
  title: string;
  recipientName: string;
  eyebrow: string;
  heroMessage: string;
  heroSubMessage: string;
  heroImage: string;
  summaryEmail: string;
}

export interface PreferenceItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  referencePrice?: string;
  priceUpdatedAt?: string;
  brand?: string;
  sourceName?: string;
  sourceUrl?: string;
  message: string;
  tags: string[];
}

export interface PreferenceCategory {
  id: string;
  name: string;
  description: string;
  notePlaceholder: string;
  items: PreferenceItem[];
}

export interface PreferenceData {
  site: SiteContent;
  categories: PreferenceCategory[];
}

export interface PreferenceManifest {
  site: string;
  categories: string[];
}

export interface PreferenceSelectionState {
  schemaVersion: 1;
  likedItemIds: string[];
  favoriteByCategory: Record<string, string>;
  notesByCategory: Record<string, string>;
  updatedAt: string | null;
}
