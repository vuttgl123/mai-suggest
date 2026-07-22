import { BookHeart, Quote, Sparkles } from "lucide-react";
import type { ItemKeepsake } from "@/modules/catalogue/domain/item-keepsakes";

interface CatalogueKeepsakeCollectionProps {
  keepsakes: ItemKeepsake[];
}

export function CatalogueKeepsakeCollection({
  keepsakes,
}: CatalogueKeepsakeCollectionProps) {
  return (
    <section className="diary-section-rule relative isolate border-y border-[var(--color-border)] py-8 sm:py-10">
      <span
        className="pointer-events-none absolute -right-32 -top-20 h-72 w-72 rounded-full bg-[var(--color-brand-soft)] opacity-60 blur-3xl"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-[var(--color-accent)] opacity-10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-11 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span
            className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
            aria-hidden="true"
          >
            <BookHeart size={20} strokeWidth={1.45} />
          </span>
          <p className="diary-kicker mt-4">Một góc chỉ dành cho chúng mình</p>
          <h2 className="font-display mt-2 text-balance text-3xl font-semibold tracking-[-0.05em] text-[var(--color-brand-strong)] sm:text-4xl">
            Những điều muốn nói
          </h2>
        </div>

        {keepsakes.length ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-5">
            {keepsakes.map((keepsake, index) => (
              <KeepsakeCard
                keepsake={keepsake}
                key={keepsake.id}
                sequence={index + 1}
              />
            ))}
          </div>
        ) : (
          <div className="diary-surface diary-surface--note mt-8 px-5 py-8 text-center sm:px-8">
            <Sparkles
              className="mx-auto text-[var(--color-accent)]"
              size={21}
              aria-hidden="true"
            />
            <p className="font-display mt-4 text-2xl font-semibold text-[var(--color-brand-strong)]">
              Chỗ này đang chờ một điều thật riêng.
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-[var(--color-muted)]">
              Một lời nhắn nhỏ, một bài thơ hay một kỷ niệm sẽ được lưu lại ở đây.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function KeepsakeCard({
  keepsake,
  sequence,
}: {
  keepsake: ItemKeepsake;
  sequence: number;
}) {
  const copy = keepsakeCopy(keepsake.kind);

  return (
    <article className="diary-surface diary-surface--page relative p-5 sm:p-6">
      <span
        className="absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/65 to-transparent"
        aria-hidden="true"
      />
      <span
        className="absolute right-5 top-5 font-display text-4xl font-semibold text-[rgb(101_12_28_/_10%)]"
        aria-hidden="true"
      >
        {String(sequence).padStart(2, "0")}
      </span>
      <div className="flex items-center gap-2 text-[var(--color-accent)]">
        <Quote size={18} strokeWidth={1.45} aria-hidden="true" />
        <p className="diary-kicker text-[var(--color-accent)]">{copy.label}</p>
      </div>
      {keepsake.title ? (
        <h3 className="font-display mt-4 max-w-[82%] text-2xl font-semibold tracking-[-0.04em] text-[var(--color-brand-strong)]">
          {keepsake.title}
        </h3>
      ) : null}
      <p className="mt-3 whitespace-pre-line text-[15px] leading-8 text-[var(--color-ink)]">
        {keepsake.content}
      </p>
    </article>
  );
}

function keepsakeCopy(kind: ItemKeepsake["kind"]): { label: string } {
  const labels = {
    message: { label: "Lời nhắn" },
    poem: { label: "Một bài thơ" },
    memory: { label: "Kỷ niệm" },
  } as const;

  return labels[kind];
}
