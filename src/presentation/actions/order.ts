"use server";

import { 
  makeCreateOrderUseCase, 
  makeOrderRepository,
  makeSupabaseClient
} from "@/infrastructure/supabase/container";
import { CreateOrderDTO } from "@/application/use-cases/orders/CreateOrder";
import { revalidatePath } from "next/cache";

async function getUserId() {
  const supabase = await makeSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
}

export async function createOrderAction(data: Omit<CreateOrderDTO, 'userId'>) {
  const userId = await getUserId();
  if (!userId) return { error: "Bạn cần đăng nhập để đặt hàng." };

  const createOrderUseCase = await makeCreateOrderUseCase();
  const result = await createOrderUseCase.execute({ ...data, userId });

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
  } catch (error: unknown) {
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
  } catch (error: unknown) {
    return { error: "Không thể lấy danh sách đơn hàng." };
  }
}
