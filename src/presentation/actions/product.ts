"use server";

import { 
  makeCreateProductUseCase, 
  makeUpdateProductUseCase, 
  makeProductRepository 
} from "@/infrastructure/supabase/container";
import { CreateProductDTO, UpdateProductDTO } from "@/domain/entities/Product";
import { revalidatePath } from "next/cache";

export async function createProductAction(data: CreateProductDTO) {
  const createProductUseCase = await makeCreateProductUseCase();
  const result = await createProductUseCase.execute(data);

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  
  return { data: result.data };
}

export async function updateProductAction(id: string, data: UpdateProductDTO) {
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

export async function deleteProductAction(id: string) {
  try {
    const productRepository = await makeProductRepository();
    await productRepository.delete(id);
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    return { error: "Không thể xóa sản phẩm." };
  }
}
