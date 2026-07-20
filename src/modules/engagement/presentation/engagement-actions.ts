"use server";

import {
  revalidateAfterMutation,
  runServerAction,
} from "@/lib/backend/run-server-action";
import type {
  CreateItemCommentInput,
  SetMyItemRatingInput,
  SetMyItemStateInput,
  UpdateItemCommentInput,
} from "@/modules/engagement/domain/engagement-models";

export async function setMyItemStateAction(input: SetMyItemStateInput) {
  const result = await runServerAction((backend, actor) =>
    backend.manageItemEngagement.setMyItemState(actor, input),
  );

  return revalidateAfterMutation(result);
}

export async function setMyItemRatingAction(input: SetMyItemRatingInput) {
  const result = await runServerAction((backend, actor) =>
    backend.manageItemEngagement.setMyItemRating(actor, input),
  );

  return revalidateAfterMutation(result);
}

export async function deleteMyItemRatingAction(itemId: string) {
  const result = await runServerAction((backend, actor) =>
    backend.manageItemEngagement.deleteMyItemRating(actor, itemId),
  );

  return revalidateAfterMutation(result);
}

export async function createItemCommentAction(input: CreateItemCommentInput) {
  const result = await runServerAction((backend, actor) =>
    backend.manageItemEngagement.createComment(actor, input),
  );

  return revalidateAfterMutation(result);
}

export async function updateMyItemCommentAction(input: UpdateItemCommentInput) {
  const result = await runServerAction((backend, actor) =>
    backend.manageItemEngagement.updateMyComment(actor, input),
  );

  return revalidateAfterMutation(result);
}

export async function deleteItemCommentAction(commentId: string) {
  const result = await runServerAction((backend, actor) =>
    backend.manageItemEngagement.deleteComment(actor, commentId),
  );

  return revalidateAfterMutation(result);
}
