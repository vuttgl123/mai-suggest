import type { AppRole } from "@/modules/identity/domain/current-actor";

export interface AllowedUserInput {
  email: string;
  role: AppRole;
  displayName: string | null;
  isActive: boolean;
}

export interface AllowedUserUpdateInput {
  role: AppRole;
  displayName: string | null;
  isActive: boolean;
}

export interface AllowedUser extends AllowedUserInput {
  createdAt: string;
  updatedAt: string;
}
