import { type Result } from "@/core/application/result";
import { requireActiveActor, type CurrentActor } from "@/modules/identity/domain/current-actor";
import type { TimelineReader } from "@/modules/timeline/application/timeline-reader";
import type { TimelineChapterPreview } from "@/modules/timeline/domain/timeline-models";

export class ListVisibleTimelineChapters {
  constructor(private readonly reader: TimelineReader) {}

  async execute(actor: CurrentActor): Promise<Result<TimelineChapterPreview[]>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) return activeActor;
    
    return this.reader.listVisibleChapterPreviews();
  }
}
