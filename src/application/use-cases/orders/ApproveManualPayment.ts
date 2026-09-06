import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { Order, OrderStatus } from '@/domain/entities/Order';
import { SendOrderConfirmationEmailUseCase } from './SendOrderConfirmationEmail';
import { Result, ok, fail } from '@/domain/shared/Result';

export class ApproveManualPaymentUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private sendOrderEmailUseCase?: SendOrderConfirmationEmailUseCase
  ) {}

  async execute(orderId: string): Promise<Result<Order>> {
    try {
      const order = await this.orderRepo.findById(orderId);
      if (!order) {
        return fail(new Error('Không tìm thấy đơn hàng.'));
      }

      await this.orderRepo.updatePaymentStatus(orderId, 'paid');
      await this.orderRepo.updateStatus(orderId, OrderStatus.COMPLETED);

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
