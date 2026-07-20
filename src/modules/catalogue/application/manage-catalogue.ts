import { failure, type Result } from "@/core/application/result";
import type { CatalogueAdminRepository } from "@/modules/catalogue/application/catalogue-admin-repository";
import type {
  CatalogueCategoryInput,
  CatalogueItemInput,
  ItemImageInput,
  ItemImageUpdateInput,
  ItemLinkInput,
  ItemLinkUpdateInput,
  ManagedCatalogueCategory,
  ManagedCatalogueItem,
  ManagedItemImage,
  ManagedItemLink,
} from "@/modules/catalogue/domain/catalogue-admin-models";
import type { CatalogueItemKind, CatalogueLinkType } from "@/modules/catalogue/domain/catalogue-read-models";
import {
  requireCatalogueOwner,
  type CurrentActor,
} from "@/modules/identity/domain/current-actor";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ITEM_KINDS: readonly CatalogueItemKind[] = [
  "place",
  "product",
  "experience",
  "article",
  "other",
];
const LINK_TYPES: readonly CatalogueLinkType[] = [
  "website",
  "map",
  "menu",
  "review",
  "facebook",
  "instagram",
  "tiktok",
  "shopping",
  "other",
];

export class ManageCatalogue {
  constructor(private readonly repository: CatalogueAdminRepository) {}

  async createCategory(
    actor: CurrentActor,
    input: CatalogueCategoryInput,
  ): Promise<Result<ManagedCatalogueCategory>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;

    const normalized = normalizeCategory(input);
    if (!normalized.ok) return normalized;

    return this.repository.createCategory(owner.value.userId, normalized.value);
  }

  async updateCategory(
    actor: CurrentActor,
    categoryId: string,
    input: CatalogueCategoryInput,
  ): Promise<Result<ManagedCatalogueCategory>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;
    if (!hasId(categoryId)) return failure("VALIDATION_FAILED");

    const normalized = normalizeCategory(input);
    if (!normalized.ok) return normalized;

    return this.repository.updateCategory(categoryId, normalized.value);
  }

  async deleteCategory(actor: CurrentActor, categoryId: string): Promise<Result<void>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;
    if (!hasId(categoryId)) return failure("VALIDATION_FAILED");

    return this.repository.deleteCategory(categoryId);
  }

  async createItem(
    actor: CurrentActor,
    input: CatalogueItemInput,
  ): Promise<Result<ManagedCatalogueItem>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;

    const normalized = normalizeItem(input);
    if (!normalized.ok) return normalized;

    return this.repository.createItem(owner.value.userId, normalized.value);
  }

  async updateItem(
    actor: CurrentActor,
    itemId: string,
    input: CatalogueItemInput,
  ): Promise<Result<ManagedCatalogueItem>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;
    if (!hasId(itemId)) return failure("VALIDATION_FAILED");

    const normalized = normalizeItem(input);
    if (!normalized.ok) return normalized;

    return this.repository.updateItem(itemId, normalized.value);
  }

  async deleteItem(actor: CurrentActor, itemId: string): Promise<Result<void>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;
    if (!hasId(itemId)) return failure("VALIDATION_FAILED");

    return this.repository.deleteItem(itemId);
  }

  async createItemImage(
    actor: CurrentActor,
    input: ItemImageInput,
  ): Promise<Result<ManagedItemImage>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;

    const normalized = normalizeItemImage(input);
    if (!normalized.ok) return normalized;

    return this.repository.createItemImage(normalized.value);
  }

  async updateItemImage(
    actor: CurrentActor,
    imageId: string,
    input: ItemImageUpdateInput,
  ): Promise<Result<ManagedItemImage>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;
    if (!hasId(imageId)) return failure("VALIDATION_FAILED");

    const normalized = normalizeItemImageUpdate(input);
    if (!normalized.ok) return normalized;

    return this.repository.updateItemImage(imageId, normalized.value);
  }

  async deleteItemImage(actor: CurrentActor, imageId: string): Promise<Result<void>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;
    if (!hasId(imageId)) return failure("VALIDATION_FAILED");

    return this.repository.deleteItemImage(imageId);
  }

  async createItemLink(
    actor: CurrentActor,
    input: ItemLinkInput,
  ): Promise<Result<ManagedItemLink>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;

    const normalized = normalizeItemLink(input);
    if (!normalized.ok) return normalized;

    return this.repository.createItemLink(normalized.value);
  }

  async updateItemLink(
    actor: CurrentActor,
    linkId: string,
    input: ItemLinkUpdateInput,
  ): Promise<Result<ManagedItemLink>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;
    if (!hasId(linkId)) return failure("VALIDATION_FAILED");

    const normalized = normalizeItemLinkUpdate(input);
    if (!normalized.ok) return normalized;

    return this.repository.updateItemLink(linkId, normalized.value);
  }

  async deleteItemLink(actor: CurrentActor, linkId: string): Promise<Result<void>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;
    if (!hasId(linkId)) return failure("VALIDATION_FAILED");

    return this.repository.deleteItemLink(linkId);
  }
}

