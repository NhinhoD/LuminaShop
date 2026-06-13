"use server";

import { makeProcessPaymentUseCase } from "@/infrastructure/supabase/container";
import { revalidatePath } from "next/cache";

export async function processPaymentAction(orderId: string, amount: number, method: string) {
  const processPaymentUseCase = await makeProcessPaymentUseCase();
  const result = await processPaymentUseCase.execute({ orderId, amount, method });

  if (!result.success) {
    return { error: result.message };
  }

  revalidatePath("/profile");
  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${orderId}/success`);
  
  return { data: result };
}

export async function verifyOrderPaymentAction(orderId: string) {
  const { makeVerifyOrderPaymentUseCase } = await import('@/infrastructure/supabase/container');
  const useCase = await makeVerifyOrderPaymentUseCase();
  const result = await useCase.execute(orderId);
  
  if (result.success) {
    revalidatePath("/profile/orders");
    revalidatePath(`/orders/${orderId}/success`);
    revalidatePath("/admin/orders");
  }
  
  return result;
}
