"use client";

import { AlertTriangle } from "lucide-react";
import { useRef } from "react";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";

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

  return (
    <Dialog
      open={open}
      role="alertdialog"
      titleId="confirm-title"
      descriptionId="confirm-description"
      onClose={onCancel}
      initialFocusRef={cancelButtonRef}
      closeOnBackdrop={false}
      overlayClassName="z-[70] items-center px-5 py-8"
      panelClassName="paper-card max-w-md border border-[var(--color-border)] p-6 text-center sm:p-8"
    >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-[#f8e8e6] text-[var(--color-danger)]">
          <AlertTriangle size={22} aria-hidden="true" />
        </div>
        <h2 id="confirm-title" className="font-display mt-5 text-3xl font-semibold tracking-normal text-[var(--color-brand-strong)]">
          {title}
        </h2>
        <p id="confirm-description" className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
          {description}
        </p>
        <div className="mt-7 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
          <Button
            ref={cancelButtonRef}
            variant="secondary"
            onClick={onCancel}
            className="min-h-12"
          >
            Giữ lại lựa chọn
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            className="min-h-12"
          >
            {confirmLabel}
          </Button>
        </div>
    </Dialog>
  );
}
