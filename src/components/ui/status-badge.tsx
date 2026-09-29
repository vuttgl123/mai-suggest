interface StatusBadgeProps {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}

/* Status is carried by shape and text, never colour alone: a filled dot for
 * active content, a dashed outline for drafts or hidden items. */
export function StatusBadge({ active, activeLabel, inactiveLabel }: StatusBadgeProps) {
  return active ? (
    <span className="inline-flex shrink-0 items-center gap-1.5 text-[0.8125rem] font-medium text-positive">
      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-olive" />
      {activeLabel}
    </span>
  ) : (
    <span className="inline-flex shrink-0 items-center rounded-full border border-dashed border-border-strong px-2 py-0.5 text-[0.8125rem] font-medium text-muted">
      {inactiveLabel}
    </span>
  );
}
