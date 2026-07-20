import type { ButtonHTMLAttributes, ReactElement, Ref } from "react";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";
export type ButtonSize = "medium" | "compact" | "icon";

const variantClassNames: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-[var(--color-brand)] text-white shadow-[0_8px_20px_rgb(122_16_37_/_18%)] hover:-translate-y-0.5 hover:bg-[var(--color-brand-strong)] hover:shadow-[0_12px_26px_rgb(67_8_19_/_24%)]",
  secondary:
    "border-[var(--color-border)] bg-[rgb(255_250_247_/_82%)] text-[var(--color-brand)] hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:bg-white",
  quiet:
    "border-transparent bg-transparent text-[var(--color-brand)] hover:bg-[var(--color-brand-soft)]",
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
    "inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] border font-semibold transition duration-[var(--duration-fast)] ease-out disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0",
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
