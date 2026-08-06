"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { motion } from "motion/react";

interface GoogleSignInButtonProps {
  nextPath: string;
}

export function GoogleSignInButton({
  nextPath,
}: GoogleSignInButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function signInWithGoogle() {
    setIsPending(true);
    setErrorMessage(null);

    const redirectTo = new URL("/auth/callback", window.location.origin);
    redirectTo.searchParams.set("next", nextPath);
    const { error } = await createBrowserSupabaseClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo.toString() },
    });

    if (error) {
      setErrorMessage("Không thể bắt đầu đăng nhập Google. Hãy thử lại.");
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isPending}
        onClick={signInWithGoogle}
        className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-white/10 px-6 py-4 font-semibold text-white shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-colors hover:bg-white/20 hover:shadow-[0_0_60px_rgba(216,161,91,0.3)] disabled:opacity-50"
      >
        {/* Magical sweeping light effect on hover */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
        
        {/* Subtle inner border glow */}
        <div className="absolute inset-0 rounded-full border border-white/20 transition-colors group-hover:border-[var(--color-brand)]/50" />
        
        {/* Google Icon SVG */}
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l2.85-2.22.83-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>

        <span className="relative z-10 text-sm tracking-wide">
          {isPending ? "Đang bay đến Google…" : "Bước vào bằng Google"}
        </span>
      </motion.button>
      
      {errorMessage ? (
        <p className="text-center text-sm text-red-400" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
