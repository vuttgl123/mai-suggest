"use client";

import { ExternalLink, Heart, MailOpen, Music2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CatalogueItemImage } from "@/features/catalogue/presentation/catalogue-item-image";
import { formatFutureLetterDateTime } from "@/modules/future-letters/domain/future-letter-time";
import type { FutureLetter } from "@/modules/future-letters/domain/future-letter-models";

type OpeningPhase = "sealed" | "opening" | "opened";

export function FutureLetterOpeningCard({ letter }: { letter: FutureLetter }) {
  const [phase, setPhase] = useState<OpeningPhase>("sealed");
  const articleRef = useRef<HTMLElement>(null);
  const openingTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (openingTimer.current !== null) {
        window.clearTimeout(openingTimer.current);
      }
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

    setPhase("opening");
    openingTimer.current = window.setTimeout(() => setPhase("opened"), 720);
  }

  return (
    <article
      aria-label={`Thư từ ${letter.author.displayName}`}
      className="future-letter-opening"
      data-phase={phase}
      ref={articleRef}
      tabIndex={-1}
    >
      {phase !== "opened" ? (
        <div className="future-letter-envelope-stage">
          <div className="future-letter-envelope" aria-hidden="true">
            <span className="future-letter-envelope-shadow" />
            <span className="future-letter-flap" />
            <span className="future-letter-envelope-fold future-letter-envelope-fold--left" />
            <span className="future-letter-envelope-fold future-letter-envelope-fold--right" />
            <span className="future-letter-seal"><Heart size={16} fill="currentColor" strokeWidth={1.4} /></span>
          </div>
          <span className="future-letter-halo" aria-hidden="true" />
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

      {phase !== "sealed" ? (
        <div aria-hidden={phase !== "opened"} className="future-letter-paper" id={`future-letter-${letter.id}`}>
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-border)] pb-4">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar displayName={letter.author.displayName} imageUrl={letter.author.avatarUrl} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[var(--color-brand-strong)]">{letter.author.displayName}</p>
                <time className="mt-0.5 block text-xs text-[var(--color-muted)]" dateTime={letter.opensAt}>
                  Hẹn mở {formatFutureLetterDateTime(letter.opensAt)}
                </time>
              </div>
            </div>
            <Sparkles className="text-[var(--color-accent)]" size={18} strokeWidth={1.35} aria-hidden="true" />
          </div>
          <p className="diary-kicker mt-5">Đã mở ra</p>
          <h3 className="font-display mt-2 break-words text-3xl font-semibold tracking-[-0.045em] text-[var(--color-brand-strong)]">
            {letter.title}
          </h3>
          <p className="mt-5 break-words whitespace-pre-line text-[15px] leading-8 text-[var(--color-ink)]">
            {letter.content}
          </p>
          {letter.imageUrl && letter.imageAltText ? (
            <div className="mt-6 overflow-hidden rounded-[calc(var(--radius-card)_-_0.35rem)] border border-[var(--color-border)]">
              <CatalogueItemImage alt={letter.imageAltText} src={letter.imageUrl} />
            </div>
          ) : null}
          {letter.musicUrl ? (
            <a className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-brand-soft)] px-4 text-sm font-semibold text-[var(--color-brand)] transition hover:-translate-y-0.5 hover:bg-[rgb(233_222_218_/_70%)]" href={letter.musicUrl} rel="noreferrer" target="_blank">
              <Music2 size={16} aria-hidden="true" />
              Nghe bài hát đi cùng lá thư
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          ) : null}
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
