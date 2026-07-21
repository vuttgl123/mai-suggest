import type { Database } from "@/lib/supabase/database.types";
import type {
  FutureLetter,
  FutureLetterAuthor,
  FutureLetterRecord,
} from "@/modules/future-letters/domain/future-letter-models";

export type FutureLetterRow =
  Database["public"]["Tables"]["future_letters"]["Row"];
export type FutureLetterProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "display_name" | "avatar_url"
>;

export function toFutureLetterRecord(
  row: FutureLetterRow,
): FutureLetterRecord {
  return {
    id: row.id,
    authorId: row.author_id,
    title: row.title,
    content: row.content,
    opensAt: row.opens_at,
    imageUrl: row.image_url,
    imageAltText: row.image_alt_text,
    musicUrl: row.music_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toFutureLetter(
  row: FutureLetterRow,
  author: FutureLetterAuthor,
): FutureLetter {
  return {
    ...toFutureLetterRecord(row),
    author,
  };
}

export function futureLetterAuthorsById(
  profileRows: FutureLetterProfileRow[],
): Map<string, FutureLetterAuthor> {
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

export const fallbackFutureLetterAuthor: FutureLetterAuthor = {
  displayName: "Thành viên",
  avatarUrl: null,
};
