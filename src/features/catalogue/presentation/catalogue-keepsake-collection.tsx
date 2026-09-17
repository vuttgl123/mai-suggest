import { BookHeart, Quote, Sparkles } from "lucide-react";
import type { ItemKeepsake } from "@/modules/catalogue/domain/item-keepsakes";

interface CatalogueKeepsakeCollectionProps {
  keepsakes: ItemKeepsake[];
}

export function CatalogueKeepsakeCollection({
  keepsakes,
}: CatalogueKeepsakeCollectionProps) {
  return (
    <section className="relative isolate overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-elevated)] text-brand  ring-1 ring-border/50"
            aria-hidden="true"
          >
            <BookHeart size={20} strokeWidth={1.5} />
          </span>
          <h2 className="font-display mt-6 text-3xl font-semibold tracking-tight text-brand-strong sm:text-4xl">
            Những điều muốn nói
          </h2>
          <p className="mt-3 text-lg text-muted">
            Một góc chỉ dành cho chúng mình.
          </p>
        </div>

        {keepsakes.length ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:gap-8">
            {keepsakes.map((keepsake, index) => (
              <KeepsakeCard
                keepsake={keepsake}
                key={keepsake.id}
                sequence={index + 1}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-[2rem] border border-border/60 bg-[var(--surface-elevated)] p-12 text-center  backdrop-blur-xl">
            <Sparkles
              className="mx-auto text-accent"
              size={24}
              aria-hidden="true"
            />
            <p className="font-display mt-4 text-xl font-semibold text-brand-strong">
              Chỗ này đang chờ một điều thật riêng.
            </p>
            <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-muted">
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
    <article className="group relative overflow-hidden rounded-[2rem] border border-border/60 bg-[var(--color-surface)]/80 p-8  backdrop-blur-xl transition hover:border-brand-soft sm:p-10">
      <span
        className="absolute right-6 top-6 font-display text-5xl font-semibold text-brand-soft/50 transition-colors group-hover:text-brand-soft"
        aria-hidden="true"
      >
        {String(sequence).padStart(2, "0")}
      </span>
      <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-[var(--surface-elevated)] px-4 py-1.5 ">
        <Quote size={14} className="text-accent" aria-hidden="true" />
        <p className="text-[13px] font-semibold text-accent">{copy.label}</p>
      </div>
      {keepsake.title ? (
        <h3 className="font-display mt-6 max-w-[85%] text-2xl font-semibold tracking-tight text-brand-strong">
          {keepsake.title}
        </h3>
      ) : null}
      <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-ink">
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
