import type {
  BudgetTier,
  GiftType,
  PreferenceCategory,
  PreferenceCollection,
  PreferenceItem,
  PreferenceManifest,
  PreferenceTaxonomy,
  SiteContent,
  TaxonomyOption,
} from "@/types/preference";

const BUDGET_TIERS = new Set<BudgetTier>([
  "duoi-500k", "500k-1m", "1m-3m", "3m-10m", "tren-10m", "linh-hoat",
]);
const GIFT_TYPES = new Set<GiftType>([
  "vat-pham", "trai-nghiem", "ca-nhan-hoa", "tu-lam",
]);

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function optionalString(value: unknown): value is string | undefined {
  return value === undefined || isNonEmptyString(value);
}

function stringArray(value: unknown, minimum = 1, maximum = 12): string[] | null {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum || !value.every(isNonEmptyString)) return null;
  return [...new Set(value)];
}

export const DEFAULT_TAXONOMY: PreferenceTaxonomy = {
  occasions: [{ id: "ngay-thuong", label: "Ngày thường" }],
  styles: [{ id: "toi-gian", label: "Tối giản" }],
  budgets: [{ id: "linh-hoat", label: "Linh hoạt" }],
  giftTypes: [{ id: "vat-pham", label: "Món đồ" }],
};

function parseTaxonomyOptions(value: unknown): TaxonomyOption[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const options = value.map((entry) => {
    if (!isRecord(entry) || !isNonEmptyString(entry.id) || !isNonEmptyString(entry.label)) return null;
    return { id: entry.id, label: entry.label };
  });
  if (options.some((entry) => entry === null)) return null;
  return options.filter((entry): entry is TaxonomyOption => entry !== null);
}

export function parseTaxonomy(value: unknown): PreferenceTaxonomy {
  if (!isRecord(value)) return DEFAULT_TAXONOMY;
  const occasions = parseTaxonomyOptions(value.occasions);
  const styles = parseTaxonomyOptions(value.styles);
  const budgets = parseTaxonomyOptions(value.budgets);
  const giftTypes = parseTaxonomyOptions(value.giftTypes);
  return occasions && styles && budgets && giftTypes
    ? { occasions, styles, budgets, giftTypes }
    : DEFAULT_TAXONOMY;
}

export function parseManifest(value: unknown): PreferenceManifest | null {
  if (!isRecord(value)) return null;
  const { site, categories, taxonomy, collections } = value;
  if (!isNonEmptyString(site) || !Array.isArray(categories) || categories.length === 0 || !categories.every(isNonEmptyString)) return null;
  return { site, categories, taxonomy: parseTaxonomy(taxonomy), collections: parseCollections(collections) };
}

export function parseSite(value: unknown): SiteContent | null {
  if (!isRecord(value)) return null;
  const { title, recipientName, eyebrow, heroMessage, heroSubMessage, heroImage, summaryEmail } = value;
  if (!isNonEmptyString(title) || !isNonEmptyString(recipientName) || !isNonEmptyString(eyebrow) || !isNonEmptyString(heroMessage) || !isNonEmptyString(heroSubMessage) || !isNonEmptyString(heroImage) || !isNonEmptyString(summaryEmail)) return null;
  return { title, recipientName, eyebrow, heroMessage, heroSubMessage, heroImage, summaryEmail };
}

