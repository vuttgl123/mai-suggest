import { failure, type Result } from "@/core/application/result";
import type { TimelineRepository } from "@/modules/timeline/application/timeline-repository";
import {
  hasTimelineId,
  normalizeCreateTimelineResponseInput,
  normalizeTimelineEntryInput,
  normalizeUpdateTimelineResponseInput,
} from "@/modules/timeline/domain/timeline-validation";
import type {
  CreateTimelineResponseInput,
  ManagedTimelineEntry,
  TimelineEntryInput,
  UpdateTimelineResponseInput,
} from "@/modules/timeline/domain/timeline-models";
import {
  requireActiveActor,
  requireCatalogueOwner,
  type CurrentActor,
} from "@/modules/identity/domain/current-actor";

export class ManageTimeline {
  constructor(private readonly repository: TimelineRepository) {}

  async createEntry(
    actor: CurrentActor,
    input: TimelineEntryInput,
  ): Promise<Result<ManagedTimelineEntry>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;

    const normalized = normalizeTimelineEntryInput(input);
    if (!normalized.ok) return normalized;

    return this.repository.createEntry(owner.value.userId, normalized.value);
  }

  async updateEntry(
    actor: CurrentActor,
    entryId: string,
    input: TimelineEntryInput,
  ): Promise<Result<ManagedTimelineEntry>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;
    if (!hasTimelineId(entryId)) return failure("VALIDATION_FAILED");

    const normalized = normalizeTimelineEntryInput(input);
    if (!normalized.ok) return normalized;

    return this.repository.updateEntry(entryId.trim(), normalized.value);
  }

  async deleteEntry(actor: CurrentActor, entryId: string): Promise<Result<void>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;
    if (!hasTimelineId(entryId)) return failure("VALIDATION_FAILED");

    return this.repository.deleteEntry(entryId.trim());
  }

  async createResponse(
    actor: CurrentActor,
    input: CreateTimelineResponseInput,
  ): Promise<Result<void>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) return activeActor;

    const normalized = normalizeCreateTimelineResponseInput(input);
    if (!normalized.ok) return normalized;

    return this.repository.createResponse(activeActor.value.userId, normalized.value);
  }

  async updateResponse(
    actor: CurrentActor,
    responseId: string,
    input: UpdateTimelineResponseInput,
  ): Promise<Result<void>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) return activeActor;
    if (!hasTimelineId(responseId)) return failure("VALIDATION_FAILED");

    const normalized = normalizeUpdateTimelineResponseInput(input);
    if (!normalized.ok) return normalized;

    return this.repository.updateResponse(
      responseId.trim(),
      activeActor.value.userId,
      normalized.value,
    );
  }

  async deleteResponse(
    actor: CurrentActor,
    responseId: string,
  ): Promise<Result<void>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) return activeActor;
    if (!hasTimelineId(responseId)) return failure("VALIDATION_FAILED");

    return this.repository.deleteResponse(
      responseId.trim(),
      activeActor.value.userId,
      activeActor.value.canManageCatalogue,
    );
  }
}
