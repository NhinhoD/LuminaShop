import { Order, OrderStatus } from '../entities/Order';

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  findAll(filters?: { status?: OrderStatus }): Promise<Order[]>;
  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'items'>, items: Omit<OrderItem, 'id' | 'orderId'>[]): Promise<Order>;
  updateStatus(id: string, status: OrderStatus): Promise<void>;
}
