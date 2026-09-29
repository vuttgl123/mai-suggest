import Link from "next/link";
import type { ReactNode } from "react";

/* Skeletons mirror the shape that will load (label rules, 4:5 frames) and use a
 * still tone: nothing shimmers. */
export function RouteSkeleton({ label, variant }: { label: string; variant: "collection" | "reading" | "letters" }) {
  return (
    <div aria-busy="true" aria-label={label} className="diary-container pb-24 pt-24 sm:pt-28" role="status">
      <div className="h-[clamp(2.25rem,4vw,3.75rem)] w-2/3 max-w-xl rounded-[var(--radius-object)] bg-skeleton" />
      <div className="mt-4 h-4 w-40 rounded-full bg-skeleton" />

      {variant === "collection" ? (
        <ul className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <li className="grid gap-4" key={index}>
              <div className="matted">
                <div className="aspect-[4/5] bg-skeleton" />
              </div>
              <div className="h-px w-10 bg-border-strong" />
              <div className="h-5 w-2/3 rounded-full bg-skeleton" />
              <div className="h-4 w-full rounded-full bg-skeleton" />
            </li>
          ))}
        </ul>
      ) : null}

      {variant === "reading" ? (
        <div className="mt-14 grid gap-x-6 lg:grid-cols-12">
          <div className="hidden gap-5 border-l border-rose pl-5 lg:col-span-3 lg:grid lg:content-start">
            {[0, 1, 2, 3].map((index) => (
              <div className="h-10 rounded-[var(--radius-object)] bg-skeleton" key={index} />
            ))}
          </div>
          <div className="grid gap-4 lg:col-span-7 lg:col-start-5">
            <div className="h-9 w-3/4 rounded-[var(--radius-object)] bg-skeleton" />
            {[0, 1, 2, 3].map((index) => (
              <div className="h-4 rounded-full bg-skeleton" key={index} />
            ))}
          </div>
        </div>
      ) : null}

      {variant === "letters" ? (
        <ul className="mt-14 grid max-w-4xl gap-4">
          {[0, 1, 2].map((index) => (
            <li className="h-28 rounded-[var(--radius-object)] bg-skeleton" key={index} />
          ))}
        </ul>
      ) : null}

      <span className="sr-only">{label}</span>
    </div>
  );
}

export function RouteErrorState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: ReactNode;
}) {
  return (
    <main className="diary-container grid min-h-[70dvh] content-center py-16">
      <div className="max-w-xl" role="alert">
        <h1 className="font-display display-md text-brand-strong">{title}</h1>
        <p className="mt-4 text-ink">{description}</p>
        <div className="mt-7 flex flex-wrap items-center gap-4">
          {action}
          <Link className="text-link" href="/">
            Về trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
}
