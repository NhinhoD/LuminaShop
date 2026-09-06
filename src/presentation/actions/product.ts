"use server";

import { 
  makeCreateProductUseCase, 
  makeUpdateProductUseCase, 
  makeDeleteProductUseCase 
} from "@/infrastructure/supabase/container";
import { CreateProductDTO, UpdateProductDTO } from "@/domain/entities/Product";
import { revalidatePath } from "next/cache";
import { assertAdmin } from "./authGuards";

/**
 * Server action to create a new product (admin-only).
 *
 * @param data - The product creation payload.
 */
export async function createProductAction(data: CreateProductDTO) {
  try {
    await assertAdmin();
  } catch (authError) {
    return { error: authError instanceof Error ? authError.message : "Unauthorized" };
  }

  const createProductUseCase = await makeCreateProductUseCase();
  const result = await createProductUseCase.execute(data);

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  
  return { data: result.data };
}

/**
 * Server action to update an existing product (admin-only).
 *
 * @param id - The ID of the product to update.
 * @param data - The update payload.
 */
export async function updateProductAction(id: string, data: UpdateProductDTO) {
  try {
    await assertAdmin();
  } catch (authError) {
    return { error: authError instanceof Error ? authError.message : "Unauthorized" };
  }

  const updateProductUseCase = await makeUpdateProductUseCase();
  const result = await updateProductUseCase.execute(id, data);

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);
  revalidatePath("/shop");
  
  return { data: result.data };
}

/**
 * Server action to delete a product (admin-only).
 *
 * @param id - The ID of the product to delete.
 */
export async function deleteProductAction(id: string) {
  try {
    await assertAdmin();
    const useCase = await makeDeleteProductUseCase();
    const result = await useCase.execute(id);

    if (!result.success) {
      return { success: false, error: result.error.message };
    }

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete product' 
    };
  }
}
