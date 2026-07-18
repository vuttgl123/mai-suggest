"use client";

import { useCallback, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { createSelectionEmailUrl } from "@/lib/selection-email";
import { createSelectionText } from "@/lib/selection-text";
import { selectValidSelection } from "@/features/selection/lib/selection-selectors";
import {
  createSelectionFile,
  shareSelection,
} from "@/features/selection/lib/selection-share";
import type { PreferenceData, PreferenceSelectionState } from "@/types/preference";
import { SelectedCategoryList } from "./selected-category-list";
import { SelectionPanel } from "./selection-panel";
import { SelectionSummaryActions } from "./selection-summary-actions";

interface SelectionSummaryProps {
  open: boolean;
  data: PreferenceData;
  selection: PreferenceSelectionState;
  onClose: () => void;
  onReset: () => void;
  onNotify: (message: string) => void;
  onRemove(categoryId: string, itemId: string): void;
  onToggleFavorite(categoryId: string, itemId: string): void;
  onSetCategoryNote(categoryId: string, note: string): void;
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
  onRemove,
  onToggleFavorite,
  onSetCategoryNote,
}: SelectionSummaryProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const closeConfirm = useCallback(() => setConfirmOpen(false), []);
  const selectedCategories = selectValidSelection(data, selection);
  const selectedItemCount = selectedCategories.reduce(
    (total, entry) => total + entry.items.length,
    0,
  );
  const hasContent = selectedCategories.length > 0;
  const emailUrl = createSelectionEmailUrl(data, selection);

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

  async function shareCurrentSelection() {
    const text = createSelectionText(data, selection);
    try {
      const result = await shareSelection({
        text,
        title: data.site.title,
        navigator: navigator as Pick<Navigator, "share" | "clipboard">,
      });
      onNotify(
        result === "shared"
          ? "Đã mở tùy chọn chia sẻ"
          : "Đã sao chép những điều em yêu",
      );
    } catch {
      const copied = fallbackCopy(text);
      onNotify(
        copied
          ? "Đã sao chép những điều em yêu"
          : "Chưa thể chia sẻ, em thử lại nhé",
      );
    }
  }

  function downloadSelection() {
    const text = createSelectionText(data, selection);
    const { blob, filename } = createSelectionFile(text);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    onNotify("Đã tạo file những điều em yêu");
  }

  function confirmReset() {
    setConfirmOpen(false);
    onReset();
  }

  return (
    <>
      <SelectionPanel
        open={open}
        title="Những điều em yêu"
        description="Cảm ơn em đã kể anh nghe. Mỗi lựa chọn ở đây đều là một điều đáng nhớ."
        onClose={onClose}
        lifecycleActive={!confirmOpen}
      >
        <SelectedCategoryList
          selectedCategories={selectedCategories}
          selectedItemCount={selectedItemCount}
          updatedAt={selection.updatedAt}
          onRemove={onRemove}
          onToggleFavorite={onToggleFavorite}
          onNoteChange={onSetCategoryNote}
        />
        <SelectionSummaryActions
          hasContent={hasContent}
          emailUrl={emailUrl}
          onShare={() => void shareCurrentSelection()}
          onCopy={() => void copySelection()}
          onDownload={downloadSelection}
          onContinue={onClose}
          onRequestReset={() => setConfirmOpen(true)}
        />
      </SelectionPanel>

      <ConfirmDialog
        open={confirmOpen}
        title="Mình bắt đầu lại nhé?"
        description="Toàn bộ món đã thích, lựa chọn thích nhất và lời nhắn trên thiết bị này sẽ được xóa."
        confirmLabel="Làm lại từ đầu"
        onCancel={closeConfirm}
        onConfirm={confirmReset}
      />
    </>
  );
}
