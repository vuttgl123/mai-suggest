import { Quote } from "lucide-react";
import { CatalogueItemImage } from "@/features/catalogue/presentation/catalogue-item-image";
import { TimelineResponsePanel } from "@/features/timeline/presentation/timeline-response-panel";
import type { TimelineEntry } from "@/modules/timeline/domain/timeline-models";

interface TimelineChapterCardProps {
  actorId: string;
  canManage: boolean;
  entry: TimelineEntry;
  sequence: number;
}

export function TimelineChapterCard({
  actorId,
  canManage,
  entry,
  sequence,
}: TimelineChapterCardProps) {
  return (
    <article className="timeline-entry-card relative overflow-hidden">
      <span
        className="absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/65 to-transparent"
        aria-hidden="true"
      />
      <span
        className="absolute right-5 top-4 font-display text-4xl font-semibold text-[rgb(101_12_28_/_10%)]"
        aria-hidden="true"
      >
        {String(sequence).padStart(2, "0")}
      </span>

      <div className="flex flex-wrap items-center justify-between gap-3 pr-13">
        <p className="diary-kicker">{entry.dateLabel}</p>
        {entry.occurredOn ? (
          <time
            className="text-xs font-semibold text-[var(--color-muted)]"
            dateTime={entry.occurredOn}
          >
            {formatTimelineDate(entry.occurredOn)}
          </time>
        ) : null}
      </div>
      <h3 className="font-display mt-3 max-w-[86%] text-3xl font-semibold tracking-[-0.05em] text-[var(--color-brand-strong)]">
        {entry.title}
      </h3>
      {entry.imageUrl && entry.imageAltText ? (
        <div className="mt-5 overflow-hidden rounded-[calc(var(--radius-card)_-_0.35rem)] border border-[var(--color-border)]">
          <CatalogueItemImage alt={entry.imageAltText} src={entry.imageUrl} />
        </div>
      ) : null}
      <p className="mt-5 whitespace-pre-line text-[15px] leading-8 text-[var(--color-ink)]">
        {entry.story}
      </p>
      {entry.lesson ? (
        <blockquote className="mt-5 border-l-2 border-[var(--color-accent)] bg-[var(--color-brand-soft)]/45 px-4 py-3 text-sm leading-7 text-[var(--color-brand)]">
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
