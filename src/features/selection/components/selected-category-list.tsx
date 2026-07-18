import { Heart, Star, Trash2 } from "lucide-react";
import { SmartImage } from "@/components/smart-image";
import { FieldLabel, TextAreaControl } from "@/components/ui/form-control";
import { IconButton } from "@/components/ui/icon-button";
import type { SelectedCategory } from "@/features/selection/lib/selection-selectors";

interface SelectedCategoryListProps {
  selectedCategories: SelectedCategory[];
  selectedItemCount: number;
  updatedAt: string | null;
  onRemove(categoryId: string, itemId: string): void;
  onToggleFavorite(categoryId: string, itemId: string): void;
  onNoteChange(categoryId: string, note: string): void;
}

function formatDate(value: string | null) {
  if (!value) return "Chưa ghi nhận";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa ghi nhận";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

export function SelectedCategoryList({
  selectedCategories,
  selectedItemCount,
  updatedAt,
  onRemove,
  onToggleFavorite,
  onNoteChange,
}: SelectedCategoryListProps) {
  return (
    <div className="summary-scroll flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] bg-[var(--color-paper)] px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-brand)]">
          <Heart size={16} fill="currentColor" aria-hidden="true" />
          {selectedItemCount} món em yêu
        </span>
        <span className="text-[0.68rem] text-[var(--color-muted)]">
          Cập nhật {formatDate(updatedAt)}
        </span>
      </div>

      {selectedCategories.length > 0 ? (
        <div className="divide-y divide-[var(--color-border)]">
          {selectedCategories.map(
            ({ category, items, favoriteItemId, note }) => {
              const noteId = `summary-note-${category.id}`;
              return (
              <section
                key={category.id}
                className="py-6 first:pt-0 last:pb-0"
                aria-labelledby={`summary-category-${category.id}`}
              >
                <h3
                  id={`summary-category-${category.id}`}
                  className="font-display text-2xl font-semibold tracking-normal text-[var(--color-brand-strong)] sm:text-3xl"
                >
                  {category.name}
                </h3>
                {items.length > 0 && (
                  <ul className="mt-3 divide-y divide-[var(--color-border)]">
                    {items.map((item) => {
                      const isFavorite = favoriteItemId === item.id;
                      return (
                      <li key={item.id} className="flex items-center gap-3 py-3">
                        <SmartImage
                          src={item.imageUrl}
                          alt={item.imageAlt}
                          variant="thumbnail"
                          sizes="64px"
                          className="h-16 w-16 shrink-0 rounded-lg"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-5 text-[var(--color-ink)]">
                            {item.name}
                          </p>
                          {isFavorite && (
                            <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-positive)]">
                              <Star
                                size={10}
                                fill="currentColor"
                                aria-hidden="true"
                              />
                              Yêu thích nhất
                            </span>
                          )}
                        </div>
                        <IconButton
                          label={
                            isFavorite
                              ? `Bỏ ${item.name} khỏi lựa chọn số một`
                              : `Chọn ${item.name} làm lựa chọn số một`
                          }
                          icon={
                            <Star
                              size={16}
                              fill={isFavorite ? "currentColor" : "none"}
                              aria-hidden="true"
                            />
                          }
                          onClick={() =>
                            onToggleFavorite(category.id, item.id)
                          }
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
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <FieldLabel htmlFor={noteId}>Lời nhắn của em</FieldLabel>
                    <span className="text-xs tabular-nums text-[var(--color-muted)]">
                      {note.length}/500
                    </span>
                  </div>
                  <TextAreaControl
                    id={noteId}
                    name={noteId}
                    value={note}
                    maxLength={500}
                    rows={3}
                    placeholder={category.notePlaceholder}
                    onChange={(event) =>
                      onNoteChange(category.id, event.target.value)
                    }
                    className="resize-none"
                  />
                </div>
              </section>
              );
            },
          )}
        </div>
      ) : (
        <div className="border-y border-dashed border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-12 text-center">
          <Heart
            className="mx-auto text-[var(--color-accent)]"
            size={28}
            strokeWidth={1.3}
            aria-hidden="true"
          />
          <p className="font-display mt-3 text-2xl font-semibold tracking-normal text-[var(--color-brand-strong)]">
            Trang giấy đang chờ em
          </p>
          <p className="mt-2 text-xs leading-6 text-[var(--color-muted)]">
            Hãy tiếp tục khám phá và chọn điều khiến em mỉm cười.
          </p>
        </div>
      )}
    </div>
  );
}
