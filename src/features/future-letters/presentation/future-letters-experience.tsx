"use client";

import { Heart, MailPlus, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { DiaryBook } from "@/components/diary/diary-book";
import { DiaryMark, DiaryRule } from "@/components/diary/diary-mark";
import { DiarySurface } from "@/components/diary/diary-surface";
import { Button } from "@/components/ui/button";
import { FutureLetterOpeningCard } from "@/features/future-letters/presentation/future-letter-opening-card";
import { ScheduledLetterList } from "@/features/future-letters/presentation/scheduled-letter-list";
import type {
  FutureLetter,
  FutureLetterRecord,
} from "@/modules/future-letters/domain/future-letter-models";
import type { ActiveActor } from "@/modules/identity/domain/current-actor";

const loadFutureLetterComposer = () =>
  import("@/features/future-letters/presentation/future-letter-composer").then(
    (module) => module.FutureLetterComposer,
  );

const FutureLetterComposer = dynamic(loadFutureLetterComposer, { ssr: false });

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
  const scheduledCount = scheduledLetters.length;
  const openedCount = openedLetters.length;

  function createLetter() {
    void loadFutureLetterComposer();
    setEditingLetter(null);
    setComposerOpen(true);
  }

  function editLetter(letter: FutureLetterRecord) {
    void loadFutureLetterComposer();
    setEditingLetter(letter);
    setComposerOpen(true);
  }

  function preloadComposer() {
    void loadFutureLetterComposer();
  }

  function closeComposer() {
    setComposerOpen(false);
    setEditingLetter(null);
  }

  return (
    <DiaryBook>
      <a
        className="sr-only absolute left-5 top-4 z-50 rounded-full bg-[var(--color-brand-strong)] px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
        href="#future-letters-content"
      >
        Đi tới những lá thư
      </a>
      <AppHeader activeSection="letters" actor={actor} />

      <main id="future-letters-content" tabIndex={-1}>
        <section className="diary-section-rule mx-auto max-w-5xl px-5 pb-10 pt-11 text-center sm:px-8 sm:pb-14 sm:pt-15 lg:px-10">
          <span
            className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
            aria-hidden="true"
          >
            <MailPlus size={20} strokeWidth={1.35} />
          </span>
          <DiaryMark className="mt-4">Một cuộc hẹn với tương lai</DiaryMark>
          <div className="mt-4 flex items-center justify-center gap-3 text-[var(--color-accent)]" aria-hidden="true">
            <DiaryRule />
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            <DiaryRule />
          </div>
          <h1 className="font-display display-lg mx-auto mt-5 max-w-3xl text-balance font-semibold text-[var(--color-brand-strong)]">
            Có những điều chỉ nên mở ra vào đúng một ngày.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-[var(--color-muted)] sm:text-base sm:leading-8">
            Viết cho ngày mai một lời thơ, một lời hứa, hay chỉ một điều mình muốn
            hai đứa cùng nhớ. Đến giờ hẹn, lá thư sẽ tìm được đường để mở ra.
          </p>
          <div className="mx-auto mt-7 grid max-w-md grid-cols-2 gap-3 text-left">
            <DiarySurface className="px-4 py-3" kind="ledger">
              <DiaryMark className="text-[var(--color-accent)]">Đang niêm phong</DiaryMark>
              <p className="font-display mt-2 text-2xl font-semibold tracking-[-0.045em] text-[var(--color-brand-strong)]">
                {scheduledCount}
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">lá thư đang chờ</p>
            </DiarySurface>
            <DiarySurface className="px-4 py-3" kind="ledger">
              <DiaryMark className="text-[var(--color-accent)]">Đã đến ngày</DiaryMark>
              <p className="font-display mt-2 text-2xl font-semibold tracking-[-0.045em] text-[var(--color-brand-strong)]">
                {openedCount}
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">lá thư đã mở</p>
            </DiarySurface>
          </div>
          <Button
            className="mt-6"
            onClick={createLetter}
            onFocus={preloadComposer}
            onMouseEnter={preloadComposer}
            type="button"
          >
            <MailPlus size={16} aria-hidden="true" />
            Hẹn một lá thư
          </Button>
        </section>

        {scheduledLetters.length ? (
          <section className="diary-section-rule relative isolate border-y border-[var(--color-border)] py-10 sm:py-12">
            <span
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/45 to-transparent"
              aria-hidden="true"
            />
            <DiarySurface className="relative mx-auto max-w-6xl px-5 py-5 sm:px-8 lg:px-10" kind="spread">
              <ScheduledLetterList letters={scheduledLetters} onEdit={editLetter} />
            </DiarySurface>
          </section>
        ) : null}

        <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-13 lg:px-10" aria-labelledby="opened-letters-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <DiaryMark>Khoảnh khắc đã đến</DiaryMark>
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
            <DiarySurface className="mt-6 px-6 py-10 text-center sm:px-10" kind="note">
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
              <Button
                className="mt-5"
                onClick={createLetter}
                onFocus={preloadComposer}
                onMouseEnter={preloadComposer}
                type="button"
                variant="secondary"
              >
                <Sparkles size={16} aria-hidden="true" />
                Viết cho một ngày mai
              </Button>
            </DiarySurface>
          )}
        </section>
      </main>

      {isComposerOpen ? (
        <FutureLetterComposer
          isOpen={isComposerOpen}
          letter={editingLetter}
          onClose={closeComposer}
        />
      ) : null}
    </DiaryBook>
  );
}
