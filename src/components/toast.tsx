"use client";

import { Check } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";

interface ToastProps {
  message: string | null;
  action?: ToastAction;
  onDismiss: () => void;
}

interface ToastAction {
  label: string;
  onClick(): void;
}

export function Toast({ message, action, onDismiss }: ToastProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(onDismiss, action ? 5_000 : 3_200);
    return () => window.clearTimeout(timeout);
  }, [action, message, onDismiss]);

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
            className="pointer-events-auto flex max-w-md items-center gap-3 rounded-[var(--radius-control)] border border-white/20 bg-[var(--color-brand-strong)] px-4 py-3 text-left text-xs font-medium text-white shadow-xl"
          >
            <Check size={16} className="text-[#b7d5c3]" aria-hidden="true" />
            <span>{message}</span>
            {action && (
              <button
                type="button"
                onClick={() => {
                  action.onClick();
                  onDismiss();
                }}
                className="min-h-8 border-l border-white/25 pl-3 font-semibold text-[#f6dfa9] underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
              >
                {action.label}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
