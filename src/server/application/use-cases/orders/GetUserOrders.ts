import { IOrderRepository } from '@/server/domain/repositories/IOrderRepository';
import { Order } from '@/server/domain/entities/Order';
import { Result, ok, fail } from '@/server/domain/shared/Result';

export interface GetUserOrdersDTO {
  userId: string;
  limit?: number;
  offset?: number;
  search?: string;
}

/**
 * Use case to retrieve orders belonging to an authenticated customer.
 */
export class GetUserOrdersUseCase {
  constructor(private orderRepo: IOrderRepository) {}

  /**
   * Retrieves paginated orders for a user with optional search filtering.
   *
   * @param data - The user ID, pagination limit, offset, and optional search term.
   * @returns A Result containing orders and the total count.
   */
  async execute(data: GetUserOrdersDTO): Promise<Result<{ orders: Order[], total: number }>> {
    try {
      const result = await this.orderRepo.findByUserId(data.userId, {
        limit: data.limit,
        offset: data.offset,
        search: data.search
      });
      return ok(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve user orders.';
      return fail(new Error(message));
    }
  }
}
