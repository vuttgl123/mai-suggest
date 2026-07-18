"use client";

import { useRef, type ReactElement, type ReactNode, type RefObject } from "react";
import { useDialogLifecycle } from "@/hooks/use-dialog-lifecycle";

interface DialogProps {
  open: boolean;
  titleId: string;
  descriptionId?: string;
  onClose(): void;
  children: ReactNode;
  role?: "dialog" | "alertdialog";
  panelClassName?: string;
  overlayClassName?: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
  lifecycleActive?: boolean;
  closeOnBackdrop?: boolean;
}

export function Dialog({
  open,
  titleId,
  descriptionId,
  onClose,
  children,
  role = "dialog",
  panelClassName = "",
  overlayClassName = "",
  initialFocusRef,
  lifecycleActive = true,
  closeOnBackdrop = true,
}: DialogProps): ReactElement | null {
  const panelRef = useRef<HTMLDivElement>(null);
  useDialogLifecycle({
    open: open && lifecycleActive,
    onClose,
    containerRef: panelRef,
    initialFocusRef,
  });

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-end justify-center bg-black/70 md:items-center md:p-6 ${overlayClassName}`}
      onClick={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={`relative w-full overflow-hidden rounded-t-[var(--radius-dialog)] bg-[var(--color-paper)] md:rounded-[var(--radius-dialog)] ${panelClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
