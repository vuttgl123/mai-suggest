import { ViewTransition } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { MemoryThread, TimelineChapterSelect } from "@/features/timeline/presentation/memory-thread";
import { TimelineChapterReader } from "@/features/timeline/presentation/timeline-chapter-reader";
import type { ActiveActor } from "@/modules/identity/domain/current-actor";
import type { TimelineChapterPreview, TimelineEntry } from "@/modules/timeline/domain/timeline-models";

interface RelationshipTimelineProps {
  actor: ActiveActor;
  previews: TimelineChapterPreview[];
  activeChapter: TimelineEntry | null;
}

export function RelationshipTimeline({ actor, previews, activeChapter }: RelationshipTimelineProps) {
  const activeIndex = previews.findIndex((preview) => preview.id === activeChapter?.id);

  return (
    <div className="journey-layout pb-24">
      <a
        className="sr-only absolute left-5 top-4 z-50 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-on-brand focus:not-sr-only"
        href="#journey-content"
      >
        Đi tới hành trình
      </a>
      <AppHeader activeSection="journey" actor={actor} />

      <main className="diary-container" id="journey-content" tabIndex={-1}>
        <header className="pt-14 sm:pt-20">
          <h1 className="font-display display-xl max-w-[14ch] text-brand-strong">
            Chuyện hôm ấy, mình vẫn nhớ
          </h1>
          {previews.length ? (
            <p className="tabular mt-4 text-muted">{previews.length} chương đã viết</p>
          ) : null}
        </header>

        {activeChapter && previews.length ? (
          <div className="mt-12 grid lg:mt-16 lg:grid-cols-[minmax(13rem,17rem)_minmax(0,60rem)] lg:gap-x-[clamp(3rem,7vw,9rem)]">
            <div className="hidden lg:block">
              <MemoryThread activeChapterId={activeChapter.id} chapters={previews} />
            </div>
            <div className="mb-8 lg:hidden">
              <TimelineChapterSelect activeChapterId={activeChapter.id} chapters={previews} />
            </div>
            <div className="min-w-0">
              <ViewTransition
                default="none"
                enter={{ "chapter-change": "fade-in", default: "none" }}
                exit={{ "chapter-change": "fade-out", default: "none" }}
                key={activeChapter.id}
              >
                <div>
                  <TimelineChapterReader
                    actorId={actor.userId}
                    canManage={actor.canManageCatalogue}
                    entry={activeChapter}
                    next={activeIndex >= 0 ? (previews[activeIndex + 1] ?? null) : null}
                    previous={activeIndex > 0 ? previews[activeIndex - 1] : null}
                    sequence={activeIndex >= 0 ? activeIndex + 1 : 1}
                  />
                </div>
              </ViewTransition>
            </div>
          </div>
        ) : (
          <section className="mt-12 max-w-xl border-t border-border pt-8">
            <h2 className="font-display heading-text text-brand-strong">
              Hành trình đang chờ chương đầu tiên.
            </h2>
            <p className="mt-3 text-muted">
              {actor.canManageCatalogue
                ? "Một ngày đáng nhớ, một điều đã cùng học được. Chương đầu tiên có thể bắt đầu từ đó."
                : "Chương đầu tiên sẽ xuất hiện ở đây khi được viết."}
            </p>
            {actor.canManageCatalogue ? (
              <Link className="text-link mt-3" href="/admin/hanh-trinh">
                Viết chương đầu tiên
              </Link>
            ) : null}
          </section>
        )}
      </main>
    </div>
  );
}
