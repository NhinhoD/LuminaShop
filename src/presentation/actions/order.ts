"use server";

import { 
  makePlaceOrderUseCase, 
  makeOrderRepository,
  makeSupabaseClient
} from "@/infrastructure/supabase/container";
import { PlaceOrderDTO } from "@/application/use-cases/orders/PlaceOrder";
import { revalidatePath } from "next/cache";

async function getUserId() {
  const supabase = await makeSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
}

export async function placeOrderAction(data: Omit<PlaceOrderDTO, 'userId'>) {
  const userId = await getUserId();
  if (!userId) return { error: "Bạn cần đăng nhập để đặt hàng." };

  const placeOrderUseCase = await makePlaceOrderUseCase();
  const result = await placeOrderUseCase.execute({ ...data, userId });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/profile");
  revalidatePath("/admin/orders");
  
  return { data: result.data };
}

export async function getOrderAction(id: string) {
  try {
    const orderRepo = await makeOrderRepository();
    const order = await orderRepo.findById(id);
    return { data: order };
  } catch (error: any) {
    return { error: "Không thể lấy thông tin đơn hàng." };
  }
}

export async function getUserOrdersAction() {
  const userId = await getUserId();
  if (!userId) return { data: [] };

  try {
    const orderRepo = await makeOrderRepository();
    const orders = await orderRepo.findByUserId(userId);
    return { data: orders };
  } catch (error: any) {
    return { error: "Không thể lấy danh sách đơn hàng." };
  }
}
