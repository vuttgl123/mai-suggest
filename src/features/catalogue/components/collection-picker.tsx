import type { ReactElement } from "react";
import { SmartImage } from "@/components/smart-image";
import type { PreferenceCollection } from "@/types/preference";

interface CollectionPickerProps {
  collections: PreferenceCollection[];
  selectedId: string;
  onSelect(collectionId: string): void;
}

export function CollectionPicker({
  collections,
  selectedId,
  onSelect,
}: CollectionPickerProps): ReactElement {
  return (
    <div
      className="hide-scrollbar mt-7 grid w-full min-w-0 snap-x auto-cols-[78%] grid-flow-col gap-3 overflow-x-auto pb-2 sm:auto-cols-[46%] lg:grid-flow-row lg:grid-cols-3 lg:overflow-visible"
      aria-label="Bộ sưu tập theo tình huống"
    >
      {collections.map((collection) => {
        const selected = collection.id === selectedId;
        return (
          <button
            key={collection.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(selected ? "" : collection.id)}
            className={`group relative min-h-52 snap-start overflow-hidden rounded-lg border text-left shadow-[var(--shadow-card)] transition-colors ${
              selected
                ? "border-[var(--color-positive)] ring-2 ring-[var(--color-positive)] ring-offset-2"
                : "border-[var(--color-border)]"
            }`}
          >
            <SmartImage
              src={collection.imageUrl}
              alt={collection.imageAlt}
              variant="hero"
              sizes="(max-width: 1023px) 78vw, 32vw"
              className="absolute inset-0"
              imageClassName="transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <span
              className="absolute inset-0 bg-black/45"
              aria-hidden="true"
            />
            <span className="absolute inset-x-0 bottom-0 p-5 text-white">
              <span className="font-display block text-2xl font-semibold tracking-normal">
                {collection.name}
              </span>
              <span className="mt-2 line-clamp-2 block text-xs leading-5 text-white/85">
                {collection.description}
              </span>
              <span className="mt-2 block text-xs tabular-nums text-[#f6dfa9]">
                {collection.itemIds.length} gợi ý
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
