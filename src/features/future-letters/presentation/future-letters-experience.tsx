"use client";

import { Heart, MailPlus, Sparkles } from "lucide-react";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { FutureLetterComposer } from "@/features/future-letters/presentation/future-letter-composer";
import { FutureLetterOpeningCard } from "@/features/future-letters/presentation/future-letter-opening-card";
import { ScheduledLetterList } from "@/features/future-letters/presentation/scheduled-letter-list";
import type {
  FutureLetter,
  FutureLetterRecord,
} from "@/modules/future-letters/domain/future-letter-models";
import type { ActiveActor } from "@/modules/identity/domain/current-actor";

interface FutureLettersExperienceProps {
  actor: ActiveActor;
  openedLetters: FutureLetter[];
  scheduledLetters: FutureLetterRecord[];
}

export function FutureLettersExperience({
  actor,
  openedLetters,
  scheduledLetters,
}: FutureLettersExperienceProps) {
  const [isComposerOpen, setComposerOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<FutureLetterRecord | null>(
    null,
  );

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
    <div className="diary-shell">
      <a
        className="sr-only absolute left-5 top-4 z-50 rounded-full bg-[var(--color-brand-strong)] px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
        href="#future-letters-content"
      >
        Đi tới những lá thư
      </a>
      <AppHeader activeSection="letters" actor={actor} />

      <main id="future-letters-content" tabIndex={-1}>
        <section className="mx-auto max-w-5xl px-5 pb-9 pt-11 text-center sm:px-8 sm:pb-12 sm:pt-15 lg:px-10">
          <span
            className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
            aria-hidden="true"
          >
            <MailPlus size={20} strokeWidth={1.35} />
          </span>
          <p className="diary-kicker mt-4">Một cuộc hẹn với tương lai</p>
          <h1 className="font-display display-lg mx-auto mt-4 max-w-3xl text-balance font-semibold text-[var(--color-brand-strong)]">
            Có những điều chỉ nên mở ra vào đúng một ngày.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-[var(--color-muted)] sm:text-base sm:leading-8">
            Viết cho ngày mai một lời thơ, một lời hứa, hay chỉ một điều mình muốn
            hai đứa cùng nhớ. Đến giờ hẹn, lá thư sẽ tìm được đường để mở ra.
          </p>
          <Button className="mt-6" onClick={createLetter} type="button">
            <MailPlus size={16} aria-hidden="true" />
            Hẹn một lá thư
          </Button>
        </section>

        {scheduledLetters.length ? (
          <section className="border-y border-[var(--color-border)] bg-[rgb(101_12_28_/_4%)] py-8 sm:py-10">
            <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
              <ScheduledLetterList letters={scheduledLetters} onEdit={editLetter} />
            </div>
          </section>
        ) : null}

        <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-13 lg:px-10" aria-labelledby="opened-letters-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="diary-kicker">Đã đến ngày</p>
              <h2 id="opened-letters-heading" className="font-display mt-2 text-3xl font-semibold tracking-[-0.045em] text-[var(--color-brand-strong)] sm:text-4xl">
                Những lá thư đã mở.
              </h2>
            </div>
            {openedLetters.length ? (
              <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-brand)]">
                {openedLetters.length} lá thư
              </span>
            ) : null}
          </div>

          {openedLetters.length ? (
            <div className="future-letter-archive mt-6 grid gap-5 lg:grid-cols-2">
              {openedLetters.map((letter) => (
                <FutureLetterOpeningCard key={letter.id} letter={letter} />
              ))}
            </div>
          ) : (
            <div className="diary-wash mt-6 rounded-[var(--radius-dialog)] border border-[var(--color-border)] px-6 py-10 text-center shadow-[var(--shadow-soft)] sm:px-10">
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand)]" aria-hidden="true">
                <Heart size={19} fill="currentColor" strokeWidth={1.3} />
              </span>
              <h3 className="font-display mt-4 text-3xl font-semibold tracking-[-0.045em] text-[var(--color-brand-strong)]">
                Một phong bì đang chờ ngày đến.
              </h3>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[var(--color-muted)]">
                Hãy hẹn lá thư đầu tiên. Khoảnh khắc mở ra sẽ là một mẩu kỷ niệm
                thật riêng để cùng quay về sau này.
              </p>
              <Button className="mt-5" onClick={createLetter} type="button" variant="secondary">
                <Sparkles size={16} aria-hidden="true" />
                Viết cho một ngày mai
              </Button>
            </div>
          )}
        </section>
      </main>

      <FutureLetterComposer
        isOpen={isComposerOpen}
        letter={editingLetter}
        onClose={closeComposer}
      />
    </div>
  );
}
