"use client";

import { ArrowDown } from "lucide-react";
import type { SiteContent } from "@/types/preference";
import { SmartImage } from "./smart-image";
import { Button } from "./ui/button";

interface HeroSectionProps {
  site: SiteContent;
  onStart: () => void;
}

export function HeroSection({
  site,
  onStart,
}: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative grid min-h-[72svh] w-full place-items-center overflow-hidden bg-[var(--color-brand-strong)] px-5 pb-[max(3rem,env(safe-area-inset-bottom))] pt-[max(3rem,env(safe-area-inset-top))] text-center text-white sm:min-h-[76svh] sm:px-8"
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

      <div className="relative z-10 mx-auto flex w-full max-w-[46rem] flex-col items-center justify-self-center text-center">
        <p
          className="mx-auto mb-4 text-[0.66rem] font-medium text-[#f6dfa9] sm:text-xs"
        >
          {site.eyebrow}
        </p>
        <h1
          id="hero-title"
          className="font-display text-balance mx-auto w-full max-w-[10.5ch] break-words text-center text-5xl font-medium leading-[0.96] tracking-normal text-white sm:text-7xl lg:text-8xl"
        >
          {site.title}
        </h1>
        <p
          className="text-balance mx-auto mt-5 max-w-[38rem] text-[0.9rem] leading-7 text-white sm:text-base sm:leading-8"
        >
          {site.heroMessage}
        </p>
        <div className="mx-auto mt-7 w-full max-w-sm sm:mt-9">
          <Button
            variant="secondary"
            onClick={onStart}
            className="group min-h-12 w-full border-white/70 bg-white px-6 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.18)] focus-visible:outline-white"
          >
            Khám phá theo dịp
            <ArrowDown
              size={17}
              className="transition-transform group-hover:translate-y-0.5"
              aria-hidden="true"
            />
          </Button>
        </div>
      </div>
    </section>
  );
}
