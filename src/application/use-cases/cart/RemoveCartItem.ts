import { ICartRepository } from '@/domain/repositories/ICartRepository';
import { Result, ok, fail } from '@/domain/shared/Result';

export interface RemoveCartItemDTO {
  userId: string;
  itemId: string;
}

/**
 * Use case to remove an item from the user's cart.
 * Validates ownership to protect against IDOR (CWE-639).
 */
export class RemoveCartItemUseCase {
  constructor(private cartRepo: ICartRepository) {}

  /**
   * Executes cart item removal after verifying cart ownership.
   *
   * @param dto - Object containing userId and itemId to remove.
   * @returns Result indicating success or error.
   */
  async execute(dto: RemoveCartItemDTO): Promise<Result<void>> {
    try {
      const cart = await this.cartRepo.findByUserId(dto.userId);
      if (!cart) {
        return fail(new Error('Không tìm thấy giỏ hàng của bạn.'));
      }

      // IDOR Defense: verify that itemId actually belongs to this user's cart
      const itemExists = cart.items.some(item => item.id === dto.itemId);
      if (!itemExists) {
        return fail(new Error('Sản phẩm không thuộc giỏ hàng của bạn.'));
      }

      await this.cartRepo.removeItem(dto.itemId);
      return ok(undefined);
    } catch (error: unknown) {
      console.error('RemoveCartItemUseCase Error:', error);
      return fail(new Error('Không thể xóa sản phẩm khỏi giỏ hàng.'));
    }
  }
}
