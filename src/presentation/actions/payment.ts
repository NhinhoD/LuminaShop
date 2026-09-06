"use server";

import { 
  makeAuthRepository,
  makeProcessPaymentUseCase, 
  makeVerifyOrderPaymentUseCase 
} from "@/infrastructure/supabase/container";
import { revalidatePath } from "next/cache";

/**
 * Server action to process payment for an order.
 * Enforces session authentication and passes userId to use case to prevent IDOR (CWE-639).
 *
 * @param orderId - The target order identifier.
 * @param amount - The total order amount.
 * @param method - The payment method (e.g. 'payos', 'cod').
 * @returns An object containing the payment result or an error message.
 */
export async function processPaymentAction(orderId: string, amount: number, method: string) {
  const authRepo = await makeAuthRepository();
  const user = await authRepo.getCurrentUser();
  if (!user) {
    return { error: "Bạn cần đăng nhập để thực hiện thanh toán." };
  }

  const processPaymentUseCase = await makeProcessPaymentUseCase();
  const result = await processPaymentUseCase.execute({ orderId, amount, method, userId: user.id });

  if (!result.success) {
    return { error: result.message };
  }

  revalidatePath("/profile");
  revalidatePath("/profile/orders");
  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${orderId}/success`);
  
  return { data: result };
}

/**
 * Server action to verify order payment status with payment gateways.
 * Requires authenticated session to ensure only authorized order owners can trigger verification.
 *
 * @param orderId - The target order identifier to verify.
 * @param shouldRevalidate - Whether to revalidate storefront order paths upon successful verification.
 * @returns An object containing success status and descriptive message.
 */
export async function verifyOrderPaymentAction(orderId: string, shouldRevalidate: boolean = true) {
  const authRepo = await makeAuthRepository();
  const user = await authRepo.getCurrentUser();
  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  const useCase = await makeVerifyOrderPaymentUseCase();
  const result = await useCase.execute(orderId, user.id);
  
  if (result.success && shouldRevalidate) {
    revalidatePath("/profile/orders");
    revalidatePath(`/orders/${orderId}/success`);
    revalidatePath("/admin/orders");
  }
  
  return result;
}
