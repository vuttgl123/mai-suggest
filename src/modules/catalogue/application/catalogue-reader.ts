import type { Result } from "@/core/application/result";
import type {
  CatalogueCategory,
  CatalogueChapterPreview,
  CatalogueItemDetail,
  CatalogueItemPage,
} from "@/modules/catalogue/domain/catalogue-read-models";

export interface CatalogueItemCriteria {
  categorySlug?: string;
}

export interface CatalogueItemPageCriteria extends CatalogueItemCriteria {
  page: number;
  pageSize: number;
  query?: string;
}

export interface CatalogueChapterPreviewCriteria {
  itemsPerChapter: number;
}

export interface CatalogueReader {
  listCategories(): Promise<Result<CatalogueCategory[]>>;
  listChapterPreviews(
    criteria: CatalogueChapterPreviewCriteria,
  ): Promise<Result<CatalogueChapterPreview[]>>;
  listItemPage(
    criteria: CatalogueItemPageCriteria,
  ): Promise<Result<CatalogueItemPage>>;
  findItemDetailBySlug(slug: string): Promise<Result<CatalogueItemDetail | null>>;
}
