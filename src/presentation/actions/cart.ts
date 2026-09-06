"use server";

import { 
  makeAddToCartUseCase, 
  makeMergeCartUseCase, 
  makeGetCartUseCase,
  makeUpdateCartItemUseCase,
  makeRemoveCartItemUseCase,
  makeSupabaseClient
} from "@/infrastructure/supabase/container";
import { revalidatePath } from "next/cache";
import { CartItem as DomainCartItem } from "@/domain/entities/Cart";

/**
 * Retrieves the currently authenticated user's ID from session.
 */
async function getUserId(): Promise<string | undefined> {
  const supabase = await makeSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
}

/**
 * Server action to add an item to the current user's cart.
 *
 * @param item - The product item payload (productId, variantId, quantity).
 */
export async function addToCartAction(item: { productId: string, variantId?: string, quantity: number }) {
  const userId = await getUserId();
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
  const userId = await getUserId();
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
  const userId = await getUserId();
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
  const userId = await getUserId();
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
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized: Yêu cầu đăng nhập." };

  const useCase = await makeRemoveCartItemUseCase();
  const result = await useCase.execute({ userId, itemId });
  if (!result.success) return { success: false, error: result.error.message };

  revalidatePath("/cart");
  return { success: true };
}
