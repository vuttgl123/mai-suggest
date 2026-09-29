import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { TimelineChapterPreview } from "@/modules/timeline/domain/timeline-models";

interface MemoryThreadProps {
  chapters: TimelineChapterPreview[];
  activeChapterId: string | null;
}

export function chapterHref(chapterId: string): string {
  return `/hanh-trinh?chapter=${encodeURIComponent(chapterId)}`;
}

function shortDate(chapter: TimelineChapterPreview): string {
  if (!chapter.occurredOn) return chapter.dateLabel;
  const [year, month] = chapter.occurredOn.split("-");
  return `${month}/${year}`;
}

function ThreadList({ chapters, activeChapterId }: MemoryThreadProps) {
  return (
    <ol className="memory-thread">
      {chapters.map((chapter, index) => {
        const isActive = chapter.id === activeChapterId;
        return (
          <li
            className="memory-thread__item"
            data-active={isActive ? "true" : undefined}
            key={chapter.id}
            style={{ "--node-index": index } as React.CSSProperties}
          >
            <Link
              aria-current={isActive ? "page" : undefined}
              className="memory-thread__link"
              href={chapterHref(chapter.id)}
              scroll={false}
              transitionTypes={["chapter-change"]}
            >
              <span className="memory-thread__number">Chương {index + 1}</span>
              <span className="memory-thread__title">{chapter.title}</span>
              <span className="memory-thread__date">{shortDate(chapter)}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

/* The chapter index on a thin thread. It shows structure only; it never fills
 * up as a progress bar. */
export function MemoryThread({ chapters, activeChapterId }: MemoryThreadProps) {
  if (chapters.length < 2) return null;

  return (
    <nav aria-label="Các chương" className="sticky top-28 max-h-[calc(100svh-8rem)] overflow-y-auto pb-6 pl-1">
      <ThreadList activeChapterId={activeChapterId} chapters={chapters} />
    </nav>
  );
}

/* Phones get a compact disclosure instead of the side index. It works without
 * JavaScript because it is a native <details>. */
export function TimelineChapterSelect({ chapters, activeChapterId }: MemoryThreadProps) {
  if (chapters.length < 2) return null;

  const activeIndex = Math.max(0, chapters.findIndex((chapter) => chapter.id === activeChapterId));
  const active = chapters[activeIndex];

  return (
    <details className="group rounded-[var(--radius-card)] border border-border bg-paper">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 text-[0.9375rem] [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="tabular font-semibold text-brand">
            Chương {activeIndex + 1} trên {chapters.length}
          </span>
          <span className="block truncate text-ink">{active.title}</span>
        </span>
        <ChevronDown aria-hidden="true" className="shrink-0 text-muted transition-transform group-open:rotate-180" size={18} strokeWidth={1.5} />
      </summary>
      <nav aria-label="Các chương" className="border-t border-border px-4 pb-2 pt-1">
        <ThreadList activeChapterId={activeChapterId} chapters={chapters} />
      </nav>
    </details>
  );
}
