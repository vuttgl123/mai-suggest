import { BookHeart, Heart, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { TimelineChapterPreview } from "@/features/timeline/presentation/timeline-chapter-preview";
import { TimelineChapterReader } from "@/features/timeline/presentation/timeline-chapter-reader";
import { TimelineFilmControls } from "@/features/timeline/presentation/timeline-film-controls";
import type { TimelineEntry, TimelineChapterPreview as TimelineChapterPreviewModel } from "@/modules/timeline/domain/timeline-models";
import type { ActiveActor } from "@/modules/identity/domain/current-actor";

const TIMELINE_FILM_VIEWPORT_ID = "timeline-film-viewport";

interface RelationshipTimelineProps {
  actor: ActiveActor;
  previews: TimelineChapterPreviewModel[];
  activeChapter: TimelineEntry | null;
}

export function RelationshipTimeline({
  actor,
  previews,
  activeChapter,
}: RelationshipTimelineProps) {
  const activeChapterIndex = previews.findIndex((p) => p.id === activeChapter?.id);

  return (
    <div className="journey-layout">
      <a
        className="sr-only absolute left-5 top-4 z-50 rounded-full bg-brand-strong px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
        href="#journey-content"
      >
        Đi tới hành trình
      </a>
      <AppHeader activeSection="journey" actor={actor} />

      <main id="journey-content" tabIndex={-1}>
        <section className="diary-container diary-section pt-16 lg:pt-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 text-accent" aria-hidden="true">
              <BookHeart size={20} strokeWidth={1.35} />
              <span className="h-px w-16 bg-accent/55" />
            </div>
            <p className="diary-kicker mt-5 text-muted">Hành trình của chúng mình</p>
            <h1 className="font-display display-xl mt-3 max-w-3xl text-balance font-semibold text-brand-strong">
              Chúng mình đã lớn lên cùng nhau như thế nào.
            </h1>
            <p className="body-text mt-6 max-w-2xl text-muted">
              Không chỉ là những ngày đã đi qua, mà còn là những điều mình đã cùng học,
              cùng vượt qua và vẫn đang lựa chọn mỗi ngày.
            </p>
          </div>
        </section>

        {previews.length > 0 ? (
          <section
            aria-labelledby="timeline-heading"
            className="mt-8 pb-20"
          >
            <div className="diary-container">
              <div className="flex flex-wrap items-end justify-between gap-5 border-t border-border pt-8">
                <div>
                  <h2
                    className="font-display text-balance text-2xl font-semibold text-brand-strong"
                    id="timeline-heading"
                  >
                    Từng trang mình đã viết
                  </h2>
                </div>
                <p className="body-text-sm max-w-xs text-muted">{previews.length} trang đang được gìn giữ</p>
              </div>
              <div className="timeline-film-stage mt-9 sm:mt-11">
                <div
                  aria-label="Cuộn phim các chặng trong hành trình"
                  className="timeline-film-viewport"
                  id={TIMELINE_FILM_VIEWPORT_ID}
                  role="region"
                  tabIndex={0}
                >
                  <ol className="flex w-max gap-4 pb-4 px-1" style={{ scrollSnapType: "x mandatory" }}>
                    {previews.map((preview, index) => {
                      const isActive = preview.id === activeChapter?.id;
                      return (
                        <li
                          className="timeline-film-frame snap-start"
                          id={`timeline-entry-${preview.id}`}
                          key={preview.id}
                        >
                          <TimelineChapterPreview
                            chapter={preview}
                            isActive={isActive}
                            sequence={index + 1}
                          />
                        </li>
                      );
                    })}
                  </ol>
                </div>
                {previews.length > 1 ? <TimelineFilmControls viewportId={TIMELINE_FILM_VIEWPORT_ID} /> : null}
              </div>

              {activeChapter ? (
                <div className="mt-12">
                  <TimelineChapterReader
                    actorId={actor.userId}
                    canManage={actor.canManageCatalogue}
                    entry={activeChapter}
                    sequence={activeChapterIndex >= 0 ? activeChapterIndex + 1 : 1}
                  />
                </div>
              ) : null}
            </div>
          </section>
        ) : (
          <section className="mx-auto max-w-3xl px-5 pb-14 sm:px-8 lg:px-10">
            <div className="diary-wash rounded-[var(--radius-dialog)] border border-border px-6 py-10 text-center  sm:px-10">
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-brand-soft text-brand" aria-hidden="true">
                <Heart size={19} fill="currentColor" strokeWidth={1.3} />
              </span>
              <h2 className="font-display mt-4 text-3xl font-semibold tracking-[-0.045em] text-brand-strong">
                Hành trình đang chờ trang đầu tiên.
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-muted">
                Một ngày thật đáng nhớ, một điều đã cùng học được, hay chỉ một câu nói
                khiến mình muốn giữ lại. Tất cả đều có thể bắt đầu từ đây.
              </p>
              {actor.canManageCatalogue ? (
                <a className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-strong" href="/admin/hanh-trinh">
                  <Sparkles size={16} aria-hidden="true" />
                  Viết mục đầu tiên
                </a>
              ) : null}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
