import type { SupabaseClient } from "@supabase/supabase-js";
import { failure, success, type Result } from "@/core/application/result";
import type { ItemEngagementReader } from "@/modules/engagement/application/item-engagement-reader";
import type { ItemEngagementView } from "@/modules/engagement/domain/item-engagement-view";
import {
  engagementAuthorsById,
  toItemCommentView,
  toItemRatingView,
  toItemState,
  type EngagementProfileRow,
} from "@/modules/engagement/infrastructure/engagement-mappers";
import type { Database } from "@/lib/supabase/database.types";

const STATE_COLUMNS =
  "id,item_id,user_id,is_favorite,state,note,created_at,updated_at";
const RATING_COLUMNS = "id,item_id,user_id,score,note,created_at,updated_at";
const COMMENT_COLUMNS = "id,item_id,user_id,content,created_at,updated_at";
const PROFILE_COLUMNS = "id,display_name,avatar_url";

export class SupabaseItemEngagementReader implements ItemEngagementReader {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async readItemEngagement(
    itemId: string,
    viewerId: string,
  ): Promise<Result<ItemEngagementView>> {
    const [stateResult, ratingsResult, commentsResult] = await Promise.all([
      this.client
        .from("user_item_states")
        .select(STATE_COLUMNS)
        .eq("item_id", itemId)
        .eq("user_id", viewerId)
        .maybeSingle(),
      this.client
        .from("ratings")
        .select(RATING_COLUMNS)
        .eq("item_id", itemId)
        .order("updated_at", { ascending: false }),
      this.client
        .from("comments")
        .select(COMMENT_COLUMNS)
        .eq("item_id", itemId)
        .order("created_at", { ascending: false }),
    ]);

    if (stateResult.error || ratingsResult.error || commentsResult.error) {
      return failure("UNEXPECTED_FAILURE");
    }

    const ratingRows = ratingsResult.data ?? [];
    const commentRows = commentsResult.data ?? [];
    const userIds = [
      ...new Set([
        ...ratingRows.map((rating) => rating.user_id),
        ...commentRows.map((comment) => comment.user_id),
      ]),
    ];

    let profileRows: EngagementProfileRow[] = [];
    if (userIds.length) {
      const profilesResult = await this.client
        .from("profiles")
        .select(PROFILE_COLUMNS)
        .in("id", userIds);

      if (profilesResult.error) return failure("UNEXPECTED_FAILURE");
      profileRows = profilesResult.data ?? [];
    }

    const authors = engagementAuthorsById(profileRows);

    return success({
      state: stateResult.data ? toItemState(stateResult.data) : null,
      ratings: ratingRows.map((rating) => toItemRatingView(rating, authors)),
      comments: commentRows.map((comment) => toItemCommentView(comment, authors)),
    });
  }
}
