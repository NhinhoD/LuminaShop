"use server";

import { 
  makeAddToCartUseCase, 
  makeMergeCartUseCase, 
  makeGetCartUseCase,
  makeUpdateCartItemUseCase,
  makeRemoveCartItemUseCase,
  makeGetCurrentUserUseCase
} from "@/server/di/container";
import { revalidatePath } from "next/cache";
import { CartItem as DomainCartItem } from "@/server/domain/entities/Cart";
import { Result, ok, fail } from "@/server/domain/shared/Result";

/**
 * Retrieves the currently authenticated user's ID from session.
 * Distinguishes fail(error) from ok(null) unauthenticated user.
 */
async function getUserIdResult(): Promise<Result<string | null>> {
  const getCurrentUser = await makeGetCurrentUserUseCase();
  const userResult = await getCurrentUser.execute();
  if (!userResult.success) {
    return fail(userResult.error);
  }
  return ok(userResult.data ? userResult.data.id : null);
}

/**
 * Server action to add an item to the current user's cart.
 *
 * @param item - The product item payload (productId, variantId, quantity).
 */
export async function addToCartAction(item: { productId: string, variantId?: string, quantity: number }) {
  const userRes = await getUserIdResult();
  if (!userRes.success) {
    console.error("[Action Error] addToCartAction user lookup failed:", userRes.error);
    return { error: "Không thể xác thực thông tin người dùng. Vui lòng thử lại sau." };
  }
  const userId = userRes.data;
  if (!userId) return { error: "Bạn cần đăng nhập để thực hiện hành động này." };

  const addToCartUseCase = await makeAddToCartUseCase();
  const result = await addToCartUseCase.execute(userId, item);
  if (!result.success) return { error: result.error.message };

  revalidatePath("/cart");
  return { success: true };
}

/**
 * Server action to merge guest localStorage cart items into authenticated user's database cart.
 *
 * @param localItems - Array of cart items from local state.
 */
export async function mergeCartAction(localItems: Omit<DomainCartItem, 'id' | 'cartId'>[]) {
  const userRes = await getUserIdResult();
  if (!userRes.success) {
    console.error("[Action Error] mergeCartAction user lookup failed:", userRes.error);
    return { error: "Authentication failed. Please try again later." };
  }
  const userId = userRes.data;
  if (!userId) return { error: "Unauthorized" };

  const mergeCartUseCase = await makeMergeCartUseCase();
  const result = await mergeCartUseCase.execute(userId, localItems);
  if (!result.success) return { error: result.error.message };

  revalidatePath("/cart");
  return { success: true };
}

/**
 * Server action to retrieve the authenticated user's cart.
 */
export async function getCartAction() {
  const userRes = await getUserIdResult();
  if (!userRes.success) {
    console.error("[Action Error] getCartAction user lookup failed:", userRes.error);
    return { error: "Không thể tải giỏ hàng do lỗi xác thực." };
  }
  const userId = userRes.data;
  if (!userId) return { data: null };

  const useCase = await makeGetCartUseCase();
  const result = await useCase.execute(userId);
  if (!result.success) return { error: result.error.message };
  return { data: result.data };
}

/**
 * Server action to update the quantity of an item in the current user's cart.
 * Enforces authenticated session and cart ownership verification to prevent IDOR (CWE-639).
 *
 * @param itemId - The unique ID of the cart item.
 * @param quantity - Target quantity.
 */
export async function updateCartItemAction(itemId: string, quantity: number) {
  const userRes = await getUserIdResult();
  if (!userRes.success) {
    console.error("[Action Error] updateCartItemAction user lookup failed:", userRes.error);
    return { success: false, error: "Authentication failed. Please try again later." };
  }
  const userId = userRes.data;
  if (!userId) return { success: false, error: "Unauthorized: Yêu cầu đăng nhập." };

  const useCase = await makeUpdateCartItemUseCase();
  const result = await useCase.execute({ userId, itemId, quantity });
  if (!result.success) return { success: false, error: result.error.message };

  revalidatePath("/cart");
  return { success: true };
}

/**
 * Server action to remove an item from the current user's cart.
 * Enforces authenticated session and cart ownership verification to prevent IDOR (CWE-639).
 *
 * @param itemId - The unique ID of the cart item.
 */
export async function removeCartItemAction(itemId: string) {
  const userRes = await getUserIdResult();
  if (!userRes.success) {
    console.error("[Action Error] removeCartItemAction user lookup failed:", userRes.error);
    return { success: false, error: "Authentication failed. Please try again later." };
  }
  const userId = userRes.data;
  if (!userId) return { success: false, error: "Unauthorized: Yêu cầu đăng nhập." };

  const useCase = await makeRemoveCartItemUseCase();
  const result = await useCase.execute({ userId, itemId });
  if (!result.success) return { success: false, error: result.error.message };

  revalidatePath("/cart");
  return { success: true };
}
