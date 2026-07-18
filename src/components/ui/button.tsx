import type { ButtonHTMLAttributes, ReactElement, Ref } from "react";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";
export type ButtonSize = "medium" | "compact" | "icon";

const variantClassNames: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-strong)]",
  secondary:
    "border-[var(--color-border)] bg-[var(--color-paper)] text-[var(--color-brand)] hover:border-[var(--color-accent)] hover:bg-white",
  quiet:
    "border-transparent bg-transparent text-[var(--color-brand)] hover:bg-[var(--color-surface)]",
  danger:
    "border-transparent bg-[var(--color-danger)] text-white hover:brightness-90",
};

const sizeClassNames: Record<ButtonSize, string> = {
  medium: "min-h-11 px-4 py-2.5 text-sm",
  compact: "min-h-11 px-3 py-2 text-xs",
  icon: "h-11 w-11 shrink-0 p-0",
};

export function buttonClassName({
  variant = "primary",
  size = "medium",
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] border font-semibold transition duration-[var(--duration-fast)] disabled:cursor-not-allowed disabled:opacity-45",
    variantClassNames[variant],
    sizeClassNames[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  type = "button",
  variant,
  size,
  className,
  ref,
  ...props
}: ButtonProps): ReactElement {
  return (
    <button
      type={type}
      ref={ref}
      className={buttonClassName({ variant, size, className })}
      {...props}
    />
  );
}
