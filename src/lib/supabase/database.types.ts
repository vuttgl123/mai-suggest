export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: Database["public"]["Enums"]["app_role"];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type AllowedUserRow = {
  email: string;
  role: Database["public"]["Enums"]["app_role"];
  display_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  cover_image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type ItemRow = {
  id: string;
  category_id: string;
  slug: string;
  kind: Database["public"]["Enums"]["item_kind"];
  title: string;
  summary: string | null;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  map_url: string | null;
  price_label: string | null;
  external_rating: number | null;
  external_review_count: number | null;
  external_rating_source: string | null;
  metadata: Json;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type ItemImageRow = {
  id: string;
  item_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
};

type ItemLinkRow = {
  id: string;
  item_id: string;
  link_type: Database["public"]["Enums"]["item_link_type"];
  title: string;
  url: string;
  sort_order: number;
  created_at: string;
};

type RatingRow = {
  id: string;
  item_id: string;
  user_id: string;
  score: number;
  note: string | null;
  created_at: string;
  updated_at: string;
};

type CommentRow = {
  id: string;
  item_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

type UserItemStateRow = {
  id: string;
  item_id: string;
  user_id: string;
  is_favorite: boolean;
  state: Database["public"]["Enums"]["user_item_state"];
  note: string | null;
  created_at: string;
  updated_at: string;
};

type TimelineEntryRow = {
  id: string;
  date_label: string;
  occurred_on: string | null;
  title: string;
  story: string;
  lesson: string | null;
  image_url: string | null;
  image_alt_text: string | null;
  sort_order: number;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type TimelineResponseRow = {
  id: string;
  timeline_entry_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

type FutureLetterRow = {
  id: string;
  author_id: string;
  title: string;
  content: string;
  opens_at: string;
  image_url: string | null;
  image_alt_text: string | null;
  music_url: string | null;
  created_at: string;
  updated_at: string;
};

type SiteThemeSettingsRow = {
  id: boolean;
  manual_theme_key: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

type SiteThemeScheduleRow = {
  id: string;
  theme_key: string;
  starts_at: string;
  ends_at: string;
  priority: number;
  is_enabled: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export interface Database {
  public: {
    Tables: {
      allowed_users: Table<AllowedUserRow>;
      profiles: Table<ProfileRow>;
      categories: Table<CategoryRow>;
      items: Table<ItemRow>;
      item_images: Table<ItemImageRow>;
      item_links: Table<ItemLinkRow>;
      ratings: Table<RatingRow>;
      comments: Table<CommentRow>;
      user_item_states: Table<UserItemStateRow>;
      timeline_entries: Table<TimelineEntryRow>;
      timeline_responses: Table<TimelineResponseRow>;
      future_letters: Table<FutureLetterRow>;
      site_theme_settings: Table<SiteThemeSettingsRow>;
      site_theme_schedules: Table<SiteThemeScheduleRow>;
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      app_role: "owner" | "member";
      item_kind: "place" | "product" | "experience" | "article" | "other";
      item_link_type:
        | "website"
        | "map"
        | "menu"
        | "review"
        | "facebook"
        | "instagram"
        | "tiktok"
        | "shopping"
        | "other";
      user_item_state:
        | "none"
        | "want_to_try"
        | "tried"
        | "want_to_buy"
        | "bought"
        | "not_interested";
    };
    CompositeTypes: Record<never, never>;
  };
}
