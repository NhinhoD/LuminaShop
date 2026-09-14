"use server";

import { 
  makeCreateOrderUseCase, 
  makeGetAllOrdersUseCase, 
  makeGetOrderDetailUseCase, 
  makeGetUserOrdersUseCase, 
  makeUpdateOrderStatusUseCase,
  makeApproveManualPaymentUseCase,
  makeGetCurrentUserUseCase,
  makeGetProfileUseCase,
  makeSendOrderConfirmationEmailUseCase,
  makeGetCustomerCheckoutInfoUseCase,
  makePaymentRepository,
  makeGetUserPurchasedTemplatesUseCase,
  makeCheckProductPurchasedUseCase
} from "@/di/container";
import { CreateOrderDTO } from "@/application/use-cases/orders/CreateOrder";
import { OrderStatus, Order } from "@/domain/entities/Order";
import { UserPurchasedTemplatesResult } from "@/domain/repositories/IOrderRepository";
import { revalidatePath } from "next/cache";
import { ROLES } from "@/presentation/constants";
import { Result, ok, fail } from "@/domain/shared/Result";
import { AuthUser } from "@/domain/repositories/IAuthRepository";

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
async function getCurrentUser(): Promise<Result<AuthUser | null>> {
  const getCurrentUserUseCase = await makeGetCurrentUserUseCase();
  return await getCurrentUserUseCase.execute();
}

/**
 * Helper to check if current user is an admin
 */
async function isUserAdmin(): Promise<Result<boolean>> {
  const userResult = await getCurrentUser();
  if (!userResult.success) {
    return fail(userResult.error);
  }
  if (!userResult.data) {
    return ok(false);
  }

  try {
    const getProfileUseCase = await makeGetProfileUseCase();
    const profileResult = await getProfileUseCase.execute(userResult.data.id);
    if (!profileResult.success) {
      return fail(profileResult.error);
    }
    return ok(profileResult.data?.role === ROLES.ADMIN);
  } catch (error) {
    return fail(error instanceof Error ? error : new Error("Failed to check admin privileges"));
  }
}

/**
 * Create a new order
 */
