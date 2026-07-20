import type { Result } from "@/core/application/result";
import type { CurrentActor } from "@/modules/identity/domain/current-actor";
import type { ActorReader } from "@/modules/identity/application/actor-reader";

export class GetCurrentActor {
  constructor(private readonly actorReader: ActorReader) {}

  execute(): Promise<Result<CurrentActor>> {
    return this.actorReader.readCurrentActor();
  }
}
