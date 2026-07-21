import type {
  EngagementAuthor,
  ItemCommentView,
  ItemRatingView,
} from "@/modules/engagement/domain/item-engagement-view";
import type {
  ItemComment,
  ItemRating,
  ItemUserState,
} from "@/modules/engagement/domain/engagement-models";
import type { Database } from "@/lib/supabase/database.types";

export type EngagementStateRow = Database["public"]["Tables"]["user_item_states"]["Row"];
export type EngagementRatingRow = Database["public"]["Tables"]["ratings"]["Row"];
export type EngagementCommentRow = Database["public"]["Tables"]["comments"]["Row"];
export type EngagementProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "display_name" | "avatar_url"
>;

export const fallbackEngagementAuthor: EngagementAuthor = {
  displayName: "Thành viên",
  avatarUrl: null,
};

export function toItemState(row: EngagementStateRow): ItemUserState {
  return {
    id: row.id,
    itemId: row.item_id,
    userId: row.user_id,
    isFavorite: row.is_favorite,
    state: row.state,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toItemRating(row: EngagementRatingRow): ItemRating {
  return {
    id: row.id,
    itemId: row.item_id,
    userId: row.user_id,
    score: row.score,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toItemComment(row: EngagementCommentRow): ItemComment {
  return {
    id: row.id,
    itemId: row.item_id,
    userId: row.user_id,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toItemRatingView(
  row: EngagementRatingRow,
  authors: Map<string, EngagementAuthor>,
): ItemRatingView {
  return {
    ...toItemRating(row),
    author: authors.get(row.user_id) ?? fallbackEngagementAuthor,
  };
}

export function toItemCommentView(
  row: EngagementCommentRow,
  authors: Map<string, EngagementAuthor>,
): ItemCommentView {
  return {
    ...toItemComment(row),
    author: authors.get(row.user_id) ?? fallbackEngagementAuthor,
  };
}

export function engagementAuthorsById(
  profileRows: EngagementProfileRow[],
): Map<string, EngagementAuthor> {
  return new Map(
    profileRows.map((profile) => [
      profile.id,
      {
        displayName: profile.display_name?.trim() || "Thành viên",
        avatarUrl: profile.avatar_url,
      },
    ]),
  );
}
