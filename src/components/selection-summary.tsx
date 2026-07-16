"use client";

import {
  Clipboard,
  Heart,
  Mail,
  Pencil,
  RotateCcw,
  Star,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createSelectionEmailUrl } from "@/lib/selection-email";
import { createSelectionText } from "@/lib/selection-text";
import type { PreferenceData, PreferenceSelectionState } from "@/types/preference";
import { ConfirmDialog } from "./confirm-dialog";
import { DecorativeDivider } from "./decorative-elements";
import { SmartImage } from "./smart-image";

interface SelectionSummaryProps {
  open: boolean;
  data: PreferenceData;
  selection: PreferenceSelectionState;
  onClose: () => void;
  onReset: () => void;
  onNotify: (message: string) => void;
}

function formatDate(value: string | null) {
  if (!value) return "Chưa ghi nhận";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa ghi nhận";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

function fallbackCopy(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}

export function SelectionSummary({
  open,
  data,
  selection,
  onClose,
  onReset,
  onNotify,
}: SelectionSummaryProps) {
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const confirmOpenRef = useRef(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const validItemIds = new Set(
    data.categories.flatMap((category) => category.items.map((item) => item.id)),
  );
  const selectedItemCount = selection.likedItemIds.filter((id) =>
    validItemIds.has(id),
  ).length;
  const selectedCategories = data.categories.filter((category) => {
    const hasLikedItem = category.items.some((item) =>
      selection.likedItemIds.includes(item.id),
    );
    return hasLikedItem || Boolean(selection.notesByCategory[category.id]?.trim());
  });
  const hasContent = selectedCategories.length > 0;
  const emailUrl = createSelectionEmailUrl(data, selection);

  useEffect(() => {
    confirmOpenRef.current = confirmOpen;
  }, [confirmOpen]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (confirmOpenRef.current) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose, open]);

  async function copySelection() {
    const text = createSelectionText(data, selection);
    let copied = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch {
      copied = false;
    }

    if (!copied) copied = fallbackCopy(text);
    onNotify(
      copied
        ? "Đã sao chép những điều em yêu"
        : "Chưa thể sao chép, em thử lại nhé",
    );
  }

  function confirmReset() {
    setConfirmOpen(false);
    onReset();
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#210408]/72 md:items-center md:p-6"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
          >
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="summary-title"
              aria-describedby="summary-description"
              initial={reduceMotion ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 20 }}
              transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeOut" }}
              className="summary-scroll relative flex h-[100svh] w-full max-w-4xl flex-col overflow-hidden bg-[#f8f1e8] md:h-auto md:max-h-[90svh] md:rounded-[1.6rem] md:border md:border-[#c8a96b]/30"
            >
              <header className="relative shrink-0 border-b border-[#5a0d18]/10 bg-[#fffaf4] px-5 pb-5 pt-[max(1rem,env(safe-area-inset-top))] text-center sm:px-8 md:pt-6">
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Đóng phần tổng kết"
                  className="absolute right-4 top-[max(0.75rem,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full border border-[#5a0d18]/15 bg-white text-[#5a0d18] md:top-4"
                >
                  <X size={20} aria-hidden="true" />
                </button>
                <p className="text-[0.63rem] font-semibold uppercase tracking-[0.2em] text-[#9b763e]">
                  Một bức thư nhỏ bằng những lựa chọn
                </p>
                <h2
                  id="summary-title"
                  className="font-display mt-2 pr-10 text-4xl font-semibold leading-none tracking-[-0.025em] text-[#31080e] sm:pr-0 sm:text-5xl"
                >
                  Những điều em yêu
                </h2>
                <div className="mt-4">
                  <DecorativeDivider />
                </div>
                <p
                  id="summary-description"
                  className="mx-auto mt-3 max-w-xl text-xs leading-6 text-[#765e62] sm:text-sm"
                >
                  Cảm ơn em đã kể anh nghe. Mỗi lựa chọn ở đây đều là một điều đáng nhớ.
                </p>
              </header>

              <div className="summary-scroll flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-7">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#5a0d18]/10 bg-[#fffaf4] px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-[#5a0d18]">
                    <Heart size={16} fill="currentColor" aria-hidden="true" />
                    {selectedItemCount} món em yêu
                  </span>
                  <span className="text-[0.68rem] text-[#765e62]">
                    Cập nhật {formatDate(selection.updatedAt)}
                  </span>
                </div>

                {hasContent ? (
                  <div className="space-y-4">
                    {selectedCategories.map((category) => {
                      const likedItems = category.items.filter((item) =>
                        selection.likedItemIds.includes(item.id),
                      );
                      const favoriteId = selection.favoriteByCategory[category.id];
                      const note = selection.notesByCategory[category.id]?.trim();

                      return (
                        <section
                          key={category.id}
                          className="rounded-[1.25rem] border border-[#5a0d18]/10 bg-[#fffaf4] p-4 sm:p-5"
                        >
                          <h3 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[#31080e] sm:text-3xl">
                            {category.name}
                          </h3>
                          {likedItems.length > 0 && (
                            <ul className="mt-4 space-y-3">
                              {likedItems.map((item) => (
                                <li key={item.id} className="flex items-center gap-3">
                                  <SmartImage
                                    src={item.imageUrl}
                                    alt={item.imageAlt}
                                    variant="thumbnail"
                                    sizes="64px"
                                    className="h-16 w-16 shrink-0 rounded-lg"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold leading-5 text-[#2a171a]">
                                      {item.name}
                                    </p>
                                    {favoriteId === item.id && (
                                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#efe2bd] px-2 py-1 text-[0.6rem] font-semibold text-[#5a0d18]">
                                        <Star
                                          size={10}
                                          fill="currentColor"
                                          aria-hidden="true"
                                        />
                                        Yêu thích nhất
                                      </span>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                          {note && (
                            <div className="mt-4 border-t border-[#5a0d18]/10 pt-4">
                              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#9b763e]">
                                Lời nhắn của em
                              </p>
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#765e62]">
                                {note}
                              </p>
                            </div>
                          )}
                        </section>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-[#5a0d18]/20 bg-[#fffaf4]/60 px-5 py-12 text-center">
                    <Heart
                      className="mx-auto text-[#c8a96b]"
                      size={28}
                      strokeWidth={1.3}
                      aria-hidden="true"
                    />
                    <p className="font-display mt-3 text-2xl font-semibold text-[#31080e]">
                      Trang giấy đang chờ em
                    </p>
                    <p className="mt-2 text-xs leading-6 text-[#765e62]">
                      Hãy tiếp tục khám phá và chọn điều khiến em mỉm cười.
                    </p>
                  </div>
                )}
              </div>

              <footer className="shrink-0 border-t border-[#5a0d18]/10 bg-[#fffaf4] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-8">
                <div className="mx-auto grid max-w-3xl grid-cols-1 gap-2 min-[430px]:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => void copySelection()}
                    disabled={!hasContent}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#5a0d18] px-4 py-3 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Clipboard size={16} aria-hidden="true" />
                    Sao chép kết quả
                  </button>
                  <a
                    href={hasContent ? emailUrl : undefined}
                    aria-disabled={!hasContent}
                    onClick={(event) => {
                      if (!hasContent) event.preventDefault();
                    }}
                    className={`flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#c8a96b] bg-[#f5e9ca] px-4 py-3 text-xs font-semibold text-[#5a0d18] ${
                      hasContent ? "" : "pointer-events-none opacity-45"
                    }`}
                  >
                    <Mail size={16} aria-hidden="true" />
                    Gửi qua email
                  </a>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#5a0d18]/20 px-4 py-3 text-xs font-semibold text-[#5a0d18]"
                  >
                    <Pencil size={16} aria-hidden="true" />
                    Tiếp tục chỉnh sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmOpen(true)}
                    disabled={!hasContent}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-full px-4 py-3 text-xs font-semibold text-[#765e62] hover:bg-[#e8d5d7]/40 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <RotateCcw size={16} aria-hidden="true" />
                    Làm lại từ đầu
                  </button>
                </div>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmOpen}
        title="Mình bắt đầu lại nhé?"
        description="Toàn bộ món đã thích, lựa chọn thích nhất và lời nhắn trên thiết bị này sẽ được xóa."
        confirmLabel="Làm lại từ đầu"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmReset}
      />
    </>
  );
}
