import type { Result } from "@/core/application/result";
import type {
  ManagedCatalogueCategory,
  ManagedCatalogueItem,
  ManagedCatalogueItemDetail,
} from "@/modules/catalogue/domain/catalogue-admin-models";

export interface ManagedCatalogueItemCriteria {
  categoryId?: string;
}

export interface CatalogueAdminReader {
  listManagedCategories(): Promise<Result<ManagedCatalogueCategory[]>>;
  listManagedItems(
    criteria: ManagedCatalogueItemCriteria,
  ): Promise<Result<ManagedCatalogueItem[]>>;
  findManagedItemDetailById(
    itemId: string,
  ): Promise<Result<ManagedCatalogueItemDetail | null>>;
}
