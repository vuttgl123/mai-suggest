"use client";

import { X } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { Dialog } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";

interface SelectionPanelProps {
  open: boolean;
  title: string;
  description: string;
  onClose(): void;
  children: ReactNode;
  lifecycleActive?: boolean;
}

export function SelectionPanel({
  open,
  title,
  description,
  onClose,
  children,
  lifecycleActive = true,
}: SelectionPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog
      open={open}
      titleId="selection-panel-title"
      descriptionId="selection-panel-description"
      onClose={onClose}
      initialFocusRef={closeButtonRef}
      lifecycleActive={lifecycleActive}
      closeOnBackdrop={false}
      overlayClassName="z-50"
      panelClassName="summary-scroll flex h-[100svh] max-w-4xl flex-col bg-[var(--color-surface)] md:h-auto md:max-h-[90svh] md:border md:border-[var(--color-border)]"
    >
      <header className="relative shrink-0 border-b border-[var(--color-border)] bg-[var(--color-paper)] px-5 pb-5 pt-[max(1rem,env(safe-area-inset-top))] text-center sm:px-8 md:pt-6">
        <IconButton
          ref={closeButtonRef}
          onClick={onClose}
          label="Đóng phần tổng kết"
          icon={<X size={20} aria-hidden="true" />}
          className="absolute right-4 top-[max(0.75rem,env(safe-area-inset-top))] bg-white md:top-4"
        />
        <h2
          id="selection-panel-title"
          className="font-display pr-10 text-3xl font-semibold leading-tight tracking-normal text-[var(--color-brand-strong)] sm:pr-0 sm:text-4xl"
        >
          {title}
        </h2>
        <p
          id="selection-panel-description"
          className="mx-auto mt-2 max-w-xl text-xs leading-6 text-[var(--color-muted)] sm:text-sm"
        >
          {description}
        </p>
      </header>
      {children}
    </Dialog>
  );
}
