import { Scale, X } from "lucide-react";
import type { ReactElement } from "react";
import { SmartImage } from "@/components/smart-image";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import type { PreferenceItem } from "@/types/preference";

interface CompareTrayProps {
  items: PreferenceItem[];
  onRemove(itemId: string): void;
  onCompare(): void;
  onClear(): void;
}

export function CompareTray({
  items,
  onRemove,
  onCompare,
  onClear,
}: CompareTrayProps): ReactElement | null {
  if (items.length < 2) return null;

  return (
    <aside
      aria-label="Danh sách so sánh"
      className="mt-7 border-y border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-3"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
          {items.map((item) => (
            <div key={item.id} className="flex min-w-48 items-center gap-2">
              <SmartImage
                src={item.imageUrl}
                alt=""
                variant="thumbnail"
                sizes="44px"
                className="h-11 w-11 shrink-0 rounded-md"
              />
              <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[var(--color-ink)]">
                {item.name}
              </span>
              <IconButton
                label={`Bỏ ${item.name} khỏi so sánh`}
                icon={<X size={15} aria-hidden="true" />}
                onClick={() => onRemove(item.id)}
                className="h-11 w-11"
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 lg:flex">
          <Button variant="quiet" size="compact" onClick={onClear}>
            Xóa so sánh
          </Button>
          <Button size="compact" onClick={onCompare}>
            <Scale size={16} aria-hidden="true" />
            So sánh {items.length} món
          </Button>
        </div>
      </div>
    </aside>
  );
}
