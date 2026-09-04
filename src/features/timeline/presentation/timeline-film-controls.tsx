"use client";

import { MediaRailControls } from "@/components/ui/media-rail";

export function TimelineFilmControls({ viewportId }: { viewportId: string }) {
  return (
    <MediaRailControls
      frameClassName="timeline-film-frame"
      groupLabel="Điều hướng cuộn phim"
      nextLabel="Xem chương tiếp theo"
      previousLabel="Xem chương trước"
      viewportId={viewportId}
    />
  );
}
