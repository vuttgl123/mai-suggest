import type { Result } from "@/core/application/result";
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

export interface CatalogueAdminRepository {
  createCategory(
    ownerId: string,
    input: CatalogueCategoryInput,
  ): Promise<Result<ManagedCatalogueCategory>>;
  updateCategory(
    categoryId: string,
    input: CatalogueCategoryInput,
  ): Promise<Result<ManagedCatalogueCategory>>;
  deleteCategory(categoryId: string): Promise<Result<void>>;

  createItem(
    ownerId: string,
    input: CatalogueItemInput,
  ): Promise<Result<ManagedCatalogueItem>>;
  updateItem(
    itemId: string,
    input: CatalogueItemInput,
  ): Promise<Result<ManagedCatalogueItem>>;
  deleteItem(itemId: string): Promise<Result<void>>;

  createItemImage(input: ItemImageInput): Promise<Result<ManagedItemImage>>;
  updateItemImage(
    imageId: string,
    input: ItemImageUpdateInput,
  ): Promise<Result<ManagedItemImage>>;
  deleteItemImage(imageId: string): Promise<Result<void>>;

  createItemLink(input: ItemLinkInput): Promise<Result<ManagedItemLink>>;
  updateItemLink(
    linkId: string,
    input: ItemLinkUpdateInput,
  ): Promise<Result<ManagedItemLink>>;
  deleteItemLink(linkId: string): Promise<Result<void>>;
}
