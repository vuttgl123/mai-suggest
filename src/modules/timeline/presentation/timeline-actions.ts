"use server";

import {
  revalidateAfterMutation,
  runServerAction,
} from "@/lib/backend/run-server-action";
import type {
  CreateTimelineResponseInput,
  TimelineEntryInput,
  UpdateTimelineResponseInput,
} from "@/modules/timeline/domain/timeline-models";

export async function createTimelineEntryAction(input: TimelineEntryInput) {
  const result = await runServerAction((backend, actor) =>
    backend.manageTimeline.createEntry(actor, input),
  );

  return revalidateAfterMutation(result);
}

export async function updateTimelineEntryAction(
  entryId: string,
  input: TimelineEntryInput,
) {
  const result = await runServerAction((backend, actor) =>
    backend.manageTimeline.updateEntry(actor, entryId, input),
  );

  return revalidateAfterMutation(result);
}

export async function deleteTimelineEntryAction(entryId: string) {
  const result = await runServerAction((backend, actor) =>
    backend.manageTimeline.deleteEntry(actor, entryId),
  );

  return revalidateAfterMutation(result);
}

export async function createTimelineResponseAction(
  input: CreateTimelineResponseInput,
) {
  const result = await runServerAction((backend, actor) =>
    backend.manageTimeline.createResponse(actor, input),
  );

  return revalidateAfterMutation(result);
}

export async function updateTimelineResponseAction(
  responseId: string,
  input: UpdateTimelineResponseInput,
) {
  const result = await runServerAction((backend, actor) =>
    backend.manageTimeline.updateResponse(actor, responseId, input),
  );

  return revalidateAfterMutation(result);
}

export async function deleteTimelineResponseAction(responseId: string) {
  const result = await runServerAction((backend, actor) =>
    backend.manageTimeline.deleteResponse(actor, responseId),
  );

  return revalidateAfterMutation(result);
}
