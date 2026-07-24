"use client";

import { ExternalLink, Heart, MailOpen, Music2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CatalogueItemImage } from "@/features/catalogue/presentation/catalogue-item-image";
import { formatFutureLetterDateTime } from "@/modules/future-letters/domain/future-letter-time";
import type { FutureLetter } from "@/modules/future-letters/domain/future-letter-models";

type OpeningPhase = "sealed" | "unsealing" | "revealing" | "opened";

export function FutureLetterOpeningCard({ letter }: { letter: FutureLetter }) {
  const [phase, setPhase] = useState<OpeningPhase>("sealed");
  const articleRef = useRef<HTMLElement>(null);
  const phaseTimersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      phaseTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      phaseTimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (phase === "opened") articleRef.current?.focus();
  }, [phase]);

  function openLetter() {
    if (phase !== "sealed") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("opened");
      return;
    }

    setPhase("unsealing");
    schedulePhase("revealing", 460);
    schedulePhase("opened", 1_020);
  }

  function schedulePhase(nextPhase: OpeningPhase, delay: number) {
    phaseTimersRef.current.push(
      window.setTimeout(() => setPhase(nextPhase), delay),
    );
  }

  const isEnvelopeVisible = phase !== "opened";
  const isPaperVisible = phase === "revealing" || phase === "opened";
  const hasImageBackdrop = Boolean(letter.imageUrl && letter.imageAltText);

  return (
    <article
      aria-label={`Thư từ ${letter.author.displayName}`}
      className="future-letter-opening"
      data-phase={phase}
      ref={articleRef}
      tabIndex={-1}
    >
      <p aria-live="polite" className="sr-only">
        {phase === "unsealing"
          ? "Triện sáp đang mở."
          : phase === "revealing"
            ? "Lá thư đang hiện ra."
            : phase === "opened"
              ? "Lá thư đã mở."
              : ""}
      </p>

      {isEnvelopeVisible ? (
        <div className="future-letter-envelope-stage">
          <span className="future-letter-light" aria-hidden="true" />
          <div className="future-letter-envelope" aria-hidden="true">
            <span className="future-letter-envelope-shadow" />
            <span className="future-letter-envelope-liner" />
            <span className="future-letter-flap" />
            <span className="future-letter-envelope-fold future-letter-envelope-fold--left" />
            <span className="future-letter-envelope-fold future-letter-envelope-fold--right" />
            <span className="future-letter-seal"><Heart size={16} fill="currentColor" strokeWidth={1.4} /></span>
          </div>
          <span className="future-letter-halo" aria-hidden="true" />
          <span className="future-letter-seal-fragments" aria-hidden="true">
            {Array.from({ length: 12 }, (_, index) => <i key={index} />)}
          </span>
          <span className="future-letter-sparks" aria-hidden="true">
            {Array.from({ length: 10 }, (_, index) => <i key={index} />)}
          </span>
          {phase === "sealed" ? (
            <div className="future-letter-open-control">
              <p className="diary-kicker">Đã đến giờ hẹn</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                {letter.author.displayName} có một điều muốn gửi đến hôm nay.
              </p>
              <Button className="mt-4" onClick={openLetter} type="button">
                <MailOpen size={16} aria-hidden="true" />
                Mở thư
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {isPaperVisible ? (
        <div
          aria-hidden={phase !== "opened"}
          className="future-letter-paper"
          id={`future-letter-${letter.id}`}
        >
          {hasImageBackdrop ? (
            <div className="future-letter-paper-image">
              <CatalogueItemImage alt={letter.imageAltText!} src={letter.imageUrl!} variant="content-fill" />
            </div>
          ) : null}
          {hasImageBackdrop ? <span aria-hidden="true" className="future-letter-paper-scrim" /> : null}
          <div className="future-letter-paper-content">
            <div className="border-b border-[var(--color-border)] pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[var(--color-accent)]">
                  <span className="diary-rule" aria-hidden="true" />
                  <p className="diary-kicker text-[var(--color-accent)]">Gửi lại đúng ngày hẹn</p>
                </div>
                <Sparkles className="text-[var(--color-accent)]" size={18} strokeWidth={1.35} aria-hidden="true" />
              </div>
              <div className="mt-4 flex min-w-0 items-center gap-3">
                <Avatar displayName={letter.author.displayName} imageUrl={letter.author.avatarUrl} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[var(--color-brand-strong)]">{letter.author.displayName}</p>
                  <time className="mt-0.5 block text-xs text-[var(--color-muted)]" dateTime={letter.opensAt}>
                    Hẹn mở {formatFutureLetterDateTime(letter.opensAt)}
                  </time>
                </div>
              </div>
            </div>
            <p className="diary-kicker mt-5">Đã mở ra</p>
            <div className="future-letter-title-row">
              <h3 className="font-display min-w-0 break-words text-3xl font-semibold tracking-[-0.045em] text-[var(--color-brand-strong)]">
                {letter.title}
              </h3>
              {letter.musicUrl ? (
                <a
                  aria-label={`Nghe bài hát đi cùng thư: ${letter.title}`}
                  className="future-letter-music-link"
                  href={letter.musicUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Music2 size={16} aria-hidden="true" />
                  <span>Bài hát</span>
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              ) : null}
            </div>
            <p className="mt-5 break-words whitespace-pre-line text-[15px] leading-8 text-[var(--color-ink)]">
              {letter.content}
            </p>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function Avatar({ displayName, imageUrl }: { displayName: string; imageUrl: string | null }) {
  if (imageUrl) {
    return <img alt="" className="h-10 w-10 shrink-0 rounded-full border border-[var(--color-border)] object-cover" decoding="async" height={40} loading="lazy" src={imageUrl} width={40} />;
  }

  return <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--color-brand-soft)] text-sm font-bold text-[var(--color-brand)]" aria-hidden="true">{displayName.trim().slice(0, 1).toLocaleUpperCase("vi-VN") || "T"}</span>;
}
