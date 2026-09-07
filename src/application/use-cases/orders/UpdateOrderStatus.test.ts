import { describe, it } from 'node:test';
import assert from 'node:assert';
import { UpdateOrderStatusUseCase } from './UpdateOrderStatus';
import { Order, OrderStatus, PaymentMethod } from '@/domain/entities/Order';
import { IOrderRepository } from '@/domain/repositories/IOrderRepository';

function createMockOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-123',
    userId: 'user-456',
    status: OrderStatus.PENDING,
    paymentMethod: PaymentMethod.PAYOS,
    paymentStatus: 'unpaid',
    totalAmount: 100000,
    shippingAddress: {
      fullName: 'Test User',
      phone: '0901234567',
      street: '123 Street',
      district: 'District 1',
      city: 'Hanoi',
      ward: 'Ward 1',
    },
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('UpdateOrderStatusUseCase', () => {
  it('returns ok(order) as an idempotent no-op when order is already CANCELLED', async () => {
    let cancelPendingOrderCalled = false;
    const existingOrder = createMockOrder({ status: OrderStatus.CANCELLED });

    const mockRepo: Partial<IOrderRepository> = {
      findById: async () => existingOrder,
      cancelPendingOrder: async () => {
        cancelPendingOrderCalled = true;
        return true;
      },
      updateStatus: async () => {},
    };

    const useCase = new UpdateOrderStatusUseCase(mockRepo as IOrderRepository);
    const result = await useCase.execute({
      orderId: 'order-123',
      newStatus: OrderStatus.CANCELLED,
      adminId: 'user-456',
    });

    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data.status, OrderStatus.CANCELLED);
    }
    assert.strictEqual(cancelPendingOrderCalled, false, 'cancelPendingOrder should NOT be called when already CANCELLED');
  });

  it('atomically cancels pending unpaid order', async () => {
    let cancelPendingOrderCalled = false;
    const pendingOrder = createMockOrder({ status: OrderStatus.PENDING, paymentStatus: 'unpaid' });
    const cancelledOrder = createMockOrder({ status: OrderStatus.CANCELLED, paymentStatus: 'unpaid' });

    let fetchCount = 0;
    const mockRepo: Partial<IOrderRepository> = {
      findById: async () => {
        fetchCount++;
        return fetchCount === 1 ? pendingOrder : cancelledOrder;
      },
      cancelPendingOrder: async () => {
        cancelPendingOrderCalled = true;
        return true;
      },
    };

    const useCase = new UpdateOrderStatusUseCase(mockRepo as IOrderRepository);
    const result = await useCase.execute({
      orderId: 'order-123',
      newStatus: OrderStatus.CANCELLED,
      adminId: 'user-456',
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(cancelPendingOrderCalled, true);
    if (result.success) {
      assert.strictEqual(result.data.status, OrderStatus.CANCELLED);
    }
  });

  it('rejects cancellation when order is already paid', async () => {
    const paidOrder = createMockOrder({ status: OrderStatus.PENDING, paymentStatus: 'paid' });

    const mockRepo: Partial<IOrderRepository> = {
      findById: async () => paidOrder,
      cancelPendingOrder: async () => true,
    };

    const useCase = new UpdateOrderStatusUseCase(mockRepo as IOrderRepository);
    const result = await useCase.execute({
      orderId: 'order-123',
      newStatus: OrderStatus.CANCELLED,
      adminId: 'user-456',
    });

    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.match(result.error.message, /Không thể hủy đơn hàng đã thanh toán/);
    }
  });

  it('rejects invalid status transition (e.g. COMPLETED to PENDING)', async () => {
    const completedOrder = createMockOrder({ status: OrderStatus.COMPLETED });

    const mockRepo: Partial<IOrderRepository> = {
      findById: async () => completedOrder,
    };

    const useCase = new UpdateOrderStatusUseCase(mockRepo as IOrderRepository);
    const result = await useCase.execute({
      orderId: 'order-123',
      newStatus: OrderStatus.PENDING,
      adminId: 'admin-1',
    });

    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.match(result.error.message, /Invalid status transition/);
    }
  });
});
