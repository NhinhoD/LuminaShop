import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { Order, OrderStatus } from '@/domain/entities/Order';
import { Result, ok, fail } from '@/domain/shared/Result';

export interface GetAllOrdersDTO {
  status?: OrderStatus;
  adminId: string; // Ensure only admins can call this
}

export class GetAllOrdersUseCase {
  constructor(private orderRepo: IOrderRepository) {}

  async execute(data: GetAllOrdersDTO): Promise<Result<Order[]>> {
    try {
      const orders = await this.orderRepo.findAll({ status: data.status });
      return ok(orders);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve orders.';
      return fail(new Error(message));
    }
  }
}
