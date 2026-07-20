import type { SupabaseClient } from "@supabase/supabase-js";
import { failure, success, type Result } from "@/core/application/result";
import type {
  CreateCommentCommand,
  DeleteCommentCommand,
  EngagementRepository,
  SaveItemRatingCommand,
  SaveItemStateCommand,
  UpdateCommentCommand,
} from "@/modules/engagement/application/engagement-repository";
import type {
  ItemComment,
  ItemRating,
  ItemUserState,
} from "@/modules/engagement/domain/engagement-models";
import type { Database } from "@/lib/supabase/database.types";

const STATE_COLUMNS =
  "id,item_id,user_id,is_favorite,state,note,created_at,updated_at";
const RATING_COLUMNS = "id,item_id,user_id,score,note,created_at,updated_at";
const COMMENT_COLUMNS = "id,item_id,user_id,content,created_at,updated_at";

type StateRow = Database["public"]["Tables"]["user_item_states"]["Row"];
type RatingRow = Database["public"]["Tables"]["ratings"]["Row"];
type CommentRow = Database["public"]["Tables"]["comments"]["Row"];

function toItemState(row: StateRow): ItemUserState {
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

function toItemRating(row: RatingRow): ItemRating {
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

function toItemComment(row: CommentRow): ItemComment {
  return {
    id: row.id,
    itemId: row.item_id,
    userId: row.user_id,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseEngagementRepository implements EngagementRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async findItemState(
    itemId: string,
    userId: string,
  ): Promise<Result<ItemUserState | null>> {
    const { data, error } = await this.client
      .from("user_item_states")
      .select(STATE_COLUMNS)
      .eq("item_id", itemId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) return failure("UNEXPECTED_FAILURE");
    return success(data ? toItemState(data) : null);
  }

  async listItemRatings(itemId: string): Promise<Result<ItemRating[]>> {
    const { data, error } = await this.client
      .from("ratings")
      .select(RATING_COLUMNS)
      .eq("item_id", itemId)
      .order("updated_at", { ascending: false });

    if (error) return failure("UNEXPECTED_FAILURE");
    return success(data.map(toItemRating));
  }

  async listItemComments(itemId: string): Promise<Result<ItemComment[]>> {
    const { data, error } = await this.client
      .from("comments")
      .select(COMMENT_COLUMNS)
      .eq("item_id", itemId)
      .order("created_at", { ascending: false });

    if (error) return failure("UNEXPECTED_FAILURE");
    return success(data.map(toItemComment));
  }

  async saveItemState(
    command: SaveItemStateCommand,
  ): Promise<Result<ItemUserState>> {
    const { data, error } = await this.client
      .from("user_item_states")
      .upsert(
        {
          item_id: command.itemId,
          user_id: command.userId,
          is_favorite: command.isFavorite,
          state: command.state,
          note: command.note,
        },
        { onConflict: "item_id,user_id" },
      )
      .select(STATE_COLUMNS)
      .single();

    if (error) return failure("UNEXPECTED_FAILURE");
    return success(toItemState(data));
  }

  async saveItemRating(
    command: SaveItemRatingCommand,
  ): Promise<Result<ItemRating>> {
    const { data, error } = await this.client
      .from("ratings")
      .upsert(
        {
          item_id: command.itemId,
          user_id: command.userId,
          score: command.score,
          note: command.note,
        },
        { onConflict: "item_id,user_id" },
      )
      .select(RATING_COLUMNS)
      .single();

    if (error) return failure("UNEXPECTED_FAILURE");
    return success(toItemRating(data));
  }

  async deleteItemRating(itemId: string, userId: string): Promise<Result<void>> {
    const { data, error } = await this.client
      .from("ratings")
      .delete()
      .eq("item_id", itemId)
      .eq("user_id", userId)
      .select("id")
      .maybeSingle();

    if (error) return failure("UNEXPECTED_FAILURE");
    return data ? success(undefined) : failure("NOT_FOUND");
  }

  async createComment(
    command: CreateCommentCommand,
  ): Promise<Result<ItemComment>> {
    const { data, error } = await this.client
      .from("comments")
      .insert({
        item_id: command.itemId,
        user_id: command.userId,
        content: command.content,
      })
      .select(COMMENT_COLUMNS)
      .single();

    if (error) return failure("UNEXPECTED_FAILURE");
    return success(toItemComment(data));
  }

  async updateComment(
    command: UpdateCommentCommand,
  ): Promise<Result<ItemComment>> {
    const { data, error } = await this.client
      .from("comments")
      .update({ content: command.content })
      .eq("id", command.commentId)
      .eq("user_id", command.userId)
      .select(COMMENT_COLUMNS)
      .maybeSingle();

    if (error) return failure("UNEXPECTED_FAILURE");
    return data ? success(toItemComment(data)) : failure("NOT_FOUND");
  }

  async deleteComment(
    command: DeleteCommentCommand,
  ): Promise<Result<void>> {
    let query = this.client
      .from("comments")
      .delete()
      .eq("id", command.commentId);

    if (!command.canManageAll) {
      query = query.eq("user_id", command.userId);
    }

    const { data, error } = await query.select("id").maybeSingle();
    if (error) return failure("UNEXPECTED_FAILURE");
    return data ? success(undefined) : failure("NOT_FOUND");
  }
}
