export function createAdminTimelinePath({
  entryId,
}: {
  entryId: string | null;
}): string {
  if (!entryId?.trim()) return "/admin/hanh-trinh";

  const params = new URLSearchParams({ entry: entryId.trim() });
  return `/admin/hanh-trinh?${params.toString()}`;
}

export function createTimelineEntryAnchor(entryId: string): string {
  return `#timeline-entry-${encodeURIComponent(entryId)}`;
}
