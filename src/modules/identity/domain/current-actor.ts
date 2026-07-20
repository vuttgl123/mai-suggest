import { failure, success, type Result } from "@/core/application/result";

export type AppRole = "owner" | "member";

export type CurrentActor =
  | {
      status: "anonymous";
      userId: null;
      email: null;
      role: null;
      canManageCatalogue: false;
    }
  | {
      status: "inactive";
      userId: string;
      email: string | null;
      role: AppRole;
      canManageCatalogue: false;
    }
  | {
      status: "active";
      userId: string;
      email: string | null;
      role: "member";
      canManageCatalogue: false;
    }
  | {
      status: "active";
      userId: string;
      email: string | null;
      role: "owner";
      canManageCatalogue: true;
    };

export type ActiveActor = Extract<CurrentActor, { status: "active" }>;
export type CatalogueOwner = Extract<
  CurrentActor,
  { canManageCatalogue: true }
>;

export function requireActiveActor(actor: CurrentActor): Result<ActiveActor> {
  if (actor.status === "anonymous") {
    return failure("UNAUTHENTICATED");
  }

  if (actor.status === "inactive") {
    return failure("ACCESS_DENIED");
  }

  return success(actor);
}

export function requireCatalogueOwner(
  actor: CurrentActor,
): Result<CatalogueOwner> {
  const activeActor = requireActiveActor(actor);
  if (!activeActor.ok) return activeActor;
  if (!activeActor.value.canManageCatalogue) return failure("ACCESS_DENIED");

  return success(activeActor.value);
}
