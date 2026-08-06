"use client";

import { GoogleSignInButton } from "@/features/identity/components/google-sign-in-button";
import { Heart, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { MagicalBackground } from "./magical-background";

interface MagicalLoginClientProps {
  nextPath: string;
  hasCallbackError: boolean;
}

export function MagicalLoginClient({ nextPath, hasCallbackError }: MagicalLoginClientProps) {
  return (
    <main className="relative grid min-h-[100dvh] place-items-center overflow-hidden bg-[#110406]">
      {/* 3D Background */}
      <MagicalBackground />

      {/* Floating Glassmorphic Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[28rem] px-4"
      >
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl sm:p-12"
        >
          {/* Subtle glow behind the card content */}
          <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-[var(--color-accent)] opacity-20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-[var(--color-brand)] opacity-20 blur-3xl" />

          <div className="relative flex flex-col items-center text-center">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
              className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-strong)] text-white shadow-lg"
            >
              <Heart size={24} fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
            </motion.span>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mt-6 text-sm font-semibold tracking-widest text-[var(--color-accent)] uppercase"
              translate="no"
            >
              Điều Em Yêu
            </motion.p>
            
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-3 text-balance font-display text-3xl font-bold leading-tight text-white sm:text-4xl"
            >
              Bước vào thế giới của riêng em.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-4 text-sm leading-relaxed text-white/60"
            >
              Giữ lại những nơi muốn đến, những điều muốn thử và mọi lựa chọn khiến em vui.
            </motion.p>

            {hasCallbackError && (
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                role="alert"
              >
                Phiên đăng nhập chưa hoàn tất. Hãy thử lại nhé.
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="mt-8 w-full"
            >
              <GoogleSignInButton nextPath={nextPath} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="mt-8 flex items-center gap-2 text-xs font-medium text-white/40"
            >
              <Sparkles size={14} />
              <span>Dành riêng cho em</span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
