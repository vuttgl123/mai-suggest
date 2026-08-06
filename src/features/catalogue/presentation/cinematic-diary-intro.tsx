"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";

import type {
  CinematicDiaryPalette,
  CinematicDiaryScene,
} from "@/features/catalogue/presentation/cinematic-diary-scene";

function readPalette(): CinematicDiaryPalette {
  const styles = window.getComputedStyle(document.body);
  const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;

  return {
    accent: read("--color-accent", "#e6ad58"),
    brand: read("--color-brand", "#741f43"),
    brandStrong: read("--color-brand-strong", "#4a142a"),
    paper: read("--color-paper", "#fff8ec"),
    surface: read("--color-surface", "#f6e7d8"),
  };
}

function getPhase(progress: number) {
  if (progress < 0.16) {
    return "closed";
  }

  if (progress < 0.72) {
    return "opening";
  }

  if (progress < 0.9) {
    return "reading";
  }

  return "handoff";
}

export function CinematicDiaryIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<CinematicDiaryScene | null>(null);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end end"],
    target: sectionRef,
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    section.style.setProperty("--diary-intro-progress", String(progress));
    section.dataset.phase = getPhase(progress);
    sceneRef.current?.setProgress(progress);
  });

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!section || !stage || !canvas) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canUseWebGl2 = Boolean(document.createElement("canvas").getContext("webgl2"));
    if (prefersReducedMotion.matches || !canUseWebGl2) {
      return;
    }

    let cancelled = false;
    let isIntersecting = true;

    const updateActivity = () => {
      sceneRef.current?.setActive(isIntersecting && !document.hidden);
    };

    const resize = () => {
      sceneRef.current?.resize(stage.clientWidth, stage.clientHeight);
    };

    const onPointerMove = (event: PointerEvent) => {
      const bounds = stage.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
      sceneRef.current?.setPointer(x, y);
    };

    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (pointerQuery.matches) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);

    const themeObserver = new MutationObserver(() => {
      sceneRef.current?.setPalette(readPalette());
    });
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        updateActivity();
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(section);

    document.addEventListener("visibilitychange", updateActivity);

    const initialiseScene = async () => {
      try {
        const { createCinematicDiaryScene } = await import(
          "@/features/catalogue/presentation/cinematic-diary-scene"
        );
        if (cancelled) {
          return;
        }

        sceneRef.current = createCinematicDiaryScene(canvas, readPalette());
        resize();
        const progress = scrollYProgress.get();
        section.style.setProperty("--diary-intro-progress", String(progress));
        section.dataset.phase = getPhase(progress);
        sceneRef.current.setProgress(progress);
        updateActivity();
        setIsSceneReady(true);
      } catch {
        // The CSS journal remains visible if the browser cannot initialise WebGL.
      }
    };

    void initialiseScene();

    return () => {
      cancelled = true;
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", updateActivity);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      intersectionObserver.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [scrollYProgress]);

  return (
    <section
      aria-labelledby="cinematic-diary-title"
      className="cinematic-diary-intro"
      data-phase="closed"
      data-scene-ready={isSceneReady ? "true" : undefined}
      ref={sectionRef}
    >
      <div className="cinematic-diary-intro__stage" ref={stageRef}>
        <div aria-hidden="true" className="cinematic-diary-intro__fallback">
          <span className="cinematic-diary-intro__fallback-spread">
            <span className="cinematic-diary-intro__fallback-crease" />
            <span className="cinematic-diary-intro__fallback-mark" />
            <span className="cinematic-diary-intro__fallback-note">Anh yêu em</span>
          </span>
          <span className="cinematic-diary-intro__fallback-cover" />
        </div>
        <canvas aria-hidden="true" className="cinematic-diary-intro__canvas" ref={canvasRef} />
        <div className="cinematic-diary-intro__copy relative z-10 flex flex-col items-center text-center px-4">
          <p className="cinematic-diary-intro__kicker tracking-[0.2em] uppercase text-brand/70 font-semibold text-xs md:text-sm mb-4">
            Một chương dành riêng cho hai người
          </p>
          <h1 className="font-display cinematic-diary-intro__title text-5xl md:text-7xl font-bold bg-gradient-to-r from-brandStrong via-brand to-accent bg-clip-text text-transparent drop-shadow-sm pb-2 pt-4 overflow-visible" id="cinematic-diary-title">
            Những điều làm em mỉm cười.
          </h1>
          <p className="cinematic-diary-intro__description text-lg md:text-xl text-brandStrong/70 mt-6 max-w-xl mx-auto leading-relaxed">
            Một nơi nhỏ để gìn giữ những lựa chọn đẹp đẽ và những ngày thường trở nên đặc biệt.
          </p>
          <p className="cinematic-diary-intro__reading-line italic text-brand/60 mt-8 text-xl">
            Có những điều đẹp nhất cần được mở thật chậm.
          </p>
          <a className="cinematic-diary-intro__cta mt-12 inline-flex items-center gap-2 px-8 py-3 rounded-full border border-accent/40 bg-white/40 hover:bg-white/70 hover:shadow-[0_8px_32px_rgba(216,161,91,0.25)] hover:-translate-y-1 transition-all duration-500 text-brandStrong backdrop-blur-md" href="#collection">
            Khám phá chương đầu <span aria-hidden="true" className="group-hover:translate-y-1 transition-transform">↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}
