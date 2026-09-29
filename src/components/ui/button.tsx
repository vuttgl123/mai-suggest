import type { ButtonHTMLAttributes, ReactElement, Ref } from "react";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";
export type ButtonSize = "medium" | "compact" | "icon";

const variantClassNames: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-brand text-on-brand hover:bg-brand-strong",
  secondary:
    "border-border-strong bg-paper text-brand hover:border-brand hover:bg-brand-soft",
  quiet:
    "border-transparent bg-transparent text-brand hover:bg-brand-soft",
  danger:
    "border-transparent bg-danger text-on-brand hover:brightness-95",
};

const sizeClassNames: Record<ButtonSize, string> = {
  medium: "min-h-11 px-5 py-2.5 text-[0.9375rem]",
  compact: "min-h-11 px-4 py-2 text-sm",
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
    "press inline-flex touch-manipulation items-center justify-center gap-2 whitespace-nowrap rounded-full border font-semibold transition-colors duration-[var(--motion-micro)] ease-[var(--ease-standard)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none",
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
