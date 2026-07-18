"use client";

import { Heart, SlidersHorizontal } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "./ui/button";

interface MobileSelectionBarProps {
  visible: boolean;
  activeFilterCount: number;
  selectedItemCount: number;
  onOpenFilters: () => void;
  onOpenSelection: () => void;
}

export function MobileSelectionBar({
  visible,
  activeFilterCount,
  selectedItemCount,
  onOpenFilters,
  onOpenSelection,
}: MobileSelectionBarProps) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={reduceMotion ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: 40 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-paper)] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_24px_rgb(36_28_30/10%)] md:hidden"
          aria-label="Lựa chọn hiện tại"
        >
          <div className="mx-auto grid max-w-lg grid-cols-2 gap-2">
            <Button
              variant="secondary"
              onClick={onOpenFilters}
              className="text-xs"
              aria-label={
                activeFilterCount
                  ? `Mở ${activeFilterCount} bộ lọc đang dùng`
                  : "Mở bộ lọc"
              }
            >
              <SlidersHorizontal size={16} aria-hidden="true" />
              Bộ lọc
              {activeFilterCount > 0 && (
                <span className="tabular-nums">{activeFilterCount}</span>
              )}
            </Button>
            <Button
              onClick={onOpenSelection}
              disabled={selectedItemCount === 0}
              className="text-xs"
              aria-label={
                selectedItemCount
                  ? `Xem ${selectedItemCount} lựa chọn`
                  : "Chưa có lựa chọn"
              }
            >
              <Heart size={16} aria-hidden="true" />
              Lựa chọn
              {selectedItemCount > 0 && (
                <span className="tabular-nums">{selectedItemCount}</span>
              )}
            </Button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
