"use client";

/* Avatar and attachment URLs come from Supabase and member input. */
/* eslint-disable @next/next/no-img-element */

import { ExternalLink, Music2, X } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { MattedImage } from "@/components/ui/matted-image";
import { formatFutureLetterOpening } from "@/modules/future-letters/domain/future-letter-time";
import type { FutureLetter } from "@/modules/future-letters/domain/future-letter-models";

/** Length of the full opening ritual; the stage is removed right after. */
export const LETTER_RITUAL_MS = 2600;

type Entrance = "ritual" | "quick";

interface LetterReadingRoomProps {
  letter: FutureLetter;
  playRitual: boolean;
  onClose: () => void;
}

// Gold motes and wax crumbs: fixed positions so the ritual looks the same each time.
const MOTES = [
  { x: "-150px", y: "-170px", delay: "0ms", size: "5px" },
  { x: "-70px", y: "-230px", delay: "120ms", size: "3px" },
  { x: "20px", y: "-260px", delay: "60ms", size: "4px" },
  { x: "90px", y: "-200px", delay: "180ms", size: "3px" },
  { x: "150px", y: "-150px", delay: "90ms", size: "5px" },
  { x: "-110px", y: "-120px", delay: "240ms", size: "3px" },
  { x: "120px", y: "-110px", delay: "210ms", size: "4px" },
  { x: "50px", y: "-300px", delay: "300ms", size: "3px" },
];

const CRUMBS = [
  { x: "-46px", y: "34px", r: "-70deg" },
  { x: "40px", y: "42px", r: "80deg" },
  { x: "-20px", y: "58px", r: "-30deg" },
  { x: "26px", y: "64px", r: "45deg" },
];

/*
 * The reading room, rendered into <body> so no ancestor (overflow, transform)
 * can clip it, even in browsers without <dialog>.showModal(). The letter
 * content is only here after the server returned it, so nothing sealed can
 * leak. The ritual can be skipped at any moment and never replays on re-reads.
 */
export function LetterReadingRoom({ letter, playRitual, onClose }: LetterReadingRoomProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<number | null>(null);
  const [isStaging, setIsStaging] = useState(playRitual);
  const [entrance, setEntrance] = useState<Entrance>(playRitual ? "ritual" : "quick");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    if (playRitual) {
      timerRef.current = window.setTimeout(() => setIsStaging(false), LETTER_RITUAL_MS);
    }

    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      root.style.overflow = previousOverflow;
    };
  }, [playRitual]);

  // Keep focus inside the room so Esc and Enter work even without a modal dialog.
  useEffect(() => {
    if (isStaging) skipRef.current?.focus({ preventScroll: true });
    else titleRef.current?.focus({ preventScroll: true });
  }, [isStaging]);

  function skipToLetter() {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setEntrance("quick");
    setIsStaging(false);
  }

  function close() {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    const dialog = dialogRef.current;
    // Older browsers and in-app webviews may lack the dialog methods.
    if (dialog && typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog?.removeAttribute("open");
    onClose();
  }

  function handleEscapeOrEnter(key: string): boolean {
    if (key === "Escape") {
      if (isStaging) skipToLetter();
      else close();
      return true;
    }
    if (key === "Enter" && isStaging) {
      skipToLetter();
      return true;
    }
    return false;
  }

  return createPortal(
    <dialog
      aria-labelledby={`letter-title-${letter.id}`}
      className="letter-room"
      data-entrance={entrance}
      data-staging={isStaging ? "true" : undefined}
      onCancel={(event) => {
        // Native Esc: skip the ritual first, then close the letter.
        event.preventDefault();
        handleEscapeOrEnter("Escape");
      }}
      onClick={(event) => {
        // Any tap during the ritual skips it; afterwards only the backdrop closes.
        if (isStaging) skipToLetter();
        else if (event.target === event.currentTarget) close();
      }}
      onKeyDown={(event) => {
        // Covers Enter always, and Esc in browsers without a modal dialog.
        if (event.key === "Escape" && dialogRef.current?.matches(":modal")) return;
        if (handleEscapeOrEnter(event.key)) event.preventDefault();
      }}
      ref={dialogRef}
    >
      <p aria-live="polite" className="sr-only">
        {isStaging ? "Đang mở thư." : "Lá thư đã mở."}
      </p>

      {isStaging ? (
        <>
          <div aria-hidden="true" className="ritual">
            <span className="ritual__glow" />
            <div className="ritual__envelope">
              <span className="ritual__back" />
              <div className="ritual__mini-letter">
                <span className="ritual__mini-title">{letter.title}</span>
                <span className="ritual__mini-line" />
                <span className="ritual__mini-line" />
                <span className="ritual__mini-line ritual__mini-line--short" />
              </div>
              <span className="ritual__pocket" />
              <span className="ritual__flap" />
              <span className="ritual__seal">
                <span className="ritual__seal-half ritual__seal-half--left" />
                <span className="ritual__seal-half ritual__seal-half--right" />
                <span className="ritual__seal-glint" />
                {CRUMBS.map((crumb, index) => (
                  <span
                    className="ritual__crumb"
                    key={index}
                    style={{ "--crumb-x": crumb.x, "--crumb-y": crumb.y, "--crumb-r": crumb.r } as CSSProperties}
                  />
                ))}
              </span>
            </div>
            {MOTES.map((mote, index) => (
              <span
                className="ritual__mote"
                key={index}
                style={{ "--mote-x": mote.x, "--mote-y": mote.y, "--mote-delay": mote.delay, "--mote-size": mote.size } as CSSProperties}
              />
            ))}
          </div>
          <button className="letter-room__skip" onClick={skipToLetter} ref={skipRef} type="button">
            Bỏ qua
          </button>
        </>
      ) : null}

      <article className="letter-room__paper">
        <button aria-label="Đóng thư" className="letter-room__close" onClick={close} type="button">
          <X aria-hidden="true" size={18} strokeWidth={1.5} />
          <span>Đóng</span>
        </button>
        <h2 className="letter-room__line font-display display-md pr-24 text-brand-strong" id={`letter-title-${letter.id}`} ref={titleRef} tabIndex={-1}>
          {letter.title}
        </h2>
        <p className="letter-room__line tabular mt-3 flex items-center gap-2.5 text-sm text-muted">
          <Avatar displayName={letter.author.displayName} imageUrl={letter.author.avatarUrl} />
          <span className="min-w-0">
            Từ <span className="font-semibold text-ink">{letter.author.displayName}</span>.{" "}
            {formatFutureLetterOpening(letter.opensAt, { withTimeZone: true })}.
          </span>
        </p>
        <div className="letter-room__line prose-text mt-8 whitespace-pre-line break-words text-ink">{letter.content}</div>
        {letter.imageUrl && letter.imageAltText ? (
          <figure className="letter-room__line mt-8">
            <MattedImage alt={letter.imageAltText} ratio="4/3" src={letter.imageUrl} />
          </figure>
        ) : null}
        {letter.musicUrl ? (
          <a className="letter-room__line text-link mt-6" href={letter.musicUrl} rel="noreferrer" target="_blank">
            <Music2 aria-hidden="true" size={16} strokeWidth={1.5} />
            Nghe bài hát đi kèm
            <ExternalLink aria-hidden="true" size={14} strokeWidth={1.5} />
            <span className="sr-only">(mở trang ngoài)</span>
          </a>
        ) : null}
      </article>
    </dialog>,
    document.body,
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
