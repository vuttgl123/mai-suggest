import { ExternalLink, Scale, X } from "lucide-react";
import { useRef, type ReactElement } from "react";
import { SmartImage } from "@/components/smart-image";
import { Dialog } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import type { PreferenceItem } from "@/types/preference";

const budgetLabels: Record<PreferenceItem["budgetTier"], string> = {
  "duoi-500k": "Dưới 500 nghìn",
  "500k-1m": "500 nghìn - 1 triệu",
  "1m-3m": "1 - 3 triệu",
  "3m-10m": "3 - 10 triệu",
  "tren-10m": "Trên 10 triệu",
  "linh-hoat": "Ngân sách linh hoạt",
};

interface CompareDialogProps {
  open: boolean;
  items: PreferenceItem[];
  onClose(): void;
}

export function CompareDialog({
  open,
  items,
  onClose,
}: CompareDialogProps): ReactElement {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog
      open={open}
      titleId="compare-title"
      descriptionId="compare-description"
      onClose={onClose}
      initialFocusRef={closeButtonRef}
      panelClassName="flex max-h-[92svh] max-w-6xl flex-col"
    >
      <header className="flex items-start gap-3 border-b border-[var(--color-border)] px-4 py-4 sm:px-6">
        <Scale className="mt-1 text-[var(--color-brand)]" size={19} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h2 id="compare-title" className="text-xl font-semibold text-[var(--color-ink)]">
            So sánh gợi ý
          </h2>
          <p id="compare-description" className="mt-1 text-xs text-[var(--color-muted)]">
            Đối chiếu thông tin đang có trong catalogue.
          </p>
        </div>
        <IconButton
          ref={closeButtonRef}
          label="Đóng so sánh"
          icon={<X size={18} aria-hidden="true" />}
          onClick={onClose}
        />
      </header>
      <div className="summary-scroll flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)]"
            >
              <SmartImage
                src={item.imageUrl}
                alt={item.imageAlt}
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
              />
              <div className="space-y-4 p-4">
                <div>
                  <h3 className="font-display text-2xl font-semibold tracking-normal text-[var(--color-brand-strong)]">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    {item.brand ?? "Không ghi thương hiệu"}
                  </p>
                </div>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs font-semibold text-[var(--color-muted)]">Ngân sách</dt>
                    <dd className="mt-1 text-[var(--color-ink)]">{budgetLabels[item.budgetTier]}</dd>
                  </div>
                  {item.referencePrice && (
                    <div>
                      <dt className="text-xs font-semibold text-[var(--color-muted)]">Giá tham khảo</dt>
                      <dd className="mt-1 text-[var(--color-ink)]">{item.referencePrice}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs font-semibold text-[var(--color-muted)]">Lý do phù hợp</dt>
                    <dd className="mt-1 leading-6 text-[var(--color-ink)]">{item.whyItFits}</dd>
                  </div>
                </dl>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-sm border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {item.sourceName && item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-[var(--color-brand)] underline underline-offset-4"
                  >
                    {item.sourceName}
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
