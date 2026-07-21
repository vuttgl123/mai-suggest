import { failure, type Result } from "@/core/application/result";
import type { TimelineAdminReader } from "@/modules/timeline/application/timeline-admin-reader";
import type { ManagedTimelineEntry } from "@/modules/timeline/domain/timeline-models";
import {
  requireCatalogueOwner,
  type CurrentActor,
} from "@/modules/identity/domain/current-actor";

export class GetManagedTimelineEntry {
  constructor(private readonly reader: TimelineAdminReader) {}

  async execute(
    actor: CurrentActor,
    entryId: string,
  ): Promise<Result<ManagedTimelineEntry | null>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;
    if (!entryId.trim()) return failure("VALIDATION_FAILED");

    return this.reader.findManagedById(entryId.trim());
  }
}
