"use server";

import {
  revalidateAfterMutation,
  runServerAction,
} from "@/lib/backend/run-server-action";
import type {
  CatalogueCategoryInput,
  CatalogueItemInput,
  ItemImageInput,
  ItemImageUpdateInput,
  ItemLinkInput,
  ItemLinkUpdateInput,
} from "@/modules/catalogue/domain/catalogue-admin-models";

export async function createCatalogueCategoryAction(
  input: CatalogueCategoryInput,
) {
  const result = await runServerAction((backend, actor) =>
    backend.manageCatalogue.createCategory(actor, input),
  );

  return revalidateAfterMutation(result);
}

export async function updateCatalogueCategoryAction(
  categoryId: string,
  input: CatalogueCategoryInput,
) {
  const result = await runServerAction((backend, actor) =>
    backend.manageCatalogue.updateCategory(actor, categoryId, input),
  );

  return revalidateAfterMutation(result);
}

export async function deleteCatalogueCategoryAction(categoryId: string) {
  const result = await runServerAction((backend, actor) =>
    backend.manageCatalogue.deleteCategory(actor, categoryId),
  );

  return revalidateAfterMutation(result);
}

export async function createCatalogueItemAction(input: CatalogueItemInput) {
  const result = await runServerAction((backend, actor) =>
    backend.manageCatalogue.createItem(actor, input),
  );

  return revalidateAfterMutation(result);
}

export async function updateCatalogueItemAction(
  itemId: string,
  input: CatalogueItemInput,
) {
  const result = await runServerAction((backend, actor) =>
    backend.manageCatalogue.updateItem(actor, itemId, input),
  );

  return revalidateAfterMutation(result);
}

export async function deleteCatalogueItemAction(itemId: string) {
  const result = await runServerAction((backend, actor) =>
    backend.manageCatalogue.deleteItem(actor, itemId),
  );

  return revalidateAfterMutation(result);
}

export async function createCatalogueItemImageAction(input: ItemImageInput) {
  const result = await runServerAction((backend, actor) =>
    backend.manageCatalogue.createItemImage(actor, input),
  );

  return revalidateAfterMutation(result);
}

export async function updateCatalogueItemImageAction(
  imageId: string,
  input: ItemImageUpdateInput,
) {
  const result = await runServerAction((backend, actor) =>
    backend.manageCatalogue.updateItemImage(actor, imageId, input),
  );

  return revalidateAfterMutation(result);
}

export async function deleteCatalogueItemImageAction(imageId: string) {
  const result = await runServerAction((backend, actor) =>
    backend.manageCatalogue.deleteItemImage(actor, imageId),
  );

  return revalidateAfterMutation(result);
}

export async function createCatalogueItemLinkAction(input: ItemLinkInput) {
  const result = await runServerAction((backend, actor) =>
    backend.manageCatalogue.createItemLink(actor, input),
  );

  return revalidateAfterMutation(result);
}

export async function updateCatalogueItemLinkAction(
  linkId: string,
  input: ItemLinkUpdateInput,
) {
  const result = await runServerAction((backend, actor) =>
    backend.manageCatalogue.updateItemLink(actor, linkId, input),
  );

  return revalidateAfterMutation(result);
}

export async function deleteCatalogueItemLinkAction(linkId: string) {
  const result = await runServerAction((backend, actor) =>
    backend.manageCatalogue.deleteItemLink(actor, linkId),
  );

  return revalidateAfterMutation(result);
}
