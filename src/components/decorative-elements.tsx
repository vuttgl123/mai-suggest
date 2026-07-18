export function DecorativeDivider({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="flex items-center justify-center" aria-hidden="true">
      <span
        className={`h-px w-16 ${inverse ? "bg-white/35" : "bg-[var(--color-border)]"}`}
      />
    </div>
  );
}
