"use client";

import { Ban, Check, Heart, PackageCheck, ShoppingBag, Sparkles, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setMyItemStateAction } from "@/modules/engagement/presentation/engagement-actions";
import type { ItemEngagementState, ItemUserState } from "@/modules/engagement/domain/engagement-models";

const STATE_OPTIONS: Array<{ value: Exclude<ItemEngagementState, "none">; label: string; icon: LucideIcon }> = [
  { value: "want_to_try", label: "Muốn thử", icon: Sparkles },
  { value: "tried", label: "Đã thử", icon: Check },
  { value: "want_to_buy", label: "Muốn mua", icon: ShoppingBag },
  { value: "bought", label: "Đã mua", icon: PackageCheck },
  { value: "not_interested", label: "Không quan tâm", icon: Ban },
];

interface MyItemStatePanelProps {
  itemId: string;
  /** The current member's own state; other members never see it here. */
  state: ItemUserState | null;
}

export function MyItemStatePanel({ itemId, state }: MyItemStatePanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [current, setCurrent] = useState<ItemEngagementState>(state?.state ?? "none");
  const [isFavorite, setIsFavorite] = useState(state?.isFavorite ?? false);
  const [feedback, setFeedback] = useState<string | null>(null);

  function save(next: { state: ItemEngagementState; isFavorite: boolean }, message: string) {
    const previous = { state: current, isFavorite };
    setCurrent(next.state);
    setIsFavorite(next.isFavorite);
    setFeedback(null);

    startTransition(async () => {
      const result = await setMyItemStateAction({
        itemId,
        isFavorite: next.isFavorite,
        state: next.state,
        note: state?.note ?? null,
      });

      if (!result.ok) {
        setCurrent(previous.state);
        setIsFavorite(previous.isFavorite);
        setFeedback("Chưa lưu được lựa chọn. Hãy thử lại.");
        return;
      }

      setFeedback(message);
      router.refresh();
    });
  }

  return (
    <section aria-labelledby="my-state-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="font-display text-xl font-medium text-brand-strong" id="my-state-heading">
          Của bạn
        </h3>
        <button
          aria-pressed={isFavorite}
          className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[0.9375rem] font-semibold transition-colors disabled:opacity-60 ${
            isFavorite ? "border-brand bg-brand-soft text-brand" : "border-border-strong text-muted hover:border-brand hover:text-brand"
          }`}
          disabled={isPending}
          onClick={() => save({ state: current, isFavorite: !isFavorite }, isFavorite ? "Đã bỏ khỏi yêu thích." : "Đã thêm vào yêu thích.")}
          type="button"
        >
          <Heart aria-hidden="true" fill={isFavorite ? "currentColor" : "none"} size={16} strokeWidth={1.5} />
          Yêu thích
        </button>
      </div>

      <fieldset className="mt-4" disabled={isPending}>
        <legend className="text-sm text-muted">Trạng thái của bạn với điều này</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {STATE_OPTIONS.map(({ value, label, icon: Icon }) => {
            const checked = current === value;
            return (
              <label
                className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-[0.9375rem] font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-focus ${
                  checked ? "border-brand bg-brand-soft text-brand" : "border-border-strong text-ink hover:border-brand"
                }`}
                key={value}
              >
                <input
                  checked={checked}
                  className="sr-only"
                  name={`item-state-${itemId}`}
                  onChange={() => save({ state: value, isFavorite }, `Đã lưu: ${label}.`)}
                  type="radio"
                  value={value}
                />
                <Icon aria-hidden="true" size={15} strokeWidth={1.5} />
                {label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-2 flex min-h-11 flex-wrap items-center gap-3">
        {current !== "none" ? (
          <button
            className="text-sm font-semibold text-muted underline decoration-1 underline-offset-4 hover:text-brand"
            disabled={isPending}
            onClick={() => save({ state: "none", isFavorite }, "Đã bỏ chọn trạng thái.")}
            type="button"
          >
            Bỏ chọn trạng thái
          </button>
        ) : null}
        <p aria-live="polite" className="text-sm text-brand">
          {feedback}
        </p>
      </div>
    </section>
  );
}
