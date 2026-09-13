import { IOrderRepository, UserPurchasedTemplatesResult } from '@/domain/repositories/IOrderRepository';
import { Result, ok, fail } from '@/domain/shared/Result';

export interface GetUserPurchasedTemplatesDTO {
  userId: string;
  limit?: number;
  offset?: number;
  search?: string;
}

export class GetUserPurchasedTemplatesUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(dto: GetUserPurchasedTemplatesDTO): Promise<Result<UserPurchasedTemplatesResult>> {
    try {
      if (!dto.userId) {
        return fail(new Error('User ID is required'));
      }

      const result = await this.orderRepository.findUserPurchasedTemplates(dto.userId, {
        limit: dto.limit,
        offset: dto.offset,
        search: dto.search,
      });

      return ok(result);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Failed to retrieve purchased templates'));
    }
  }
}
