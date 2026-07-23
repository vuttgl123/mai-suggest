"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type FilmDirection = -1 | 1;

interface TimelineFilmControlsProps {
  viewportId: string;
}

interface FilmBounds {
  canGoBack: boolean;
  canGoForward: boolean;
}

const EMPTY_FILM_BOUNDS: FilmBounds = {
  canGoBack: false,
  canGoForward: false,
};

function getFilmFrames(viewport: HTMLElement) {
  return Array.from(viewport.querySelectorAll<HTMLElement>(".timeline-film-frame"));
}

function getFilmBounds(viewport: HTMLElement): FilmBounds {
  const edgeTolerance = 2;
  const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);

  return {
    canGoBack: viewport.scrollLeft > edgeTolerance,
    canGoForward: viewport.scrollLeft < maxScrollLeft - edgeTolerance,
  };
}

function getClosestFilmFrameIndex(viewport: HTMLElement, frames: HTMLElement[]) {
  const viewportLeft = viewport.getBoundingClientRect().left;

  return frames.reduce((closestIndex, frame, index) => {
    const closestDistance = Math.abs(
      frames[closestIndex].getBoundingClientRect().left - viewportLeft,
    );
    const distance = Math.abs(frame.getBoundingClientRect().left - viewportLeft);

    return distance < closestDistance ? index : closestIndex;
  }, 0);
}

function scrollToFilmFrame(viewport: HTMLElement, frame: HTMLElement) {
  const viewportLeft = viewport.getBoundingClientRect().left;
  const frameLeft = frame.getBoundingClientRect().left;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  viewport.scrollTo({
    left: frameLeft - viewportLeft + viewport.scrollLeft,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}

export function TimelineFilmControls({ viewportId }: TimelineFilmControlsProps) {
  const [bounds, setBounds] = useState<FilmBounds>(EMPTY_FILM_BOUNDS);

  const updateBounds = useCallback(() => {
    const viewport = document.getElementById(viewportId);
    const nextBounds = viewport ? getFilmBounds(viewport) : EMPTY_FILM_BOUNDS;

    setBounds((currentBounds) => (
      currentBounds.canGoBack === nextBounds.canGoBack
        && currentBounds.canGoForward === nextBounds.canGoForward
        ? currentBounds
        : nextBounds
    ));
  }, [viewportId]);

  useEffect(() => {
    const viewport = document.getElementById(viewportId);
    if (!viewport) {
      updateBounds();
      return;
    }

    let animationFrame = 0;
    const scheduleBoundsUpdate = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(updateBounds);
    };
    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(scheduleBoundsUpdate);

    resizeObserver?.observe(viewport);
    viewport.addEventListener("scroll", scheduleBoundsUpdate, { passive: true });
    scheduleBoundsUpdate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      viewport.removeEventListener("scroll", scheduleBoundsUpdate);
      resizeObserver?.disconnect();
    };
  }, [updateBounds, viewportId]);

  const move = useCallback((direction: FilmDirection) => {
    const viewport = document.getElementById(viewportId);
    if (!viewport) {
      return;
    }

    const frames = getFilmFrames(viewport);
    const nextFrame = frames[getClosestFilmFrameIndex(viewport, frames) + direction];
    if (!nextFrame) {
      updateBounds();
      return;
    }

    scrollToFilmFrame(viewport, nextFrame);
  }, [updateBounds, viewportId]);

  return (
    <div aria-label="Điều hướng cuộn phim" className="timeline-film-controls" role="group">
      <button
        aria-controls={viewportId}
        aria-label="Xem chương trước"
        className="timeline-film-control"
        disabled={!bounds.canGoBack}
        onClick={() => move(-1)}
        type="button"
      >
        <ChevronLeft aria-hidden="true" size={21} strokeWidth={1.5} />
      </button>
      <button
        aria-controls={viewportId}
        aria-label="Xem chương tiếp theo"
        className="timeline-film-control"
        disabled={!bounds.canGoForward}
        onClick={() => move(1)}
        type="button"
      >
        <ChevronRight aria-hidden="true" size={21} strokeWidth={1.5} />
      </button>
    </div>
  );
}
