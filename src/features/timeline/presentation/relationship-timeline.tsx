import { BookHeart, Heart, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { TimelineChapterCard } from "@/features/timeline/presentation/timeline-chapter-card";
import { TimelineFeaturedChapter } from "@/features/timeline/presentation/timeline-featured-chapter";
import type { TimelineEntry } from "@/modules/timeline/domain/timeline-models";
import type { ActiveActor } from "@/modules/identity/domain/current-actor";

interface RelationshipTimelineProps {
  actor: ActiveActor;
  entries: TimelineEntry[];
}

export function RelationshipTimeline({
  actor,
  entries,
}: RelationshipTimelineProps) {
  const [featuredEntry, ...chapterEntries] = entries;

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

        {featuredEntry ? (
          <>
            <section
              className="relative isolate overflow-hidden border-y border-[var(--color-border)] bg-[rgb(255_249_243_/_55%)]"
              aria-labelledby="timeline-heading"
            >
              <span
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/45 to-transparent"
                aria-hidden="true"
              />
              <div className="relative mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
                <div className="mb-6 max-w-2xl sm:mb-8">
                  <p className="diary-kicker">Một chương đang mở</p>
                  <h2
                    className="font-display mt-2 text-balance text-3xl font-semibold tracking-[-0.05em] text-[var(--color-brand-strong)] sm:text-4xl"
                    id="timeline-heading"
                  >
                    Điều mình đang cùng viết
                  </h2>
                </div>
                <TimelineFeaturedChapter
                  actorId={actor.userId}
                  canManage={actor.canManageCatalogue}
                  entry={featuredEntry}
                />
              </div>
            </section>

            {chapterEntries.length ? (
              <section className="border-b border-[var(--color-border)] bg-[rgb(255_252_248_/_62%)] py-11 sm:py-15">
                <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
                  <div className="mx-auto max-w-2xl text-center">
                    <p className="diary-kicker">Lật lại những trang trước</p>
                    <h2 className="font-display mt-2 text-balance text-3xl font-semibold tracking-[-0.05em] text-[var(--color-brand-strong)] sm:text-4xl">
                      Những chương đã viết
                    </h2>
                  </div>
                  <ol className="timeline-rail mt-8 sm:mt-10">
                    {chapterEntries.map((entry, index) => (
                      <li
                        className={`timeline-entry ${index % 2 ? "timeline-entry--right" : ""}`}
                        id={`timeline-entry-${entry.id}`}
                        key={entry.id}
                      >
                        <TimelineChapterCard
                          actorId={actor.userId}
                          canManage={actor.canManageCatalogue}
                          entry={entry}
                          sequence={index + 2}
                        />
                      </li>
                    ))}
                  </ol>
                </div>
              </section>
            ) : null}
          </>
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
