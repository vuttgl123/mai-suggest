"use client";

import { BookOpen, Crown, Heart } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { PreferenceItem } from "@/types/preference";
import { SmartImage } from "./smart-image";

interface PreferenceCardProps {
  item: PreferenceItem;
  isLiked: boolean;
  isFavorite: boolean;
  priority?: boolean;
  onOpen: () => void;
  onToggleLiked: () => void;
  onToggleFavorite: () => void;
}

export function PreferenceCard({
  item,
  isLiked,
  isFavorite,
  priority = false,
  onOpen,
  onToggleLiked,
  onToggleFavorite,
}: PreferenceCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      layout={!reduceMotion}
      animate={reduceMotion ? undefined : { y: isFavorite ? -2 : 0 }}
      className={`paper-card group flex h-full min-w-0 flex-col overflow-hidden rounded-[1rem] border bg-[#fffaf4] transition-colors sm:rounded-[1.25rem] ${
        isFavorite
          ? "border-[#7a1425] ring-1 ring-[#c8a96b]/55"
          : isLiked
            ? "border-[#c8a96b]"
            : "border-[#5a0d18]/10"
      }`}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 flex-col text-left focus-visible:outline-offset-[-3px]"
        aria-label={`Mở lời nhắn của ${item.name}`}
      >
        <div className="relative w-full overflow-hidden">
          <SmartImage
            src={item.imageUrl}
            alt={item.imageAlt}
            sizes="(max-width: 639px) 46vw, (max-width: 1023px) 30vw, (max-width: 1279px) 23vw, 19vw"
            priority={priority}
            imageClassName="transition-transform duration-700 group-hover:scale-[1.018]"
          />
          {(isFavorite || isLiked) && (
            <span
              className={`absolute left-2 top-2 inline-flex min-h-7 items-center gap-1 rounded-full px-2 py-1 text-[0.56rem] font-semibold shadow-sm sm:left-3 sm:top-3 sm:text-[0.62rem] ${
                isFavorite
                  ? "bg-[#5a0d18] text-white"
                  : "bg-[#fffaf4]/95 text-[#7a1425]"
              }`}
            >
              {isFavorite ? (
                <Crown size={11} fill="currentColor" aria-hidden="true" />
              ) : (
                <Heart size={11} fill="currentColor" aria-hidden="true" />
              )}
              {isFavorite ? "Thích nhất" : "Đã thích"}
            </span>
          )}
        </div>

        <div className="flex w-full flex-1 flex-col p-3 sm:p-4">
          <p className="truncate text-[0.56rem] font-semibold uppercase tracking-[0.12em] text-[#9b763e] sm:text-[0.62rem]">
            {item.brand ?? "Dành cho em"}
          </p>
          <h3 className="font-display mt-1 line-clamp-2 min-h-[2.55rem] text-[1.02rem] font-semibold leading-5 tracking-[-0.02em] text-[#31080e] sm:min-h-[3rem] sm:text-[1.22rem] sm:leading-6">
            {item.name}
          </h3>
          {item.referencePrice && (
            <p className="mt-2 truncate text-[0.62rem] text-[#765e62] sm:text-[0.68rem]">
              {item.referencePrice}
            </p>
          )}
          <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-[0.6rem] font-semibold text-[#7a1425] sm:text-[0.68rem]">
            <BookOpen size={13} aria-hidden="true" />
            Đọc lời nhắn
          </span>
        </div>
      </button>

      <div className="grid grid-cols-2 border-t border-[#5a0d18]/10">
        <button
          type="button"
          aria-pressed={isLiked}
          aria-label={isLiked ? `Bỏ thích ${item.name}` : `Thích ${item.name}`}
          onClick={onToggleLiked}
          className={`flex min-h-11 items-center justify-center gap-1 border-r border-[#5a0d18]/10 px-1 text-[0.64rem] font-semibold transition sm:gap-1.5 sm:text-[0.7rem] ${
            isLiked
              ? "bg-[#7a1425] text-white"
              : "text-[#5a0d18] hover:bg-[#e8d5d7]/35"
          }`}
        >
          <Heart size={14} fill={isLiked ? "currentColor" : "none"} aria-hidden="true" />
          Thích
        </button>
        <button
          type="button"
          aria-pressed={isFavorite}
          aria-label={isFavorite ? `Bỏ thích nhất ${item.name}` : `Chọn ${item.name} là thích nhất`}
          onClick={onToggleFavorite}
          className={`flex min-h-11 items-center justify-center gap-1 px-1 text-[0.64rem] font-semibold transition sm:gap-1.5 sm:text-[0.7rem] ${
            isFavorite
              ? "bg-[#efe2bd] text-[#5a0d18]"
              : "text-[#6c4a1e] hover:bg-[#f4e9ce]"
          }`}
        >
          <Crown size={14} fill={isFavorite ? "currentColor" : "none"} aria-hidden="true" />
          Thích nhất
        </button>
      </div>
    </motion.article>
  );
}
