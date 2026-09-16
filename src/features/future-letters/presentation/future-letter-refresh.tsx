"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { FutureLetterRecord } from "@/modules/future-letters/domain/future-letter-models";

export function FutureLetterRefresh({ letters }: { letters: FutureLetterRecord[] }) {
  const router = useRouter();

  useEffect(() => {
    const nextOpenAt = Math.min(
      ...letters.map((letter) => new Date(letter.opensAt).getTime()),
    );
    if (!Number.isFinite(nextOpenAt)) return;

    const delay = nextOpenAt - Date.now();
    if (delay > 2_147_483_647) return; // Max setTimeout delay

    if (delay <= 0) {
      // If we are already past the time, we might be waiting for the server to catch up.
      // We don't want to loop rapidly.
      const timeout = window.setTimeout(() => router.refresh(), 5000);
      return () => window.clearTimeout(timeout);
    }

    const timeout = window.setTimeout(() => router.refresh(), delay + 100);
    return () => window.clearTimeout(timeout);
  }, [letters, router]);

  return null;
}
