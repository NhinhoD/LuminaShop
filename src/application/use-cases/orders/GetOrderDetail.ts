import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { Order } from '@/domain/entities/Order';
import { Result, ok, fail } from '@/domain/shared/Result';

export interface GetOrderDetailDTO {
  orderId: string;
  requesterId: string;
  isAdmin: boolean;
}

export class GetOrderDetailUseCase {
  constructor(private orderRepo: IOrderRepository) {}

  async execute(data: GetOrderDetailDTO): Promise<Result<Order>> {
    try {
      const order = await this.orderRepo.findById(data.orderId);
      if (!order) {
        return fail(new Error('Order not found.'));
      }

      // Security check: only owner or admin can view
      if (!data.isAdmin && order.userId !== data.requesterId) {
        return fail(new Error('Unauthorized to view this order.'));
      }

      return ok(order);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve order detail.';
      return fail(new Error(message));
    }
  }
}
