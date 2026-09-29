interface WaxSealProps {
  state?: "sealed" | "broken";
  size?: string;
  className?: string;
}

/* Used only for letters and the brand mark, so it stays meaningful. */
export function WaxSeal({ state = "sealed", size, className = "" }: WaxSealProps) {
  return (
    <span
      aria-hidden="true"
      className={`wax-seal ${className}`.trim()}
      data-state={state}
      style={size ? ({ "--seal-size": size } as React.CSSProperties) : undefined}
    >
      <span className="wax-seal__half" />
      <span className="wax-seal__half" />
    </span>
  );
}
