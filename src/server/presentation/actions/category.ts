"use server";

import { 
  makeCreateCategoryUseCase, 
  makeUpdateCategoryUseCase, 
  makeDeleteCategoryUseCase, 
  makeGetCategoriesUseCase 
} from "@/server/di/container";
import { CreateCategoryDTO, UpdateCategoryDTO } from "@/server/domain/entities/Category";
import { revalidatePath } from "next/cache";

import { assertAdmin } from "./authGuards";

/**
 * Server action to fetch a paginated list of categories.
 *
 * @param limit - Max number of categories to retrieve.
 * @param offset - Starting offset for pagination.
 * @param search - Optional keyword search.
 * @returns Object with categories data or error message.
 */
export async function getCategoriesAction(limit?: number, offset?: number, search?: string) {
  const useCase = await makeGetCategoriesUseCase();
  const result = await useCase.execute({ limit, offset, search });
  return result.success ? { data: result.data } : { error: result.error.message };
}

/**
 * Server action to create a new category after admin authorization.
 *
 * @param data - Category payload data.
 * @returns Object containing created category or error message.
 */
export async function createCategoryAction(data: CreateCategoryDTO) {
  try {
    await assertAdmin();
  } catch (authError) {
    return { error: authError instanceof Error ? authError.message : "Unauthorized" };
  }

  const useCase = await makeCreateCategoryUseCase();
  const result = await useCase.execute(data);
  
  if (result.success) {
    revalidatePath("/admin/categories");
    return { data: result.data };
  }
  return { error: result.error.message };
}

/**
 * Server action to update an existing category after admin authorization.
 *
 * @param id - UUID of category to update.
 * @param data - Update payload data.
 * @returns Object containing updated category or error message.
 */
export async function updateCategoryAction(id: string, data: UpdateCategoryDTO) {
  try {
    await assertAdmin();
  } catch (authError) {
    return { error: authError instanceof Error ? authError.message : "Unauthorized" };
  }

  const useCase = await makeUpdateCategoryUseCase();
  const result = await useCase.execute(id, data);
  
  if (result.success) {
    revalidatePath("/admin/categories");
    return { data: result.data };
  }
  return { error: result.error.message };
}

/**
 * Server action to soft-delete a category after admin authorization.
 *
 * @param id - UUID of category to delete.
 * @returns Object indicating success or localized error message.
 */
export async function deleteCategoryAction(id: string) {
  try {
    await assertAdmin();
  } catch (authError) {
    return { error: authError instanceof Error ? authError.message : "Unauthorized" };
  }

  const useCase = await makeDeleteCategoryUseCase();
  const result = await useCase.execute(id);
  
  if (result.success) {
    revalidatePath("/admin/categories");
    return { success: true };
  }
  return { error: result.error.message };
}
