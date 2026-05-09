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
