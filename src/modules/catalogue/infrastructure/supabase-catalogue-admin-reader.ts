import type { SupabaseClient } from "@supabase/supabase-js";
import { failure, success, type Result } from "@/core/application/result";
import type {
  CatalogueAdminReader,
  ManagedCatalogueItemCriteria,
  ManagedCatalogueItemPageCriteria,
} from "@/modules/catalogue/application/catalogue-admin-reader";
import type {
  ManagedCatalogueCategory,
  ManagedCatalogueItem,
  ManagedCatalogueItemDetail,
  ManagedCatalogueItemPage,
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

export class SupabaseCatalogueAdminReader implements CatalogueAdminReader {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listManagedCategories(): Promise<Result<ManagedCatalogueCategory[]>> {
    const { data, error } = await this.client
      .from("categories")
      .select(CATEGORY_COLUMNS)
      .order("sort_order")
      .order("name");

    if (error) return failure("UNEXPECTED_FAILURE");
    return success((data ?? []).map(toManagedCategory));
  }

  async listManagedItems(
    criteria: ManagedCatalogueItemCriteria,
  ): Promise<Result<ManagedCatalogueItem[]>> {
    const request = criteria.categoryId
      ? this.client
          .from("items")
          .select(ITEM_COLUMNS)
          .eq("category_id", criteria.categoryId)
          .order("created_at", { ascending: false })
      : this.client
          .from("items")
          .select(ITEM_COLUMNS)
          .order("created_at", { ascending: false });
    const { data, error } = await request;

    if (error) return failure("UNEXPECTED_FAILURE");
    return success((data ?? []).map(toManagedItem));
  }

  async listManagedItemPage(
    criteria: ManagedCatalogueItemPageCriteria,
  ): Promise<Result<ManagedCatalogueItemPage>> {
    const from = (criteria.page - 1) * criteria.pageSize;
    const to = from + criteria.pageSize - 1;
    const request = criteria.categoryId
      ? this.client
          .from("items")
          .select(ITEM_COLUMNS, { count: "exact" })
          .eq("category_id", criteria.categoryId)
      : this.client.from("items").select(ITEM_COLUMNS, { count: "exact" });
    const { data, error, count } = await request
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) return failure("UNEXPECTED_FAILURE");

    const total = count ?? 0;
    return success({
      items: (data ?? []).map(toManagedItem),
      page: criteria.page,
      pageSize: criteria.pageSize,
      total,
      pageCount: Math.ceil(total / criteria.pageSize),
    });
  }

  async findManagedItemDetailById(
    itemId: string,
  ): Promise<Result<ManagedCatalogueItemDetail | null>> {
    const { data: itemRow, error: itemError } = await this.client
      .from("items")
      .select(ITEM_COLUMNS)
      .eq("id", itemId)
      .maybeSingle();

    if (itemError) return failure("UNEXPECTED_FAILURE");
    if (!itemRow) return success(null);

    const [imagesResult, linksResult] = await Promise.all([
      this.client
        .from("item_images")
        .select(ITEM_IMAGE_COLUMNS)
        .eq("item_id", itemId)
        .order("sort_order"),
      this.client
        .from("item_links")
        .select(ITEM_LINK_COLUMNS)
        .eq("item_id", itemId)
        .order("sort_order"),
    ]);

    if (imagesResult.error || linksResult.error) {
      return failure("UNEXPECTED_FAILURE");
    }

    return success({
      ...toManagedItem(itemRow),
      images: (imagesResult.data ?? []).map(toManagedItemImage),
      links: (linksResult.data ?? []).map(toManagedItemLink),
    });
  }
}
