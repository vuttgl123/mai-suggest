import type { Result } from "@/core/application/result";
import type { ItemEngagementView } from "@/modules/engagement/domain/item-engagement-view";

export interface ItemEngagementReader {
  readItemEngagement(
    itemId: string,
    viewerId: string,
  ): Promise<Result<ItemEngagementView>>;
}
