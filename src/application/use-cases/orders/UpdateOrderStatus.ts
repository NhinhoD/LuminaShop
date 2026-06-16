import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { Order, OrderStatus } from '@/domain/entities/Order';
import { Result, ok, fail } from '@/domain/shared/Result';

export interface UpdateOrderStatusDTO {
  orderId: string;
  newStatus: OrderStatus;
  adminId: string; // To ensure only admins can update
}

export class UpdateOrderStatusUseCase {
  constructor(private orderRepo: IOrderRepository) {}

  async execute(data: UpdateOrderStatusDTO): Promise<Result<Order>> {
    try {
      const order = await this.orderRepo.findById(data.orderId);
      if (!order) {
        return fail(new Error('Order not found.'));
      }

      const currentStatus = order.status;
      const newStatus = data.newStatus;

      // State machine validation
      if (!this.isValidTransition(currentStatus, newStatus)) {
        return fail(new Error(`Invalid status transition from ${currentStatus} to ${newStatus}.`));
      }

      await this.orderRepo.updateStatus(data.orderId, newStatus);
      
      const updatedOrder = await this.orderRepo.findById(data.orderId);
      if (!updatedOrder) {
        return fail(new Error('Failed to retrieve updated order.'));
      }

      return ok(updatedOrder);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update order status.';
      return fail(new Error(message));
    }
  }

  private isValidTransition(current: OrderStatus, next: OrderStatus): boolean {
    if (current === next) return true;

    switch (current) {
      case OrderStatus.PENDING:
        return next === OrderStatus.COMPLETED || next === OrderStatus.CANCELLED;
      case OrderStatus.COMPLETED:
      case OrderStatus.CANCELLED:
        return false;
      default:
        return false;
    }
  }
}
