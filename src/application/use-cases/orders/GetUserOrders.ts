import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { Order } from '@/domain/entities/Order';
import { Result, ok, fail } from '@/domain/shared/Result';

export interface GetUserOrdersDTO {
  userId: string;
}

export class GetUserOrdersUseCase {
  constructor(private orderRepo: IOrderRepository) {}

  async execute(data: GetUserOrdersDTO): Promise<Result<Order[]>> {
    try {
      const orders = await this.orderRepo.findByUserId(data.userId);
      return ok(orders);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve user orders.';
      return fail(new Error(message));
    }
  }
}
