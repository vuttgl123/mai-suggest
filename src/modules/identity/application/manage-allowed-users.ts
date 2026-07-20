import { failure, type Result } from "@/core/application/result";
import type { AllowedUserRepository } from "@/modules/identity/application/allowed-user-repository";
import type {
  AllowedUser,
  AllowedUserInput,
  AllowedUserUpdateInput,
} from "@/modules/identity/domain/allowed-user";
import {
  requireCatalogueOwner,
  type CurrentActor,
} from "@/modules/identity/domain/current-actor";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class ManageAllowedUsers {
  constructor(private readonly repository: AllowedUserRepository) {}

  async list(actor: CurrentActor): Promise<Result<AllowedUser[]>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;

    return this.repository.list();
  }

  async create(
    actor: CurrentActor,
    input: AllowedUserInput,
  ): Promise<Result<AllowedUser>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;

    const normalized = normalizeAllowedUser(input);
    if (!normalized.ok) return normalized;

    return this.repository.create(normalized.value);
  }

  async update(
    actor: CurrentActor,
    email: string,
    input: AllowedUserUpdateInput,
  ): Promise<Result<AllowedUser>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;
    if (!isEmail(email)) return failure("VALIDATION_FAILED");

    const normalized = normalizeAllowedUserUpdate(input);
    if (!normalized.ok) return normalized;

    return this.repository.update(email.trim().toLowerCase(), normalized.value);
  }

  async delete(actor: CurrentActor, email: string): Promise<Result<void>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;
    if (!isEmail(email)) return failure("VALIDATION_FAILED");

    return this.repository.delete(email.trim().toLowerCase());
  }
}

function normalizeAllowedUser(input: AllowedUserInput): Result<AllowedUserInput> {
  if (
    !isEmail(input.email) ||
    !isAppRole(input.role) ||
    typeof input.isActive !== "boolean"
  ) {
    return failure("VALIDATION_FAILED");
  }

  return {
    ok: true,
    value: {
      ...input,
      email: input.email.trim().toLowerCase(),
      displayName: normalizeOptionalText(input.displayName),
    },
  };
}

function normalizeAllowedUserUpdate(
  input: AllowedUserUpdateInput,
): Result<AllowedUserUpdateInput> {
  if (!isAppRole(input.role) || typeof input.isActive !== "boolean") {
    return failure("VALIDATION_FAILED");
  }

  return {
    ok: true,
    value: {
      ...input,
      displayName: normalizeOptionalText(input.displayName),
    },
  };
}

function isEmail(value: string): boolean {
  const normalized = value.trim();
  return normalized.length <= 254 && EMAIL_PATTERN.test(normalized);
}

function isAppRole(value: string): boolean {
  return value === "owner" || value === "member";
}

function normalizeOptionalText(value: string | null): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}
