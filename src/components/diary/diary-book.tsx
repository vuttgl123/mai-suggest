import type { ComponentPropsWithoutRef, ReactNode } from "react";

interface DiaryBookProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "className"> {
  children: ReactNode;
  className?: string;
}

export function DiaryBook({ children, className, ...props }: DiaryBookProps) {
  return (
    <div
      {...props}
      className={["diary-shell", "diary-book", className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}
