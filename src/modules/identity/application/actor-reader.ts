import type { Result } from "@/core/application/result";
import type { CurrentActor } from "@/modules/identity/domain/current-actor";

export interface ActorReader {
  readCurrentActor(): Promise<Result<CurrentActor>>;
}
