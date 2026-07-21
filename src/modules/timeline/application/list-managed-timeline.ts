import type { Result } from "@/core/application/result";
import type { TimelineAdminReader } from "@/modules/timeline/application/timeline-admin-reader";
import type { ManagedTimelineEntrySummary } from "@/modules/timeline/domain/timeline-models";
import {
  requireCatalogueOwner,
  type CurrentActor,
} from "@/modules/identity/domain/current-actor";

export class ListManagedTimeline {
  constructor(private readonly reader: TimelineAdminReader) {}

  async execute(
    actor: CurrentActor,
  ): Promise<Result<ManagedTimelineEntrySummary[]>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;

    return this.reader.listManaged();
  }
}
