"use client";

import { useEffect, useRef, useState } from "react";
import { ArchiveLabel } from "@/components/ui/archive-label";
import { WaxSeal } from "@/components/ui/wax-seal";
import { hasSeenRitual, markRitualSeen } from "@/features/future-letters/lib/ritual-memory";
import { LetterReadingRoom } from "@/features/future-letters/presentation/letter-reading-room";
import { formatFutureLetterOpening } from "@/modules/future-letters/domain/future-letter-time";
import type { FutureLetter, FutureLetterSummary } from "@/modules/future-letters/domain/future-letter-models";
import { getOpenedFutureLetterAction } from "@/modules/future-letters/presentation/future-letter-actions";

/*
 * An opened letter on the rack. The list only carries the summary; the content
 * is requested from the server when the reader asks to open it, and the server
 * re-checks the opening time.
 */
export function LetterEnvelope({ letter }: { letter: FutureLetterSummary }) {
  const [fullLetter, setFullLetter] = useState<FutureLetter | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [room, setRoom] = useState<{ playRitual: boolean } | null>(null);
  const [wasOpenedHere, setWasOpenedHere] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Device-local memory can only be read after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWasOpenedHere(hasSeenRitual(letter.id));
  }, [letter.id]);

  async function openLetter() {
    setError(null);
    let loaded = fullLetter;

    if (!loaded) {
      setIsFetching(true);
      try {
        loaded = await getOpenedFutureLetterAction(letter.id);
        setFullLetter(loaded);
      } catch {
        loaded = null;
      } finally {
        setIsFetching(false);
      }
    }

    if (!loaded) {
      setError("Chưa mở được thư này. Hãy thử lại.");
      return;
    }

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    setRoom({ playRitual: !prefersReducedMotion && !hasSeenRitual(letter.id) });
    markRitualSeen(letter.id);
    setWasOpenedHere(true);
  }

  function closeRoom() {
    setRoom(null);
    buttonRef.current?.focus();
  }

  return (
    <li className="letter-envelope reveal-slide">
      <div className="letter-envelope__body">
        <ArchiveLabel
          lines={[`Từ ${letter.author.displayName}`, formatFutureLetterOpening(letter.opensAt)]}
          title={letter.title}
        />
        <div className="letter-envelope__actions">
          <WaxSeal state={wasOpenedHere ? "broken" : "sealed"} />
          <button
            aria-describedby={error ? `letter-error-${letter.id}` : undefined}
            className={`inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-[0.9375rem] font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${
              wasOpenedHere
                ? "border-border-strong bg-transparent text-brand hover:border-brand hover:bg-brand-soft"
                : "border-transparent bg-brand text-on-brand hover:bg-brand-strong"
            }`}
            disabled={isFetching}
            onClick={openLetter}
            ref={buttonRef}
            type="button"
          >
            {isFetching ? "Đang mở…" : wasOpenedHere ? "Đọc lại" : "Mở thư"}
          </button>
        </div>
      </div>
      {error ? (
        <p className="relative mt-3 text-sm text-danger" id={`letter-error-${letter.id}`} role="alert">
          {error}
        </p>
      ) : null}
      {room && fullLetter ? (
        <LetterReadingRoom letter={fullLetter} onClose={closeRoom} playRitual={room.playRitual} />
      ) : null}
    </li>
  );
}
