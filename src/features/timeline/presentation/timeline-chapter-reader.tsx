import Link from "next/link";
import { MattedImage } from "@/components/ui/matted-image";
import { chapterHref } from "@/features/timeline/presentation/memory-thread";
import { TimelineResponsePanel } from "@/features/timeline/presentation/timeline-response-panel";
import type { TimelineChapterPreview, TimelineEntry } from "@/modules/timeline/domain/timeline-models";

interface TimelineChapterReaderProps {
  actorId: string;
  canManage: boolean;
  entry: TimelineEntry;
  sequence: number;
  previous: TimelineChapterPreview | null;
  next: TimelineChapterPreview | null;
}

/* Reading order: date → title → story → photo → reflection → responses. */
export function TimelineChapterReader({
  actorId,
  canManage,
  entry,
  sequence,
  previous,
  next,
}: TimelineChapterReaderProps) {
  return (
    <article aria-labelledby="chapter-title">
      <p className="tabular text-sm font-medium text-muted">
        <span className="font-semibold text-brand">Chương {sequence}</span>
        <span aria-hidden="true" className="mx-2 inline-block h-3 w-px translate-y-0.5 bg-border-strong" />
        {entry.occurredOn ? (
          <time dateTime={entry.occurredOn}>{formatTimelineDate(entry.occurredOn)}</time>
        ) : (
          entry.dateLabel
        )}
      </p>
      <h2 className="font-display display-lg mt-3 text-brand-strong" id="chapter-title" tabIndex={-1}>
        {entry.title}
      </h2>
      {entry.occurredOn && entry.dateLabel ? <p className="mt-2 text-muted">{entry.dateLabel}</p> : null}

      <div className="prose-text mt-8 whitespace-pre-line text-ink">{entry.story}</div>

      {entry.imageUrl && entry.imageAltText ? (
        <figure className="reveal-develop mt-10">
          <MattedImage alt={entry.imageAltText} ratio="3/2" src={entry.imageUrl} />
        </figure>
      ) : null}

      {entry.lesson ? (
        <blockquote className="reveal-rise mt-10 max-w-[34ch] border-l border-rose py-1 pl-6 font-prose text-[1.3125rem] italic leading-[1.55] text-brand-strong">
          {entry.lesson}
        </blockquote>
      ) : null}

      <TimelineResponsePanel
        actorId={actorId}
        canManage={canManage}
        entryId={entry.id}
        responses={entry.responses}
      />

      {previous || next ? (
        <nav aria-label="Chương liền kề" className="mt-16 grid gap-6 border-t border-border pt-5 sm:grid-cols-2">
          {previous ? (
            <Link className="grid min-h-11 gap-0.5" href={chapterHref(previous.id)} scroll={false} transitionTypes={["chapter-change"]}>
              <span className="text-sm text-muted">Chương trước</span>
              <span className="font-display text-[1.0625rem] font-medium text-brand hover:underline hover:underline-offset-4">
                {previous.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link className="grid min-h-11 gap-0.5 sm:text-right" href={chapterHref(next.id)} scroll={false} transitionTypes={["chapter-change"]}>
              <span className="text-sm text-muted">Chương sau</span>
              <span className="font-display text-[1.0625rem] font-medium text-brand hover:underline hover:underline-offset-4">
                {next.title}
              </span>
            </Link>
          ) : null}
        </nav>
      ) : null}
    </article>
  );
}

function formatTimelineDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
