import { Order, OrderStatus, OrderItem, PaymentStatus } from '../entities/Order';
import { Product } from '../entities/Product';

export interface PurchasedTemplateItem {
  id: string;
  productId: string;
  priceAtPurchase: number;
  createdAt: Date;
  orderId: string;
  orderCreatedAt?: Date;
  product: Product;
}

export interface UserPurchasedTemplatesResult {
  items: PurchasedTemplateItem[];
  total: number;
}

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string, filters?: { limit?: number; offset?: number; search?: string }): Promise<{ orders: Order[], total: number }>;
  findAll(filters?: { status?: OrderStatus; limit?: number; offset?: number; search?: string }): Promise<{ orders: Order[], total: number }>;
  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'items'>, items: Omit<OrderItem, 'id' | 'orderId'>[]): Promise<Order>;
  updateStatus(id: string, status: OrderStatus): Promise<void>;
  updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<void>;
  hasPurchasedProduct(userId: string, productId: string): Promise<boolean>;
  cancelPendingOrder(id: string): Promise<boolean>;
  findUserPurchasedTemplates(userId: string, options?: { limit?: number; offset?: number; search?: string }): Promise<UserPurchasedTemplatesResult>;
}

