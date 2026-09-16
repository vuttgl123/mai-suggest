import { type Result, failure, success } from "@/core/application/result";
import { requireActiveActor, type CurrentActor } from "@/modules/identity/domain/current-actor";
import type { TimelineReader } from "@/modules/timeline/application/timeline-reader";
import type { TimelineEntry } from "@/modules/timeline/domain/timeline-models";

export class GetVisibleTimelineChapter {
  constructor(private readonly reader: TimelineReader) {}

  async execute(
    actor: CurrentActor,
    chapterId: string,
  ): Promise<Result<TimelineEntry>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) return activeActor;
    
    const result = await this.reader.getVisibleChapterDetail(chapterId);
    if (!result.ok) return result;
    if (!result.value) return failure("NOT_FOUND");
    
    return success(result.value);
  }
}
