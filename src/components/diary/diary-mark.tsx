import type { ReactNode } from "react";

interface DiaryMarkProps {
  children: ReactNode;
  className?: string;
}

export function DiaryMark({ children, className }: DiaryMarkProps) {
  return <p className={["diary-kicker", className].filter(Boolean).join(" ")}>{children}</p>;
}

export function DiaryRule() {
  return <span aria-hidden="true" className="diary-rule" />;
}
