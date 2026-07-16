"use client";

import { ArrowDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { SiteContent } from "@/types/preference";
import { DecorativeDivider } from "./decorative-elements";
import { SmartImage } from "./smart-image";

interface HeroSectionProps {
  site: SiteContent;
  onStart: () => void;
}

export function HeroSection({ site, onStart }: HeroSectionProps) {
  const reduceMotion = useReducedMotion();
  const entrance = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduceMotion ? 0 : 0.68,
      delay,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  });

  return (
    <section
      id="hero"
      className="relative flex min-h-[90svh] items-center justify-center overflow-hidden bg-[#31080e] px-5 pb-[max(3rem,env(safe-area-inset-bottom))] pt-[max(3rem,env(safe-area-inset-top))] text-center text-[#f8f1e8] sm:min-h-[92svh] sm:px-8"
      aria-labelledby="hero-title"
    >
      <SmartImage
        src={site.heroImage}
        alt={`Không gian mở đầu cho ${site.title}`}
        variant="hero"
        sizes="100vw"
        priority
        className="absolute inset-0"
        imageClassName="object-center"
      />
      <div className="hero-overlay absolute inset-0" aria-hidden="true" />
      <div
        className="hero-vignette absolute inset-3 rounded-[1.5rem] sm:inset-5 sm:rounded-[2rem]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[46rem] flex-col items-center">
        <motion.p
          {...entrance(0.04)}
          className="mb-4 text-[0.66rem] font-medium uppercase tracking-[0.3em] text-[#ead8b3] sm:text-xs"
        >
          {site.eyebrow}
        </motion.p>
        <motion.h1
          {...entrance(0.1)}
          id="hero-title"
          className="font-display text-balance mx-auto w-full max-w-[10.5ch] break-words text-center text-[clamp(2.85rem,14vw,6.5rem)] font-medium leading-[0.94] tracking-[-0.045em] text-[#fffaf4]"
        >
          {site.title}
        </motion.h1>
        <motion.div {...entrance(0.17)} className="my-5 sm:my-7">
          <DecorativeDivider inverse />
        </motion.div>
        <motion.p
          {...entrance(0.24)}
          className="text-balance max-w-[38rem] text-[0.9rem] leading-7 text-[#fffaf4] sm:text-base sm:leading-8"
        >
          {site.heroMessage}
        </motion.p>
        <motion.p
          {...entrance(0.31)}
          className="text-balance mt-3 max-w-xl text-xs leading-6 text-[#eadfd6]/85 sm:text-sm"
        >
          {site.heroSubMessage}
        </motion.p>
        <motion.div {...entrance(0.38)} className="mt-7 w-full max-w-sm sm:mt-9">
          <button
            type="button"
            onClick={onStart}
            className="group flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-[#e3c987]/70 bg-[#f8f1e8] px-6 py-3 text-sm font-semibold text-[#5a0d18] shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition hover:bg-white focus-visible:outline-[#f8f1e8]"
          >
            Bắt đầu lựa chọn
            <ArrowDown
              size={17}
              className="transition-transform group-hover:translate-y-0.5"
              aria-hidden="true"
            />
          </button>
        </motion.div>
        <motion.p
          {...entrance(0.45)}
          className="mt-4 text-[0.64rem] leading-5 tracking-[0.07em] text-[#eadfd6]/75 sm:text-xs"
        >
          Một không gian nhỏ dành riêng cho những điều {site.recipientName.toLocaleLowerCase("vi-VN")} yêu.
        </motion.p>
      </div>
    </section>
  );
}
