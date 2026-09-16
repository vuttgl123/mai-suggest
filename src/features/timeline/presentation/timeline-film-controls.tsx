"use client";

import { MediaRailControls } from "@/components/ui/media-rail";

export function TimelineFilmControls({ viewportId }: { viewportId: string }) {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-center">
      <div className="diary-container relative h-full w-full">
        <MediaRailControls
          frameClassName="timeline-film-frame"
          groupLabel="Điều hướng cuộn phim"
          nextLabel="Xem chương tiếp theo"
          previousLabel="Xem chương trước"
          viewportId={viewportId}
        />
      </div>
    </div>
  );
}