export async function createOrderAction(data: Omit<CreateOrderDTO, 'userId'>): Promise<ActionResponse<Order>> {
  const userResult = await getCurrentUser();
  if (!userResult.success) {
    console.error('[Action Error] createOrderAction user lookup failed:', userResult.error);
    return { success: false, error: "Đã có lỗi xảy ra khi xác thực người dùng. Vui lòng thử lại sau." };
  }
  const user = userResult.data;
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
  const userResult = await getCurrentUser();
  if (!userResult.success) {
    console.error('[Action Error] getOrderAction user lookup failed:', userResult.error);
    return { success: false, error: "Đã có lỗi xảy ra khi xác thực người dùng. Vui lòng thử lại sau." };
  }
  const user = userResult.data;
  if (!user) return { success: false, error: "Unauthorized" };

  const adminResult = await isUserAdmin();
  if (!adminResult.success) {
    console.error('[Action Error] getOrderAction admin lookup failed:', adminResult.error);
    return { success: false, error: "Đã có lỗi xảy ra khi kiểm tra quyền hạn người dùng." };
  }
  const isAdmin = adminResult.data;

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
 * Retrieves the current authenticated user's orders with pagination and optional search filter.
 *
 * @param limit - Number of orders per page.
 * @param offset - Number of orders to skip.
 * @param search - Optional query string to filter by order ID.
 * @returns ActionResponse containing orders and total count.
 */
export async function getUserOrdersAction(
  limit?: number, 
  offset?: number,
  search?: string
): Promise<ActionResponse<{ orders: Order[], total: number }>> {
  const userResult = await getCurrentUser();
  if (!userResult.success) {
    console.error('[Action Error] getUserOrdersAction user lookup failed:', userResult.error);
    return { success: false, error: "Đã có lỗi xảy ra khi xác thực người dùng. Vui lòng thử lại sau." };
  }
  const user = userResult.data;
  if (!user) return { success: false, error: "Bạn cần đăng nhập để xem lịch sử đơn hàng." };

  try {
    const useCase = await makeGetUserOrdersUseCase();
    const result = await useCase.execute({ userId: user.id, limit, offset, search });

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
  const adminResult = await isUserAdmin();
  if (!adminResult.success) {
    console.error('[Action Error] getAllOrdersAction admin lookup failed:', adminResult.error);
    return { success: false, error: "Failed to verify permissions." };
  }
  if (!adminResult.data) return { success: false, error: "Access denied" };

  const userResult = await getCurrentUser();
  if (!userResult.success) {
    console.error('[Action Error] getAllOrdersAction user lookup failed:', userResult.error);
    return { success: false, error: "Authentication failed." };
  }
  const user = userResult.data;
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
  const adminResult = await isUserAdmin();
  if (!adminResult.success) {
    console.error('[Action Error] updateOrderStatusAction admin lookup failed:', adminResult.error);
    return { success: false, error: "Failed to verify permissions." };
  }
  if (!adminResult.data) return { success: false, error: "Access denied" };

  const userResult = await getCurrentUser();
  if (!userResult.success) {
    console.error('[Action Error] updateOrderStatusAction user lookup failed:', userResult.error);
    return { success: false, error: "Authentication failed." };
  }
  const user = userResult.data;
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
 * Cancels a pending unpaid order for the authenticated user.
 * Idempotent: returns success immediately if the order is already cancelled.
 * Atomically updates payment record status to 'failed' if pending/unpaid.
 *
 * @param orderId - The unique ID of the order to cancel.
 * @param shouldRevalidate - Whether Next.js page paths should be revalidated.
 * @returns ActionResponse containing the updated Order or error message.
 */
export async function cancelOrderAction(
  orderId: string, 
  shouldRevalidate: boolean = true
): Promise<ActionResponse<Order>> {
  const userResult = await getCurrentUser();
  if (!userResult.success) {
    console.error('[Action Error] cancelOrderAction user lookup failed:', userResult.error);
    return { success: false, error: "Authentication failed." };
  }
  const user = userResult.data;
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const useCase = await makeUpdateOrderStatusUseCase();
    
    // Verify ownership first
    const getDetailUseCase = await makeGetOrderDetailUseCase();
    const orderResult = await getDetailUseCase.execute({
      orderId,
      requesterId: user.id,
      isAdmin: false
    });

    if (!orderResult.success) {
      return { success: false, error: "Bạn không có quyền hủy đơn hàng này." };
    }

    // Idempotency: If already cancelled, return success immediately
    if (orderResult.data.status === OrderStatus.CANCELLED) {
      return { success: true, data: orderResult.data };
    }

    if (
      orderResult.data.status === OrderStatus.COMPLETED || 
      orderResult.data.paymentStatus === 'paid'
    ) {
      return { success: false, error: "Đơn hàng đã thanh toán hoặc đã hoàn tất, không thể tự hủy." };
    }

    const result = await useCase.execute({
      orderId,
      newStatus: OrderStatus.CANCELLED,
      adminId: user.id
    });

    if (!result.success) {
      return { success: false, error: result.error.message };
    }

    // Update payment record status if one exists and is unpaid
    const paymentRepo = await makePaymentRepository();
    const payment = await paymentRepo.findByOrderId(orderId);
    if (payment && payment.status !== 'paid') {
      await paymentRepo.updatePaymentStatus(payment.id, 'failed');
    }

    if (shouldRevalidate) {
      try {
        revalidatePath("/profile");
        revalidatePath("/profile/orders");
        revalidatePath(`/profile/orders/${orderId}`);
        revalidatePath(`/orders/${orderId}/failed`);
      } catch {
        // Safe to ignore in active render contexts
      }
    }
    
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
  const adminResult = await isUserAdmin();
  if (!adminResult.success) {
    console.error('[Action Error] approveManualPaymentAction admin lookup failed:', adminResult.error);
    return { success: false, error: "Failed to verify permissions." };
  }
  if (!adminResult.data) return { success: false, error: "Access denied" };

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
    const userResult = await getCurrentUser();
    if (!userResult.success) {
      console.error('[Action Error] resendOrderEmailAction user lookup failed:', userResult.error);
      return { success: false, error: "Đã có lỗi xảy ra khi xác thực người dùng." };
    }
    const user = userResult.data;
    if (!user) {
      return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này." };
    }

    const adminResult = await isUserAdmin();
    if (!adminResult.success) {
      console.error('[Action Error] resendOrderEmailAction admin lookup failed:', adminResult.error);
      return { success: false, error: "Đã có lỗi xảy ra khi kiểm tra quyền người dùng." };
    }
    const admin = adminResult.data;
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

/**
 * Server action to retrieve pre-filled customer details for checkout.
 * Returns the authenticated user's fullName, email, and phone number (support contact handle).
 */
export async function getCustomerCheckoutInfoAction(): Promise<ActionResponse<{ fullName: string; email: string; phone: string } | null>> {
  try {
    const useCase = await makeGetCustomerCheckoutInfoUseCase();
    const result = await useCase.execute();

    if (!result.success) {
      return { success: false, error: result.error.message };
    }

    return { success: true, data: result.data };
  } catch (_error: unknown) {
    return { success: false, error: "Không thể tải thông tin khách hàng." };
  }
}

/**
 * Server action to retrieve purchased templates for the authenticated customer.
 */
export async function getUserPurchasedTemplatesAction(
  limit: number = 9,
  offset: number = 0,
  search?: string
): Promise<ActionResponse<UserPurchasedTemplatesResult>> {
  try {
    const userResult = await getCurrentUser();
    if (!userResult.success) {
      console.error('[Action Error] getUserPurchasedTemplatesAction user lookup failed:', userResult.error);
      return { success: false, error: "Đã có lỗi xảy ra khi xác thực người dùng." };
    }
    const user = userResult.data;
    if (!user) {
      return { success: false, error: "Yêu cầu đăng nhập để xem mã nguồn sở hữu." };
    }

    const useCase = await makeGetUserPurchasedTemplatesUseCase();
    const result = await useCase.execute({
      userId: user.id,
      limit,
      offset,
      search,
    });

    if (!result.success) {
      return { success: false, error: result.error.message };
    }

    return { success: true, data: result.data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Không thể tải danh sách mã nguồn đã mua."
    };
  }
}

/**
 * Server action to verify whether the authenticated customer has purchased a specific product.
 */
export async function checkProductPurchasedAction(productId: string): Promise<ActionResponse<boolean>> {
  try {
    const userResult = await getCurrentUser();
    if (!userResult.success) {
      console.error('[Action Error] checkProductPurchasedAction user lookup failed:', userResult.error);
      return { success: false, error: "Đã có lỗi xảy ra khi xác thực người dùng." };
    }
    const user = userResult.data;
    if (!user) {
      return { success: true, data: false };
    }

    const useCase = await makeCheckProductPurchasedUseCase();
    const result = await useCase.execute(user.id, productId);

    if (!result.success) {
      return { success: false, error: result.error.message };
    }

    return { success: true, data: result.data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Không thể kiểm tra trạng thái mua sản phẩm."
    };
  }
}


