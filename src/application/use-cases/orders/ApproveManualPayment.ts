import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { Order } from '@/domain/entities/Order';
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

      const updatedOrder = await this.orderRepo.findById(orderId);
      if (!updatedOrder) {
        return fail(new Error('Không tìm thấy đơn hàng sau cập nhật.'));
      }

      // Auto-trigger license key & fulfillment email on approval
      if (this.sendOrderEmailUseCase) {
        try {
          await this.sendOrderEmailUseCase.execute(orderId);
        } catch {
          // Non-blocking: payment status is already updated
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