function normalizeCategory(input: CatalogueCategoryInput): Result<CatalogueCategoryInput> {
  if (
    !isSlug(input.slug) ||
    !hasText(input.name) ||
    !isNonNegativeInteger(input.sortOrder) ||
    typeof input.isActive !== "boolean" ||
    !isOptionalHttpUrl(input.coverImageUrl)
  ) {
    return failure("VALIDATION_FAILED");
  }

  return {
    ok: true,
    value: {
      ...input,
      slug: input.slug.trim(),
      name: input.name.trim(),
      description: normalizeOptionalText(input.description),
      icon: normalizeOptionalText(input.icon),
      coverImageUrl: normalizeOptionalText(input.coverImageUrl),
    },
  };
}

function normalizeItem(input: CatalogueItemInput): Result<CatalogueItemInput> {
  if (
    !hasId(input.categoryId) ||
    !isSlug(input.slug) ||
    !hasText(input.title) ||
    !ITEM_KINDS.includes(input.kind) ||
    !isValidCoordinates(input.latitude, input.longitude) ||
    !isValidRating(input.externalRating) ||
    !isValidReviewCount(input.externalReviewCount) ||
    !isMetadata(input.metadata) ||
    typeof input.isPublished !== "boolean" ||
    !isOptionalHttpUrl(input.mapUrl)
  ) {
    return failure("VALIDATION_FAILED");
  }

  return {
    ok: true,
    value: {
      ...input,
      categoryId: input.categoryId.trim(),
      slug: input.slug.trim(),
      title: input.title.trim(),
      summary: normalizeOptionalText(input.summary),
      description: normalizeOptionalText(input.description),
      address: normalizeOptionalText(input.address),
      mapUrl: normalizeOptionalText(input.mapUrl),
      priceLabel: normalizeOptionalText(input.priceLabel),
      externalRatingSource: normalizeOptionalText(input.externalRatingSource),
    },
  };
}

function normalizeItemImage(input: ItemImageInput): Result<ItemImageInput> {
  if (
    !hasId(input.itemId) ||
    !isHttpUrl(input.imageUrl) ||
    !isNonNegativeInteger(input.sortOrder)
  ) {
    return failure("VALIDATION_FAILED");
  }

  return {
    ok: true,
    value: {
      ...input,
      itemId: input.itemId.trim(),
      imageUrl: input.imageUrl.trim(),
      altText: normalizeOptionalText(input.altText),
    },
  };
}

function normalizeItemImageUpdate(
  input: ItemImageUpdateInput,
): Result<ItemImageUpdateInput> {
  if (!isHttpUrl(input.imageUrl) || !isNonNegativeInteger(input.sortOrder)) {
    return failure("VALIDATION_FAILED");
  }

  return {
    ok: true,
    value: {
      ...input,
      imageUrl: input.imageUrl.trim(),
      altText: normalizeOptionalText(input.altText),
    },
  };
}

function normalizeItemLink(input: ItemLinkInput): Result<ItemLinkInput> {
  if (
    !hasId(input.itemId) ||
    !hasText(input.title) ||
    !isHttpUrl(input.url) ||
    !LINK_TYPES.includes(input.type) ||
    !isNonNegativeInteger(input.sortOrder)
  ) {
    return failure("VALIDATION_FAILED");
  }

  return {
    ok: true,
    value: {
      ...input,
      itemId: input.itemId.trim(),
      title: input.title.trim(),
      url: input.url.trim(),
    },
  };
}

function normalizeItemLinkUpdate(
  input: ItemLinkUpdateInput,
): Result<ItemLinkUpdateInput> {
  if (
    !hasText(input.title) ||
    !isHttpUrl(input.url) ||
    !LINK_TYPES.includes(input.type) ||
    !isNonNegativeInteger(input.sortOrder)
  ) {
    return failure("VALIDATION_FAILED");
  }

  return {
    ok: true,
    value: {
      ...input,
      title: input.title.trim(),
      url: input.url.trim(),
    },
  };
}

function hasId(value: string): boolean {
  return hasText(value);
}

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

function isSlug(value: string): boolean {
  return SLUG_PATTERN.test(value.trim());
}

function normalizeOptionalText(value: string | null): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function isNonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

function isValidCoordinates(latitude: number | null, longitude: number | null): boolean {
  if (latitude === null && longitude === null) return true;
  if (latitude === null || longitude === null) return false;

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function isValidRating(value: number | null): boolean {
  return value === null || (Number.isFinite(value) && value >= 0 && value <= 5);
}

function isValidReviewCount(value: number | null): boolean {
  return value === null || isNonNegativeInteger(value);
}

function isMetadata(value: unknown): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOptionalHttpUrl(value: string | null): boolean {
  const normalized = value?.trim();
  return !normalized || isHttpUrl(normalized);
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
