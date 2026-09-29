import type { ReactNode } from "react";

interface ArchiveLabelProps {
  title: ReactNode;
  /** Secondary lines in order: date, provenance, author. Empty values are skipped. */
  lines?: Array<ReactNode | null | undefined | false>;
  titleAs?: "h1" | "h2" | "h3" | "h4" | "p";
  titleId?: string;
  className?: string;
  titleClassName?: string;
}

/* Stacked lines under a short rule, like a museum wall label. */
export function ArchiveLabel({
  title,
  lines = [],
  titleAs: Title = "h3",
  titleId,
  className = "",
  titleClassName = "",
}: ArchiveLabelProps) {
  const visibleLines = lines.filter(
    (line): line is ReactNode => line !== null && line !== undefined && line !== false && line !== "",
  );

  return (
    <div className={`archive-label ${className}`.trim()}>
      <Title className={`archive-label__title ${titleClassName}`.trim()} id={titleId}>
        {title}
      </Title>
      {visibleLines.map((line, index) => (
        <p className="archive-label__line" key={index}>
          {line}
        </p>
      ))}
    </div>
  );
}
