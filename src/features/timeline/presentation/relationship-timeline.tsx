import { BookHeart, Heart, Quote, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { CatalogueItemImage } from "@/features/catalogue/presentation/catalogue-item-image";
import { TimelineResponsePanel } from "@/features/timeline/presentation/timeline-response-panel";
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
        <section className="mx-auto max-w-5xl px-5 pb-10 pt-12 text-center sm:px-8 sm:pb-14 sm:pt-16 lg:px-10">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand)]" aria-hidden="true">
            <BookHeart size={20} strokeWidth={1.35} />
          </span>
          <p className="diary-kicker mt-4">Một cuốn nhật ký chung</p>
          <h1 className="font-display display-lg mx-auto mt-4 max-w-3xl text-balance font-semibold text-[var(--color-brand-strong)]">
            Chúng mình đã lớn lên cùng nhau như thế nào.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--color-muted)]">
            Không chỉ là những ngày đã đi qua, mà còn là những điều mình đã cùng học,
            cùng vượt qua và vẫn đang lựa chọn mỗi ngày.
          </p>
        </section>

        {entries.length ? (
          <section className="border-t border-[var(--color-border)] bg-[rgb(255_249_243_/_55%)] py-10 sm:py-14" aria-labelledby="timeline-heading">
            <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
              <h2 id="timeline-heading" className="sr-only">Các cột mốc của hành trình</h2>
              <ol className="timeline-rail">
                {entries.map((entry, index) => (
                  <li
                    className={`timeline-entry ${index % 2 ? "timeline-entry--right" : ""}`}
                    id={`timeline-entry-${entry.id}`}
                    key={entry.id}
                  >
                    <article className="timeline-entry-card">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="diary-kicker">{entry.dateLabel}</p>
                        {entry.occurredOn ? (
                          <time className="text-xs font-semibold text-[var(--color-muted)]" dateTime={entry.occurredOn}>
                            {formatTimelineDate(entry.occurredOn)}
                          </time>
                        ) : null}
                      </div>
                      <h3 className="font-display mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--color-brand-strong)]">
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
                        <blockquote className="mt-5 border-l-2 border-[var(--color-accent)] bg-[rgb(166_91_69_/_7%)] px-4 py-3 text-sm leading-7 text-[var(--color-brand)]">
                          <Quote className="mb-1 text-[var(--color-accent)]" size={16} strokeWidth={1.45} aria-hidden="true" />
                          {entry.lesson}
                        </blockquote>
                      ) : null}
                      <TimelineResponsePanel
                        actorId={actor.userId}
                        canManage={actor.canManageCatalogue}
                        entryId={entry.id}
                        responses={entry.responses}
                      />
                    </article>
                  </li>
                ))}
              </ol>
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

function formatTimelineDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
