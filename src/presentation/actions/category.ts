"use server";

import { 
  makeCreateCategoryUseCase, 
  makeUpdateCategoryUseCase, 
  makeDeleteCategoryUseCase, 
  makeGetCategoriesUseCase 
} from "@/infrastructure/supabase/container";
import { CreateCategoryDTO, UpdateCategoryDTO } from "@/domain/entities/Category";
import { revalidatePath } from "next/cache";

import { assertAdmin } from "./authGuards";

export async function getCategoriesAction(limit?: number, offset?: number, search?: string) {
  const useCase = await makeGetCategoriesUseCase();
  const result = await useCase.execute({ limit, offset, search });
  return result.success ? { data: result.data } : { error: result.error.message };
}

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
