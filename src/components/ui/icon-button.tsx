import type {
  ButtonHTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
} from "react";
import type { ButtonVariant } from "./button";
import { Button } from "./button";

interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  label: string;
  icon: ReactNode;
  variant?: ButtonVariant;
  ref?: Ref<HTMLButtonElement>;
}

export function IconButton({
  label,
  icon,
  title = label,
  variant = "secondary",
  ref,
  ...props
}: IconButtonProps): ReactElement {
  return (
    <Button
      size="icon"
      variant={variant}
      ref={ref}
      aria-label={label}
      title={title}
      {...props}
    >
      {icon}
    </Button>
  );
}
