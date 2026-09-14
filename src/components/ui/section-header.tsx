import type { ReactNode } from "react";

interface SectionHeaderProps {
  aside?: ReactNode;
  headingId?: string;
  headingLevel?: 2 | 3;
  kicker?: string;
  title: string;
}

export function SectionHeader({
  aside,
  headingId,
  headingLevel = 2,
  kicker,
  title,
}: SectionHeaderProps) {
  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {kicker ? <p className="diary-kicker">{kicker}</p> : null}
        <Heading
          className="font-display display-md mt-2 font-semibold text-brand-strong"
          id={headingId}
        >
          {title}
        </Heading>
      </div>
      {aside ? <div className="body-text-sm text-muted">{aside}</div> : null}
    </div>
  );
}
