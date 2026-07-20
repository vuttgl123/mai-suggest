import type { Result } from "@/core/application/result";
import type {
  ManagedCatalogueCategory,
  ManagedCatalogueItem,
  ManagedCatalogueItemDetail,
  ManagedCatalogueItemPage,
} from "@/modules/catalogue/domain/catalogue-admin-models";

export interface ManagedCatalogueItemCriteria {
  categoryId?: string;
}

export interface ManagedCatalogueItemPageCriteria extends ManagedCatalogueItemCriteria {
  page: number;
  pageSize: number;
}

export interface CatalogueAdminReader {
  listManagedCategories(): Promise<Result<ManagedCatalogueCategory[]>>;
  listManagedItems(
    criteria: ManagedCatalogueItemCriteria,
  ): Promise<Result<ManagedCatalogueItem[]>>;
  listManagedItemPage(
    criteria: ManagedCatalogueItemPageCriteria,
  ): Promise<Result<ManagedCatalogueItemPage>>;
  findManagedItemDetailById(
    itemId: string,
  ): Promise<Result<ManagedCatalogueItemDetail | null>>;
}
