"use client";

import { Crown, ExternalLink, Heart, Quote, Scale, X } from "lucide-react";
import { useRef } from "react";
import type { PreferenceItem } from "@/types/preference";
import { SmartImage } from "./smart-image";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";
import { IconButton } from "./ui/icon-button";

interface ProductMessageDialogProps {
  item: PreferenceItem | null;
  isLiked: boolean;
  isFavorite: boolean;
  isCompared: boolean;
  canCompare: boolean;
  selectionReady?: boolean;
  onClose: () => void;
  onToggleLiked: () => void;
  onToggleFavorite: () => void;
  onToggleCompare: () => void;
}

export function ProductMessageDialog({
  item,
  isLiked,
  isFavorite,
  isCompared,
  canCompare,
  selectionReady = true,
  onClose,
  onToggleLiked,
  onToggleFavorite,
  onToggleCompare,
}: ProductMessageDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog
      open={Boolean(item)}
      titleId="product-message-title"
      descriptionId="product-message-description"
      onClose={onClose}
      initialFocusRef={closeButtonRef}
      panelClassName="summary-scroll grid max-h-[94svh] max-w-4xl overflow-y-auto md:max-h-[88svh] md:grid-cols-[minmax(18rem,0.9fr)_1.1fr] md:overflow-hidden"
    >
      {item && (
        <>
            <IconButton
              ref={closeButtonRef}
              onClick={onClose}
              label="Đóng lời nhắn"
              icon={<X size={20} aria-hidden="true" />}
              className="fixed right-3 top-3 z-10 bg-[var(--color-paper)] md:absolute"
            />

            <SmartImage
              src={item.imageUrl}
              alt={item.imageAlt}
              sizes="(max-width: 767px) 100vw, 42vw"
              className="min-h-[44svh] w-full rounded-none md:h-full md:min-h-[34rem]"
            />

            <div className="flex min-w-0 flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 sm:px-7 md:overflow-y-auto md:px-9 md:py-10">
              <p className="text-[0.64rem] font-semibold text-[var(--color-accent)]">
                {item.brand ?? "Một lựa chọn dành cho em"}
              </p>
              <h2
                id="product-message-title"
                className="font-display text-balance mt-2 pr-10 text-3xl font-semibold leading-[1.05] tracking-normal text-[var(--color-brand-strong)] sm:text-4xl"
              >
                {item.name}
              </h2>
              <p id="product-message-description" className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
                {item.description}
              </p>
              <div className="mt-5 border-l-2 border-[var(--color-accent)] pl-4">
                <p className="text-xs font-semibold text-[var(--color-accent)]">
                  Vì sao gợi ý này phù hợp
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-ink)]">
                  {item.whyItFits}
                </p>
              </div>

              <div className="my-6 h-px bg-[var(--color-border)]" />
              <div className="relative border-y border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-6 text-center">
                <Quote
                  className="mx-auto text-[var(--color-accent)]"
                  size={22}
                  strokeWidth={1.3}
                  aria-hidden="true"
                />
                <p className="mt-2 text-[0.62rem] font-semibold text-[var(--color-accent)]">
                  {item.messageTitle}
                </p>
                <blockquote className="font-display mt-3 whitespace-pre-line text-xl font-medium italic leading-8 text-[var(--color-brand)] sm:text-2xl sm:leading-9">
                  {item.message}
                </blockquote>
              </div>

              <div className="mt-5 flex flex-wrap gap-2" aria-label="Phong cách">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-sm border border-[var(--color-border)] px-2.5 py-1 text-[0.62rem] text-[var(--color-muted)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {item.referencePrice && (
                <p className="mt-4 text-xs text-[var(--color-muted)]">
                  <span className="mr-1.5 font-semibold text-[var(--color-accent)]">Giá tham khảo:</span>
                  {item.referencePrice}
                </p>
              )}

              {item.sourceName && item.sourceUrl && (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-3 inline-flex min-h-11 w-fit items-center gap-1.5 py-2 text-xs font-semibold text-[var(--color-brand)] underline decoration-[var(--color-accent)] underline-offset-4"
                >
                  Xem nơi tham khảo: {item.sourceName}
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              )}

              <div className="mt-6 grid grid-cols-2 gap-2">
                <Button
                  variant={isLiked ? "primary" : "secondary"}
                  aria-pressed={isLiked}
                  disabled={!selectionReady}
                  onClick={onToggleLiked}
                  className="min-h-12 px-3 text-xs"
                >
                  <Heart size={16} fill={isLiked ? "currentColor" : "none"} aria-hidden="true" />
                  {isLiked ? "Đã thích" : "Em thích"}
                </Button>
                <Button
                  variant={isFavorite ? "primary" : "secondary"}
                  aria-pressed={isFavorite}
                  disabled={!selectionReady}
                  onClick={onToggleFavorite}
                  className="min-h-12 px-3 text-xs"
                >
                  <Crown size={16} fill={isFavorite ? "currentColor" : "none"} aria-hidden="true" />
                  Thích nhất
                </Button>
                <Button
                  variant={isCompared ? "primary" : "secondary"}
                  aria-pressed={isCompared}
                  onClick={onToggleCompare}
                  disabled={!canCompare}
                  className="col-span-2 min-h-12 px-3 text-xs"
                >
                  <Scale size={16} aria-hidden="true" />
                  {isCompared ? "Bỏ khỏi so sánh" : "Thêm vào so sánh"}
                </Button>
              </div>
            </div>
        </>
      )}
    </Dialog>
  );
}
