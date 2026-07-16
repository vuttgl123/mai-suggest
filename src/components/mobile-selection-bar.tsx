"use client";

import { ChevronUp, Heart } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

interface MobileSelectionBarProps {
  visible: boolean;
  selectedItemCount: number;
  selectedCategoryCount: number;
  totalCategoryCount: number;
  onViewSummary: () => void;
  onContinue: () => void;
}

export function MobileSelectionBar({
  visible,
  selectedItemCount,
  selectedCategoryCount,
  totalCategoryCount,
  onViewSummary,
  onContinue,
}: MobileSelectionBarProps) {
  const reduceMotion = useReducedMotion();
  const hasSelections = selectedItemCount > 0 || selectedCategoryCount > 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={reduceMotion ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: 40 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-[#c8a96b]/40 bg-[#fffaf4]/96 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-14px_38px_rgba(49,8,14,0.12)] backdrop-blur-xl md:hidden"
          aria-label="Lựa chọn hiện tại"
        >
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="min-w-0 flex-1">
              {hasSelections ? (
                <>
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-[#5a0d18]">
                    <Heart size={14} fill="currentColor" aria-hidden="true" />
                    {selectedItemCount} món đã chọn
                  </p>
                  <p className="mt-1 truncate text-[0.65rem] text-[#765e62]">
                    Tiến độ {selectedCategoryCount}/{totalCategoryCount} danh mục
                  </p>
                </>
              ) : (
                <p className="text-xs font-medium leading-5 text-[#5a0d18]">Mình bắt đầu từ điều làm em mỉm cười nhé</p>
              )}
            </div>
            <button
              type="button"
              onClick={hasSelections ? onViewSummary : onContinue}
              className="flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#5a0d18] px-4 py-2 text-xs font-semibold text-white"
            >
              {hasSelections ? "Xem lựa chọn" : "Tiếp tục chọn"}
              <ChevronUp size={15} aria-hidden="true" />
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
