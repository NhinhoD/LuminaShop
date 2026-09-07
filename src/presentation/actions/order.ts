"use server";

import { 
  makeCreateOrderUseCase, 
  makeGetAllOrdersUseCase, 
  makeGetOrderDetailUseCase, 
  makeGetUserOrdersUseCase, 
  makeUpdateOrderStatusUseCase,
  makeApproveManualPaymentUseCase,
  makeSupabaseClient,
  makeSendOrderConfirmationEmailUseCase
} from "@/infrastructure/supabase/container";
import { CreateOrderDTO } from "@/application/use-cases/orders/CreateOrder";
import { OrderStatus, Order } from "@/domain/entities/Order";
import { revalidatePath } from "next/cache";
import { ROLES } from "@/presentation/constants";

/**
 * Result interface for all server actions
 */
export interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Helper to get current authenticated user
 */
async function getCurrentUser() {
  const supabase = await makeSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Helper to check if current user is an admin
 */
async function isUserAdmin() {
  const user = await getCurrentUser();
  if (!user) return false;

  const supabase = await makeSupabaseClient();
  
  // 1. Check Claims
  try {
    const { data: claimsData } = await supabase.rpc('get_my_claims');
    if (claimsData?.claims?.app_metadata?.user_role === ROLES.ADMIN || 
        claimsData?.claims?.user_role === ROLES.ADMIN) {
      return true;
    }
  } catch {
    // Ignore error and fall back
  }

  // 2. Check Profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === ROLES.ADMIN;
}

/**
 * Create a new order
 */
export async function createOrderAction(data: Omit<CreateOrderDTO, 'userId'>): Promise<ActionResponse<Order>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Bạn cần đăng nhập để đặt hàng." };

  try {
    const createOrderUseCase = await makeCreateOrderUseCase();
    const result = await createOrderUseCase.execute({ ...data, userId: user.id });

    if (!result.success) {
      return { success: false, error: result.error.message };
    }

    revalidatePath("/profile");
    revalidatePath("/admin/orders");
    
    return { success: true, data: result.data };
  } catch (error: unknown) {
    console.error('[Action Error] createOrderAction:', error);
    return { success: false, error: "Đã có lỗi xảy ra khi tạo đơn hàng." };
  }
}

/**
 * Get a specific order (owner or admin only)
 */
export async function getOrderAction(id: string): Promise<ActionResponse<Order>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const isAdmin = await isUserAdmin();

  try {
    const useCase = await makeGetOrderDetailUseCase();
    const result = await useCase.execute({
      orderId: id,
      requesterId: user.id,
      isAdmin
    });

    if (!result.success) {
      return { success: false, error: result.error.message };
    }

    return { success: true, data: result.data };
  } catch (error: unknown) {
    console.error('[Action Error] getOrderAction:', error);
    return { success: false, error: "Failed to load order details." };
  }
}

/**
 * Get current user's orders
 */
export async function getUserOrdersAction(limit?: number, offset?: number): Promise<ActionResponse<{ orders: Order[], total: number }>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Bạn cần đăng nhập để xem lịch sử đơn hàng." };

  try {
    const useCase = await makeGetUserOrdersUseCase();
    const result = await useCase.execute({ userId: user.id, limit, offset });

    if (!result.success) {
      return { success: false, error: result.error.message };
    }

    return { success: true, data: result.data };
  } catch (error: unknown) {
    console.error('[Action Error] getUserOrdersAction:', error);
    return { success: false, error: "Failed to load order history." };
  }
}

/**
 * Get all orders (Admin only)
 */
export async function getAllOrdersAction(
  status?: OrderStatus, 
  limit?: number, 
  offset?: number,
  search?: string
): Promise<ActionResponse<{ orders: Order[], total: number }>> {
  const isAdmin = await isUserAdmin();
  if (!isAdmin) return { success: false, error: "Access denied" };

  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const useCase = await makeGetAllOrdersUseCase();
    const result = await useCase.execute({ 
      status,
      adminId: user.id,
      limit,
      offset,
      search
    });

    if (!result.success) {
      return { success: false, error: result.error.message };
    }

    return { success: true, data: result.data };
  } catch (error: unknown) {
    console.error('[Action Error] getAllOrdersAction:', error);
    return { success: false, error: "Failed to load orders." };
  }
}

