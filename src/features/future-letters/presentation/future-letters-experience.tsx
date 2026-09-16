"use client";

import { Heart, MailPlus, Sparkles } from "lucide-react";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { FutureLetterComposer } from "@/features/future-letters/presentation/future-letter-composer";
import { FutureLetterOpeningCard } from "@/features/future-letters/presentation/future-letter-opening-card";
import { ScheduledLetterList } from "@/features/future-letters/presentation/scheduled-letter-list";
import type {
  FutureLetterRecord,
  FutureLetterSummary,
  FutureMailboxPage,
} from "@/modules/future-letters/domain/future-letter-models";
import type { ActiveActor } from "@/modules/identity/domain/current-actor";
import { FutureLetterPagination } from "@/features/future-letters/presentation/future-letter-pagination";
import { FutureMailboxNavigation } from "@/features/future-letters/presentation/future-mailbox-navigation";

interface FutureLettersExperienceProps {
  actor: ActiveActor;
  mailbox: FutureMailboxPage;
  scheduledLetters: FutureLetterRecord[];
  searchQuery: string;
  currentPage: number;
}

export function FutureLettersExperience({
  actor,
  mailbox,
  scheduledLetters,
  searchQuery,
  currentPage,
}: FutureLettersExperienceProps) {
  const [isComposerOpen, setComposerOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<FutureLetterRecord | null>(
    null,
  );
  const [activeLetterId, setActiveLetterId] = useState<string | null>(null);
  const scheduledCount = scheduledLetters.length;
  const openedCount = mailbox.totalCount;

  function createLetter() {
    setEditingLetter(null);
    setComposerOpen(true);
  }

  function editLetter(letter: FutureLetterRecord) {
    setEditingLetter(letter);
    setComposerOpen(true);
  }

  function closeComposer() {
    setComposerOpen(false);
    setEditingLetter(null);
  }

  return (
    <div className="journey-layout">
      <a
        className="sr-only absolute left-5 top-4 z-50 rounded-full bg-brand-strong px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
        href="#future-letters-content"
      >
        Đi tới những lá thư
      </a>
      <AppHeader activeSection="letters" actor={actor} />

      <main id="future-letters-content" tabIndex={-1}>
        <section className="diary-container diary-section grid gap-10 pt-16 lg:pt-24 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.62fr)] lg:items-end lg:gap-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 text-accent" aria-hidden="true">
              <MailPlus size={21} strokeWidth={1.35} />
              <span className="h-px w-16 bg-accent/55" />
            </div>
            <p className="diary-kicker mt-5 text-muted">Một cuộc hẹn với tương lai</p>
            <h1 className="font-display display-xl mt-3 max-w-3xl text-balance font-semibold text-brand-strong">
              Có những điều chỉ nên mở ra vào đúng một ngày.
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-7 text-muted sm:text-base sm:leading-8">
              Viết cho ngày mai một lời thề, một lời hứa, hay chỉ một điều mình muốn
              hai đứa cùng nhớ. Đến giờ hẹn, lá thư sẽ tìm được đường để mở ra.
            </p>
            <Button className="mt-7" onClick={createLetter} type="button">
              <MailPlus size={16} aria-hidden="true" />
              Hẹn một lá thư
            </Button>
          </div>
          <aside className="diary-wash relative overflow-hidden rounded-[var(--radius-card)] border border-border p-5 sm:p-6">
            <p className="text-sm font-semibold text-accent">Bản viết hôm nay</p>
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4">
              <div>
                <p className="font-display text-4xl font-semibold tracking-[-0.07em] text-brand-strong">{scheduledCount}</p>
                <p className="mt-1 text-xs leading-5 text-muted">đang niêm phong</p>
              </div>
              <div>
                <p className="font-display text-4xl font-semibold tracking-[-0.07em] text-brand-strong">{openedCount}</p>
                <p className="mt-1 text-xs leading-5 text-muted">đã đến ngày</p>
              </div>
            </div>
          </aside>
        </section>

        {scheduledLetters.length ? (
          <section className="diary-container diary-section">
            <div className="pt-10 border-t border-border">
              <ScheduledLetterList letters={scheduledLetters} onEdit={editLetter} />
            </div>
          </section>
        ) : null}

        <section className="diary-container diary-section pb-20" aria-labelledby="opened-letters-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="diary-kicker text-muted">Khoảnh khắc đã đến</p>
              <h2 id="opened-letters-heading" className="font-display mt-2 text-3xl font-semibold tracking-[-0.045em] text-brand-strong sm:text-4xl">
                Những lá thư đã mở.
              </h2>
            </div>
            {mailbox.totalCount > 0 ? (
              <span className="rounded-full border border-border bg-paper px-3 py-1.5 text-xs font-semibold text-brand">
                {mailbox.totalCount} lá thư
              </span>
            ) : null}
          </div>

          {mailbox.totalCount > 0 && (
            <div className="mt-8 mb-6">
              <FutureMailboxNavigation initialQuery={searchQuery} />
            </div>
          )}

          {mailbox.items.length ? (
            <div className="future-letter-archive mt-6 grid gap-5 lg:grid-cols-2">
              {mailbox.items.map((letter) => (
                <FutureLetterOpeningCard
                  isActive={activeLetterId === letter.id}
                  key={letter.id}
                  letter={letter}
                  onActivate={() => setActiveLetterId(letter.id)}
                  onClose={() =>
                    setActiveLetterId((currentId) =>
                      currentId === letter.id ? null : currentId,
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div className="diary-wash mt-6 rounded-[var(--radius-dialog)] border border-border px-6 py-10 text-center sm:px-10">
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-brand-soft text-brand" aria-hidden="true">
                <Heart size={19} fill="currentColor" strokeWidth={1.3} />
              </span>
              <h3 className="font-display mt-4 text-3xl font-semibold tracking-[-0.045em] text-brand-strong">
                {searchQuery ? "Không tìm thấy thư nào." : "Một phong bì đang chờ ngày đến."}
              </h3>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-muted">
                {searchQuery 
                  ? "Hãy thử tìm kiếm với từ khóa khác." 
                  : "Hãy hẹn lá thư đầu tiên. Khoảnh khắc mở ra sẽ là một mẩu kỉ niệm thật riêng để cùng quay về sau này."}
              </p>
              {!searchQuery && (
                <Button className="mt-5" onClick={createLetter} type="button" variant="secondary">
                  <Sparkles size={16} aria-hidden="true" />
                  Viết cho một ngày mai
                </Button>
              )}
            </div>
          )}

          {mailbox.totalCount > 0 && (
            <FutureLetterPagination 
              currentPage={currentPage}
              hasMore={mailbox.hasMore}
              query={searchQuery}
            />
          )}
        </section>
      </main>

      <FutureLetterComposer
        isOpen={isComposerOpen}
        letter={editingLetter}
        onClose={closeComposer}
        key={`${isComposerOpen ? "open" : "closed"}:${editingLetter?.id ?? "new"}`}
      />
    </div>
  );
}
