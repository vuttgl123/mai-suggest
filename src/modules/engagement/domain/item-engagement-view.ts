import type {
  ItemComment,
  ItemRating,
  ItemUserState,
} from "@/modules/engagement/domain/engagement-models";

export interface EngagementAuthor {
  displayName: string;
  avatarUrl: string | null;
}

export interface ItemRatingView extends ItemRating {
  author: EngagementAuthor;
}

export interface ItemCommentView extends ItemComment {
  author: EngagementAuthor;
}

export interface ItemEngagementView {
  state: ItemUserState | null;
  ratings: ItemRatingView[];
  comments: ItemCommentView[];
}
