import Link from "next/link";
import { CatalogueItemImage } from "@/features/catalogue/presentation/catalogue-item-image";
import type { TimelineChapterPreview as TimelineChapterPreviewModel } from "@/modules/timeline/domain/timeline-models";

interface TimelineChapterPreviewProps {
  chapter: TimelineChapterPreviewModel;
  isActive: boolean;
  sequence: number;
}

export function TimelineChapterPreview({
  chapter,
  isActive,
  sequence,
}: TimelineChapterPreviewProps) {
  const baseClasses = "group flex w-60 shrink-0 cursor-pointer flex-col gap-3 rounded-[var(--radius-card)] border bg-white p-3  transition-all hover:border-brand-soft";
  const activeClasses = isActive
    ? "border-brand-soft ring-1 ring-brand-soft"
    : "border-border hover:";

  return (
    <Link
      href={`/hanh-trinh?chapter=${chapter.id}`}
      scroll={false}
      className={`${baseClasses} ${activeClasses}`}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-[calc(var(--radius-card)_-_0.5rem)] bg-surface">
        {chapter.imageUrl && chapter.imageAltText ? (
          <CatalogueItemImage
            alt={chapter.imageAltText}
            src={chapter.imageUrl}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-soft/20">
            <span className="font-display text-2xl font-bold text-brand-soft">
              {String(sequence).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 px-1 pb-1">
        <p className="diary-kicker text-xs text-brand">{chapter.dateLabel}</p>
        <p className="body-text-sm line-clamp-2 font-medium text-brand-strong">
          {chapter.title}
        </p>
      </div>
    </Link>
  );
}
