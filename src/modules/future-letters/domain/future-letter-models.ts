export interface FutureLetterAuthor {
  displayName: string;
  avatarUrl: string | null;
}

export interface FutureLetterRecord {
  id: string;
  authorId: string;
  title: string;
  content: string;
  opensAt: string;
  imageUrl: string | null;
  imageAltText: string | null;
  musicUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FutureLetter extends FutureLetterRecord {
  author: FutureLetterAuthor;
}

export interface FutureLetterInput {
  title: string;
  content: string;
  opensAt: string;
  imageUrl: string | null;
  imageAltText: string | null;
  musicUrl: string | null;
}
