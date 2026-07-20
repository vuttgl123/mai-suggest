import type { Result } from "@/core/application/result";
import type {
  AllowedUser,
  AllowedUserInput,
  AllowedUserUpdateInput,
} from "@/modules/identity/domain/allowed-user";

export interface AllowedUserRepository {
  list(): Promise<Result<AllowedUser[]>>;
  create(input: AllowedUserInput): Promise<Result<AllowedUser>>;
  update(
    email: string,
    input: AllowedUserUpdateInput,
  ): Promise<Result<AllowedUser>>;
  delete(email: string): Promise<Result<void>>;
}