export function parseItem(value: unknown): PreferenceItem | null {
  if (!isRecord(value)) return null;
  const { id, name, description, whyItFits, imageUrl, imageAlt, referencePrice,
    priceUpdatedAt, brand, sourceName, sourceUrl, messageTitle, message, tags,
    occasions, styles, budgetTier, giftType, featured, editorialOrder } = value;
  const parsedTags = stringArray(tags, 2, 4);
  const parsedOccasions = occasions === undefined ? ["ngay-thuong"] : stringArray(occasions, 1, 8);
  const parsedStyles = styles === undefined ? ["toi-gian"] : stringArray(styles, 1, 6);
  const parsedBudget = budgetTier === undefined ? "linh-hoat" : budgetTier;
  const parsedGiftType = giftType === undefined ? "vat-pham" : giftType;

  if (!isNonEmptyString(id) || !isNonEmptyString(name) || !isNonEmptyString(description) ||
    !isNonEmptyString(imageUrl) || !isNonEmptyString(imageAlt) || !isNonEmptyString(message) ||
    !parsedTags || !parsedOccasions || !parsedStyles ||
    !BUDGET_TIERS.has(parsedBudget as BudgetTier) || !GIFT_TYPES.has(parsedGiftType as GiftType) ||
    !optionalString(referencePrice) || !optionalString(priceUpdatedAt) ||
    !optionalString(brand) || !optionalString(sourceName) || !optionalString(sourceUrl) ||
    (featured !== undefined && typeof featured !== "boolean") ||
    (editorialOrder !== undefined && typeof editorialOrder !== "number")) return null;

  return {
    id, name, description,
    whyItFits: isNonEmptyString(whyItFits) ? whyItFits : description,
    imageUrl, imageAlt, tags: parsedTags, occasions: parsedOccasions, styles: parsedStyles,
    budgetTier: parsedBudget as BudgetTier, giftType: parsedGiftType as GiftType,
    messageTitle: isNonEmptyString(messageTitle) ? messageTitle : "Một lời nhắn cho em",
    message,
    ...(referencePrice === undefined ? {} : { referencePrice }),
    ...(priceUpdatedAt === undefined ? {} : { priceUpdatedAt }),
    ...(brand === undefined ? {} : { brand }),
    ...(sourceName === undefined ? {} : { sourceName }),
    ...(sourceUrl === undefined ? {} : { sourceUrl }),
    ...(featured === undefined ? {} : { featured }),
    ...(editorialOrder === undefined ? {} : { editorialOrder }),
  };
}

export function parseCategory(value: unknown): PreferenceCategory | null {
  if (!isRecord(value)) return null;
  const { id, name, description, notePlaceholder, coverImage, coverAlt, items } = value;
  if (!isNonEmptyString(id) || !isNonEmptyString(name) || !isNonEmptyString(description) ||
    !isNonEmptyString(notePlaceholder) || !optionalString(coverImage) || !optionalString(coverAlt) ||
    !Array.isArray(items) || items.length < 4 || items.length > 60) return null;
  const parsedItems = items.map(parseItem);
  if (parsedItems.some((item) => item === null)) return null;
  const validItems = parsedItems.filter((item): item is PreferenceItem => item !== null);
  if (new Set(validItems.map((item) => item.id)).size !== validItems.length) return null;
  return { id, name, description, notePlaceholder, items: validItems,
    ...(coverImage === undefined ? {} : { coverImage }),
    ...(coverAlt === undefined ? {} : { coverAlt }) };
}

export function parseCollections(value: unknown): PreferenceCollection[] {
  if (!Array.isArray(value)) return [];

  const collections = value.map((entry) => {
    if (!isRecord(entry)) return null;

    const {
      id,
      name,
      description,
      occasionIds,
      itemIds,
      imageUrl,
      imageAlt,
    } = entry;
    const parsedOccasions = stringArray(occasionIds, 1, 8);
    const parsedItemIds = stringArray(itemIds, 1, 12);

    if (
      !isNonEmptyString(id) ||
      !isNonEmptyString(name) ||
      !isNonEmptyString(description) ||
      !parsedOccasions ||
      !parsedItemIds ||
      !isNonEmptyString(imageUrl) ||
      !isNonEmptyString(imageAlt)
    ) {
      return null;
    }

    return {
      id,
      name,
      description,
      occasionIds: parsedOccasions,
      itemIds: parsedItemIds,
      imageUrl,
      imageAlt,
    };
  });

  return collections.filter(
    (entry): entry is PreferenceCollection => entry !== null,
  );
}
