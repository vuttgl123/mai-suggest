"use client";

import { Crown, ExternalLink, Heart, Quote, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import type { PreferenceItem } from "@/types/preference";
import { SmartImage } from "./smart-image";

interface ProductMessageDialogProps {
  item: PreferenceItem | null;
  isLiked: boolean;
  isFavorite: boolean;
  onClose: () => void;
  onToggleLiked: () => void;
  onToggleFavorite: () => void;
}

export function ProductMessageDialog({
  item,
  isLiked,
  isFavorite,
  onClose,
  onToggleLiked,
  onToggleFavorite,
}: ProductMessageDialogProps) {
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!item) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-[#210408]/75 p-0 md:items-center md:p-6"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-message-title"
            initial={reduceMotion ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 20 }}
            transition={{ duration: reduceMotion ? 0 : 0.26, ease: "easeOut" }}
            className="summary-scroll relative grid max-h-[94svh] w-full max-w-4xl overflow-y-auto rounded-t-[1.5rem] bg-[#fffaf4] md:max-h-[88svh] md:grid-cols-[minmax(18rem,0.9fr)_1.1fr] md:overflow-hidden md:rounded-[1.5rem]"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Đóng lời nhắn"
              className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#5a0d18]/15 bg-[#fffaf4]/95 text-[#5a0d18] shadow-sm backdrop-blur"
            >
              <X size={20} aria-hidden="true" />
            </button>

            <SmartImage
              src={item.imageUrl}
              alt={item.imageAlt}
              sizes="(max-width: 767px) 100vw, 42vw"
              className="min-h-[44svh] w-full rounded-none md:h-full md:min-h-[34rem]"
            />

            <div className="flex min-w-0 flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 sm:px-7 md:overflow-y-auto md:px-9 md:py-10">
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#9b763e]">
                {item.brand ?? "Một lựa chọn dành cho em"}
              </p>
              <h2
                id="product-message-title"
                className="font-display text-balance mt-2 pr-10 text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-[#31080e] sm:text-4xl"
              >
                {item.name}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#765e62]">
                {item.description}
              </p>

              <div className="my-6 h-px bg-[#5a0d18]/10" />
              <div className="relative rounded-[1.2rem] border border-[#c8a96b]/35 bg-[#f8f1e8] px-5 py-6 text-center">
                <Quote
                  className="mx-auto text-[#c8a96b]"
                  size={22}
                  strokeWidth={1.3}
                  aria-hidden="true"
                />
                <p className="mt-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#9b763e]">
                  Một lời nhắn cho em
                </p>
                <blockquote className="font-display mt-3 whitespace-pre-line text-xl font-medium italic leading-8 text-[#5a0d18] sm:text-2xl sm:leading-9">
                  {item.message}
                </blockquote>
              </div>

              <div className="mt-5 flex flex-wrap gap-2" aria-label="Phong cách">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#5a0d18]/10 px-2.5 py-1 text-[0.62rem] text-[#765e62]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {item.referencePrice && (
                <p className="mt-4 text-xs text-[#765e62]">
                  <span className="mr-1.5 font-semibold text-[#9b763e]">Giá tham khảo:</span>
                  {item.referencePrice}
                </p>
              )}

              {item.sourceName && item.sourceUrl && (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-3 inline-flex min-h-11 w-fit items-center gap-1.5 py-2 text-xs font-semibold text-[#7a1425] underline decoration-[#c8a96b]/70 underline-offset-4"
                >
                  Xem nơi tham khảo: {item.sourceName}
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              )}

              <div className="mt-6 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  aria-pressed={isLiked}
                  onClick={onToggleLiked}
                  className={`flex min-h-12 items-center justify-center gap-2 rounded-full border px-3 text-xs font-semibold ${
                    isLiked
                      ? "border-[#7a1425] bg-[#7a1425] text-white"
                      : "border-[#5a0d18]/20 text-[#5a0d18]"
                  }`}
                >
                  <Heart size={16} fill={isLiked ? "currentColor" : "none"} aria-hidden="true" />
                  {isLiked ? "Đã thích" : "Em thích"}
                </button>
                <button
                  type="button"
                  aria-pressed={isFavorite}
                  onClick={onToggleFavorite}
                  className={`flex min-h-12 items-center justify-center gap-2 rounded-full border px-3 text-xs font-semibold ${
                    isFavorite
                      ? "border-[#c8a96b] bg-[#efe2bd] text-[#5a0d18]"
                      : "border-[#c8a96b]/65 text-[#6c4a1e]"
                  }`}
                >
                  <Crown size={16} fill={isFavorite ? "currentColor" : "none"} aria-hidden="true" />
                  Thích nhất
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
