import type { Result } from "@/core/application/result";
import type { TimelineReader } from "@/modules/timeline/application/timeline-reader";
import type { TimelineEntry } from "@/modules/timeline/domain/timeline-models";
import {
  requireActiveActor,
  type CurrentActor,
} from "@/modules/identity/domain/current-actor";

export class ListVisibleTimeline {
  constructor(private readonly reader: TimelineReader) {}

  async execute(actor: CurrentActor): Promise<Result<TimelineEntry[]>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) return activeActor;

    return this.reader.listVisible();
  }
}
