import { Heart, Star, Trash2 } from "lucide-react";
import type { ReactElement } from "react";
import { SmartImage } from "@/components/smart-image";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import type { SelectedCategory } from "@/features/selection/lib/selection-selectors";

interface SelectedItemsViewProps {
  selectedCategories: SelectedCategory[];
  onShowAll(): void;
  onRemove(categoryId: string, itemId: string): void;
  onToggleFavorite(categoryId: string, itemId: string): void;
}

export function SelectedItemsView({
  selectedCategories,
  onShowAll,
  onRemove,
  onToggleFavorite,
}: SelectedItemsViewProps): ReactElement {
  const selectedItemCount = selectedCategories.reduce(
    (total, entry) => total + entry.items.length,
    0,
  );

  if (selectedCategories.length === 0) {
    return (
      <section className="border-y border-dashed border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-14 text-center">
        <Heart className="mx-auto text-[var(--color-muted)]" size={28} aria-hidden="true" />
        <h2 className="mt-3 text-xl font-semibold text-[var(--color-ink)]">
          Chưa có lựa chọn
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted)]">
          Chọn Like trên một gợi ý để thêm vào danh sách này.
        </p>
        <Button onClick={onShowAll} className="mt-5">
          Xem tất cả gợi ý
        </Button>
      </section>
    );
  }

  return (
    <section aria-labelledby="selected-items-title">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--color-border)] pb-4">
        <div>
          <h2 id="selected-items-title" className="font-display text-3xl font-semibold tracking-normal text-[var(--color-brand-strong)]">
            Đã chọn
          </h2>
          <p className="mt-1 text-sm tabular-nums text-[var(--color-muted)]">
            {selectedItemCount} gợi ý trong {selectedCategories.length} danh mục
          </p>
        </div>
        <Button variant="secondary" onClick={onShowAll}>
          Xem tất cả
        </Button>
      </header>

      <div className="space-y-8">
        {selectedCategories.map(({ category, items, favoriteItemId, note }) => (
          <section key={category.id} aria-labelledby={`selected-${category.id}`}>
            <h3
              id={`selected-${category.id}`}
              className="border-b border-[var(--color-border)] pb-2 text-lg font-semibold text-[var(--color-ink)]"
            >
              {category.name}
            </h3>
            {items.length > 0 && (
              <ul className="divide-y divide-[var(--color-border)]">
                {items.map((item) => {
                  const favorite = favoriteItemId === item.id;
                  return (
                    <li key={item.id} className="flex items-center gap-3 py-3">
                      <SmartImage
                        src={item.imageUrl}
                        alt={item.imageAlt}
                        variant="thumbnail"
                        sizes="64px"
                        className="h-16 w-16 shrink-0 rounded-md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[var(--color-ink)]">
                          {item.name}
                        </p>
                        {favorite && (
                          <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-positive)]">
                            <Star size={12} fill="currentColor" aria-hidden="true" />
                            Lựa chọn số một
                          </span>
                        )}
                      </div>
                      <IconButton
                        label={
                          favorite
                            ? `Bỏ ${item.name} khỏi lựa chọn số một`
                            : `Chọn ${item.name} làm lựa chọn số một`
                        }
                        icon={<Star size={16} fill={favorite ? "currentColor" : "none"} aria-hidden="true" />}
                        onClick={() => onToggleFavorite(category.id, item.id)}
                      />
                      <IconButton
                        label={`Bỏ ${item.name} khỏi lựa chọn`}
                        icon={<Trash2 size={16} aria-hidden="true" />}
                        onClick={() => onRemove(category.id, item.id)}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
            {note && (
              <p className="mt-3 border-l-2 border-[var(--color-accent)] pl-3 text-sm leading-6 text-[var(--color-muted)]">
                {note}
              </p>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}
