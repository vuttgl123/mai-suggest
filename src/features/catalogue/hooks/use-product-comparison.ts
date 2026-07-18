"use client";

import { useCallback, useMemo, useState } from "react";
import type { PreferenceItem } from "@/types/preference";

export interface ProductComparison {
  itemIds: string[];
  canAdd(itemId: string): boolean;
  toggle(itemId: string): void;
  clear(): void;
}

interface UseProductComparisonOptions {
  categoryId: string;
  items: PreferenceItem[];
}

export function useProductComparison({
  categoryId,
  items,
}: UseProductComparisonOptions): ProductComparison {
  const [state, setState] = useState({ categoryId, itemIds: [] as string[] });
  const validItemIds = useMemo(
    () => new Set(items.map((item) => item.id)),
    [items],
  );
  const itemIds = useMemo(
    () =>
      state.categoryId === categoryId
        ? state.itemIds.filter((itemId) => validItemIds.has(itemId))
        : [],
    [categoryId, state.categoryId, state.itemIds, validItemIds],
  );

  const canAdd = useCallback(
    (itemId: string) =>
      validItemIds.has(itemId) &&
      (itemIds.includes(itemId) || itemIds.length < 3),
    [itemIds, validItemIds],
  );

  const toggle = useCallback(
    (itemId: string) => {
      if (!validItemIds.has(itemId)) return;
      setState((current) => {
        const currentIds =
          current.categoryId === categoryId
            ? current.itemIds.filter((id) => validItemIds.has(id))
            : [];
        const exists = currentIds.includes(itemId);
        if (!exists && currentIds.length >= 3) {
          return { categoryId, itemIds: currentIds };
        }
        return {
          categoryId,
          itemIds: exists
            ? currentIds.filter((id) => id !== itemId)
            : [...currentIds, itemId],
        };
      });
    },
    [categoryId, validItemIds],
  );

  const clear = useCallback(
    () => setState({ categoryId, itemIds: [] }),
    [categoryId],
  );

  return { itemIds, canAdd, toggle, clear };
}
