"use client";

/* Avatar and attachment URLs come from Supabase and member input. */
/* eslint-disable @next/next/no-img-element */

import { ExternalLink, Music2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MattedImage } from "@/components/ui/matted-image";
import { WaxSeal } from "@/components/ui/wax-seal";
import { formatFutureLetterOpening } from "@/modules/future-letters/domain/future-letter-time";
import type { FutureLetter } from "@/modules/future-letters/domain/future-letter-models";

export type RitualPhase = "sealed" | "unsealing" | "flap" | "reveal" | "read";

const RITUAL_STEPS: Array<[RitualPhase, number]> = [
  ["unsealing", 200],
  ["flap", 480],
  ["reveal", 760],
  ["read", 1000],
];

interface LetterReadingRoomProps {
  letter: FutureLetter;
  playRitual: boolean;
  onClose: () => void;
}

/*
 * Quiet reading room in the Blue Hour palette. The letter content is only
 * rendered here after the server returned it, so nothing sealed can leak.
 * The ritual lasts about one second and can be skipped at any moment.
 */
export function LetterReadingRoom({ letter, playRitual, onClose }: LetterReadingRoomProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const timersRef = useRef<number[]>([]);
  const [phase, setPhase] = useState<RitualPhase>(playRitual ? "sealed" : "read");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }

    if (playRitual) {
      timersRef.current = RITUAL_STEPS.map(([nextPhase, delay]) =>
        window.setTimeout(() => setPhase(nextPhase), delay),
      );
    }

    const timers = timersRef.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [playRitual]);

  useEffect(() => {
    if (phase === "read") titleRef.current?.focus();
  }, [phase]);

  function skipToLetter() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    setPhase("read");
  }

  function close() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    dialogRef.current?.close();
    onClose();
  }

  return (
    <dialog
      aria-labelledby={`letter-title-${letter.id}`}
      className="letter-room"
      data-phase={phase}
      onCancel={(event) => {
        // Esc skips the ritual first, then closes the letter.
        event.preventDefault();
        if (phase === "read") close();
        else skipToLetter();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          if (phase === "read") close();
          else skipToLetter();
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" && phase !== "read") {
          event.preventDefault();
          skipToLetter();
        }
      }}
      ref={dialogRef}
    >
      <p aria-live="polite" className="sr-only">
        {phase === "read" ? "Lá thư đã mở." : "Đang mở thư."}
      </p>

      {phase !== "read" ? (
        <>
          <div aria-hidden="true" className="letter-room__envelope">
            <span className="letter-room__flap" />
            <span className="letter-room__pocket" />
            <WaxSeal className="letter-room__seal" size="3.5rem" state={phase === "sealed" ? "sealed" : "broken"} />
          </div>
          <button className="letter-room__skip" onClick={skipToLetter} type="button">
            Bỏ qua
          </button>
        </>
      ) : null}

      <article className="letter-room__paper" hidden={phase !== "reveal" && phase !== "read"}>
        <button aria-label="Đóng thư" className="letter-room__close" onClick={close} type="button">
          <X aria-hidden="true" size={18} strokeWidth={1.5} />
          <span>Đóng</span>
        </button>
        <h2 className="font-display display-md pr-24 text-brand-strong" id={`letter-title-${letter.id}`} ref={titleRef} tabIndex={-1}>
          {letter.title}
        </h2>
        <p className="tabular mt-3 flex items-center gap-2.5 text-sm text-muted">
          <Avatar displayName={letter.author.displayName} imageUrl={letter.author.avatarUrl} />
          <span className="min-w-0">
            Từ <span className="font-semibold text-ink">{letter.author.displayName}</span>.{" "}
            {formatFutureLetterOpening(letter.opensAt, { withTimeZone: true })}.
          </span>
        </p>
        <div className="prose-text mt-8 whitespace-pre-line break-words text-ink">{letter.content}</div>
        {letter.imageUrl && letter.imageAltText ? (
          <figure className="mt-8">
            <MattedImage alt={letter.imageAltText} ratio="4/3" src={letter.imageUrl} />
          </figure>
        ) : null}
        {letter.musicUrl ? (
          <a className="text-link mt-6" href={letter.musicUrl} rel="noreferrer" target="_blank">
            <Music2 aria-hidden="true" size={16} strokeWidth={1.5} />
            Nghe bài hát đi kèm
            <ExternalLink aria-hidden="true" size={14} strokeWidth={1.5} />
            <span className="sr-only">(mở trang ngoài)</span>
          </a>
        ) : null}
      </article>
    </dialog>
  );
}

function Avatar({ displayName, imageUrl }: { displayName: string; imageUrl: string | null }) {
  if (imageUrl) {
    return <img alt="" className="h-7 w-7 shrink-0 rounded-full border border-border object-cover" height={28} src={imageUrl} width={28} />;
  }

  return (
    <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border bg-paper-deep font-display text-xs font-medium text-brand-strong">
      {displayName.trim().charAt(0).toLocaleUpperCase("vi") || "T"}
    </span>
  );
}
