import Link from "next/link";

interface HomeEntrancesProps {
  itemCount: number;
  chapterCount: number;
  openedLetterCount: number;
}

/* Counts only include what the viewer may see: visible items, published
 * chapters and letters that have already opened. Sealed letters are never
 * counted here. */
export function HomeEntrances({
  itemCount,
  chapterCount,
  openedLetterCount,
}: HomeEntrancesProps) {
  const entrances = [
    {
      href: "/#collection",
      title: "Bộ sưu tập",
      line: "Những điều muốn cùng nhau thử",
      count: `${itemCount} điều`,
    },
    {
      href: "/hanh-trinh",
      title: "Hành trình",
      line: "Đọc lại từng chương",
      count: `${chapterCount} chương`,
    },
    {
      href: "/thu-hen-ngay-mo",
      title: "Hộp thư",
      line: "Gửi một chút hôm nay đến ngày mai",
      count: `${openedLetterCount} lá thư đã mở`,
    },
  ];

  return (
    <nav aria-label="Lối vào" className="diary-container mt-10 md:mt-0">
      <ul className="grid border-y border-border md:grid-cols-3">
        {entrances.map((entrance, index) => (
          <li
            className={`reveal-rise ${index > 0 ? "border-t md:border-l md:border-t-0" : ""} border-border`}
            key={entrance.href}
          >
            <Link
              className={`group grid min-h-11 gap-1 py-6 md:py-8 ${index > 0 ? "md:pl-6" : ""} md:pr-6`}
              href={entrance.href}
            >
              <span className="font-display title-text w-fit font-medium text-brand-strong">
                <span className="underline-grow pb-0.5">
                {entrance.title}</span>
              </span>
              <span className="text-muted">{entrance.line}</span>
              <span className="tabular mt-2 text-sm font-semibold text-ink">{entrance.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
