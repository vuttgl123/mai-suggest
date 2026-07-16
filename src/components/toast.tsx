"use client";

import { Check } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(onDismiss, 3200);
    return () => window.clearTimeout(timeout);
  }, [message, onDismiss]);

  return (
    <div
      className="pointer-events-none fixed inset-x-4 top-[max(1rem,env(safe-area-inset-top))] z-[90] flex justify-center"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence>
        {message && (
          <motion.div
            role="status"
            initial={reduceMotion ? false : { opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
            className="flex max-w-md items-center gap-2 rounded-full border border-[#c8a96b]/45 bg-[#31080e] px-5 py-3 text-center text-xs font-medium text-[#fffaf4] shadow-2xl"
          >
            <Check size={16} className="text-[#e5c989]" aria-hidden="true" />
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
