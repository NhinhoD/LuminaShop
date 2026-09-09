import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ProcessPaymentUseCase } from './ProcessPayment';
import { Order, OrderStatus, PaymentMethod } from '@/domain/entities/Order';
import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { IPaymentGateway, PaymentResult } from '@/domain/repositories/IPaymentGateway';

function createMockOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-test-123',
    userId: 'user-test-456',
    status: OrderStatus.PENDING,
    paymentMethod: PaymentMethod.PAYOS,
    paymentStatus: 'unpaid',
    totalAmount: 50000,
    shippingAddress: {
      fullName: 'John Doe',
      phone: '0901234567',
      street: 'Street',
      district: 'District',
      city: 'City',
      ward: 'Ward',
    },
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('ProcessPaymentUseCase - Error Sanitization & CWE-209 Defense', () => {
  it('sanitizes unexpected database error from orderRepo.findById and returns safe generic message', async () => {
    const distinctiveSecret = 'DISTINCTIVE_DATABASE_CRASH_SECRET_PASSWORD_123';
    const mockOrderRepo: Partial<IOrderRepository> = {
      findById: async () => {
        throw new Error(distinctiveSecret);
      },
      updatePaymentStatus: async () => {},
    };

    const mockGateway: IPaymentGateway = {
      processPayment: async () => ({ success: true, paymentId: 'pay-1', message: 'Success' }),
    };

    const useCase = new ProcessPaymentUseCase(mockGateway, mockOrderRepo as IOrderRepository);
    const result = await useCase.execute({
      orderId: 'order-test-123',
      amount: 50000,
      method: 'payos',
      userId: 'user-test-456',
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.message, 'Payment processing failed.');
    assert.strictEqual(result.message.includes(distinctiveSecret), false, 'Must not leak distinctive database error');
  });

  it('sanitizes unexpected payment gateway error and returns safe generic message', async () => {
    const distinctiveSecret = 'DISTINCTIVE_GATEWAY_CREDENTIAL_LEAK_SECRET_456';
    const existingOrder = createMockOrder();

    const mockOrderRepo: Partial<IOrderRepository> = {
      findById: async () => existingOrder,
      updatePaymentStatus: async () => {},
    };

    const mockGateway: IPaymentGateway = {
      processPayment: async () => {
        throw new Error(distinctiveSecret);
      },
    };

    const useCase = new ProcessPaymentUseCase(mockGateway, mockOrderRepo as IOrderRepository);
    const result = await useCase.execute({
      orderId: 'order-test-123',
      amount: 50000,
      method: 'payos',
      userId: 'user-test-456',
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.message, 'Payment processing failed.');
    assert.strictEqual(result.message.includes(distinctiveSecret), false, 'Must not leak gateway credential error');
  });

  it('sanitizes unexpected error during orderRepo.updatePaymentStatus and returns safe generic message', async () => {
    const distinctiveSecret = 'DISTINCTIVE_UPDATE_ORDER_INTERNAL_STACK_789';
    const existingOrder = createMockOrder();

    const mockOrderRepo: Partial<IOrderRepository> = {
      findById: async () => existingOrder,
      updatePaymentStatus: async () => {
        throw new Error(distinctiveSecret);
      },
    };

    const mockGateway: IPaymentGateway = {
      processPayment: async () => ({ success: true, paymentId: 'pay-ok', message: 'Success' }),
    };

    const useCase = new ProcessPaymentUseCase(mockGateway, mockOrderRepo as IOrderRepository);
    const result = await useCase.execute({
      orderId: 'order-test-123',
      amount: 50000,
      method: 'payos',
      userId: 'user-test-456',
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.message, 'Payment processing failed.');
    assert.strictEqual(result.message.includes(distinctiveSecret), false, 'Must not leak order update error');
  });

  it('successfully returns gateway result when payment succeeds without unexpected error', async () => {
    const existingOrder = createMockOrder();

    const mockOrderRepo: Partial<IOrderRepository> = {
      findById: async () => existingOrder,
      updatePaymentStatus: async () => {},
    };

    const expectedResult: PaymentResult = {
      success: true,
      paymentId: 'pay-success-999',
      message: 'Payment link generated',
      checkoutUrl: 'https://payos.vn/test-checkout',
    };

    const mockGateway: IPaymentGateway = {
      processPayment: async () => expectedResult,
    };

    const useCase = new ProcessPaymentUseCase(mockGateway, mockOrderRepo as IOrderRepository);
    const result = await useCase.execute({
      orderId: 'order-test-123',
      amount: 50000,
      method: 'payos',
      userId: 'user-test-456',
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.paymentId, 'pay-success-999');
    assert.strictEqual(result.checkoutUrl, 'https://payos.vn/test-checkout');
  });
});
