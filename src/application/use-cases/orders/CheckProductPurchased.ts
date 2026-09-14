import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { Result, ok, fail } from '@/domain/shared/Result';

export class CheckProductPurchasedUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(userId: string, productId: string): Promise<Result<boolean>> {
    try {
      if (!userId || !productId) {
        return ok(false);
      }
      const hasPurchased = await this.orderRepository.hasPurchasedProduct(userId, productId);
      return ok(hasPurchased);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Failed to verify product purchase status'));
    }
  }
}
