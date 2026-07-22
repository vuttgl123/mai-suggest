"use client";

import { useEffect, useRef, useState } from "react";

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
  if (progress < 0.12) {
    return "closed";
  }

  if (progress < 0.78) {
    return "opening";
  }

  return "handoff";
}

export function CinematicDiaryIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSceneReady, setIsSceneReady] = useState(false);

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
    let diaryScene: CinematicDiaryScene | null = null;
    let isIntersecting = true;

    const updateActivity = () => {
      diaryScene?.setActive(isIntersecting && !document.hidden);
    };

    const updateProgress = () => {
      const bounds = section.getBoundingClientRect();
      const range = Math.max(section.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(1, Math.max(0, -bounds.top / range));
      section.style.setProperty("--diary-intro-progress", String(progress));
      section.dataset.phase = getPhase(progress);
      diaryScene?.setProgress(progress);
    };

    const resize = () => {
      diaryScene?.resize(stage.clientWidth, stage.clientHeight);
    };

    const onPointerMove = (event: PointerEvent) => {
      const bounds = stage.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
      diaryScene?.setPointer(x, y);
    };

    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (pointerQuery.matches) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);

    const themeObserver = new MutationObserver(() => {
      diaryScene?.setPalette(readPalette());
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

    window.addEventListener("scroll", updateProgress, { passive: true });
    document.addEventListener("visibilitychange", updateActivity);
    updateProgress();

    const initialiseScene = async () => {
      try {
        const { createCinematicDiaryScene } = await import(
          "@/features/catalogue/presentation/cinematic-diary-scene"
        );
        if (cancelled) {
          return;
        }

        diaryScene = createCinematicDiaryScene(canvas, readPalette());
        resize();
        updateProgress();
        updateActivity();
        setIsSceneReady(true);
      } catch {
        // The CSS journal remains visible if the browser cannot initialise WebGL.
      }
    };

    void initialiseScene();

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", updateActivity);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      intersectionObserver.disconnect();
      diaryScene?.dispose();
    };
  }, []);

  return (
    <section
      aria-labelledby="cinematic-diary-title"
      className="cinematic-diary-intro"
      data-phase="closed"
      data-scene-ready={isSceneReady ? "true" : undefined}
      ref={sectionRef}
    >
      <div className="cinematic-diary-intro__stage" ref={stageRef}>
        <div aria-hidden="true" className="cinematic-diary-intro__fallback" />
        <canvas aria-hidden="true" className="cinematic-diary-intro__canvas" ref={canvasRef} />
        <div className="cinematic-diary-intro__copy">
          <p className="cinematic-diary-intro__kicker">Một chương dành riêng cho hai người</p>
          <h1 className="font-display" id="cinematic-diary-title">
            Những điều làm em mỉm cười.
          </h1>
          <p className="cinematic-diary-intro__description">
            Một nơi nhỏ để gìn giữ những lựa chọn đẹp đẽ và những ngày thường trở nên đặc biệt.
          </p>
          <a className="cinematic-diary-intro__cta" href="#collection">
            Khám phá chương đầu <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}
