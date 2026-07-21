export interface TimelineAuthor {
  displayName: string;
  avatarUrl: string | null;
}

export interface TimelineResponse {
  id: string;
  entryId: string;
  userId: string;
  author: TimelineAuthor;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEntryRecord {
  id: string;
  dateLabel: string;
  occurredOn: string | null;
  title: string;
  story: string;
  lesson: string | null;
  imageUrl: string | null;
  imageAltText: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEntry extends TimelineEntryRecord {
  responses: TimelineResponse[];
}

export interface ManagedTimelineEntrySummary extends TimelineEntryRecord {
  responseCount: number;
}

export type ManagedTimelineEntry = TimelineEntry;

export interface TimelineEntryInput {
  dateLabel: string;
  occurredOn: string | null;
  title: string;
  story: string;
  lesson: string | null;
  imageUrl: string | null;
  imageAltText: string | null;
  sortOrder: number;
  isPublished: boolean;
}

export interface CreateTimelineResponseInput {
  entryId: string;
  content: string;
}

export interface UpdateTimelineResponseInput {
  content: string;
}
