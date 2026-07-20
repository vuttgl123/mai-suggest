import type { Result } from "@/core/application/result";
import type {
  ItemComment,
  ItemRating,
  ItemUserState,
} from "@/modules/engagement/domain/engagement-models";

export interface SaveItemStateCommand {
  itemId: string;
  userId: string;
  isFavorite: boolean;
  state: ItemUserState["state"];
  note: string | null;
}

export interface SaveItemRatingCommand {
  itemId: string;
  userId: string;
  score: number;
  note: string | null;
}

export interface CreateCommentCommand {
  itemId: string;
  userId: string;
  content: string;
}

export interface UpdateCommentCommand {
  commentId: string;
  userId: string;
  content: string;
}

export interface DeleteCommentCommand {
  commentId: string;
  userId: string;
  canManageAll: boolean;
}

export interface EngagementRepository {
  findItemState(
    itemId: string,
    userId: string,
  ): Promise<Result<ItemUserState | null>>;
  listItemRatings(itemId: string): Promise<Result<ItemRating[]>>;
  listItemComments(itemId: string): Promise<Result<ItemComment[]>>;
  saveItemState(command: SaveItemStateCommand): Promise<Result<ItemUserState>>;
  saveItemRating(command: SaveItemRatingCommand): Promise<Result<ItemRating>>;
  deleteItemRating(itemId: string, userId: string): Promise<Result<void>>;
  createComment(command: CreateCommentCommand): Promise<Result<ItemComment>>;
  updateComment(command: UpdateCommentCommand): Promise<Result<ItemComment>>;
  deleteComment(command: DeleteCommentCommand): Promise<Result<void>>;
}
