import type { Result } from "@/core/application/result";
import type {
  CatalogueCategory,
  CatalogueItemDetail,
  CatalogueItemPage,
  CatalogueItemSummary,
} from "@/modules/catalogue/domain/catalogue-read-models";

export interface CatalogueItemCriteria {
  categorySlug?: string;
}

export interface CatalogueItemPageCriteria extends CatalogueItemCriteria {
  page: number;
  pageSize: number;
}

export interface CatalogueReader {
  listCategories(): Promise<Result<CatalogueCategory[]>>;
  listItems(criteria: CatalogueItemCriteria): Promise<Result<CatalogueItemSummary[]>>;
  listItemPage(
    criteria: CatalogueItemPageCriteria,
  ): Promise<Result<CatalogueItemPage>>;
  findItemDetailBySlug(slug: string): Promise<Result<CatalogueItemDetail | null>>;
}
