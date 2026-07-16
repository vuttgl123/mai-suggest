"use client";

import { useEffect, useState } from "react";
import type {
  PreferenceCategory,
  PreferenceData,
  PreferenceItem,
  PreferenceManifest,
  SiteContent,
} from "@/types/preference";

interface PreferenceDataState {
  data: PreferenceData | null;
  isLoading: boolean;
  error: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function optionalStringIsValid(value: unknown): boolean {
  return value === undefined || isNonEmptyString(value);
}

function parseManifest(value: unknown): PreferenceManifest | null {
  if (!isRecord(value)) return null;
  const { site, categories } = value;

  if (
    !isNonEmptyString(site) ||
    !Array.isArray(categories) ||
    categories.length === 0 ||
    !categories.every(isNonEmptyString)
  ) {
    return null;
  }

  return { site, categories };
}

function parseSite(value: unknown): SiteContent | null {
  if (!isRecord(value)) return null;

  const {
    title,
    recipientName,
    eyebrow,
    heroMessage,
    heroSubMessage,
    heroImage,
    summaryEmail,
  } = value;

  if (
    !isNonEmptyString(title) ||
    !isNonEmptyString(recipientName) ||
    !isNonEmptyString(eyebrow) ||
    !isNonEmptyString(heroMessage) ||
    !isNonEmptyString(heroSubMessage) ||
    !isNonEmptyString(heroImage) ||
    !isNonEmptyString(summaryEmail)
  ) {
    return null;
  }

  return {
    title,
    recipientName,
    eyebrow,
    heroMessage,
    heroSubMessage,
    heroImage,
    summaryEmail,
  };
}

function parseItem(value: unknown): PreferenceItem | null {
  if (!isRecord(value)) return null;

  const {
    id,
    name,
    description,
    imageUrl,
    imageAlt,
    referencePrice,
    priceUpdatedAt,
    brand,
    sourceName,
    sourceUrl,
    message,
    tags,
  } = value;

  if (
    !isNonEmptyString(id) ||
    !isNonEmptyString(name) ||
    !isNonEmptyString(description) ||
    !isNonEmptyString(imageUrl) ||
    !isNonEmptyString(imageAlt) ||
    !Array.isArray(tags) ||
    tags.length < 2 ||
    tags.length > 4 ||
    !tags.every(isNonEmptyString) ||
    !optionalStringIsValid(referencePrice) ||
    !optionalStringIsValid(priceUpdatedAt) ||
    !optionalStringIsValid(brand) ||
    !optionalStringIsValid(sourceName) ||
    !optionalStringIsValid(sourceUrl) ||
    !isNonEmptyString(message)
  ) {
    return null;
  }

  return {
    id,
    name,
    description,
    imageUrl,
    imageAlt,
    tags,
    ...(referencePrice === undefined ? {} : { referencePrice: String(referencePrice) }),
    ...(priceUpdatedAt === undefined ? {} : { priceUpdatedAt: String(priceUpdatedAt) }),
    ...(brand === undefined ? {} : { brand: String(brand) }),
    ...(sourceName === undefined ? {} : { sourceName: String(sourceName) }),
    ...(sourceUrl === undefined ? {} : { sourceUrl: String(sourceUrl) }),
    message,
  };
}

function parseCategory(value: unknown): PreferenceCategory | null {
  if (!isRecord(value)) return null;

  const { id, name, description, notePlaceholder, items } = value;
  if (
    !isNonEmptyString(id) ||
    !isNonEmptyString(name) ||
    !isNonEmptyString(description) ||
    !isNonEmptyString(notePlaceholder) ||
    !Array.isArray(items) ||
    items.length < 4 ||
    items.length > 50
  ) {
    return null;
  }

  const parsedItems = items.map(parseItem);
  if (parsedItems.some((item) => item === null)) return null;

  const validItems = parsedItems.filter(
    (item): item is PreferenceItem => item !== null,
  );
  if (new Set(validItems.map((item) => item.id)).size !== validItems.length) {
    return null;
  }

  return { id, name, description, notePlaceholder, items: validItems };
}

async function fetchJson(path: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(path, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${path}`);
  const value: unknown = await response.json();
  return value;
}

export function usePreferenceData() {
  const [requestVersion, setRequestVersion] = useState(0);
  const [state, setState] = useState<PreferenceDataState>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        const manifest = parseManifest(
          await fetchJson("/data/preferences.json", controller.signal),
        );
        if (!manifest) throw new Error("Invalid preference manifest");

        const [siteValue, ...categoryValues] = await Promise.all([
          fetchJson(manifest.site, controller.signal),
          ...manifest.categories.map((path) => fetchJson(path, controller.signal)),
        ]);
        const site = parseSite(siteValue);
        const parsedCategories = categoryValues.map(parseCategory);

        if (!site || parsedCategories.some((category) => category === null)) {
          throw new Error("Invalid preference data structure");
        }

        const categories = parsedCategories.filter(
          (category): category is PreferenceCategory => category !== null,
        );
        const categoryIds = categories.map((category) => category.id);
        const itemIds = categories.flatMap((category) =>
          category.items.map((item) => item.id),
        );

        if (
          new Set(categoryIds).size !== categoryIds.length ||
          new Set(itemIds).size !== itemIds.length
        ) {
          throw new Error("Duplicate category or item ID");
        }

        setState({ data: { site, categories }, isLoading: false, error: null });
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") return;

        if (process.env.NODE_ENV === "development") {
          console.error("Không thể tải dữ liệu sở thích:", error);
        }

        setState({
          data: null,
          isLoading: false,
          error: "Không thể mở cuốn catalogue lúc này.",
        });
      }
    }

    void loadData();
    return () => controller.abort();
  }, [requestVersion]);

  function retry() {
    setState({ data: null, isLoading: true, error: null });
    setRequestVersion((version) => version + 1);
  }

  return { ...state, retry };
}
