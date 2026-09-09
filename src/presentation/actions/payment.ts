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
  try {
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
  } catch (error: unknown) {
    console.error("[processPaymentAction] Unexpected error:", error);
    return { 
      error: "Đã xảy ra lỗi không mong muốn khi xử lý thanh toán." 
    };
  }
}

/**
 * Server action to verify order payment status with payment gateways.
 * Requires authenticated session to ensure only authorized order owners can trigger verification.
 *
 * @param orderId - The target order identifier to verify.
 * @param shouldRevalidate - Whether to revalidate storefront order paths upon successful verification.
 * @returns An object containing success status and descriptive message.
 */
export async function verifyOrderPaymentAction(orderId: string, shouldRevalidate: boolean = false) {
  try {
    const authRepo = await makeAuthRepository();
    const user = await authRepo.getCurrentUser();
    if (!user) {
      return { success: false, message: "Unauthorized" };
    }

    const useCase = await makeVerifyOrderPaymentUseCase();
    const result = await useCase.execute(orderId, user.id);
    
    if (result.success && shouldRevalidate) {
      try {
        revalidatePath("/profile/orders");
        revalidatePath(`/orders/${orderId}/success`);
        revalidatePath("/admin/orders");
      } catch {
        // Safely ignore if called within an active render context where revalidation is unsupported
      }
    }
    
    return result;
  } catch (error: unknown) {
    console.error("[verifyOrderPaymentAction] Unexpected error:", error);
    return { 
      success: false, 
      message: "Lỗi không xác định khi xác thực thanh toán." 
    };
  }
}
