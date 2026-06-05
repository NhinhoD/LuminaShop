import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { Order } from '@/domain/entities/Order';
import { Result, ok, fail } from '@/domain/shared/Result';

export interface GetUserOrdersDTO {
  userId: string;
  limit?: number;
  offset?: number;
}

export class GetUserOrdersUseCase {
  constructor(private orderRepo: IOrderRepository) {}

  async execute(data: GetUserOrdersDTO): Promise<Result<{ orders: Order[], total: number }>> {
    try {
      const result = await this.orderRepo.findByUserId(data.userId, { limit: data.limit, offset: data.offset });
      return ok(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve user orders.';
      return fail(new Error(message));
    }
  }
}
