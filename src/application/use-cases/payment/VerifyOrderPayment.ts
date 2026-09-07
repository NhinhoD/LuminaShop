import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { IPaymentRepository } from '@/domain/repositories/IPaymentRepository';
import { IPaymentGateway } from '@/domain/repositories/IPaymentGateway';
import { OrderStatus } from '@/domain/entities/Order';
import { SendOrderConfirmationEmailUseCase } from '@/application/use-cases/orders/SendOrderConfirmationEmail';

/**
 * Use case to verify payment status of an order with payment gateways (e.g. PayOS).
 * Protects against IDOR, guards against invalid state transitions for cancelled orders,
 * and ensures idempotent fulfillment delivery.
 */
export class VerifyOrderPaymentUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private paymentRepo: IPaymentRepository,
    private payosGateway: IPaymentGateway,
    private sendOrderEmailUseCase?: SendOrderConfirmationEmailUseCase
  ) {}

  /**
   * Executes payment status verification for a specific order.
   *
   * @param orderId - The unique ID of the order to verify.
   * @param userId - The authenticated user ID requesting verification (IDOR protection).
   * @returns An object with success status and descriptive message.
   */
  async execute(orderId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const order = await this.orderRepo.findById(orderId);
      if (!order) return { success: false, message: 'Order not found' };

      // Security: Validate order ownership (IDOR defense - CWE-639)
      if (order.userId !== userId) {
        return { success: false, message: 'Bạn không có quyền truy cập đơn hàng này.' };
      }

      // State integrity: Cancelled orders cannot be verified or reconciled
      if (order.status === OrderStatus.CANCELLED) {
        return { success: false, message: 'Đơn hàng đã bị hủy.' };
      }

      // Reconciliation: Only reconcile paid orders that are in PENDING status
      if (order.paymentStatus === 'paid') {
        if (order.status === OrderStatus.PENDING) {
          await this.orderRepo.updateStatus(orderId, OrderStatus.COMPLETED);
        }
        return { success: true, message: 'Already paid' };
      }

      const payment = await this.paymentRepo.findByOrderId(orderId);
      if (!payment) return { success: false, message: 'Payment record not found' };

      // Only PayOS needs this online sync
      if (payment.method === 'payos' && payment.transactionId) {
        if (this.payosGateway.verifyPayment) {
          const verifyResult = await this.payosGateway.verifyPayment(payment.transactionId);
          if (verifyResult.success) {
            await this.paymentRepo.updatePaymentStatus(payment.id, 'paid');
            // updatePaymentStatus('paid') atomically sets status: 'completed' in one operation
            await this.orderRepo.updatePaymentStatus(orderId, 'paid');

            // Trigger automated license key & digital fulfillment delivery email
            if (this.sendOrderEmailUseCase) {
              try {
                const emailResult = await this.sendOrderEmailUseCase.execute(orderId);
                if (!emailResult.success) {
                  console.error(`[VerifyOrderPayment] Gửi email fulfillment thất bại cho đơn ${orderId}:`, emailResult.error.message);
                }
              } catch (emailErr) {
                console.error(`[VerifyOrderPayment] Ngoại lệ khi gửi email fulfillment cho đơn ${orderId}:`, emailErr);
              }
            }

            return { success: true, message: 'Payment verified successfully' };
          }
          return verifyResult;
        }
      }

      return { success: false, message: 'Payment is not PAID yet or unsupported method' };
    } catch (error: unknown) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
