import { describe, it } from 'node:test';
import assert from 'node:assert';
import { VerifyOrderPaymentUseCase } from './VerifyOrderPayment';
import { Order, OrderStatus, PaymentMethod } from '@/domain/entities/Order';
import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { IPaymentRepository, Payment } from '@/domain/repositories/IPaymentRepository';
import { IPaymentGateway } from '@/domain/repositories/IPaymentGateway';

function createMockOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-test-verify-123',
    userId: 'user-test-verify-456',
    status: OrderStatus.PENDING,
    paymentMethod: PaymentMethod.PAYOS,
    paymentStatus: 'unpaid',
    totalAmount: 120000,
    shippingAddress: {
      fullName: 'Jane Doe',
      phone: '0912345678',
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

function createMockPayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 'pay-record-123',
    orderId: 'order-test-verify-123',
    amount: 120000,
    method: 'payos',
    status: 'unpaid',
    transactionId: 'trans-payos-999',
    createdAt: new Date(),
    ...overrides,
  };
}

describe('VerifyOrderPaymentUseCase - Error Sanitization & CWE-209 Defense', () => {
  it('sanitizes unexpected database error from orderRepo.findById and returns safe generic message', async () => {
    const distinctiveSecret = 'DISTINCTIVE_VERIFY_DB_ERROR_SECRET_111';
    const mockOrderRepo: Partial<IOrderRepository> = {
      findById: async () => {
        throw new Error(distinctiveSecret);
      },
    };

    const mockPaymentRepo: Partial<IPaymentRepository> = {
      findByOrderId: async () => createMockPayment(),
    };

    const mockGateway: IPaymentGateway = {
      processPayment: async () => ({ success: true, paymentId: 'dummy', message: 'ok' }),
      verifyPayment: async () => ({ success: true, message: 'ok' }),
    };

    const useCase = new VerifyOrderPaymentUseCase(
      mockOrderRepo as IOrderRepository,
      mockPaymentRepo as IPaymentRepository,
      mockGateway
    );

    const result = await useCase.execute('order-test-verify-123', 'user-test-verify-456');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.message, 'Payment verification failed.');
    assert.strictEqual(result.message.includes(distinctiveSecret), false, 'Must not leak distinctive DB error');
  });

  it('sanitizes unexpected gateway error from payosGateway.verifyPayment and returns safe generic message', async () => {
    const distinctiveSecret = 'DISTINCTIVE_PAYOS_API_SECRET_KEY_EXPOSURE_222';
    const existingOrder = createMockOrder();
    const existingPayment = createMockPayment();

    const mockOrderRepo: Partial<IOrderRepository> = {
      findById: async () => existingOrder,
    };

    const mockPaymentRepo: Partial<IPaymentRepository> = {
      findByOrderId: async () => existingPayment,
    };

    const mockGateway: IPaymentGateway = {
      processPayment: async () => ({ success: true, paymentId: 'dummy', message: 'ok' }),
      verifyPayment: async () => {
        throw new Error(distinctiveSecret);
      },
    };

    const useCase = new VerifyOrderPaymentUseCase(
      mockOrderRepo as IOrderRepository,
      mockPaymentRepo as IPaymentRepository,
      mockGateway
    );

    const result = await useCase.execute('order-test-verify-123', 'user-test-verify-456');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.message, 'Payment verification failed.');
    assert.strictEqual(result.message.includes(distinctiveSecret), false, 'Must not leak payos secret error');
  });

  it('sanitizes unexpected error from paymentRepo.updatePaymentStatus and returns safe generic message', async () => {
    const distinctiveSecret = 'DISTINCTIVE_PAYMENT_REPO_UPDATE_INTERNAL_333';
    const existingOrder = createMockOrder();
    const existingPayment = createMockPayment();

    const mockOrderRepo: Partial<IOrderRepository> = {
      findById: async () => existingOrder,
      updatePaymentStatus: async () => {},
    };

    const mockPaymentRepo: Partial<IPaymentRepository> = {
      findByOrderId: async () => existingPayment,
      updatePaymentStatus: async () => {
        throw new Error(distinctiveSecret);
      },
    };

    const mockGateway: IPaymentGateway = {
      processPayment: async () => ({ success: true, paymentId: 'dummy', message: 'ok' }),
      verifyPayment: async () => ({ success: true, message: 'ok' }),
    };

    const useCase = new VerifyOrderPaymentUseCase(
      mockOrderRepo as IOrderRepository,
      mockPaymentRepo as IPaymentRepository,
      mockGateway
    );

    const result = await useCase.execute('order-test-verify-123', 'user-test-verify-456');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.message, 'Payment verification failed.');
    assert.strictEqual(result.message.includes(distinctiveSecret), false, 'Must not leak payment repo update error');
  });

  it('successfully completes verification and returns success when valid', async () => {
    const existingOrder = createMockOrder();
    const existingPayment = createMockPayment();

    let orderPaymentUpdated = false;
    let paymentRecordUpdated = false;

    const mockOrderRepo: Partial<IOrderRepository> = {
      findById: async () => existingOrder,
      updatePaymentStatus: async () => {
        orderPaymentUpdated = true;
      },
    };

    const mockPaymentRepo: Partial<IPaymentRepository> = {
      findByOrderId: async () => existingPayment,
      updatePaymentStatus: async () => {
        paymentRecordUpdated = true;
      },
    };

    const mockGateway: IPaymentGateway = {
      processPayment: async () => ({ success: true, paymentId: 'dummy', message: 'ok' }),
      verifyPayment: async () => ({ success: true, message: 'Verified' }),
    };

    const useCase = new VerifyOrderPaymentUseCase(
      mockOrderRepo as IOrderRepository,
      mockPaymentRepo as IPaymentRepository,
      mockGateway
    );

    const result = await useCase.execute('order-test-verify-123', 'user-test-verify-456');

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.message, 'Payment verified successfully');
    assert.strictEqual(orderPaymentUpdated, true);
    assert.strictEqual(paymentRecordUpdated, true);
  });
});
