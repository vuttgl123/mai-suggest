"use client";

import { useEffect, useRef } from "react";
import type { PreferenceCategory } from "@/types/preference";

interface CategoryTabsProps {
  categories: PreferenceCategory[];
  activeCategoryId: string;
  onSelect: (categoryId: string) => void;
}

export function CategoryTabs({
  categories,
  activeCategoryId,
  onSelect,
}: CategoryTabsProps) {
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeButtonRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeCategoryId]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();

    const currentIndex = categories.findIndex(
      (category) => category.id === activeCategoryId,
    );
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex =
      (currentIndex + direction + categories.length) % categories.length;
    onSelect(categories[nextIndex].id);
  }

  return (
    <nav
      aria-label="Chọn danh mục gợi ý"
      onKeyDown={handleKeyDown}
      className="sticky top-0 z-30 border-y border-[#5a0d18]/10 bg-[#f8f1e8]/95 shadow-[0_8px_30px_rgba(49,8,14,0.05)] backdrop-blur-xl"
    >
      <div className="hide-scrollbar mx-auto flex max-w-[78rem] gap-2 overflow-x-auto px-4 py-3 sm:px-8">
        {categories.map((category, index) => {
          const isActive = activeCategoryId === category.id;
          return (
            <button
              key={category.id}
              ref={isActive ? activeButtonRef : undefined}
              type="button"
              onClick={() => onSelect(category.id)}
              aria-pressed={isActive}
              className={
                "flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition " +
                (isActive
                  ? "border-[#5a0d18] bg-[#5a0d18] text-white shadow-[0_6px_18px_rgba(90,13,24,0.16)]"
                  : "border-[#5a0d18]/12 bg-[#fffaf4]/80 text-[#5a0d18] hover:border-[#c8a96b] hover:bg-white")
              }
            >
              <span
                className="font-display text-base opacity-70"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              {category.name}
              <span
                className={
                  "rounded-full px-2 py-0.5 text-xs " +
                  (isActive ? "bg-white/15" : "bg-[#e8d5d7]/55")
                }
              >
                {category.items.length}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
