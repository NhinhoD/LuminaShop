import { ICartRepository } from '@/domain/repositories/ICartRepository';
import { Cart } from '@/domain/entities/Cart';
import { Result, ok, fail } from '@/domain/shared/Result';

/**
 * Use case to retrieve the cart for an authenticated user.
 */
export class GetCartUseCase {
  constructor(private cartRepo: ICartRepository) {}

  /**
   * Retrieves the cart for the given user ID.
   *
   * @param userId - The authenticated user's ID.
   * @returns Result containing the Cart or null if none exists.
   */
  async execute(userId: string): Promise<Result<Cart | null>> {
    try {
      const cart = await this.cartRepo.findByUserId(userId);
      return ok(cart);
    } catch (error: unknown) {
      console.error('GetCartUseCase Error:', error);
      return fail(new Error('Không thể tải thông tin giỏ hàng.'));
    }
  }
}
