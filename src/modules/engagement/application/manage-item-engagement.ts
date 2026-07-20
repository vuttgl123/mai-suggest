import { failure, success, type Result } from "@/core/application/result";
import type { CurrentActor } from "@/modules/identity/domain/current-actor";
import { requireActiveActor } from "@/modules/identity/domain/current-actor";
import type {
  CreateItemCommentInput,
  ItemComment,
  ItemEngagement,
  ItemEngagementState,
  ItemRating,
  ItemUserState,
  SetMyItemRatingInput,
  SetMyItemStateInput,
  UpdateItemCommentInput,
} from "@/modules/engagement/domain/engagement-models";
import type { EngagementRepository } from "@/modules/engagement/application/engagement-repository";

const ITEM_STATES = new Set<ItemEngagementState>([
  "none",
  "want_to_try",
  "tried",
  "want_to_buy",
  "bought",
  "not_interested",
]);

function hasIdentifier(value: string): boolean {
  return value.trim().length > 0;
}

function normalizeOptionalNote(value: string | null): Result<string | null> {
  if (value === null) return success(null);

  const note = value.trim();
  if (note.length > 1000) return failure("VALIDATION_FAILED");
  return success(note || null);
}

function normalizeComment(value: string): Result<string> {
  const content = value.trim();
  if (content.length === 0 || content.length > 2000) {
    return failure("VALIDATION_FAILED");
  }

  return success(content);
}

export class ManageItemEngagement {
  constructor(private readonly repository: EngagementRepository) {}

  async getItemEngagement(
    actor: CurrentActor,
    itemId: string,
  ): Promise<Result<ItemEngagement>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) return activeActor;
    if (!hasIdentifier(itemId)) return failure("VALIDATION_FAILED");

    const [stateResult, ratingsResult, commentsResult] = await Promise.all([
      this.repository.findItemState(itemId, activeActor.value.userId),
      this.repository.listItemRatings(itemId),
      this.repository.listItemComments(itemId),
    ]);

    if (!stateResult.ok) return stateResult;
    if (!ratingsResult.ok) return ratingsResult;
    if (!commentsResult.ok) return commentsResult;

    return success({
      state: stateResult.value,
      ratings: ratingsResult.value,
      comments: commentsResult.value,
    });
  }

  async setMyItemState(
    actor: CurrentActor,
    input: SetMyItemStateInput,
  ): Promise<Result<ItemUserState>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) return activeActor;
    if (
      !hasIdentifier(input.itemId) ||
      !ITEM_STATES.has(input.state) ||
      typeof input.isFavorite !== "boolean"
    ) {
      return failure("VALIDATION_FAILED");
    }

    const note = normalizeOptionalNote(input.note);
    if (!note.ok) return note;

    return this.repository.saveItemState({
      itemId: input.itemId,
      userId: activeActor.value.userId,
      isFavorite: input.isFavorite,
      state: input.state,
      note: note.value,
    });
  }

  async setMyItemRating(
    actor: CurrentActor,
    input: SetMyItemRatingInput,
  ): Promise<Result<ItemRating>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) return activeActor;
    if (
      !hasIdentifier(input.itemId) ||
      !Number.isInteger(input.score) ||
      input.score < 1 ||
      input.score > 5
    ) {
      return failure("VALIDATION_FAILED");
    }

    const note = normalizeOptionalNote(input.note);
    if (!note.ok) return note;

    return this.repository.saveItemRating({
      itemId: input.itemId,
      userId: activeActor.value.userId,
      score: input.score,
      note: note.value,
    });
  }

  async deleteMyItemRating(
    actor: CurrentActor,
    itemId: string,
  ): Promise<Result<void>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) return activeActor;
    if (!hasIdentifier(itemId)) return failure("VALIDATION_FAILED");

    return this.repository.deleteItemRating(itemId, activeActor.value.userId);
  }

  async createComment(
    actor: CurrentActor,
    input: CreateItemCommentInput,
  ): Promise<Result<ItemComment>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) return activeActor;
    if (!hasIdentifier(input.itemId)) return failure("VALIDATION_FAILED");

    const content = normalizeComment(input.content);
    if (!content.ok) return content;

    return this.repository.createComment({
      itemId: input.itemId,
      userId: activeActor.value.userId,
      content: content.value,
    });
  }

  async updateMyComment(
    actor: CurrentActor,
    input: UpdateItemCommentInput,
  ): Promise<Result<ItemComment>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) return activeActor;
    if (!hasIdentifier(input.commentId)) return failure("VALIDATION_FAILED");

    const content = normalizeComment(input.content);
    if (!content.ok) return content;

    return this.repository.updateComment({
      commentId: input.commentId,
      userId: activeActor.value.userId,
      content: content.value,
    });
  }

  async deleteComment(
    actor: CurrentActor,
    commentId: string,
  ): Promise<Result<void>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) return activeActor;
    if (!hasIdentifier(commentId)) return failure("VALIDATION_FAILED");

    return this.repository.deleteComment({
      commentId,
      userId: activeActor.value.userId,
      canManageAll: activeActor.value.canManageCatalogue,
    });
  }
}
