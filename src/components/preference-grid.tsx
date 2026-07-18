"use client";

import { useCallback, useState } from "react";
import { CompareDialog } from "@/features/catalogue/components/compare-dialog";
import { CompareTray } from "@/features/catalogue/components/compare-tray";
import { useProductComparison } from "@/features/catalogue/hooks/use-product-comparison";
import { PRODUCT_GRID_CLASSNAME } from "@/lib/catalogue-layout";
import type { PreferenceCategory, PreferenceItem } from "@/types/preference";
import { PreferenceCard } from "./preference-card";
import { ProductMessageDialog } from "./product-message-dialog";
import { Button } from "./ui/button";

const ITEMS_PER_BATCH = 8;

interface PreferenceGridProps {
  category: PreferenceCategory;
  items: PreferenceItem[];
  categoryIndex: number;
  likedItemIds: string[];
  favoriteItemId?: string;
  selectionReady?: boolean;
  onToggleLiked: (itemId: string, categoryId: string) => void;
  onToggleFavorite: (categoryId: string, itemId: string) => void;
}

export function PreferenceGrid({
  category,
  items,
  categoryIndex,
  likedItemIds,
  favoriteItemId,
  selectionReady = true,
  onToggleLiked,
  onToggleFavorite,
}: PreferenceGridProps) {
  const scopeKey = `${category.id}:${items.map((item) => item.id).join(",")}`;
  const [visibility, setVisibility] = useState({
    scopeKey,
    count: ITEMS_PER_BATCH,
  });
  const [openItem, setOpenItem] = useState<PreferenceItem | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const comparison = useProductComparison({ categoryId: category.id, items });
  const closeDialog = useCallback(() => setOpenItem(null), []);
  const visibleCount =
    visibility.scopeKey === scopeKey ? visibility.count : ITEMS_PER_BATCH;
  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleItems.length < items.length;
  const visibleOpenItem =
    openItem && items.some((item) => item.id === openItem.id) ? openItem : null;
  const comparedItems = comparison.itemIds
    .map((itemId) => items.find((item) => item.id === itemId))
    .filter((item): item is PreferenceItem => Boolean(item));

  return (
    <>
      <div className={PRODUCT_GRID_CLASSNAME}>
        {visibleItems.map((item, itemIndex) => (
          <PreferenceCard
            key={item.id}
            item={item}
            isLiked={likedItemIds.includes(item.id)}
            isFavorite={favoriteItemId === item.id}
            selectionReady={selectionReady}
            priority={categoryIndex === 0 && itemIndex < 2}
            onOpen={() => setOpenItem(item)}
            onToggleLiked={() => onToggleLiked(item.id, category.id)}
          />
        ))}
      </div>

      <CompareTray
        items={comparedItems}
        onRemove={comparison.toggle}
        onClear={comparison.clear}
        onCompare={() => setCompareOpen(true)}
      />

      <div className="mt-7 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-border)] pt-6 sm:flex-row">
        <p className="text-sm text-[var(--color-muted)]" aria-live="polite">
          Đang xem{" "}
          <strong className="font-semibold text-[var(--color-brand)]">
            {visibleItems.length}/{items.length}
          </strong>{" "}
          gợi ý trong mục này
        </p>
        {items.length > ITEMS_PER_BATCH && (
          <Button
            variant={hasMore ? "secondary" : "quiet"}
            aria-disabled={!hasMore}
            onClick={() => {
              if (!hasMore) return;
              setVisibility((current) => {
                const currentCount =
                  current.scopeKey === scopeKey
                    ? current.count
                    : ITEMS_PER_BATCH;
                return {
                  scopeKey,
                  count: Math.min(
                    currentCount + ITEMS_PER_BATCH,
                    items.length,
                  ),
                };
              });
            }}
            className="min-h-12 px-6"
          >
            {hasMore
              ? `Xem thêm ${Math.min(
                  ITEMS_PER_BATCH,
                  items.length - visibleItems.length,
                )} gợi ý`
              : "Đã hiển thị tất cả"}
          </Button>
        )}
      </div>

      <ProductMessageDialog
        item={visibleOpenItem}
        isLiked={visibleOpenItem ? likedItemIds.includes(visibleOpenItem.id) : false}
        isFavorite={visibleOpenItem ? favoriteItemId === visibleOpenItem.id : false}
        isCompared={
          visibleOpenItem
            ? comparison.itemIds.includes(visibleOpenItem.id)
            : false
        }
        canCompare={
          visibleOpenItem ? comparison.canAdd(visibleOpenItem.id) : false
        }
        selectionReady={selectionReady}
        onClose={closeDialog}
        onToggleLiked={() => {
          if (visibleOpenItem) onToggleLiked(visibleOpenItem.id, category.id);
        }}
        onToggleFavorite={() => {
          if (visibleOpenItem) onToggleFavorite(category.id, visibleOpenItem.id);
        }}
        onToggleCompare={() => {
          if (visibleOpenItem) comparison.toggle(visibleOpenItem.id);
        }}
      />
      <CompareDialog
        open={compareOpen && comparedItems.length >= 2}
        items={comparedItems}
        onClose={() => setCompareOpen(false)}
      />
    </>
  );
}
