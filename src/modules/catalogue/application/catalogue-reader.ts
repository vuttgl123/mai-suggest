import type { Result } from "@/core/application/result";
import type {
  CatalogueCategory,
  CatalogueItemDetail,
  CatalogueItemSummary,
} from "@/modules/catalogue/domain/catalogue-read-models";

export interface CatalogueItemCriteria {
  categorySlug?: string;
}

export interface CatalogueReader {
  listCategories(): Promise<Result<CatalogueCategory[]>>;
  listItems(criteria: CatalogueItemCriteria): Promise<Result<CatalogueItemSummary[]>>;
  findItemDetailBySlug(slug: string): Promise<Result<CatalogueItemDetail | null>>;
}
