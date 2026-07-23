import type { SupabaseClient } from "@supabase/supabase-js";
import { failure, success, type Result } from "@/core/application/result";
import type {
  CatalogueCategory,
  CatalogueImage,
  CatalogueItemDetail,
  CatalogueItemPage,
  CatalogueItemSummary,
  CatalogueLink,
} from "@/modules/catalogue/domain/catalogue-read-models";
import type {
  CatalogueItemCriteria,
  CatalogueItemPageCriteria,
  CatalogueReader,
} from "@/modules/catalogue/application/catalogue-reader";
import {
  toCatalogueCategory,
  toCatalogueImage,
  toCatalogueItemDetail,
  toCatalogueItemSummary,
  toCatalogueLink,
} from "@/modules/catalogue/infrastructure/catalogue-mappers";
import { normalizeCatalogueSearchQuery } from "@/modules/catalogue/domain/catalogue-search-query";
import type { Database } from "@/lib/supabase/database.types";

const CATEGORY_COLUMNS = "id,slug,name,description,icon,cover_image_url,sort_order";
const ITEM_SUMMARY_COLUMNS =
  "id,category_id,slug,kind,title,summary,price_label";
const ITEM_DETAIL_COLUMNS =
  "id,category_id,slug,kind,title,summary,price_label,description,address,latitude,longitude,map_url,external_rating,external_review_count,external_rating_source,metadata";
const ITEM_IMAGE_COLUMNS = "id,item_id,image_url,alt_text,sort_order,created_at";
const ITEM_LINK_COLUMNS = "id,item_id,link_type,title,url,sort_order,created_at";

export class SupabaseCatalogueReader implements CatalogueReader {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listCategories(): Promise<Result<CatalogueCategory[]>> {
    const { data, error } = await this.client
      .from("categories")
      .select(CATEGORY_COLUMNS)
      .order("sort_order");

    if (error) {
      return failure("UNEXPECTED_FAILURE");
    }

    return success((data ?? []).map(toCatalogueCategory));
  }

  async listItems(
    criteria: CatalogueItemCriteria,
  ): Promise<Result<CatalogueItemSummary[]>> {
    const categoryId = await this.findVisibleCategoryId(criteria.categorySlug);
    if (!categoryId.ok) {
      return categoryId;
    }

    if (criteria.categorySlug && categoryId.value === null) {
      return success([]);
    }

    const { data: itemRows, error: itemError } = categoryId.value
      ? await this.client
          .from("items")
          .select(ITEM_SUMMARY_COLUMNS)
          .eq("category_id", categoryId.value)
          .order("title")
      : await this.client.from("items").select(ITEM_SUMMARY_COLUMNS).order("title");

    if (itemError) {
      return failure("UNEXPECTED_FAILURE");
    }

    if (!itemRows?.length) {
      return success([]);
    }

    const itemIds = itemRows.map((item) => item.id);
    const { data: imageRows, error: imageError } = await this.client
      .from("item_images")
      .select(ITEM_IMAGE_COLUMNS)
      .in("item_id", itemIds)
      .order("sort_order");

    if (imageError) {
      return failure("UNEXPECTED_FAILURE");
    }

    const primaryImages = new Map<string, CatalogueImage>();
    for (const imageRow of imageRows ?? []) {
      if (!primaryImages.has(imageRow.item_id)) {
        primaryImages.set(imageRow.item_id, toCatalogueImage(imageRow));
      }
    }

    return success(
      itemRows.map((item) =>
        toCatalogueItemSummary(item, primaryImages.get(item.id) ?? null),
      ),
    );
  }

  async listItemPage(
    criteria: CatalogueItemPageCriteria,
  ): Promise<Result<CatalogueItemPage>> {
    const categoryId = await this.findVisibleCategoryId(criteria.categorySlug);
    if (!categoryId.ok) return categoryId;

    if (criteria.categorySlug && categoryId.value === null) {
      return success(emptyItemPage(criteria));
    }

    const from = (criteria.page - 1) * criteria.pageSize;
    const to = from + criteria.pageSize - 1;
    let request = this.client
      .from("items")
      .select(ITEM_SUMMARY_COLUMNS, { count: "exact" });

    if (categoryId.value) {
      request = request.eq("category_id", categoryId.value);
    }

    const searchQuery = normalizeCatalogueSearchQuery(criteria.query);
    if (searchQuery) {
      request = request.or(
        `title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%`,
      );
    }

    const { data: itemRows, error: itemError, count } = await request
      .order("title")
      .range(from, to);

    if (itemError) return failure("UNEXPECTED_FAILURE");

    const total = count ?? 0;
    if (!itemRows?.length) {
      return success({
        ...emptyItemPage(criteria),
        total,
        pageCount: Math.ceil(total / criteria.pageSize),
      });
    }

    const itemIds = itemRows.map((item) => item.id);
    const { data: imageRows, error: imageError } = await this.client
      .from("item_images")
      .select(ITEM_IMAGE_COLUMNS)
      .in("item_id", itemIds)
      .order("sort_order");

    if (imageError) return failure("UNEXPECTED_FAILURE");

    const primaryImages = new Map<string, CatalogueImage>();
    for (const imageRow of imageRows ?? []) {
      if (!primaryImages.has(imageRow.item_id)) {
        primaryImages.set(imageRow.item_id, toCatalogueImage(imageRow));
      }
    }

    return success({
      items: itemRows.map((item) =>
        toCatalogueItemSummary(item, primaryImages.get(item.id) ?? null),
      ),
      page: criteria.page,
      pageSize: criteria.pageSize,
      total,
      pageCount: Math.ceil(total / criteria.pageSize),
    });
  }

  async findItemDetailBySlug(
    slug: string,
  ): Promise<Result<CatalogueItemDetail | null>> {
    const { data: itemRow, error: itemError } = await this.client
      .from("items")
      .select(ITEM_DETAIL_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();

    if (itemError) {
      return failure("UNEXPECTED_FAILURE");
    }

    if (!itemRow) {
      return success(null);
    }

    const [imagesResult, linksResult] = await Promise.all([
      this.client
        .from("item_images")
        .select(ITEM_IMAGE_COLUMNS)
        .eq("item_id", itemRow.id)
        .order("sort_order"),
      this.client
        .from("item_links")
        .select(ITEM_LINK_COLUMNS)
        .eq("item_id", itemRow.id)
        .order("sort_order"),
    ]);

    if (imagesResult.error || linksResult.error) {
      return failure("UNEXPECTED_FAILURE");
    }

    const images = (imagesResult.data ?? []).map(toCatalogueImage);
    const links: CatalogueLink[] = (linksResult.data ?? []).map(toCatalogueLink);

    return success(toCatalogueItemDetail(itemRow, images, links));
  }

  private async findVisibleCategoryId(
    slug: string | undefined,
  ): Promise<Result<string | null>> {
    if (!slug) {
      return success(null);
    }

    const { data, error } = await this.client
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      return failure("UNEXPECTED_FAILURE");
    }

    return success(data?.id ?? null);
  }
}

function emptyItemPage(criteria: CatalogueItemPageCriteria): CatalogueItemPage {
  return {
    items: [],
    page: criteria.page,
    pageSize: criteria.pageSize,
    total: 0,
    pageCount: 0,
  };
}
