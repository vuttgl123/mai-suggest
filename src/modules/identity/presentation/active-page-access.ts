import type { Result } from "@/core/application/result";
import type {
  ActiveActor,
  CurrentActor,
} from "@/modules/identity/domain/current-actor";

export type ActivePageAccess =
  | { kind: "allow"; actor: ActiveActor }
  | { kind: "redirect"; to: string };

export function resolveActivePageAccess(
  actorResult: Result<CurrentActor>,
): ActivePageAccess {
  if (!actorResult.ok) {
    return { kind: "redirect", to: "/login?error=session_check_failed" };
  }

  if (actorResult.value.status === "active") {
    return { kind: "allow", actor: actorResult.value };
  }

  if (actorResult.value.status === "inactive") {
    return { kind: "redirect", to: "/access-denied" };
  }

  return { kind: "redirect", to: "/login" };
}
