"use client";

import Link, { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";

type NavigationLinkProps = ComponentProps<typeof Link>;

function NavigationPendingMark() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden="true"
      className="navigation-link__pending"
      data-pending={pending || undefined}
    />
  );
}

export function NavigationLink({
  children,
  className,
  ...props
}: NavigationLinkProps) {
  return (
    <Link
      {...props}
      className={["navigation-link", className].filter(Boolean).join(" ")}
    >
      {children}
      <NavigationPendingMark />
    </Link>
  );
}
