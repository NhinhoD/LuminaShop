"use server";

import { 
  makeAddToCartUseCase, 
  makeMergeCartUseCase, 
  makeCartRepository,
  makeSupabaseClient
} from "@/infrastructure/supabase/container";
import { revalidatePath } from "next/cache";

async function getUserId() {
  const supabase = await makeSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
}

export async function addToCartAction(item: { productId: string, variantId?: string, quantity: number }) {
  const userId = await getUserId();
  if (!userId) return { error: "Bạn cần đăng nhập để thực hiện hành động này." };

  const addToCartUseCase = await makeAddToCartUseCase();
  const result = await addToCartUseCase.execute(userId, item);
  if (!result.success) return { error: result.error.message };

  revalidatePath("/cart");
  return { success: true };
}

export async function mergeCartAction(localItems: any[]) {
  const userId = await getUserId();
  if (!userId) return { error: "Unauthorized" };

  const mergeCartUseCase = await makeMergeCartUseCase();
  const result = await mergeCartUseCase.execute(userId, localItems);
  if (!result.success) return { error: result.error.message };

  revalidatePath("/cart");
  return { success: true };
}

export async function getCartAction() {
  const userId = await getUserId();
  if (!userId) return { data: null };

  const cartRepo = await makeCartRepository();
  const cart = await cartRepo.findByUserId(userId);
  return { data: cart };
}

export async function updateCartItemAction(itemId: string, quantity: number) {
  try {
    const cartRepo = await makeCartRepository();
    await cartRepo.updateItem(itemId, quantity);
    revalidatePath("/cart");
    return { success: true };
  } catch (error: any) {
    return { error: "Không thể cập nhật số lượng." };
  }
}

export async function removeCartItemAction(itemId: string) {
  try {
    const cartRepo = await makeCartRepository();
    await cartRepo.removeItem(itemId);
    revalidatePath("/cart");
    return { success: true };
  } catch (error: any) {
    return { error: "Không thể xóa sản phẩm khỏi giỏ hàng." };
  }
}
