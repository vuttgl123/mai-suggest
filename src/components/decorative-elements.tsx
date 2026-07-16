import { Heart } from "lucide-react";

export function DecorativeDivider({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-3" aria-hidden="true">
      <span
        className={`h-px w-10 ${inverse ? "bg-[#f8f1e8]/35" : "bg-[#c8a96b]/60"}`}
      />
      <Heart
        className={inverse ? "text-[#e5c989]" : "text-[#9b763e]"}
        size={13}
        strokeWidth={1.4}
      />
      <span
        className={`h-px w-10 ${inverse ? "bg-[#f8f1e8]/35" : "bg-[#c8a96b]/60"}`}
      />
    </div>
  );
}

export function CornerFlourish({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 120 120"
      fill="none"
    >
      <path
        d="M5 114C18 72 48 31 114 5M22 92c24 3 47-7 56-30M43 66C29 52 29 31 38 15M67 43c15 5 31 1 42-12"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M76 60c-1-11 5-19 16-22-1 11-6 19-16 22ZM42 78c-9-2-14-9-13-18 9 3 14 9 13 18Z"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}
