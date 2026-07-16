"use client";

import { useCallback, useState } from "react";
import { PRODUCT_GRID_CLASSNAME } from "@/lib/catalogue-layout";
import type { PreferenceCategory, PreferenceItem } from "@/types/preference";
import { PreferenceCard } from "./preference-card";
import { ProductMessageDialog } from "./product-message-dialog";

const ITEMS_PER_BATCH = 8;

interface PreferenceGridProps {
  category: PreferenceCategory;
  items: PreferenceItem[];
  categoryIndex: number;
  likedItemIds: string[];
  favoriteItemId?: string;
  onToggleLiked: (itemId: string, categoryId: string) => void;
  onToggleFavorite: (categoryId: string, itemId: string) => void;
}

export function PreferenceGrid({
  category,
  items,
  categoryIndex,
  likedItemIds,
  favoriteItemId,
  onToggleLiked,
  onToggleFavorite,
}: PreferenceGridProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_BATCH);
  const [openItem, setOpenItem] = useState<PreferenceItem | null>(null);
  const closeDialog = useCallback(() => setOpenItem(null), []);
  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleItems.length < items.length;
  const visibleOpenItem =
    openItem && items.some((item) => item.id === openItem.id) ? openItem : null;

  return (
    <>
      <div className={PRODUCT_GRID_CLASSNAME}>
        {visibleItems.map((item, itemIndex) => (
          <PreferenceCard
            key={item.id}
            item={item}
            isLiked={likedItemIds.includes(item.id)}
            isFavorite={favoriteItemId === item.id}
            priority={categoryIndex === 0 && itemIndex < 2}
            onOpen={() => setOpenItem(item)}
            onToggleLiked={() => onToggleLiked(item.id, category.id)}
            onToggleFavorite={() => onToggleFavorite(category.id, item.id)}
          />
        ))}
      </div>

      <div className="mt-7 flex flex-col items-center justify-between gap-4 border-t border-[#5a0d18]/10 pt-6 sm:flex-row">
        <p className="text-sm text-[#654f53]" aria-live="polite">
          Đang xem{" "}
          <strong className="font-semibold text-[#5a0d18]">
            {visibleItems.length}/{items.length}
          </strong>{" "}
          gợi ý trong mục này
        </p>
        {hasMore && (
          <button
            type="button"
            onClick={() =>
              setVisibleCount((current) =>
                Math.min(current + ITEMS_PER_BATCH, items.length),
              )
            }
            className="min-h-12 rounded-full border border-[#5a0d18]/20 bg-[#fffaf4] px-6 py-3 text-sm font-semibold text-[#5a0d18] transition hover:border-[#c8a96b] hover:bg-white"
          >
            Xem thêm{" "}
            {Math.min(ITEMS_PER_BATCH, items.length - visibleItems.length)} gợi ý
          </button>
        )}
      </div>

      <ProductMessageDialog
        item={visibleOpenItem}
        isLiked={visibleOpenItem ? likedItemIds.includes(visibleOpenItem.id) : false}
        isFavorite={visibleOpenItem ? favoriteItemId === visibleOpenItem.id : false}
        onClose={closeDialog}
        onToggleLiked={() => {
          if (visibleOpenItem) onToggleLiked(visibleOpenItem.id, category.id);
        }}
        onToggleFavorite={() => {
          if (visibleOpenItem) onToggleFavorite(category.id, visibleOpenItem.id);
        }}
      />
    </>
  );
}
