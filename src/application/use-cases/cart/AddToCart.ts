import { ICartRepository } from '@/domain/repositories/ICartRepository';
import { Result, ok, fail } from '@/domain/shared/Result';

export class AddToCartUseCase {
  constructor(private cartRepo: ICartRepository) {}

  async execute(userId: string, item: { productId: string, variantId?: string, quantity: number }): Promise<Result<void>> {
    try {
      let cart = await this.cartRepo.findByUserId(userId);
      if (!cart) {
        cart = await this.cartRepo.create(userId);
      }

      // Check if item already exists in cart to increment quantity
      const existingItem = cart.items.find(i => 
        i.productId === item.productId && i.variantId === item.variantId
      );

      if (existingItem) {
        await this.cartRepo.updateItem(existingItem.id, existingItem.quantity + item.quantity);
      } else {
        await this.cartRepo.addItem(cart.id, item);
      }

      return ok(undefined);
    } catch (error: any) {
      console.error('AddToCartUseCase Error:', error);
      return fail(new Error('Không thể thêm sản phẩm vào giỏ hàng.'));
    }
  }
}
