import type { SupabaseClient } from "@supabase/supabase-js";
import { failure, success, type Result } from "@/core/application/result";
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
import {
  toManagedCategory,
  toManagedItem,
  toManagedItemImage,
  toManagedItemLink,
} from "@/modules/catalogue/infrastructure/catalogue-admin-mappers";
import type { Database } from "@/lib/supabase/database.types";

const CATEGORY_COLUMNS =
  "id,slug,name,description,icon,cover_image_url,sort_order,is_active,created_by,created_at,updated_at";
const ITEM_COLUMNS =
  "id,category_id,slug,kind,title,summary,description,address,latitude,longitude,map_url,price_label,external_rating,external_review_count,external_rating_source,metadata,is_published,created_by,created_at,updated_at";
const ITEM_IMAGE_COLUMNS = "id,item_id,image_url,alt_text,sort_order,created_at";
const ITEM_LINK_COLUMNS = "id,item_id,link_type,title,url,sort_order,created_at";

export class SupabaseCatalogueAdminRepository implements CatalogueAdminRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async createCategory(
    ownerId: string,
    input: CatalogueCategoryInput,
  ): Promise<Result<ManagedCatalogueCategory>> {
    const { data, error } = await this.client
      .from("categories")
      .insert({
        slug: input.slug,
        name: input.name,
        description: input.description,
        icon: input.icon,
        cover_image_url: input.coverImageUrl,
        sort_order: input.sortOrder,
        is_active: input.isActive,
        created_by: ownerId,
      })
      .select(CATEGORY_COLUMNS)
      .single();

    return toWriteResult(data, error, toManagedCategory);
  }

  async updateCategory(
    categoryId: string,
    input: CatalogueCategoryInput,
  ): Promise<Result<ManagedCatalogueCategory>> {
    const { data, error } = await this.client
      .from("categories")
      .update({
        slug: input.slug,
        name: input.name,
        description: input.description,
        icon: input.icon,
        cover_image_url: input.coverImageUrl,
        sort_order: input.sortOrder,
        is_active: input.isActive,
      })
      .eq("id", categoryId)
      .select(CATEGORY_COLUMNS)
      .maybeSingle();

    return toMaybeWriteResult(data, error, toManagedCategory);
  }

  async deleteCategory(categoryId: string): Promise<Result<void>> {
    return this.deleteById("categories", categoryId);
  }

  async createItem(
    ownerId: string,
    input: CatalogueItemInput,
  ): Promise<Result<ManagedCatalogueItem>> {
    const { data, error } = await this.client
      .from("items")
      .insert({ ...toItemPersistence(input), created_by: ownerId })
      .select(ITEM_COLUMNS)
      .single();

    return toWriteResult(data, error, toManagedItem);
  }

  async updateItem(
    itemId: string,
    input: CatalogueItemInput,
  ): Promise<Result<ManagedCatalogueItem>> {
    const { data, error } = await this.client
      .from("items")
      .update(toItemPersistence(input))
      .eq("id", itemId)
      .select(ITEM_COLUMNS)
      .maybeSingle();

    return toMaybeWriteResult(data, error, toManagedItem);
  }

  async deleteItem(itemId: string): Promise<Result<void>> {
    return this.deleteById("items", itemId);
  }

  async createItemImage(input: ItemImageInput): Promise<Result<ManagedItemImage>> {
    const { data, error } = await this.client
      .from("item_images")
      .insert({
        item_id: input.itemId,
        image_url: input.imageUrl,
        alt_text: input.altText,
        sort_order: input.sortOrder,
      })
      .select(ITEM_IMAGE_COLUMNS)
      .single();

    return toWriteResult(data, error, toManagedItemImage);
  }

  async updateItemImage(
    imageId: string,
    input: ItemImageUpdateInput,
  ): Promise<Result<ManagedItemImage>> {
    const { data, error } = await this.client
      .from("item_images")
      .update({
        image_url: input.imageUrl,
        alt_text: input.altText,
        sort_order: input.sortOrder,
      })
      .eq("id", imageId)
      .select(ITEM_IMAGE_COLUMNS)
      .maybeSingle();

    return toMaybeWriteResult(data, error, toManagedItemImage);
  }

  async deleteItemImage(imageId: string): Promise<Result<void>> {
    return this.deleteById("item_images", imageId);
  }

  async createItemLink(input: ItemLinkInput): Promise<Result<ManagedItemLink>> {
    const { data, error } = await this.client
      .from("item_links")
      .insert({
        item_id: input.itemId,
        link_type: input.type,
        title: input.title,
        url: input.url,
        sort_order: input.sortOrder,
      })
      .select(ITEM_LINK_COLUMNS)
      .single();

    return toWriteResult(data, error, toManagedItemLink);
  }

  async updateItemLink(
    linkId: string,
    input: ItemLinkUpdateInput,
  ): Promise<Result<ManagedItemLink>> {
    const { data, error } = await this.client
      .from("item_links")
      .update({
        link_type: input.type,
        title: input.title,
        url: input.url,
        sort_order: input.sortOrder,
      })
      .eq("id", linkId)
      .select(ITEM_LINK_COLUMNS)
      .maybeSingle();

    return toMaybeWriteResult(data, error, toManagedItemLink);
  }

  async deleteItemLink(linkId: string): Promise<Result<void>> {
    return this.deleteById("item_links", linkId);
  }

  private async deleteById(
    table: "categories" | "items" | "item_images" | "item_links",
    id: string,
  ): Promise<Result<void>> {
    const { data, error } = await this.client
      .from(table)
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) return failure("UNEXPECTED_FAILURE");
    return data ? success(undefined) : failure("NOT_FOUND");
  }
}

function toItemPersistence(input: CatalogueItemInput) {
  return {
    category_id: input.categoryId,
    slug: input.slug,
    kind: input.kind,
    title: input.title,
    summary: input.summary,
    description: input.description,
    address: input.address,
    latitude: input.latitude,
    longitude: input.longitude,
    map_url: input.mapUrl,
    price_label: input.priceLabel,
    external_rating: input.externalRating,
    external_review_count: input.externalReviewCount,
    external_rating_source: input.externalRatingSource,
    metadata: input.metadata,
    is_published: input.isPublished,
  };
}

function toWriteResult<Row, Model>(
  data: Row | null,
  error: unknown,
  mapper: (row: Row) => Model,
): Result<Model> {
  if (error || !data) return failure("UNEXPECTED_FAILURE");
  return success(mapper(data));
}

function toMaybeWriteResult<Row, Model>(
  data: Row | null,
  error: unknown,
  mapper: (row: Row) => Model,
): Result<Model> {
  if (error) return failure("UNEXPECTED_FAILURE");
  return data ? success(mapper(data)) : failure("NOT_FOUND");
}
