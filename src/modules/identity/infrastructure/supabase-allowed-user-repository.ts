import type { SupabaseClient } from "@supabase/supabase-js";
import { failure, success, type Result } from "@/core/application/result";
import type { AllowedUserRepository } from "@/modules/identity/application/allowed-user-repository";
import type {
  AllowedUser,
  AllowedUserInput,
  AllowedUserUpdateInput,
} from "@/modules/identity/domain/allowed-user";
import type { Database } from "@/lib/supabase/database.types";

type AllowedUserRow = Database["public"]["Tables"]["allowed_users"]["Row"];

const ALLOWED_USER_COLUMNS =
  "email,role,display_name,is_active,created_at,updated_at";

export class SupabaseAllowedUserRepository implements AllowedUserRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async list(): Promise<Result<AllowedUser[]>> {
    const { data, error } = await this.client
      .from("allowed_users")
      .select(ALLOWED_USER_COLUMNS)
      .order("email");

    if (error) return failure("UNEXPECTED_FAILURE");
    return success((data ?? []).map(toAllowedUser));
  }

  async create(input: AllowedUserInput): Promise<Result<AllowedUser>> {
    const { data, error } = await this.client
      .from("allowed_users")
      .insert({
        email: input.email,
        role: input.role,
        display_name: input.displayName,
        is_active: input.isActive,
      })
      .select(ALLOWED_USER_COLUMNS)
      .single();

    if (error || !data) return failure("UNEXPECTED_FAILURE");
    return success(toAllowedUser(data));
  }

  async update(
    email: string,
    input: AllowedUserUpdateInput,
  ): Promise<Result<AllowedUser>> {
    const { data, error } = await this.client
      .from("allowed_users")
      .update({
        role: input.role,
        display_name: input.displayName,
        is_active: input.isActive,
      })
      .eq("email", email)
      .select(ALLOWED_USER_COLUMNS)
      .maybeSingle();

    if (error) return failure("UNEXPECTED_FAILURE");
    return data ? success(toAllowedUser(data)) : failure("NOT_FOUND");
  }

  async delete(email: string): Promise<Result<void>> {
    const { data, error } = await this.client
      .from("allowed_users")
      .delete()
      .eq("email", email)
      .select("email")
      .maybeSingle();

    if (error) return failure("UNEXPECTED_FAILURE");
    return data ? success(undefined) : failure("NOT_FOUND");
  }
}

function toAllowedUser(row: AllowedUserRow): AllowedUser {
  return {
    email: row.email,
    role: row.role,
    displayName: row.display_name,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
