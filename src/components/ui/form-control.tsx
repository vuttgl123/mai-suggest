import type {
  LabelHTMLAttributes,
  ReactElement,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

function mergeClassNames(base: string, className?: string) {
  return [base, className].filter(Boolean).join(" ");
}

export function FieldLabel({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>): ReactElement {
  return (
    <label
      className={mergeClassNames(
        "block text-xs font-semibold text-[var(--color-muted)]",
        className,
      )}
      {...props}
    />
  );
}

export function SelectControl({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>): ReactElement {
  return (
    <select
      className={mergeClassNames(
        "min-h-11 w-full appearance-none rounded-[var(--radius-control)] border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm font-medium text-[var(--color-ink)] outline-none transition disabled:cursor-not-allowed disabled:opacity-45",
        className,
      )}
      {...props}
    />
  );
}

export function TextAreaControl({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>): ReactElement {
  return (
    <textarea
      className={mergeClassNames(
        "block min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-white px-3 py-2.5 text-base leading-7 text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)] disabled:cursor-not-allowed disabled:opacity-45",
        className,
      )}
      {...props}
    />
  );
}
