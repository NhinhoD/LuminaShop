import { ICartRepository } from '@/domain/repositories/ICartRepository';
import { CartItem } from '@/domain/entities/Cart';
import { Result, ok, fail } from '@/domain/shared/Result';

export class MergeCartUseCase {
  constructor(private cartRepo: ICartRepository) {}

  async execute(userId: string, localItems: Omit<CartItem, 'id' | 'cartId'>[]): Promise<Result<void>> {
    try {
      if (localItems.length === 0) return ok(undefined);

      let cart = await this.cartRepo.findByUserId(userId);
      if (!cart) {
        cart = await this.cartRepo.create(userId);
      }

      for (const item of localItems) {
        const existingItem = cart.items.find(i => 
          i.productId === item.productId && i.variantId === item.variantId
        );

        if (existingItem) {
          await this.cartRepo.updateItem(existingItem.id, existingItem.quantity + item.quantity);
        } else {
          await this.cartRepo.addItem(cart.id, {
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity
          });
        }
      }

      return ok(undefined);
    } catch (error: unknown) {
      console.error('MergeCartUseCase Error:', error);
      return fail(new Error('Lỗi khi đồng bộ giỏ hàng.'));
    }
  }
}
