import Link from "next/link";
import { ArchiveLabel } from "@/components/ui/archive-label";
import { MattedImage } from "@/components/ui/matted-image";
import type { LivingCover as LivingCoverModel } from "@/features/home/lib/home-selection";

const COVER_LINE = "Có những ngày, mình muốn giữ lại mãi.";

export function LivingCover({ cover }: { cover: LivingCoverModel }) {
  if (cover.kind === "text") {
    return (
      <section aria-labelledby="living-cover-title" className="diary-container pb-16 pt-16 sm:pt-24">
        <h1 className="cover-text max-w-[14ch] text-brand-strong" id="living-cover-title">
          {COVER_LINE}
        </h1>
        <p className="body-text mt-6 max-w-[46ch] text-muted">
          Nơi giữ những điều muốn cùng thử, những chương đã đi qua và những lá thư
          hẹn ngày mở.
        </p>
      </section>
    );
  }

  const label =
    cover.kind === "chapter" ? (
      <ArchiveLabel
        lines={[
          cover.occurredOn ? formatCoverDate(cover.occurredOn) : cover.dateLabel,
          `Chương ${cover.sequence} trong Hành trình`,
        ]}
        title={cover.title}
        titleAs="p"
      />
    ) : (
      <ArchiveLabel lines={[cover.categoryName ?? "Trong bộ sưu tập"]} title={cover.title} titleAs="p" />
    );

  const href =
    cover.kind === "chapter"
      ? `/hanh-trinh?chapter=${encodeURIComponent(cover.chapterId)}`
      : `/catalogue/${encodeURIComponent(cover.slug)}`;

  return (
    <section aria-labelledby="living-cover-title" className="living-cover diary-container pt-6 sm:pt-10">
      <div className="grid grid-cols-4 gap-x-4 md:grid-cols-12 md:gap-x-6">
        <div className="contents md:col-span-5 md:flex md:min-h-[max(32rem,calc(100svh-6.5rem))] md:flex-col md:justify-between md:py-14">
          <h1 className="cover-text order-1 col-span-4 max-w-[11ch] pt-6 text-brand-strong md:order-none md:pt-0" id="living-cover-title">
            {COVER_LINE}
          </h1>
          <div className="order-3 col-span-4 mt-6 grid gap-3 md:order-none md:mt-0">
            {label}
            <div>
              <Link className="text-link" href={href}>
                {cover.kind === "chapter" ? "Đọc chương này" : "Xem điều này"}
              </Link>
            </div>
            <span aria-hidden="true" className="living-cover__thread hidden md:block" />
          </div>
        </div>
        <div className="living-cover__photo order-2 col-span-4 mt-7 md:order-none md:col-span-7 md:mt-0">
          <div className="aspect-[4/5] max-h-[70svh] w-full md:aspect-auto md:h-[max(32rem,calc(100svh-6.5rem))] md:max-h-none">
            <MattedImage
              alt={cover.imageAlt}
              bare
              className="h-full"
              priority
              ratio="fill"
              src={cover.imageUrl}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function formatCoverDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
