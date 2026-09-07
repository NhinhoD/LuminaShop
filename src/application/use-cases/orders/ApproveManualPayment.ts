import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { Order } from '@/domain/entities/Order';
import { SendOrderConfirmationEmailUseCase } from './SendOrderConfirmationEmail';
import { Result, ok, fail } from '@/domain/shared/Result';

/**
 * Use case for admin approval of manual payments (e.g. COD / Bank Transfer).
 * Atomically marks order as paid and completed, and triggers fulfillment email.
 */
export class ApproveManualPaymentUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private sendOrderEmailUseCase?: SendOrderConfirmationEmailUseCase
  ) {}

  /**
   * Approves a manual payment for an order.
   *
   * @param orderId - The unique ID of the order being approved.
   * @returns A Result containing the updated Order entity or an Error.
   */
  async execute(orderId: string): Promise<Result<Order>> {
    try {
      const order = await this.orderRepo.findById(orderId);
      if (!order) {
        return fail(new Error('Không tìm thấy đơn hàng.'));
      }

      // updatePaymentStatus('paid') atomically marks status as 'completed'
      await this.orderRepo.updatePaymentStatus(orderId, 'paid');

      const updatedOrder = await this.orderRepo.findById(orderId);
      if (!updatedOrder) {
        return fail(new Error('Không tìm thấy đơn hàng sau cập nhật.'));
      }

      // Auto-trigger license key & fulfillment email on approval
      if (this.sendOrderEmailUseCase) {
        try {
          const emailResult = await this.sendOrderEmailUseCase.execute(orderId);
          if (!emailResult.success) {
            console.error(`[ApproveManualPayment] Gửi email fulfillment thất bại cho đơn ${orderId}:`, emailResult.error.message);
          }
        } catch (emailErr) {
          console.error(`[ApproveManualPayment] Ngoại lệ khi gửi email fulfillment cho đơn ${orderId}:`, emailErr);
        }
      }

      return ok(updatedOrder);
    } catch (error) {
      return fail(
        error instanceof Error ? error : new Error('Không thể phê duyệt thanh toán.')
      );
    }
  }
}
