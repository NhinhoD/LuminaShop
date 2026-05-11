import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { Order, OrderStatus, ShippingAddress, PaymentMethod } from '@/domain/entities/Order';
import { Result, ok, fail } from '@/domain/shared/Result';

export interface CartItemDTO {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  title: string;
  imageUrl?: string;
  variantName?: string;
}

export interface CreateOrderDTO {
  userId: string;
  cartItems: CartItemDTO[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  notes?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export class CreateOrderUseCase {
  constructor(
    private orderRepo: IOrderRepository
  ) {}

  async execute(data: CreateOrderDTO): Promise<Result<Order>> {
    try {
      if (!data.cartItems || data.cartItems.length === 0) {
        return fail(new Error('Giỏ hàng trống.'));
      }

      // 1. Calculate total amount
      const totalAmount = data.cartItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
      
      // 2. Map to OrderItems with productSnapshot
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

      // 3. Create order
      // The repository now calls an atomic RPC that handles:
      // - Real-time stock validation with row-level locking
      // - Order and items insertion
      // - Immediate stock deduction from quantity
      // - Automatic sync to products/variants via DB triggers
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

      return ok(order);
    } catch (error: unknown) {
      console.error('CreateOrderUseCase Error:', error);
      const message = error instanceof Error ? error.message : 'Đã có lỗi xảy ra khi đặt hàng.';
      return fail(new Error(message));
    }
  }
}
