import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { IInventoryRepository } from '@/domain/repositories/IInventoryRepository';
import { Order, OrderStatus, ShippingAddress, PaymentMethod, PaymentStatus } from '@/domain/entities/Order';
import { Result, ok, fail } from '@/domain/shared/Result';

export interface CreateOrderDTO {
  userId: string;
  cartItems: any[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  notes?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export class CreateOrderUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private inventoryRepo: IInventoryRepository
  ) {}

  async execute(data: CreateOrderDTO): Promise<Result<Order>> {
    try {
      if (!data.cartItems || data.cartItems.length === 0) {
        return fail(new Error('Giỏ hàng trống.'));
      }

      // 1. Validate inventory for all items
      for (const item of data.cartItems) {
        let inventoryItem;
        if (item.variantId) {
          inventoryItem = await this.inventoryRepo.findByVariantId(item.variantId);
        } else {
          inventoryItem = await this.inventoryRepo.findBaseInventoryByProductId(item.productId);
        }

        if (!inventoryItem) {
          const name = item.variantName ? `${item.title || ''} - ${item.variantName}` : (item.title || '');
          return fail(new Error(`Không tìm thấy tồn kho cho sản phẩm ${name} (PID: ${item.productId}, VID: ${item.variantId}).`));
        }

        if (inventoryItem.available < item.quantity) {
          const name = item.variantName ? `${item.title || ''} - ${item.variantName}` : (item.title || '');
          return fail(new Error(`Sản phẩm ${name} không đủ hàng. (Yêu cầu: ${item.quantity}, Có sẵn: ${inventoryItem.available})`));
        }
      }

      // 2. Calculate total amount
      const totalAmount = data.cartItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
      
      // 3. Map to OrderItems with productSnapshot
      const orderItems = data.cartItems.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        priceAtPurchase: item.price || 0,
        productSnapshot: {
          title: item.title,
          image: item.imageUrl,
          variantName: item.variantName
        }
      }));

      // 4. Create order
      const order = await this.orderRepo.create({
        userId: data.userId,
        totalAmount,
        shippingAddress: data.shippingAddress,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone || data.shippingAddress.phone,
        paymentMethod: data.paymentMethod,
        paymentStatus: 'unpaid',
        status: OrderStatus.PENDING,
        notes: data.notes
      }, orderItems);

      // 5. Update inventory (deduct/reserve)
      for (const item of data.cartItems) {
        let inventoryItem;
        if (item.variantId) {
          inventoryItem = await this.inventoryRepo.findByVariantId(item.variantId);
        } else {
          inventoryItem = await this.inventoryRepo.findBaseInventoryByProductId(item.productId);
        }

        if (inventoryItem) {
          await this.inventoryRepo.reserve(inventoryItem.id, item.quantity);
        }
      }

      return ok(order);
    } catch (error: any) {
      console.error('CreateOrderUseCase Error:', error);
      return fail(new Error('Đã có lỗi xảy ra khi đặt hàng.'));
    }
  }
}
