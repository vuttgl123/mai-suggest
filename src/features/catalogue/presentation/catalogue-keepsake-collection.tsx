import type { ItemKeepsake } from "@/modules/catalogue/domain/item-keepsakes";

interface CatalogueKeepsakeCollectionProps {
  keepsakes: ItemKeepsake[];
}

const KIND_LABELS: Record<ItemKeepsake["kind"], string> = {
  message: "Lời nhắn",
  poem: "Bài thơ",
  memory: "Kỷ niệm",
};

/* Words kept with this item. Hidden entirely when there are none. */
export function CatalogueKeepsakeCollection({ keepsakes }: CatalogueKeepsakeCollectionProps) {
  if (!keepsakes.length) return null;

  return (
    <section aria-labelledby="keepsakes-heading" className="diary-container pt-20 sm:pt-24">
      <h2 className="font-display display-md text-brand-strong" id="keepsakes-heading">
        Những điều muốn nói
      </h2>
      <ul className="mt-8 grid gap-x-6 gap-y-10 md:grid-cols-2">
        {keepsakes.map((keepsake) => (
          <li className="reveal-rise border-t border-border pt-5" key={keepsake.id}>
            <p className="text-sm font-medium text-muted">{KIND_LABELS[keepsake.kind]}</p>
            {keepsake.title ? (
              <h3 className="font-display title-text mt-1 font-medium text-brand-strong">{keepsake.title}</h3>
            ) : null}
            <p
              className={`font-prose mt-3 whitespace-pre-line text-ink ${
                keepsake.kind === "poem" ? "text-[1.1875rem] italic leading-[1.8]" : "text-[1.0625rem] leading-[1.75]"
              }`}
            >
              {keepsake.content}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
