import { describe, it } from 'node:test';
import assert from 'node:assert';
import { GetCustomerCheckoutInfoUseCase } from './GetCustomerCheckoutInfo';
import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { ok, fail } from '@/domain/shared/Result';

describe('GetCustomerCheckoutInfoUseCase', () => {
  it('returns ok(null) when user is not authenticated', async () => {
    const mockAuthRepo: Partial<IAuthRepository> = {
      getCurrentUser: async () => ok(null),
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
      getCurrentUser: async () => ok({
        id: 'usr-123',
        email: 'customer@example.com',
      }),
      getProfile: async (id: string) => ok({
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
      getCurrentUser: async () => ok({
        id: 'usr-456',
        email: 'user.fallback@example.com',
        fullName: 'Trần Thị B',
        phone: '0912345678',
      }),
      getProfile: async () => ok(null),
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
      getCurrentUser: async () => ok({
        id: 'usr-789',
        email: 'empty@example.com',
      }),
      getProfile: async (id: string) => ok({
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

  it('returns fail(error) when auth repository returns a failure result', async () => {
    const mockAuthRepo: Partial<IAuthRepository> = {
      getCurrentUser: async () => fail(new Error('Database connection failed')),
    };

    const useCase = new GetCustomerCheckoutInfoUseCase(mockAuthRepo as IAuthRepository);
    const result = await useCase.execute();

    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.match(result.error.message, /Database connection failed/);
    }
  });

  it('returns fail(error) when auth repository throws an unexpected error', async () => {
    const mockAuthRepo: Partial<IAuthRepository> = {
      getCurrentUser: async () => {
        throw new Error('Database connection crashed');
      },
    };

    const useCase = new GetCustomerCheckoutInfoUseCase(mockAuthRepo as IAuthRepository);
    const result = await useCase.execute();

    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.match(result.error.message, /Database connection crashed/);
    }
  });
});
