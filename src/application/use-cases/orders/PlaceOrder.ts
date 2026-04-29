import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { ICartRepository } from '@/domain/repositories/ICartRepository';
import { IInventoryRepository } from '@/domain/repositories/IInventoryRepository';
import { Order, OrderStatus } from '@/domain/entities/Order';
import { Result, ok, fail } from '@/domain/shared/Result';

export interface PlaceOrderDTO {
  userId: string;
  shippingAddress: string;
  contactPhone: string;
  paymentMethod: string;
}

export class PlaceOrderUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private cartRepo: ICartRepository,
    private inventoryRepo: IInventoryRepository
  ) {}

  async execute(data: PlaceOrderDTO): Promise<Result<Order>> {
    try {
      // 1. Get user cart
      const cart = await this.cartRepo.findByUserId(data.userId);
      if (!cart || cart.items.length === 0) {
        return fail(new Error('Giỏ hàng trống.'));
      }

      // 2. Validate inventory for all items
      for (const item of cart.items) {
        let inventoryItem;
        if (item.variantId) {
          inventoryItem = await this.inventoryRepo.findByVariantId(item.variantId);
        } else {
          inventoryItem = await this.inventoryRepo.findByProductId(item.productId);
          // findByProductId returns an array, we need the base product item
          inventoryItem = inventoryItem.find(i => !i.variantId);
        }

        if (!inventoryItem || inventoryItem.available < item.quantity) {
          return fail(new Error(`Sản phẩm ${item.productTitle || ''} không đủ hàng.`));
        }
      }

      // 3. Create order
      const totalAmount = cart.items.reduce((acc, item) => acc + (item.productPrice || 0) * item.quantity, 0);
      
      const orderItems = cart.items.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        priceAtPurchase: item.productPrice || 0
      }));

      const order = await this.orderRepo.create({
        userId: data.userId,
        totalAmount,
        shippingAddress: data.shippingAddress,
        contactPhone: data.contactPhone,
        paymentMethod: data.paymentMethod,
        paymentStatus: 'unpaid',
        status: OrderStatus.PENDING
      }, orderItems);

      // 4. Update inventory (deduct/reserve)
      for (const item of cart.items) {
        let inventoryItem;
        if (item.variantId) {
          inventoryItem = await this.inventoryRepo.findByVariantId(item.variantId);
        } else {
          const items = await this.inventoryRepo.findByProductId(item.productId);
          inventoryItem = items.find(i => !i.variantId);
        }

        if (inventoryItem) {
          // For now, we deduct directly or reserve. 
          // Usually PENDING orders reserve stock.
          await this.inventoryRepo.reserve(inventoryItem.id, item.quantity);
        }
      }

      // 5. Clear cart
      await this.cartRepo.clear(cart.id);

      return ok(order);
    } catch (error: any) {
      console.error('PlaceOrderUseCase Error:', error);
      return fail(new Error('Đã có lỗi xảy ra khi đặt hàng.'));
    }
  }
}
