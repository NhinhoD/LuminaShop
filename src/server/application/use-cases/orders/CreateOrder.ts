import { IOrderRepository } from '@/server/domain/repositories/IOrderRepository';
import { IProductRepository } from '@/server/domain/repositories/IProductRepository';
import { Order, OrderStatus, OrderItem, ShippingAddress, PaymentMethod } from '@/server/domain/entities/Order';
import { Result, ok, fail } from '@/server/domain/shared/Result';

export interface CartItemDTO {
  productId: string;
  variantId?: string;
  quantity: number;
  /** Client-supplied price. Never trusted server-side; kept only for wire compatibility. */
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
    private orderRepo: IOrderRepository,
    private productRepo: IProductRepository
  ) {}

  async execute(data: CreateOrderDTO): Promise<Result<Order>> {
    try {
      if (!data.cartItems || data.cartItems.length === 0) {
        return fail(new Error('Giỏ hàng trống.'));
      }

      // Recompute every price and the total from the database. The client's
      // `price` field is ignored to prevent price tampering (CWE-472).
      let totalAmount = 0;
      const orderItems: Omit<OrderItem, 'id' | 'orderId'>[] = [];

      for (const item of data.cartItems) {
        const product = await this.productRepo.findById(item.productId);
        if (!product || !product.isActive) {
          return fail(new Error('Sản phẩm không tồn tại hoặc đã ngừng bán.'));
        }

        const quantity = Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1;

        let unitPrice = product.price;
        let variantName = item.variantName;

        if (item.variantId) {
          const variant = product.variants?.find((candidate) => candidate.id === item.variantId);
          if (!variant) {
            return fail(new Error('Phiên bản sản phẩm không hợp lệ.'));
          }
          unitPrice += variant.priceAdjustment;
          variantName = variant.name;
        }

        if (!Number.isFinite(unitPrice) || unitPrice < 0) {
          return fail(new Error('Giá sản phẩm không hợp lệ.'));
        }

        totalAmount += unitPrice * quantity;

        orderItems.push({
          productId: product.id,
          variantId: item.variantId,
          quantity,
          priceAtPurchase: unitPrice,
          productSnapshot: {
            title: product.title?.vi || product.title?.en || item.title,
            image: product.imageUrl ?? item.imageUrl,
            variantName
          }
        });
      }

      // The repository calls an atomic RPC that re-validates stock, recomputes
      // the authoritative total, and inserts order + items in one transaction.
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
      const message = error instanceof Error ? error.message : '';
      if (message.includes('Insufficient stock')) {
        return fail(new Error('Sản phẩm đã hết hàng.'));
      }
      if (message.includes('unavailable') || message.includes('not found')) {
        return fail(new Error('Sản phẩm không còn khả dụng.'));
      }
      return fail(new Error('Không thể tạo đơn hàng. Vui lòng thử lại.'));
    }
  }
}
