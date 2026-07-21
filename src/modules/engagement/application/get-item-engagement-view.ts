import { failure, type Result } from "@/core/application/result";
import type { ItemEngagementReader } from "@/modules/engagement/application/item-engagement-reader";
import type { ItemEngagementView } from "@/modules/engagement/domain/item-engagement-view";
import {
  requireActiveActor,
  type CurrentActor,
} from "@/modules/identity/domain/current-actor";

function hasIdentifier(value: string): boolean {
  return value.trim().length > 0;
}

export class GetItemEngagementView {
  constructor(private readonly reader: ItemEngagementReader) {}

  async execute(
    actor: CurrentActor,
    itemId: string,
  ): Promise<Result<ItemEngagementView>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) return activeActor;
    if (!hasIdentifier(itemId)) return failure("VALIDATION_FAILED");

    return this.reader.readItemEngagement(itemId, activeActor.value.userId);
  }
}
