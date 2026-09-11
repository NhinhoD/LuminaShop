import { describe, it } from 'node:test';
import assert from 'node:assert';
import { GetCustomerCheckoutInfoUseCase } from './GetCustomerCheckoutInfo';
import { IAuthRepository } from '@/domain/repositories/IAuthRepository';

describe('GetCustomerCheckoutInfoUseCase', () => {
  it('returns ok(null) when user is not authenticated', async () => {
    const mockAuthRepo: Partial<IAuthRepository> = {
      getCurrentUser: async () => null,
    };

    const useCase = new GetCustomerCheckoutInfoUseCase(mockAuthRepo as IAuthRepository);
    const result = await useCase.execute();

    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data, null);
    }
  });

  it('returns full customer checkout info from profile and user email', async () => {
    const mockAuthRepo: Partial<IAuthRepository> = {
      getCurrentUser: async () => ({
        id: 'usr-123',
        email: 'customer@example.com',
      }),
      getProfile: async (id: string) => ({
        id,
        fullName: 'Nguyễn Văn A',
        phone: '0987654321',
      }),
    };

    const useCase = new GetCustomerCheckoutInfoUseCase(mockAuthRepo as IAuthRepository);
    const result = await useCase.execute();

    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.deepStrictEqual(result.data, {
        fullName: 'Nguyễn Văn A',
        email: 'customer@example.com',
        phone: '0987654321',
      });
    }
  });

  it('falls back to user metadata when profile fields are missing or null', async () => {
    const mockAuthRepo: Partial<IAuthRepository> = {
      getCurrentUser: async () => ({
        id: 'usr-456',
        email: 'user.fallback@example.com',
        fullName: 'Trần Thị B',
        phone: '0912345678',
      }),
      getProfile: async () => null,
    };

    const useCase = new GetCustomerCheckoutInfoUseCase(mockAuthRepo as IAuthRepository);
    const result = await useCase.execute();

    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.deepStrictEqual(result.data, {
        fullName: 'Trần Thị B',
        email: 'user.fallback@example.com',
        phone: '0912345678',
      });
    }
  });

  it('handles empty profile and metadata gracefully with empty strings', async () => {
    const mockAuthRepo: Partial<IAuthRepository> = {
      getCurrentUser: async () => ({
        id: 'usr-789',
        email: 'empty@example.com',
      }),
      getProfile: async (id: string) => ({
        id,
        fullName: '',
        phone: '',
      }),
    };

    const useCase = new GetCustomerCheckoutInfoUseCase(mockAuthRepo as IAuthRepository);
    const result = await useCase.execute();

    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.deepStrictEqual(result.data, {
        fullName: '',
        email: 'empty@example.com',
        phone: '',
      });
    }
  });

  it('returns fail(error) when auth repository throws an unexpected error', async () => {
    const mockAuthRepo: Partial<IAuthRepository> = {
      getCurrentUser: async () => {
        throw new Error('Database connection failed');
      },
    };

    const useCase = new GetCustomerCheckoutInfoUseCase(mockAuthRepo as IAuthRepository);
    const result = await useCase.execute();

    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.match(result.error.message, /Database connection failed/);
    }
  });
});
