import Link from "next/link";
import { ViewTransition } from "react";
import {
  ArrowLeft,
  BookHeart,
  ExternalLink,
  Heart,
  MapPin,
  Quote,
  Sparkles,
} from "lucide-react";
import { CatalogueItemImage } from "@/features/catalogue/presentation/catalogue-item-image";
import { readItemKeepsakes, type ItemKeepsake } from "@/modules/catalogue/domain/item-keepsakes";
import type {
  CatalogueItemDetail,
} from "@/modules/catalogue/domain/catalogue-read-models";
import type { ActiveActor } from "@/modules/identity/domain/current-actor";
import { AppHeader } from "@/components/app-header";

interface CatalogueDetailProps {
  actor: ActiveActor;
  categoryName: string | null;
  item: CatalogueItemDetail;
}

export function CatalogueDetail({ actor, categoryName, item }: CatalogueDetailProps) {
  const keepsakes = readItemKeepsakes(item.metadata);

  return (
    <div className="diary-shell">
      <a
        className="sr-only absolute left-5 top-4 z-50 rounded-full bg-[var(--color-brand-strong)] px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
        href="#item-content"
      >
        Đi tới nội dung chính
      </a>
      <AppHeader activeSection="catalogue" actor={actor} />

      <main id="item-content" tabIndex={-1}>
        <section className="mx-auto max-w-7xl px-5 pb-8 pt-6 sm:px-8 sm:pb-12 lg:px-10">
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-1 text-sm font-semibold text-[var(--color-brand)] transition hover:text-[var(--color-brand-strong)]"
            href="/"
            transitionTypes={["nav-back"]}
          >
            <ArrowLeft size={17} aria-hidden="true" />
            Trở lại bộ sưu tập
          </Link>

          <div className="mt-6 grid gap-7 lg:grid-cols-[minmax(0,0.95fr)_minmax(20rem,0.8fr)] lg:items-start lg:gap-12">
            <div className="overflow-hidden rounded-[var(--radius-dialog)] border border-[var(--color-border)] bg-[var(--color-paper)] shadow-[var(--shadow-card)]">
              {item.primaryImage ? (
                <ViewTransition
                  default="none"
                  name={`item-image-${item.id}`}
                  share="morph"
                >
                  <CatalogueItemImage
                    alt={item.primaryImage.altText ?? item.title}
                    src={item.primaryImage.url}
                  />
                </ViewTransition>
              ) : (
                <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-[linear-gradient(145deg,_var(--color-brand-soft),_var(--color-paper)_65%,_rgb(166_91_69_/_18%))]">
                  <span className="absolute h-48 w-48 rounded-full border border-[var(--color-border)]" aria-hidden="true" />
                  <Heart
                    className="relative text-[var(--color-brand)]"
                    fill="currentColor"
                    size={34}
                    strokeWidth={1.1}
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>

            <div className="py-2 lg:py-6">
              <p className="diary-kicker">{categoryName ?? "Một điều được lưu lại"}</p>
              <h1 className="font-display mt-4 text-balance text-4xl font-semibold tracking-[-0.06em] text-[var(--color-brand-strong)] sm:text-5xl">
                {item.title}
              </h1>
              {item.summary ? (
                <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--color-muted)]">
                  {item.summary}
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-[var(--color-brand)]">
                {item.priceLabel ? <span>{item.priceLabel}</span> : null}
                {item.address ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={16} aria-hidden="true" />
                    {item.address}
                  </span>
                ) : null}
              </div>
              {item.description ? (
                <p className="mt-6 whitespace-pre-line border-t border-[var(--color-border)] pt-5 text-base leading-8 text-[var(--color-ink)]">
                  {item.description}
                </p>
              ) : null}
              {item.links.length ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  {item.links.map((link) => (
                    <a
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] px-4 text-sm font-semibold text-[var(--color-brand)] transition hover:-translate-y-0.5 hover:border-[var(--color-accent)]"
                      href={link.url}
                      key={link.id}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {link.title}
                      <ExternalLink size={15} aria-hidden="true" />
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--color-border)] bg-[rgb(255_249_243_/_72%)]">
          <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
            <div className="max-w-2xl text-center">
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand)]" aria-hidden="true">
                <BookHeart size={20} strokeWidth={1.45} />
              </span>
              <p className="diary-kicker mt-4">Một góc chỉ dành cho chúng mình</p>
              <h2 className="font-display mt-2 text-balance text-3xl font-semibold tracking-[-0.05em] text-[var(--color-brand-strong)] sm:text-4xl">
                Những điều muốn nói
              </h2>
            </div>

            {keepsakes.length ? (
              <div className="mt-7 grid gap-4 md:grid-cols-2">
                {keepsakes.map((keepsake, index) => (
                  <KeepsakeCard keepsake={keepsake} key={keepsake.id} sequence={index + 1} />
                ))}
              </div>
            ) : (
              <div className="diary-wash mt-7 rounded-[var(--radius-card)] border border-[var(--color-border)] px-5 py-8 text-center shadow-[var(--shadow-soft)] sm:px-8">
                <Sparkles className="mx-auto text-[var(--color-accent)]" size={21} aria-hidden="true" />
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
      </main>
    </div>
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
    <article className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-paper)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <span className="absolute right-5 top-4 font-display text-4xl font-semibold text-[rgb(101_12_28_/_10%)]" aria-hidden="true">
        {String(sequence).padStart(2, "0")}
      </span>
      <div className="flex items-center gap-2 text-[var(--color-accent)]">
        <Quote size={18} strokeWidth={1.45} aria-hidden="true" />
        <p className="diary-kicker text-[var(--color-accent)]">{copy.label}</p>
      </div>
      {keepsake.title ? (
        <h3 className="font-display mt-4 max-w-[85%] text-2xl font-semibold tracking-[-0.04em] text-[var(--color-brand-strong)]">
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
