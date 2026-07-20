import type { SupabaseClient } from "@supabase/supabase-js";
import { failure, success, type Result } from "@/core/application/result";
import type { ActorReader } from "@/modules/identity/application/actor-reader";
import type { CurrentActor } from "@/modules/identity/domain/current-actor";
import type { Database } from "@/lib/supabase/database.types";

export class SupabaseActorReader implements ActorReader {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async readCurrentActor(): Promise<Result<CurrentActor>> {
    const { data: claimsData, error: claimsError } =
      await this.client.auth.getClaims();

    if (claimsError) {
      return failure("UNEXPECTED_FAILURE");
    }

    const userId = claimsData?.claims?.sub;
    const claimEmail = claimsData?.claims?.email;

    if (!userId) {
      return success({
        status: "anonymous",
        userId: null,
        email: null,
        role: null,
        canManageCatalogue: false,
      });
    }

    const { data: profile, error: profileError } = await this.client
      .from("profiles")
      .select("id,email,role,is_active")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      return failure("UNEXPECTED_FAILURE");
    }

    const email = profile?.email ?? (typeof claimEmail === "string" ? claimEmail : null);

    if (!profile) {
      return success({
        status: "inactive",
        userId,
        email,
        role: "member",
        canManageCatalogue: false,
      });
    }

    if (!profile.is_active) {
      return success({
        status: "inactive",
        userId,
        email,
        role: profile.role,
        canManageCatalogue: false,
      });
    }

    if (profile.role === "owner") {
      return success({
        status: "active",
        userId,
        email,
        role: "owner",
        canManageCatalogue: true,
      });
    }

    return success({
      status: "active",
      userId,
      email,
      role: "member",
      canManageCatalogue: false,
    });
  }
}
