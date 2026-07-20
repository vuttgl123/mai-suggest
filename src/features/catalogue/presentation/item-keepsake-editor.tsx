"use client";

import { ChevronDown, ChevronUp, Heart, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type {
  ItemKeepsake,
  ItemKeepsakeKind,
} from "@/modules/catalogue/domain/item-keepsakes";

interface ItemKeepsakeEditorProps {
  disabled: boolean;
  value: ItemKeepsake[];
  onChange: (nextValue: ItemKeepsake[]) => void;
}

const kinds: Array<{ kind: ItemKeepsakeKind; label: string }> = [
  { kind: "message", label: "Lời nhắn" },
  { kind: "poem", label: "Thơ" },
  { kind: "memory", label: "Kỷ niệm" },
];

export function ItemKeepsakeEditor({
  disabled,
  value,
  onChange,
}: ItemKeepsakeEditorProps) {
  function addKeepsake(kind: ItemKeepsakeKind) {
    onChange([
      ...value,
      {
        id: createKeepsakeId(),
        kind,
        title: null,
        content: "",
      },
    ]);
  }

  function updateKeepsake(id: string, patch: Partial<ItemKeepsake>) {
    onChange(
      value.map((keepsake) =>
        keepsake.id === id ? { ...keepsake, ...patch } : keepsake,
      ),
    );
  }

  function moveKeepsake(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= value.length) return;

    const nextValue = [...value];
    [nextValue[index], nextValue[destination]] = [
      nextValue[destination],
      nextValue[index],
    ];
    onChange(nextValue);
  }

  function removeKeepsake(id: string) {
    onChange(value.filter((keepsake) => keepsake.id !== id));
  }

  return (
    <section aria-labelledby="keepsakes-heading" className="mt-10 border-t border-[var(--color-border)] pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="diary-kicker">Nội dung công khai</p>
          <h3 id="keepsakes-heading" className="font-display mt-2 text-3xl font-semibold tracking-[-0.045em] text-[var(--color-brand-strong)]">
            Những điều muốn nói
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--color-muted)]">
            Chúng sẽ xuất hiện theo thứ tự này trong trang chi tiết của item.
          </p>
        </div>
        <span className="rounded-full bg-[var(--color-brand-soft)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-brand)]">
          {value.length}/24 mảnh thư
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {kinds.map(({ kind, label }) => (
          <Button
            disabled={disabled || value.length >= 24}
            key={kind}
            onClick={() => addKeepsake(kind)}
            size="compact"
            type="button"
            variant="secondary"
          >
            <Plus size={15} aria-hidden="true" />
            Thêm {label.toLowerCase()}
          </Button>
        ))}
      </div>

      {value.length ? (
        <ol className="mt-6 space-y-4">
          {value.map((keepsake, index) => (
            <KeepsakeForm
              disabled={disabled}
              index={index}
              key={keepsake.id}
              keepsake={keepsake}
              onMove={moveKeepsake}
              onRemove={removeKeepsake}
              onUpdate={updateKeepsake}
              total={value.length}
            />
          ))}
        </ol>
      ) : (
        <div className="mt-6 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-[rgb(255_249_243_/_65%)] px-5 py-7 text-center">
          <Heart className="mx-auto text-[var(--color-accent)]" size={20} aria-hidden="true" />
          <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
            Thêm lời nhắn, thơ hoặc kỷ niệm đầu tiên cho item này.
          </p>
        </div>
      )}
    </section>
  );
}

function KeepsakeForm({
  disabled,
  index,
  keepsake,
  onMove,
  onRemove,
  onUpdate,
  total,
}: {
  disabled: boolean;
  index: number;
  keepsake: ItemKeepsake;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<ItemKeepsake>) => void;
  total: number;
}) {
  const [confirmRemoval, setConfirmRemoval] = useConfirmRemoval();
  const kindLabel = kinds.find((entry) => entry.kind === keepsake.kind)?.label;

  return (
    <li className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[rgb(255_249_243_/_72%)] p-5 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="diary-kicker">{kindLabel} · {String(index + 1).padStart(2, "0")}</p>
        <div className="flex items-center gap-1">
          <Button
            aria-label="Đưa lên trước"
            disabled={disabled || index === 0}
            onClick={() => onMove(index, -1)}
            size="icon"
            type="button"
            variant="quiet"
          >
            <ChevronUp size={16} aria-hidden="true" />
          </Button>
          <Button
            aria-label="Đưa xuống sau"
            disabled={disabled || index === total - 1}
            onClick={() => onMove(index, 1)}
            size="icon"
            type="button"
            variant="quiet"
          >
            <ChevronDown size={16} aria-hidden="true" />
          </Button>
          <Button
            disabled={disabled}
            onClick={() => setConfirmRemoval(true)}
            size="compact"
            type="button"
            variant="quiet"
          >
            <Trash2 size={15} aria-hidden="true" />
            Xóa
          </Button>
        </div>
      </div>
      <div className="mt-4 grid gap-4">
        <label className="block text-sm font-semibold text-[var(--color-brand-strong)]">
          Tiêu đề <span className="font-normal text-[var(--color-muted)]">(không bắt buộc)</span>
          <input
            className={inputClassName}
            disabled={disabled}
            maxLength={120}
            onChange={(event) => onUpdate(keepsake.id, { title: event.target.value || null })}
            value={keepsake.title ?? ""}
          />
        </label>
        <label className="block text-sm font-semibold text-[var(--color-brand-strong)]">
          Nội dung
          <textarea
            className={`${inputClassName} min-h-32 py-3 leading-7`}
            disabled={disabled}
            maxLength={2000}
            onChange={(event) => onUpdate(keepsake.id, { content: event.target.value })}
            required
            value={keepsake.content}
          />
        </label>
      </div>
      {confirmRemoval ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-3">
          <p className="text-sm leading-6 text-[var(--color-danger)]">Xóa mảnh thư này trước khi lưu item?</p>
          <span className="flex gap-2">
            <Button disabled={disabled} onClick={() => setConfirmRemoval(false)} size="compact" type="button" variant="quiet">
              Giữ lại
            </Button>
            <Button disabled={disabled} onClick={() => onRemove(keepsake.id)} size="compact" type="button" variant="danger">
              Xóa hẳn
            </Button>
          </span>
        </div>
      ) : null}
    </li>
  );
}

function useConfirmRemoval(): [boolean, (value: boolean) => void] {
  return useState(false);
}

function createKeepsakeId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `keepsake-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const inputClassName =
  "mt-2 min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 text-sm text-[var(--color-ink)] shadow-sm outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-focus)]";
