"use client";

import { useSyncExternalStore } from "react";
import { PRODUCT_PAGE_SIZES } from "@/lib/catalogue-layout";

const PAGE_SIZE_BREAKPOINTS = [
  { query: "(min-width: 1280px)", size: PRODUCT_PAGE_SIZES.wide },
  { query: "(min-width: 1024px)", size: PRODUCT_PAGE_SIZES.desktop },
  { query: "(min-width: 640px)", size: PRODUCT_PAGE_SIZES.tablet },
] as const;

function getPageSizeSnapshot() {
  for (const breakpoint of PAGE_SIZE_BREAKPOINTS) {
    if (window.matchMedia(breakpoint.query).matches) return breakpoint.size;
  }
  return PRODUCT_PAGE_SIZES.mobile;
}

function subscribeToPageSize(onChange: () => void) {
  const mediaQueries = PAGE_SIZE_BREAKPOINTS.map(({ query }) =>
    window.matchMedia(query),
  );
  mediaQueries.forEach((mediaQuery) =>
    mediaQuery.addEventListener("change", onChange),
  );

  return () => {
    mediaQueries.forEach((mediaQuery) =>
      mediaQuery.removeEventListener("change", onChange),
    );
  };
}

export function useProductPageSize() {
  return useSyncExternalStore(
    subscribeToPageSize,
    getPageSizeSnapshot,
    () => PRODUCT_PAGE_SIZES.mobile,
  );
}
