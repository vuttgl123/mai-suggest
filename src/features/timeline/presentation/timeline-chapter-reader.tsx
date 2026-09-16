import { Quote } from "lucide-react";
import { CatalogueItemImage } from "@/features/catalogue/presentation/catalogue-item-image";
import { TimelineResponsePanel } from "@/features/timeline/presentation/timeline-response-panel";
import type { TimelineEntry } from "@/modules/timeline/domain/timeline-models";
import { Card } from "@/components/ui/card";

interface TimelineChapterReaderProps {
  actorId: string;
  canManage: boolean;
  entry: TimelineEntry;
  sequence: number;
}

export function TimelineChapterReader({
  actorId,
  canManage,
  entry,
  sequence,
}: TimelineChapterReaderProps) {
  return (
    <Card className="group relative h-fit overflow-hidden p-6 sm:p-8 lg:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft font-display text-sm font-bold text-brand">
            {String(sequence).padStart(2, "0")}
          </span>
          <p className="diary-kicker text-brand">{entry.dateLabel}</p>
        </div>
        {entry.occurredOn ? (
          <time
            className="body-text-sm text-muted"
            dateTime={entry.occurredOn}
          >
            {formatTimelineDate(entry.occurredOn)}
          </time>
        ) : null}
      </div>
      <h3 className="font-display display-md mt-6 text-brand-strong">
        {entry.title}
      </h3>
      {entry.imageUrl && entry.imageAltText ? (
        <div className="mt-5 overflow-hidden rounded-[calc(var(--radius-card)_-_0.35rem)] border border-border">
          <CatalogueItemImage alt={entry.imageAltText} src={entry.imageUrl} />
        </div>
      ) : null}
      <p className="body-text mt-5 whitespace-pre-line text-ink">
        {entry.story}
      </p>
      {entry.lesson ? (
        <blockquote className="mt-5 border-l-2 border-accent bg-brand-soft/45 px-4 py-3 text-sm leading-7 text-brand">
          <Quote
            className="mb-1 text-accent"
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
    </Card>
  );
}

function formatTimelineDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
