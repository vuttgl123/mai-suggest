import { Bookmark, Quote } from "lucide-react";
import { CatalogueItemImage } from "@/features/catalogue/presentation/catalogue-item-image";
import { TimelineResponsePanel } from "@/features/timeline/presentation/timeline-response-panel";
import type { TimelineEntry } from "@/modules/timeline/domain/timeline-models";

interface TimelineFeaturedChapterProps {
  actorId: string;
  canManage: boolean;
  entry: TimelineEntry;
}

export function TimelineFeaturedChapter({
  actorId,
  canManage,
  entry,
}: TimelineFeaturedChapterProps) {
  const hasImage = entry.imageUrl !== null && entry.imageAltText !== null;

  return (
    <article
      className="relative overflow-hidden rounded-[var(--radius-dialog)] border border-[var(--color-border)] bg-[var(--theme-card-surface)] shadow-[var(--shadow-card)]"
      id={`timeline-entry-${entry.id}`}
    >
      <span
        className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[var(--color-brand-soft)] opacity-60 blur-3xl"
        aria-hidden="true"
      />
      <div
        className={`relative ${
          hasImage
            ? "grid lg:grid-cols-[minmax(15rem,0.86fr)_minmax(0,1fr)]"
            : ""
        }`}
      >
        {hasImage ? (
          <div className="overflow-hidden border-b border-[var(--color-border)] lg:border-b-0 lg:border-r">
            <CatalogueItemImage alt={entry.imageAltText} src={entry.imageUrl} />
          </div>
        ) : null}

        <div className="p-5 sm:p-7 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--theme-badge-border)] bg-[var(--color-paper)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-brand)]">
              <Bookmark size={13} aria-hidden="true" />
              Chương đang mở
            </span>
            {entry.occurredOn ? (
              <time
                className="text-xs font-semibold text-[var(--color-muted)]"
                dateTime={entry.occurredOn}
              >
                {formatTimelineDate(entry.occurredOn)}
              </time>
            ) : null}
          </div>

          <p className="diary-kicker mt-5">{entry.dateLabel}</p>
          <h3 className="font-display mt-2 text-balance text-3xl font-semibold tracking-[-0.05em] text-[var(--color-brand-strong)] sm:text-4xl">
            {entry.title}
          </h3>
          <p className="mt-5 whitespace-pre-line text-[15px] leading-8 text-[var(--color-ink)]">
            {entry.story}
          </p>

          {entry.lesson ? (
            <blockquote className="mt-6 border-l-2 border-[var(--color-accent)] bg-[var(--color-brand-soft)]/45 px-4 py-3 text-sm leading-7 text-[var(--color-brand)]">
              <Quote
                className="mb-1 text-[var(--color-accent)]"
                size={16}
                strokeWidth={1.45}
                aria-hidden="true"
              />
              {entry.lesson}
            </blockquote>
          ) : null}

          <TimelineResponsePanel
            actorId={actorId}
            canManage={canManage}
            entryId={entry.id}
            responses={entry.responses}
          />
        </div>
      </div>
    </article>
  );
}

function formatTimelineDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
