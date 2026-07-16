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
  return (
    <nav
      aria-label="Danh mục gợi ý quà"
      className="sticky top-0 z-30 border-y border-[#5a0d18]/10 bg-[#f8f1e8]/95 shadow-[0_8px_30px_rgba(49,8,14,0.05)] backdrop-blur-lg"
    >
      <div className="hide-scrollbar mx-auto flex max-w-[78rem] gap-2 overflow-x-auto px-4 py-3 sm:px-8 md:flex-wrap md:justify-center">
        {categories.map((category, index) => {
          const isActive = activeCategoryId === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              aria-current={isActive ? "page" : undefined}
              className={`min-h-11 shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition sm:text-[0.78rem] ${
                isActive
                  ? "border-[#5a0d18] bg-[#5a0d18] text-white shadow-[0_6px_18px_rgba(90,13,24,0.16)]"
                  : "border-[#5a0d18]/12 bg-[#fffaf4]/70 text-[#5a0d18] hover:border-[#c8a96b] hover:bg-white"
              }`}
            >
              <span className="mr-1.5 font-display text-base opacity-70" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              {category.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
