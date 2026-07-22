"use server";

import {
  revalidateAfterMutation,
  runServerAction,
} from "@/lib/backend/run-server-action";
import type {
  SiteThemeKey,
  SiteThemeScheduleInput,
} from "@/modules/site-theme/domain/site-theme-models";

export async function setManualSiteThemeAction(
  themeKey: SiteThemeKey | null,
) {
  return revalidateAfterMutation(
    await runServerAction((backend, actor) =>
      backend.manageSiteTheme.setManualTheme(actor, themeKey),
    ),
  );
}

export async function startThemeSceneTransitionAction(themeKey: SiteThemeKey) {
  return runServerAction((backend, actor) =>
    backend.manageSiteTheme.startSceneTransition(actor, themeKey),
  );
}

export async function commitThemeSceneTransitionAction() {
  return revalidateAfterMutation(
    await runServerAction((backend, actor) =>
      backend.manageSiteTheme.commitSceneTransition(actor),
    ),
  );
}

export async function cancelThemeSceneTransitionAction() {
  return revalidateAfterMutation(
    await runServerAction((backend, actor) =>
      backend.manageSiteTheme.cancelSceneTransition(actor),
    ),
  );
}

export async function createSiteThemeScheduleAction(
  input: SiteThemeScheduleInput,
) {
  return revalidateAfterMutation(
    await runServerAction((backend, actor) =>
      backend.manageSiteTheme.createSchedule(actor, input),
    ),
  );
}

export async function updateSiteThemeScheduleAction(
  scheduleId: string,
  input: SiteThemeScheduleInput,
) {
  return revalidateAfterMutation(
    await runServerAction((backend, actor) =>
      backend.manageSiteTheme.updateSchedule(actor, scheduleId, input),
    ),
  );
}

export async function deleteSiteThemeScheduleAction(scheduleId: string) {
  return revalidateAfterMutation(
    await runServerAction((backend, actor) =>
      backend.manageSiteTheme.deleteSchedule(actor, scheduleId),
    ),
  );
}
