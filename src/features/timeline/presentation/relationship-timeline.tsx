import { BookHeart, Heart, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { TimelineChapterCard } from "@/features/timeline/presentation/timeline-chapter-card";
import { TimelineFilmControls } from "@/features/timeline/presentation/timeline-film-controls";
import type { TimelineEntry } from "@/modules/timeline/domain/timeline-models";
import type { ActiveActor } from "@/modules/identity/domain/current-actor";

const TIMELINE_FILM_VIEWPORT_ID = "timeline-film-viewport";

interface RelationshipTimelineProps {
  actor: ActiveActor;
  entries: TimelineEntry[];
}

export function RelationshipTimeline({
  actor,
  entries,
}: RelationshipTimelineProps) {
  return (
    <div className="diary-shell">
      <a
        className="sr-only absolute left-5 top-4 z-50 rounded-full bg-[var(--color-brand-strong)] px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
        href="#journey-content"
      >
        Đi tới hành trình
      </a>
      <AppHeader activeSection="journey" actor={actor} />

      <main id="journey-content" tabIndex={-1}>
        <section className="mx-auto max-w-5xl px-5 pb-11 pt-11 text-center sm:px-8 sm:pb-15 sm:pt-17 lg:px-10">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand)]" aria-hidden="true">
            <BookHeart size={20} strokeWidth={1.35} />
          </span>
          <p className="diary-kicker mt-4">Một cuốn nhật ký chung</p>
          <div className="mt-4 flex items-center justify-center gap-3 text-[var(--color-accent)]" aria-hidden="true">
            <span className="diary-rule" />
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            <span className="diary-rule" />
          </div>
          <h1 className="font-display display-lg mx-auto mt-5 max-w-3xl text-balance font-semibold text-[var(--color-brand-strong)]">
            Chúng mình đã lớn lên cùng nhau như thế nào.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--color-muted)]">
            Không chỉ là những ngày đã đi qua, mà còn là những điều mình đã cùng học,
            cùng vượt qua và vẫn đang lựa chọn mỗi ngày.
          </p>
        </section>

        {entries.length ? (
          <section
            aria-labelledby="timeline-heading"
            className="border-y border-[var(--color-border)] bg-[rgb(255_252_248_/_62%)] py-11 sm:py-15"
          >
            <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
              <div className="mx-auto max-w-2xl text-center">
                <p className="diary-kicker">Từng trang mình đã viết</p>
                <h2
                  className="font-display mt-2 text-balance text-3xl font-semibold tracking-[-0.05em] text-[var(--color-brand-strong)] sm:text-4xl"
                  id="timeline-heading"
                >
                  Hành trình của chúng mình
                </h2>
              </div>
              <div className="timeline-film-stage mt-8 sm:mt-10">
                <div
                  aria-label="Cuộn phim các chương trong hành trình"
                  className="timeline-film-viewport"
                  id={TIMELINE_FILM_VIEWPORT_ID}
                  role="region"
                  tabIndex={0}
                >
                  <ol className="timeline-filmstrip">
                    {entries.map((entry, index) => (
                      <li
                        className="timeline-film-frame"
                        id={`timeline-entry-${entry.id}`}
                        key={entry.id}
                      >
                        <TimelineChapterCard
                          actorId={actor.userId}
                          canManage={actor.canManageCatalogue}
                          entry={entry}
                          sequence={index + 1}
                        />
                        <TimelineFilmMarker entry={entry} />
                      </li>
                    ))}
                  </ol>
                </div>
                {entries.length > 1 ? <TimelineFilmControls viewportId={TIMELINE_FILM_VIEWPORT_ID} /> : null}
              </div>
            </div>
          </section>
        ) : (
          <section className="mx-auto max-w-3xl px-5 pb-14 sm:px-8 lg:px-10">
            <div className="diary-wash rounded-[var(--radius-dialog)] border border-[var(--color-border)] px-6 py-10 text-center shadow-[var(--shadow-soft)] sm:px-10">
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand)]" aria-hidden="true">
                <Heart size={19} fill="currentColor" strokeWidth={1.3} />
              </span>
              <h2 className="font-display mt-4 text-3xl font-semibold tracking-[-0.045em] text-[var(--color-brand-strong)]">
                Hành trình đang chờ trang đầu tiên.
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[var(--color-muted)]">
                Một ngày thật đáng nhớ, một điều đã cùng học được, hay chỉ một câu nói
                khiến mình muốn giữ lại — tất cả đều có thể bắt đầu từ đây.
              </p>
              {actor.canManageCatalogue ? (
                <a className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--color-brand)] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--color-brand-strong)]" href="/admin/hanh-trinh">
                  <Sparkles size={16} aria-hidden="true" />
                  Viết mốc đầu tiên
                </a>
              ) : null}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function TimelineFilmMarker({ entry }: { entry: TimelineEntry }) {
  const dateLabel = entry.occurredOn ? (
    <time className="timeline-film-marker-date" dateTime={entry.occurredOn}>
      {entry.dateLabel}
    </time>
  ) : (
    <p className="timeline-film-marker-date">{entry.dateLabel}</p>
  );

  return (
    <div className="timeline-film-marker">
      <span className="timeline-film-marker-dot" aria-hidden="true" />
      {dateLabel}
      <p className="timeline-film-marker-title">{entry.title}</p>
    </div>
  );
}
