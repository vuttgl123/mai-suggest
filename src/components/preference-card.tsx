"use client";

import { ArrowUpRight, Crown, Heart, Sparkles } from "lucide-react";
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
  priority = false,
  onOpen,
  onToggleLiked,
  onToggleFavorite,
}: PreferenceCardProps) {
  const reduceMotion = useReducedMotion();
  const stateClass = isFavorite
    ? "border-[#7a1425] ring-1 ring-[#c8a96b]/60"
    : isLiked
      ? "border-[#c8a96b]"
      : "border-[#5a0d18]/10 hover:border-[#c8a96b]/70";

  return (
    <motion.article
      layout={!reduceMotion}
      animate={reduceMotion ? undefined : { y: isFavorite ? -3 : 0 }}
      className={
        "paper-card group flex h-full min-w-0 flex-col overflow-hidden rounded-[1.35rem] border bg-[#fffaf4] transition duration-300 " +
        stateClass
      }
    >
      <div className="relative overflow-hidden">
        <button
          type="button"
          onClick={onOpen}
          className="block w-full overflow-hidden text-left focus-visible:outline-offset-[-4px]"
          aria-label={"Mở chi tiết " + item.name}
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
          <span className="absolute left-3 top-3 inline-flex min-h-8 items-center gap-1.5 rounded-full bg-[#fffaf4]/95 px-3 py-1.5 text-xs font-semibold text-[#6b1624] shadow-sm backdrop-blur">
            <Sparkles size={13} aria-hidden="true" />
            Tuyển chọn
          </span>
        )}

        <button
          type="button"
          aria-pressed={isLiked}
          aria-label={(isLiked ? "Bỏ thích " : "Thích ") + item.name}
          onClick={onToggleLiked}
          className={
            "absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border shadow-md backdrop-blur transition " +
            (isLiked
              ? "border-[#7a1425] bg-[#7a1425] text-white"
              : "border-white/60 bg-[#fffaf4]/95 text-[#5a0d18] hover:bg-white")
          }
        >
          <Heart
            size={18}
            fill={isLiked ? "currentColor" : "none"}
            aria-hidden="true"
          />
        </button>
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 flex-col p-4 text-left focus-visible:outline-offset-[-4px] sm:p-5"
      >
        <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-[#6e542c]">
          <span className="truncate">{item.brand ?? "Dành riêng cho em"}</span>
          <span aria-hidden="true">·</span>
          <span className="shrink-0">{budgetLabels[item.budgetTier]}</span>
        </div>
        <h3 className="font-display mt-2 line-clamp-2 text-[1.32rem] font-semibold leading-[1.08] tracking-[-0.025em] text-[#31080e] sm:text-[1.5rem]">
          {item.name}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#654f53]">
          {item.whyItFits}
        </p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-[#6b1624]">
          Xem câu chuyện
          <ArrowUpRight
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            size={16}
            aria-hidden="true"
          />
        </span>
      </button>

      <button
        type="button"
        aria-pressed={isFavorite}
        aria-label={
          (isFavorite ? "Bỏ lựa chọn thích nhất " : "Chọn làm thích nhất ") +
          item.name
        }
        onClick={onToggleFavorite}
        className={
          "flex min-h-12 items-center justify-center gap-2 border-t border-[#5a0d18]/10 px-4 py-3 text-sm font-semibold transition " +
          (isFavorite
            ? "bg-[#efe2bd] text-[#5a0d18]"
            : "text-[#674b21] hover:bg-[#f4e9ce]")
        }
      >
        <Crown
          size={16}
          fill={isFavorite ? "currentColor" : "none"}
          aria-hidden="true"
        />
        {isFavorite ? "Đang là lựa chọn số một" : "Đặt làm lựa chọn số một"}
      </button>
    </motion.article>
  );
}
