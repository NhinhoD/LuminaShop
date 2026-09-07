import { ICartRepository } from '@/domain/repositories/ICartRepository';
import { Result, ok, fail } from '@/domain/shared/Result';

export interface UpdateCartItemDTO {
  userId: string;
  itemId: string;
  quantity: number;
}

/**
 * Use case to update the quantity of an item in the user's cart.
 * Validates ownership to protect against IDOR (CWE-639).
 */
export class UpdateCartItemUseCase {
  constructor(private cartRepo: ICartRepository) {}

  /**
   * Executes cart item quantity update after verifying cart ownership.
   *
   * @param dto - Object containing userId, itemId, and target quantity.
   * @returns Result indicating success or error.
   */
  async execute(dto: UpdateCartItemDTO): Promise<Result<void>> {
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

      // Validate quantity as finite integer
      if (!Number.isFinite(dto.quantity) || (dto.quantity > 0 && !Number.isInteger(dto.quantity))) {
        return fail(new Error('Số lượng sản phẩm không hợp lệ.'));
      }

      if (dto.quantity <= 0) {
        await this.cartRepo.removeItem(dto.itemId);
      } else {
        // Enforce digital asset quantity limit of 1
        const safeQuantity = Math.min(dto.quantity, 1);
        await this.cartRepo.updateItem(dto.itemId, safeQuantity);
      }

      return ok(undefined);
    } catch (error: unknown) {
      console.error('UpdateCartItemUseCase Error:', error);
      return fail(new Error('Không thể cập nhật số lượng sản phẩm.'));
    }
  }
}
