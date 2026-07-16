"use client";

import { useEffect, useState } from "react";
import {
  parseCategory,
  parseManifest,
  parseSite,
} from "@/lib/preference-validation";
import type { PreferenceCategory, PreferenceData } from "@/types/preference";

interface PreferenceDataState {
  data: PreferenceData | null;
  isLoading: boolean;
  error: string | null;
}

async function fetchJson(path: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(path, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${path}`);
  const value: unknown = await response.json();
  return value;
}

function validateUniqueIds(categories: PreferenceCategory[]) {
  const categoryIds = categories.map((category) => category.id);
  const itemIds = categories.flatMap((category) => category.items.map((item) => item.id));
  return new Set(categoryIds).size === categoryIds.length &&
    new Set(itemIds).size === itemIds.length;
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
        if (!validateUniqueIds(categories)) {
          throw new Error("Duplicate category or item ID");
        }

        setState({
          data: {
            site,
            categories,
            taxonomy: manifest.taxonomy ?? {
              occasions: [], styles: [], budgets: [], giftTypes: [],
            },
            collections: manifest.collections ?? [],
          },
          isLoading: false,
          error: null,
        });
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (process.env.NODE_ENV === "development") {
          console.error("Không thể tải dữ liệu sở thích:", error);
        }
        setState({ data: null, isLoading: false, error: "Không thể mở cuốn catalogue lúc này." });
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
