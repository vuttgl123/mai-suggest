"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    cancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onCancel, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#210408]/70 px-5 py-8 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
        className="paper-card w-full max-w-md rounded-[1.75rem] border border-[#c8a96b]/35 bg-[#fffaf4] p-6 text-center sm:p-8"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e8d5d7]/65 text-[#7a1425]">
          <AlertTriangle size={22} aria-hidden="true" />
        </div>
        <h2 id="confirm-title" className="font-display mt-5 text-3xl font-semibold text-[#31080e]">
          {title}
        </h2>
        <p id="confirm-description" className="mt-3 text-sm leading-6 text-[#765e62]">
          {description}
        </p>
        <div className="mt-7 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="min-h-12 rounded-full border border-[#5a0d18]/20 px-5 py-3 text-sm font-semibold text-[#5a0d18]"
          >
            Giữ lại lựa chọn
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-12 rounded-full bg-[#5a0d18] px-5 py-3 text-sm font-semibold text-white hover:bg-[#7a1425]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
