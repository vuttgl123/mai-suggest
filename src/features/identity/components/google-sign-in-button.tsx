"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

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
      <Button
        className="w-full"
        disabled={isPending}
        onClick={signInWithGoogle}
      >
        {isPending ? "Đang chuyển đến Google…" : "Đăng nhập với Google"}
      </Button>
      {errorMessage ? (
        <p className="text-sm text-[var(--color-danger)]" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
