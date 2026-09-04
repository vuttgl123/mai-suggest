"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type RailDirection = -1 | 1;

export interface MediaRailControlsProps {
  viewportId: string;
  frameClassName: string;
  groupLabel: string;
  previousLabel: string;
  nextLabel: string;
}

interface RailBounds {
  canGoBack: boolean;
  canGoForward: boolean;
}

const EMPTY_RAIL_BOUNDS: RailBounds = {
  canGoBack: false,
  canGoForward: false,
};

function getFrames(viewport: HTMLElement, frameClassName: string) {
  return Array.from(viewport.querySelectorAll<HTMLElement>(`.${frameClassName}`));
}

function getRailBounds(viewport: HTMLElement): RailBounds {
  const edgeTolerance = 2;
  const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);

  return {
    canGoBack: viewport.scrollLeft > edgeTolerance,
    canGoForward: viewport.scrollLeft < maxScrollLeft - edgeTolerance,
  };
}

function getClosestFrameIndex(viewport: HTMLElement, frames: HTMLElement[]) {
  const viewportLeft = viewport.getBoundingClientRect().left;

  return frames.reduce((closestIndex, frame, index) => {
    const closestDistance = Math.abs(
      frames[closestIndex].getBoundingClientRect().left - viewportLeft,
    );
    const distance = Math.abs(frame.getBoundingClientRect().left - viewportLeft);

    return distance < closestDistance ? index : closestIndex;
  }, 0);
}

function scrollToFrame(viewport: HTMLElement, frame: HTMLElement) {
  const viewportLeft = viewport.getBoundingClientRect().left;
  const frameLeft = frame.getBoundingClientRect().left;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  viewport.scrollTo({
    left: frameLeft - viewportLeft + viewport.scrollLeft,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}

export function MediaRailControls({
  viewportId,
  frameClassName,
  groupLabel,
  previousLabel,
  nextLabel,
}: MediaRailControlsProps) {
  const [bounds, setBounds] = useState<RailBounds>(EMPTY_RAIL_BOUNDS);

  const updateBounds = useCallback(() => {
    const viewport = document.getElementById(viewportId);
    const nextBounds = viewport ? getRailBounds(viewport) : EMPTY_RAIL_BOUNDS;

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

  const move = useCallback((direction: RailDirection) => {
    const viewport = document.getElementById(viewportId);
    if (!viewport) {
      return;
    }

    const frames = getFrames(viewport, frameClassName);
    const nextFrame = frames[getClosestFrameIndex(viewport, frames) + direction];
    if (!nextFrame) {
      updateBounds();
      return;
    }

    scrollToFrame(viewport, nextFrame);
  }, [frameClassName, updateBounds, viewportId]);

  return (
    <div aria-label={groupLabel} className="media-rail-controls" role="group">
      <button
        aria-controls={viewportId}
        aria-label={previousLabel}
        className="media-rail-control"
        disabled={!bounds.canGoBack}
        onClick={() => move(-1)}
        type="button"
      >
        <ChevronLeft aria-hidden="true" size={21} strokeWidth={1.5} />
      </button>
      <button
        aria-controls={viewportId}
        aria-label={nextLabel}
        className="media-rail-control"
        disabled={!bounds.canGoForward}
        onClick={() => move(1)}
        type="button"
      >
        <ChevronRight aria-hidden="true" size={21} strokeWidth={1.5} />
      </button>
    </div>
  );
}
