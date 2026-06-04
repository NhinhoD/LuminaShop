import { Order, OrderStatus, OrderItem, PaymentStatus } from '../entities/Order';

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string, filters?: { limit?: number; offset?: number }): Promise<{ orders: Order[], total: number }>;
  findAll(filters?: { status?: OrderStatus; limit?: number; offset?: number }): Promise<{ orders: Order[], total: number }>;
  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'items'>, items: Omit<OrderItem, 'id' | 'orderId'>[]): Promise<Order>;
  updateStatus(id: string, status: OrderStatus): Promise<void>;
  updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<void>;
}
