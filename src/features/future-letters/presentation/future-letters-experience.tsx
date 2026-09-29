"use client";

import Link from "next/link";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { FutureLetterComposer } from "@/features/future-letters/presentation/future-letter-composer";
import { FutureLetterPagination } from "@/features/future-letters/presentation/future-letter-pagination";
import { FutureMailboxNavigation } from "@/features/future-letters/presentation/future-mailbox-navigation";
import { LetterEnvelope } from "@/features/future-letters/presentation/letter-envelope";
import { ScheduledLetterList } from "@/features/future-letters/presentation/scheduled-letter-list";
import type {
  FutureLetterRecord,
  FutureMailboxPage,
} from "@/modules/future-letters/domain/future-letter-models";
import type { ActiveActor } from "@/modules/identity/domain/current-actor";

export type MailboxTab = "shared" | "scheduled";

interface FutureLettersExperienceProps {
  actor: ActiveActor;
  mailbox: FutureMailboxPage;
  scheduledLetters: FutureLetterRecord[];
  searchQuery: string;
  currentPage: number;
  tab: MailboxTab;
}

export function FutureLettersExperience({
  actor,
  mailbox,
  scheduledLetters,
  searchQuery,
  currentPage,
  tab,
}: FutureLettersExperienceProps) {
  const [isComposerOpen, setComposerOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<FutureLetterRecord | null>(null);
  // The author's own sealed letters are the only sealed letters ever counted.
  const showScheduledTab = scheduledLetters.length > 0 || tab === "scheduled";
  const activeTab = showScheduledTab ? tab : "shared";

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
    <div className="journey-layout pb-24">
      <a
        className="sr-only absolute left-5 top-4 z-50 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-on-brand focus:not-sr-only"
        href="#future-letters-content"
      >
        Đi tới hộp thư
      </a>
      <AppHeader activeSection="letters" actor={actor} />

      <main className="diary-container" id="future-letters-content" tabIndex={-1}>
        <header className="flex flex-wrap items-end justify-between gap-6 pt-14 sm:pt-20">
          <div>
            <h1 className="font-display display-xl max-w-[15ch] text-brand-strong">
              Gửi một chút hôm nay đến ngày mai
            </h1>
            <p className="mt-4 max-w-[52ch] text-muted">
              Viết bây giờ và hẹn một ngày giờ. Đến lúc đó, lá thư sẽ mở ra trong hòm thư chung
              cho mọi thành viên.
            </p>
          </div>
          <Button onClick={createLetter} type="button">
            Viết một lá thư
          </Button>
        </header>

        <nav aria-label="Hộp thư" className="mt-12 border-b border-border">
          <ul className="flex gap-6">
            <li>
              <Link
                aria-current={activeTab === "shared" ? "page" : undefined}
                className="mailbox-tab"
                href="/thu-hen-ngay-mo"
                scroll={false}
              >
                Hòm thư chung
              </Link>
            </li>
            {showScheduledTab ? (
              <li>
                <Link
                  aria-current={activeTab === "scheduled" ? "page" : undefined}
                  className="mailbox-tab"
                  href="/thu-hen-ngay-mo?tab=da-hen"
                  scroll={false}
                >
                  <span>
                    Thư tôi đã hẹn <span className="tabular">({scheduledLetters.length})</span>
                  </span>
                </Link>
              </li>
            ) : null}
          </ul>
        </nav>

        <div className="mt-8">
          {activeTab === "scheduled" ? (
            <ScheduledLetterList letters={scheduledLetters} onEdit={editLetter} />
          ) : (
            <section aria-labelledby="opened-letters-heading">
              <h2 className="sr-only" id="opened-letters-heading">
                Hòm thư chung
              </h2>
              {mailbox.totalCount > 0 || searchQuery ? (
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                  <FutureMailboxNavigation initialQuery={searchQuery} key={searchQuery} />
                  <p className="tabular text-[0.9375rem] text-muted">
                    {searchQuery
                      ? `${mailbox.totalCount} lá thư khớp “${searchQuery}”`
                      : `${mailbox.totalCount} lá thư đã mở`}
                  </p>
                </div>
              ) : null}

              {mailbox.items.length ? (
                <ul className="grid max-w-4xl gap-4 2xl:max-w-none 2xl:grid-cols-2">
                  {mailbox.items.map((letter) => (
                    <LetterEnvelope key={letter.id} letter={letter} />
                  ))}
                </ul>
              ) : (
                <div className="max-w-xl border-t border-border pt-8">
                  <h3 className="font-display heading-text text-brand-strong">
                    {searchQuery ? "Không có lá thư nào khớp từ khóa này." : "Chưa có lá thư nào đến ngày mở."}
                  </h3>
                  <p className="mt-3 text-muted">
                    {searchQuery
                      ? "Thử một từ khác trong tiêu đề thư."
                      : "Khi một lá thư đến giờ hẹn, nó sẽ xuất hiện ở đây."}
                  </p>
                  {searchQuery ? (
                    <Link className="text-link mt-3" href="/thu-hen-ngay-mo">
                      Xem toàn bộ hòm thư
                    </Link>
                  ) : (
                    <Button className="mt-5" onClick={createLetter} type="button" variant="secondary">
                      Viết một lá thư
                    </Button>
                  )}
                </div>
              )}

              <FutureLetterPagination currentPage={currentPage} hasMore={mailbox.hasMore} query={searchQuery} />
            </section>
          )}
        </div>
      </main>

      <FutureLetterComposer
        isOpen={isComposerOpen}
        key={`${isComposerOpen ? "open" : "closed"}:${editingLetter?.id ?? "new"}`}
        letter={editingLetter}
        onClose={closeComposer}
      />
    </div>
  );
}
