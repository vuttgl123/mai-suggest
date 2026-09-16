"use client";

/* Avatar URLs are supplied by Supabase and are intentionally rendered through
 * a native image boundary instead of a fixed Next Image allow-list. */
/* eslint-disable @next/next/no-img-element */

import { ChevronsUp, ExternalLink, Heart, MailOpen, Music2, Sparkles, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, ViewTransition } from "react";
import { Button } from "@/components/ui/button";
import { CatalogueItemImage } from "@/features/catalogue/presentation/catalogue-item-image";
import { formatFutureLetterDateTime } from "@/modules/future-letters/domain/future-letter-time";
import type { FutureLetter, FutureLetterSummary } from "@/modules/future-letters/domain/future-letter-models";
import { getOpenedFutureLetterAction } from "@/modules/future-letters/presentation/future-letter-actions";

type OpeningPhase = "sealed" | "unsealing" | "revealing" | "opened" | "preview";

interface FutureLetterOpeningCardProps {
  isActive: boolean;
  letter: FutureLetterSummary;
  onActivate: () => void;
  onClose: () => void;
}

function clearPhaseTimers(timerRefs: { current: number[] }) {
  timerRefs.current.forEach((timer) => window.clearTimeout(timer));
  timerRefs.current = [];
}

export function FutureLetterOpeningCard({
  isActive,
  letter,
  onActivate,
  onClose,
}: FutureLetterOpeningCardProps) {
  const [phase, setPhase] = useState<OpeningPhase>("sealed");
  const [fullLetter, setFullLetter] = useState<FutureLetter | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const articleRef = useRef<HTMLElement>(null);
  const previewButtonRef = useRef<HTMLButtonElement>(null);
  const phaseTimersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => clearPhaseTimers(phaseTimersRef);
  }, []);

  useEffect(() => {
    if (!isActive) clearPhaseTimers(phaseTimersRef);
  }, [isActive]);

  useEffect(() => {
    if (phase === "opened") articleRef.current?.focus();
    if (phase === "preview") previewButtonRef.current?.focus();
  }, [phase]);

  async function openLetter() {
    if (phase !== "sealed") return;

    onActivate();
    
    if (!fullLetter) {
      setIsFetching(true);
      try {
        const fetched = await getOpenedFutureLetterAction(letter.id);
        setFullLetter(fetched);
      } catch (err) {
        setIsFetching(false);
        // Có thể hiện thị Toast lỗi, tạm thời return
        return; 
      }
      setIsFetching(false);
    }

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
      window.setTimeout(() => {
        setPhase(nextPhase);
      }, delay),
    );
  }

  function readAgain() {
    onActivate();
    setPhase("opened");
  }

  function collapseLetter() {
    clearPhaseTimers(phaseTimersRef);
    setPhase("preview");
    onClose();
  }

  const renderPhase = !isActive && phase === "opened" ? "preview" : phase;
  const isEnvelopeVisible = renderPhase !== "opened";
  const isPaperVisible = renderPhase === "revealing" || renderPhase === "opened";
  const hasImageBackdrop = Boolean(fullLetter?.imageUrl && fullLetter?.imageAltText);

  if (renderPhase === "preview") {
    return (
      <ViewTransition name={`letter-${letter.id}`} default="none">
        <article
          aria-label={`Thư đã mở từ ${letter.author.displayName}`}
          className="future-letter-opening future-letter-opening--preview"
          data-active={isActive ? "true" : "false"}
        >
          <p aria-live="polite" className="sr-only">Lá thư đã được thu gọn.</p>
          <div className="future-letter-preview">
            <div>
              <p className="diary-kicker">Đã mở</p>
              <h3 className="font-display mt-2 break-words text-2xl font-semibold tracking-[-0.045em] text-brand-strong">
                {letter.title}
              </h3>
              <p className="mt-2 text-sm text-muted">
                {letter.author.displayName} — {formatFutureLetterDateTime(letter.opensAt)}
              </p>
            </div>
            <Button
              className="future-letter-preview__action"
              onClick={readAgain}
              ref={previewButtonRef}
              size="compact"
              type="button"
              variant="quiet"
            >
              <MailOpen size={15} aria-hidden="true" />
              Đọc lại
            </Button>
          </div>
        </article>
      </ViewTransition>
    );
  }

  return (
    <ViewTransition name={`letter-${letter.id}`} default="none">
      <article
        aria-label={`Thư từ ${letter.author.displayName}`}
        className="future-letter-opening"
        data-active={isActive ? "true" : "false"}
        data-phase={renderPhase}
        ref={articleRef}
        tabIndex={-1}
      >
        <p aria-live="polite" className="sr-only">
          {renderPhase === "unsealing"
            ? "Triện sáp đang mở."
            : renderPhase === "revealing"
              ? "Lá thư đang hiện ra."
              : renderPhase === "opened"
                ? "Lá thư đã mở."
                : ""}
        </p>

        {isEnvelopeVisible ? (
          <div className="future-letter-envelope-stage">
            <div className="future-letter-envelope" aria-hidden="true">
              <span className="future-letter-envelope-shadow" />
              <span className="future-letter-envelope-liner" />
              <span className="future-letter-flap" />
              <span className="future-letter-envelope-fold future-letter-envelope-fold--left" />
              <span className="future-letter-envelope-fold future-letter-envelope-fold--right" />
              <span className="future-letter-seal"><Heart size={16} fill="currentColor" strokeWidth={1.4} /></span>
            </div>
            {renderPhase === "sealed" ? (
              <div className="future-letter-open-control">
                <p className="diary-kicker">Đã đến giờ hẹn</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {letter.author.displayName} có một điều muốn gửi đến hôm nay.
                </p>
                <Button className="mt-4" onClick={openLetter} type="button" disabled={isFetching}>
                  {isFetching ? (
                    <Loader2 size={16} aria-hidden="true" className="animate-spin" />
                  ) : (
                    <MailOpen size={16} aria-hidden="true" />
                  )}
                  {isFetching ? "Đang mở..." : "Mở thư"}
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}

        {isPaperVisible ? (
          <div
            aria-hidden={renderPhase !== "opened"}
            className="future-letter-paper"
            id={`future-letter-${letter.id}`}
          >
            {hasImageBackdrop ? (
              <div className="future-letter-paper-image">
                <CatalogueItemImage alt={fullLetter?.imageAltText ?? ""} src={fullLetter?.imageUrl ?? ""} variant="content-fill" />
              </div>
            ) : null}
            {hasImageBackdrop ? <span aria-hidden="true" className="future-letter-paper-scrim" /> : null}
            <div className="future-letter-paper-content">
              <div className="future-letter-reader-header border-b border-border pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-accent">
                    <span className="diary-rule" aria-hidden="true" />
                    <p className="diary-kicker text-accent">Gửi lại đúng ngày hẹn</p>
                  </div>
                  <div className="flex items-center gap-2">
                      {renderPhase === "opened" ? (
                      <Button
                        className="future-letter-reader-header__action"
                        onClick={collapseLetter}
                        size="compact"
                        type="button"
                        variant="quiet"
                      >
                        <ChevronsUp size={15} aria-hidden="true" />
                        Thu gọn thư
                      </Button>
                    ) : null}
                  </div>
                </div>
                <div className="mt-4 flex min-w-0 items-center gap-3">
                  <Avatar displayName={letter.author.displayName} imageUrl={letter.author.avatarUrl} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-brand-strong">{letter.author.displayName}</p>
                    <time className="mt-0.5 block text-xs text-muted" dateTime={letter.opensAt}>
                      Hẹn mở {formatFutureLetterDateTime(letter.opensAt)}
                    </time>
                  </div>
                </div>
              </div>
              <p className="diary-kicker mt-5">Đã mở ra</p>
              <div className="future-letter-title-row">
                <h3 className="font-display min-w-0 break-words text-3xl font-semibold tracking-[-0.045em] text-brand-strong">
                  {letter.title}
                </h3>
                {fullLetter?.musicUrl ? (
                  <a
                    aria-label={`Nghe bài hát đi cùng thư: ${letter.title}`}
                    className="future-letter-music-link"
                    href={fullLetter.musicUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Music2 size={16} aria-hidden="true" />
                    <span>Bài hát</span>
                    <ExternalLink size={14} aria-hidden="true" />
                  </a>
                ) : null}
              </div>
              <p className="mt-5 break-words whitespace-pre-line text-[15px] leading-8 text-ink">
                {fullLetter?.content}
              </p>
              {renderPhase === "opened" ? (
                <div className="future-letter-reader-closeout">
                  <p>Đã đọc xong lá thư này?</p>
                  <Button
                    className="future-letter-reader-closeout__action"
                    onClick={collapseLetter}
                    size="compact"
                    type="button"
                    variant="quiet"
                  >
                    <ChevronsUp size={15} aria-hidden="true" />
                    Thu gọn thư
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </article>
    </ViewTransition>
  );
}

function Avatar({ displayName, imageUrl }: { displayName: string; imageUrl: string | null }) {
  if (imageUrl) {
    return <img alt="" className="h-10 w-10 shrink-0 rounded-full border border-border object-cover" decoding="async" height={40} loading="lazy" src={imageUrl} width={40} />;
  }

  return <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand" aria-hidden="true">{displayName.trim().slice(0, 1).toLocaleUpperCase("vi-VN") || "T"}</span>;
}
