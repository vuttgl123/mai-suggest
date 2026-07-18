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
      className="min-w-0 border-y border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm"
    >
      <div className="hide-scrollbar mx-auto flex w-full min-w-0 max-w-[78rem] gap-2 overflow-x-auto px-4 py-3 sm:px-8">
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
                "flex min-h-11 shrink-0 items-center gap-2 rounded-[var(--radius-control)] border px-4 py-2 text-sm font-semibold transition " +
                (isActive
                  ? "border-[var(--color-positive)] bg-[var(--color-positive)] text-white"
                  : "border-[var(--color-border)] bg-[var(--color-paper)] text-[var(--color-brand)] hover:border-[var(--color-accent)] hover:bg-white")
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
                  "rounded-sm px-2 py-0.5 text-xs " +
                  (isActive ? "bg-white/15" : "bg-[var(--color-surface)]")
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
