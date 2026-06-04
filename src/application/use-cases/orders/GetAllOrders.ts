import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { Order, OrderStatus } from '@/domain/entities/Order';
import { Result, ok, fail } from '@/domain/shared/Result';

export interface GetAllOrdersDTO {
  status?: OrderStatus;
  adminId: string; // Ensure only admins can call this
  limit?: number;
  offset?: number;
}

export class GetAllOrdersUseCase {
  constructor(private orderRepo: IOrderRepository) {}

  async execute(data: GetAllOrdersDTO): Promise<Result<{ orders: Order[], total: number }>> {
    try {
      const result = await this.orderRepo.findAll({ status: data.status, limit: data.limit, offset: data.offset });
      return ok(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve orders.';
      return fail(new Error(message));
    }
  }
}
