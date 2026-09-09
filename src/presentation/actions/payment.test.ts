import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert';
import { processPaymentAction, verifyOrderPaymentAction } from './payment';
import {
  setCustomAuthRepositoryFactoryForTesting,
  setCustomProcessPaymentUseCaseFactoryForTesting,
  setCustomVerifyOrderPaymentUseCaseFactoryForTesting,
} from '@/infrastructure/supabase/container';
import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { ProcessPaymentUseCase } from '@/application/use-cases/payment/ProcessPayment';
import { VerifyOrderPaymentUseCase } from '@/application/use-cases/payment/VerifyOrderPayment';

describe('Payment Server Actions - Error Sanitization & CWE-209 Defense', () => {
  afterEach(() => {
    setCustomAuthRepositoryFactoryForTesting(null);
    setCustomProcessPaymentUseCaseFactoryForTesting(null);
    setCustomVerifyOrderPaymentUseCaseFactoryForTesting(null);
  });

  describe('processPaymentAction', () => {
    it('sanitizes error thrown from makeAuthRepository factory and returns localized generic fallback', async () => {
      const distinctiveSecret = 'DISTINCTIVE_AUTH_FACTORY_CRASH_SECRET_111';
      setCustomAuthRepositoryFactoryForTesting(async () => {
        throw new Error(distinctiveSecret);
      });

      const result = await processPaymentAction('order-1', 50000, 'payos');

      assert.strictEqual(result.error, 'Đã xảy ra lỗi không mong muốn khi xử lý thanh toán.');
      assert.strictEqual(result.error.includes(distinctiveSecret), false, 'Must not leak distinctive factory error');
    });

    it('sanitizes error thrown from authRepo.getCurrentUser and returns localized generic fallback', async () => {
      const distinctiveSecret = 'DISTINCTIVE_AUTH_GET_USER_CRASH_SECRET_222';
      const mockAuthRepo: Partial<IAuthRepository> = {
        getCurrentUser: async () => {
          throw new Error(distinctiveSecret);
        },
      };

      setCustomAuthRepositoryFactoryForTesting(async () => mockAuthRepo as IAuthRepository);

      const result = await processPaymentAction('order-1', 50000, 'payos');

      assert.strictEqual(result.error, 'Đã xảy ra lỗi không mong muốn khi xử lý thanh toán.');
      assert.strictEqual(result.error.includes(distinctiveSecret), false, 'Must not leak authRepo error');
    });

    it('sanitizes error thrown from makeProcessPaymentUseCase factory and returns localized generic fallback', async () => {
      const distinctiveSecret = 'DISTINCTIVE_PROCESS_PAYMENT_FACTORY_LEAK_333';
      const mockAuthRepo: Partial<IAuthRepository> = {
        getCurrentUser: async () => ({
          id: 'user-123',
          email: 'test@example.com',
          role: 'customer',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };

      setCustomAuthRepositoryFactoryForTesting(async () => mockAuthRepo as IAuthRepository);
      setCustomProcessPaymentUseCaseFactoryForTesting(async () => {
        throw new Error(distinctiveSecret);
      });

      const result = await processPaymentAction('order-1', 50000, 'payos');

      assert.strictEqual(result.error, 'Đã xảy ra lỗi không mong muốn khi xử lý thanh toán.');
      assert.strictEqual(result.error.includes(distinctiveSecret), false, 'Must not leak usecase factory error');
    });

    it('sanitizes error thrown from useCase.execute and returns localized generic fallback', async () => {
      const distinctiveSecret = 'DISTINCTIVE_PROCESS_PAYMENT_EXECUTE_CRASH_444';
      const mockAuthRepo: Partial<IAuthRepository> = {
        getCurrentUser: async () => ({
          id: 'user-123',
          email: 'test@example.com',
          role: 'customer',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };

      const mockUseCase: Partial<ProcessPaymentUseCase> = {
        execute: async () => {
          throw new Error(distinctiveSecret);
        },
      };

      setCustomAuthRepositoryFactoryForTesting(async () => mockAuthRepo as IAuthRepository);
      setCustomProcessPaymentUseCaseFactoryForTesting(async () => mockUseCase as ProcessPaymentUseCase);

      const result = await processPaymentAction('order-1', 50000, 'payos');

      assert.strictEqual(result.error, 'Đã xảy ra lỗi không mong muốn khi xử lý thanh toán.');
      assert.strictEqual(result.error.includes(distinctiveSecret), false, 'Must not leak execute crash error');
    });

    it('returns unauthorized error message when user is unauthenticated', async () => {
      const mockAuthRepo: Partial<IAuthRepository> = {
        getCurrentUser: async () => null,
      };

      setCustomAuthRepositoryFactoryForTesting(async () => mockAuthRepo as IAuthRepository);

      const result = await processPaymentAction('order-1', 50000, 'payos');

      assert.strictEqual(result.error, 'Bạn cần đăng nhập để thực hiện thanh toán.');
    });
  });

  describe('verifyOrderPaymentAction', () => {
    it('sanitizes error thrown from makeAuthRepository factory and returns localized generic fallback', async () => {
      const distinctiveSecret = 'DISTINCTIVE_VERIFY_AUTH_FACTORY_CRASH_555';
      setCustomAuthRepositoryFactoryForTesting(async () => {
        throw new Error(distinctiveSecret);
      });

      const result = await verifyOrderPaymentAction('order-1');

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.message, 'Lỗi không xác định khi xác thực thanh toán.');
      assert.strictEqual(result.message.includes(distinctiveSecret), false, 'Must not leak distinctive factory error');
    });

    it('sanitizes error thrown from authRepo.getCurrentUser and returns localized generic fallback', async () => {
      const distinctiveSecret = 'DISTINCTIVE_VERIFY_GET_USER_CRASH_666';
      const mockAuthRepo: Partial<IAuthRepository> = {
        getCurrentUser: async () => {
          throw new Error(distinctiveSecret);
        },
      };

      setCustomAuthRepositoryFactoryForTesting(async () => mockAuthRepo as IAuthRepository);

      const result = await verifyOrderPaymentAction('order-1');

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.message, 'Lỗi không xác định khi xác thực thanh toán.');
      assert.strictEqual(result.message.includes(distinctiveSecret), false, 'Must not leak authRepo error');
    });

    it('sanitizes error thrown from makeVerifyOrderPaymentUseCase factory and returns localized generic fallback', async () => {
      const distinctiveSecret = 'DISTINCTIVE_VERIFY_USECASE_FACTORY_LEAK_777';
      const mockAuthRepo: Partial<IAuthRepository> = {
        getCurrentUser: async () => ({
          id: 'user-123',
          email: 'test@example.com',
          role: 'customer',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };

      setCustomAuthRepositoryFactoryForTesting(async () => mockAuthRepo as IAuthRepository);
      setCustomVerifyOrderPaymentUseCaseFactoryForTesting(async () => {
        throw new Error(distinctiveSecret);
      });

      const result = await verifyOrderPaymentAction('order-1');

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.message, 'Lỗi không xác định khi xác thực thanh toán.');
      assert.strictEqual(result.message.includes(distinctiveSecret), false, 'Must not leak usecase factory error');
    });

    it('sanitizes error thrown from verify useCase.execute and returns localized generic fallback', async () => {
      const distinctiveSecret = 'DISTINCTIVE_VERIFY_EXECUTE_CRASH_888';
      const mockAuthRepo: Partial<IAuthRepository> = {
        getCurrentUser: async () => ({
          id: 'user-123',
          email: 'test@example.com',
          role: 'customer',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };

      const mockUseCase: Partial<VerifyOrderPaymentUseCase> = {
        execute: async () => {
          throw new Error(distinctiveSecret);
        },
      };

      setCustomAuthRepositoryFactoryForTesting(async () => mockAuthRepo as IAuthRepository);
      setCustomVerifyOrderPaymentUseCaseFactoryForTesting(async () => mockUseCase as VerifyOrderPaymentUseCase);

      const result = await verifyOrderPaymentAction('order-1');

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.message, 'Lỗi không xác định khi xác thực thanh toán.');
      assert.strictEqual(result.message.includes(distinctiveSecret), false, 'Must not leak execute crash error');
    });

    it('returns unauthorized error message when user is unauthenticated', async () => {
      const mockAuthRepo: Partial<IAuthRepository> = {
        getCurrentUser: async () => null,
      };

      setCustomAuthRepositoryFactoryForTesting(async () => mockAuthRepo as IAuthRepository);

      const result = await verifyOrderPaymentAction('order-1');

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.message, 'Unauthorized');
    });
  });
});
