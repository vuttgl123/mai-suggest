import { ViewTransition, type ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      default="none"
      enter={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        "page-forward": "nav-forward",
        "page-back": "nav-back",
        default: "slide-up",
      }}
      exit={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        "page-forward": "nav-forward",
        "page-back": "nav-back",
        default: "slide-down",
      }}
    >
      {children}
    </ViewTransition>
  );
}