/**
 * Update order status (Admin only)
 */
export async function updateOrderStatusAction(orderId: string, newStatus: OrderStatus): Promise<ActionResponse<Order>> {
  const isAdmin = await isUserAdmin();
  if (!isAdmin) return { success: false, error: "Access denied" };

  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const useCase = await makeUpdateOrderStatusUseCase();
    const result = await useCase.execute({
      orderId,
      newStatus,
      adminId: user.id
    });

    if (!result.success) {
      return { success: false, error: result.error.message };
    }

    revalidatePath("/admin/orders");
    revalidatePath("/profile");
    revalidatePath("/profile/orders");
    revalidatePath(`/profile/orders/${orderId}`);
    
    return { success: true, data: result.data };
  } catch (error: unknown) {
    console.error('[Action Error] updateOrderStatusAction:', error);
    return { success: false, error: "Failed to update order status." };
  }
}
/**
 * Cancel order (User only - when pending)
 */
export async function cancelOrderAction(orderId: string): Promise<ActionResponse<Order>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const useCase = await makeUpdateOrderStatusUseCase();
    
    // We need to verify ownership first since updateOrderStatusUseCase doesn't check ownership by default
    const getDetailUseCase = await makeGetOrderDetailUseCase();
    const orderResult = await getDetailUseCase.execute({
      orderId,
      requesterId: user.id,
      isAdmin: false
    });

    if (!orderResult.success) {
      return { success: false, error: "Bạn không có quyền hủy đơn hàng này." };
    }

    if (
      orderResult.data.status === OrderStatus.COMPLETED || 
      orderResult.data.status === OrderStatus.CANCELLED ||
      orderResult.data.paymentStatus === 'paid'
    ) {
      return { success: false, error: "Đơn hàng đã thanh toán hoặc đã hoàn tất, không thể tự hủy." };
    }

    const result = await useCase.execute({
      orderId,
      newStatus: OrderStatus.CANCELLED,
      adminId: user.id // We pass user.id as adminId here to bypass the admin check in useCase if it has one, 
                        // but our useCase doesn't actually check adminId, it just takes it.
    });

    if (!result.success) {
      return { success: false, error: result.error.message };
    }

    revalidatePath("/profile");
    revalidatePath("/profile/orders");
    revalidatePath(`/profile/orders/${orderId}`);
    
    return { success: true, data: result.data };
  } catch (error: unknown) {
    console.error('[Action Error] cancelOrderAction:', error);
    return { success: false, error: "Không thể hủy đơn hàng." };
  }
}

/**
 * Approve manual bank transfer payment (Admin only)
 */
export async function approveManualPaymentAction(orderId: string): Promise<ActionResponse<Order>> {
  const isAdmin = await isUserAdmin();
  if (!isAdmin) return { success: false, error: "Access denied" };

  try {
    const useCase = await makeApproveManualPaymentUseCase();
    const result = await useCase.execute(orderId);

    if (!result.success) {
      return { success: false, error: result.error.message };
    }

    revalidatePath("/admin/orders");
    revalidatePath("/profile");
    revalidatePath("/profile/orders");
    revalidatePath(`/profile/orders/${orderId}`);

    return { success: true, data: result.data };
  } catch {
    return { success: false, error: "Không thể phê duyệt thanh toán." };
  }
}

/**
 * Resend order confirmation and digital license key email
 */
export async function resendOrderEmailAction(orderId: string): Promise<ActionResponse<void>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này." };
    }

    const admin = await isUserAdmin();
    const orderDetailUseCase = await makeGetOrderDetailUseCase();
    const orderResult = await orderDetailUseCase.execute({
      orderId,
      requesterId: user.id,
      isAdmin: admin,
    });

    if (!orderResult.success) {
      return { success: false, error: orderResult.error.message };
    }

    const order = orderResult.data;
    if (order.paymentStatus !== "paid") {
      return { success: false, error: "Đơn hàng chưa thanh toán, không thể cấp mã bản quyền." };
    }

    const useCase = await makeSendOrderConfirmationEmailUseCase();
    const result = await useCase.execute(orderId);
    if (!result.success) {
      return { success: false, error: result.error.message };
    }
    return { success: true };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Không thể gửi lại email xác nhận đơn hàng." 
    };
  }
}

