import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  parseCategory,
  parseManifest,
  parseSite,
} from "@/lib/preference-validation";
import type {
  PreferenceCategory,
  PreferenceData,
  PreferenceTaxonomy,
} from "@/types/preference";

const PUBLIC_ROOT = path.join(process.cwd(), "public");

async function readPublicJson(publicPath: string): Promise<unknown> {
  const relativePath = publicPath.split("/").filter(Boolean);
  const source = await readFile(path.join(PUBLIC_ROOT, ...relativePath), "utf8");
  return JSON.parse(source) as unknown;
}

function assertUnique(values: string[], label: string) {
  if (new Set(values).size !== values.length) {
    throw new Error(`Duplicate ${label} ID`);
  }
}

function validateTaxonomy(taxonomy: PreferenceTaxonomy) {
  assertUnique(taxonomy.occasions.map((option) => option.id), "occasion");
  assertUnique(taxonomy.styles.map((option) => option.id), "style");
  assertUnique(taxonomy.budgets.map((option) => option.id), "budget");
  assertUnique(taxonomy.giftTypes.map((option) => option.id), "gift type");
}

function validateReferences(data: PreferenceData) {
  const itemIds = data.categories.flatMap((category) =>
    category.items.map((item) => item.id),
  );
  const occasionIds = new Set(data.taxonomy.occasions.map((option) => option.id));
  const styleIds = new Set(data.taxonomy.styles.map((option) => option.id));
  const budgetIds = new Set(data.taxonomy.budgets.map((option) => option.id));
  const giftTypeIds = new Set(data.taxonomy.giftTypes.map((option) => option.id));
  const validItemIds = new Set(itemIds);

  assertUnique(data.categories.map((category) => category.id), "category");
  assertUnique(itemIds, "item");
  assertUnique(data.collections.map((collection) => collection.id), "collection");

  for (const category of data.categories) {
    for (const item of category.items) {
      if (item.occasions.some((id) => !occasionIds.has(id))) {
        throw new Error(`Unknown occasion on item: ${item.id}`);
      }
      if (item.styles.some((id) => !styleIds.has(id))) {
        throw new Error(`Unknown style on item: ${item.id}`);
      }
      if (!budgetIds.has(item.budgetTier)) {
        throw new Error(`Unknown budget on item: ${item.id}`);
      }
      if (!giftTypeIds.has(item.giftType)) {
        throw new Error(`Unknown gift type on item: ${item.id}`);
      }
    }
  }

  for (const collection of data.collections) {
    if (collection.occasionIds.some((id) => !occasionIds.has(id))) {
      throw new Error(`Unknown occasion on collection: ${collection.id}`);
    }
    if (collection.itemIds.some((id) => !validItemIds.has(id))) {
      throw new Error(`Unknown item on collection: ${collection.id}`);
    }
  }
}

export async function getPreferenceData(): Promise<PreferenceData> {
  const manifest = parseManifest(
    await readPublicJson("/data/preferences.json"),
  );
  if (!manifest) throw new Error("Invalid preference manifest");

  const [siteValue, ...categoryValues] = await Promise.all([
    readPublicJson(manifest.site),
    ...manifest.categories.map(readPublicJson),
  ]);
  const site = parseSite(siteValue);
  const parsedCategories = categoryValues.map(parseCategory);

  if (!site || parsedCategories.some((category) => category === null)) {
    throw new Error("Invalid preference data structure");
  }

  const categories = parsedCategories.filter(
    (category): category is PreferenceCategory => category !== null,
  );
  const data: PreferenceData = {
    site,
    categories,
    taxonomy: manifest.taxonomy ?? {
      occasions: [],
      styles: [],
      budgets: [],
      giftTypes: [],
    },
    collections: manifest.collections ?? [],
  };

  validateTaxonomy(data.taxonomy);
  validateReferences(data);
  return data;
}
