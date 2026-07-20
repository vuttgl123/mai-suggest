export type ItemEngagementState =
  | "none"
  | "want_to_try"
  | "tried"
  | "want_to_buy"
  | "bought"
  | "not_interested";

export interface ItemUserState {
  id: string;
  itemId: string;
  userId: string;
  isFavorite: boolean;
  state: ItemEngagementState;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ItemRating {
  id: string;
  itemId: string;
  userId: string;
  score: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ItemComment {
  id: string;
  itemId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemEngagement {
  state: ItemUserState | null;
  ratings: ItemRating[];
  comments: ItemComment[];
}

export interface SetMyItemStateInput {
  itemId: string;
  isFavorite: boolean;
  state: ItemEngagementState;
  note: string | null;
}

export interface SetMyItemRatingInput {
  itemId: string;
  score: number;
  note: string | null;
}

export interface CreateItemCommentInput {
  itemId: string;
  content: string;
}

export interface UpdateItemCommentInput {
  commentId: string;
  content: string;
}
