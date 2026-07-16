"use client";

import { useState } from "react";
import { useProductPageSize } from "@/hooks/use-product-page-size";
import { PRODUCT_GRID_CLASSNAME } from "@/lib/catalogue-layout";
import type { PreferenceCategory, PreferenceItem } from "@/types/preference";
import { PreferenceCard } from "./preference-card";
import { ProductMessageDialog } from "./product-message-dialog";
import { ProductPagination } from "./product-pagination";

interface PreferenceGridProps {
  category: PreferenceCategory;
  categoryIndex: number;
  likedItemIds: string[];
  favoriteItemId?: string;
  onToggleLiked: (itemId: string, categoryId: string) => void;
  onToggleFavorite: (categoryId: string, itemId: string) => void;
}

export function PreferenceGrid({
  category,
  categoryIndex,
  likedItemIds,
  favoriteItemId,
  onToggleLiked,
  onToggleFavorite,
}: PreferenceGridProps) {
  const pageSize = useProductPageSize();
  const [requestedPage, setRequestedPage] = useState(1);
  const [openItem, setOpenItem] = useState<PreferenceItem | null>(null);
  const totalPages = Math.max(1, Math.ceil(category.items.length / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const firstIndex = (currentPage - 1) * pageSize;
  const visibleItems = category.items.slice(firstIndex, firstIndex + pageSize);

  function changePage(page: number) {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    setRequestedPage(nextPage);
    setOpenItem(null);
    window.requestAnimationFrame(() => {
      document.getElementById(`category-${category.id}-heading`)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <>
      <div className={PRODUCT_GRID_CLASSNAME}>
        {visibleItems.map((item, itemIndex) => (
          <PreferenceCard
            key={item.id}
            item={item}
            isLiked={likedItemIds.includes(item.id)}
            isFavorite={favoriteItemId === item.id}
            priority={categoryIndex === 0 && currentPage === 1 && itemIndex < 2}
            onOpen={() => setOpenItem(item)}
            onToggleLiked={() => onToggleLiked(item.id, category.id)}
            onToggleFavorite={() => onToggleFavorite(category.id, item.id)}
          />
        ))}
      </div>

      <ProductPagination
        currentPage={currentPage}
        totalPages={totalPages}
        firstItem={firstIndex + 1}
        lastItem={firstIndex + visibleItems.length}
        totalItems={category.items.length}
        onPageChange={changePage}
      />

      <ProductMessageDialog
        item={openItem}
        isLiked={openItem ? likedItemIds.includes(openItem.id) : false}
        isFavorite={openItem ? favoriteItemId === openItem.id : false}
        onClose={() => setOpenItem(null)}
        onToggleLiked={() => {
          if (openItem) onToggleLiked(openItem.id, category.id);
        }}
        onToggleFavorite={() => {
          if (openItem) onToggleFavorite(category.id, openItem.id);
        }}
      />
    </>
  );
}
