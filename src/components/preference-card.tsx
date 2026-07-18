"use client";

import { ArrowUpRight, Crown, Heart, Sparkles } from "lucide-react";
import type { PreferenceItem } from "@/types/preference";
import { SmartImage } from "./smart-image";
import { IconButton } from "./ui/icon-button";

interface PreferenceCardProps {
  item: PreferenceItem;
  isLiked: boolean;
  isFavorite: boolean;
  selectionReady?: boolean;
  priority?: boolean;
  onOpen: () => void;
  onToggleLiked: () => void;
}

const budgetLabels: Record<PreferenceItem["budgetTier"], string> = {
  "duoi-500k": "Dưới 500 nghìn",
  "500k-1m": "500 nghìn – 1 triệu",
  "1m-3m": "1 – 3 triệu",
  "3m-10m": "3 – 10 triệu",
  "tren-10m": "Trên 10 triệu",
  "linh-hoat": "Ngân sách linh hoạt",
};

export function PreferenceCard({
  item,
  isLiked,
  isFavorite,
  selectionReady = true,
  priority = false,
  onOpen,
  onToggleLiked,
}: PreferenceCardProps) {
  const stateClass = isFavorite
    ? "border-[var(--color-brand)] ring-1 ring-[var(--color-accent)]"
    : isLiked
      ? "border-[var(--color-positive)]"
      : "border-[var(--color-border)] hover:border-[var(--color-accent)]";

  return (
    <article
      className={
        "paper-card group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border bg-[var(--color-paper)] transition duration-[var(--duration-base)] " +
        stateClass
      }
    >
      <div className="relative overflow-hidden">
        <button
          type="button"
          onClick={onOpen}
          className="block w-full overflow-hidden text-left focus-visible:outline-offset-[-4px]"
          aria-label={"Xem ảnh " + item.name}
        >
          <SmartImage
            src={item.imageUrl}
            alt={item.imageAlt}
            sizes="(max-width: 379px) 92vw, (max-width: 639px) 46vw, (max-width: 1023px) 30vw, 24vw"
            priority={priority}
            imageClassName="transition-transform duration-700 group-hover:scale-[1.035]"
          />
        </button>

        {item.featured && (
          <span className="absolute left-3 top-3 inline-flex min-h-8 items-center gap-1.5 rounded-md bg-[var(--color-paper)] px-3 py-1.5 text-xs font-semibold text-[var(--color-brand)] shadow-sm">
            <Sparkles size={13} aria-hidden="true" />
            Tuyển chọn
          </span>
        )}

        <IconButton
          aria-pressed={isLiked}
          disabled={!selectionReady}
          label={(isLiked ? "Bỏ thích " : "Thích ") + item.name}
          variant={isLiked ? "primary" : "secondary"}
          icon={
            <Heart
              size={18}
              fill={isLiked ? "currentColor" : "none"}
              aria-hidden="true"
            />
          }
          onClick={onToggleLiked}
          className="absolute right-3 top-3 shadow-md"
        />
      </div>

      <button
        type="button"
        onClick={onOpen}
        aria-label={"Mở chi tiết " + item.name}
        className="flex min-w-0 flex-1 flex-col p-4 text-left focus-visible:outline-offset-[-4px] sm:p-5"
      >
        <h3 className="font-display line-clamp-2 min-h-[2.3em] text-[1.32rem] font-semibold leading-[1.08] tracking-normal text-[var(--color-brand-strong)] sm:text-[1.5rem]">
          {item.name}
        </h3>
        {isFavorite && (
          <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-sm bg-[#edf3ef] px-2 py-1 text-xs font-semibold text-[var(--color-positive)]">
            <Crown size={13} fill="currentColor" aria-hidden="true" />
            Lựa chọn số một
          </span>
        )}
        <div className="mt-3 flex min-w-0 items-start gap-2 text-xs font-semibold text-[var(--color-accent)]">
          <span className="min-w-0 flex-1 truncate">
            {item.brand ?? "Không ghi thương hiệu"}
          </span>
          <span aria-hidden="true">·</span>
          <span className="shrink-0 text-right">{budgetLabels[item.budgetTier]}</span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-muted)]">
          {item.whyItFits}
        </p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-[var(--color-brand)]">
          Xem chi tiết
          <ArrowUpRight
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            size={16}
            aria-hidden="true"
          />
        </span>
      </button>

    </article>
  );
}
