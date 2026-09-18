import { describe, it } from 'node:test';
import assert from 'node:assert';
import { GetCurrentUserUseCase } from './GetCurrentUser';
import { GetProfileUseCase } from './GetProfile';
import { IAuthRepository, AuthUser, AuthProfile } from '@/server/domain/repositories/IAuthRepository';
import { ok, fail } from '@/server/domain/shared/Result';

describe('GetCurrentUserUseCase & GetProfileUseCase - Contract & Failure Preservation', () => {
  describe('GetCurrentUserUseCase', () => {
    it('returns ok(user) when user is authenticated', async () => {
      const mockUser: AuthUser = {
        id: 'user-456',
        email: 'user@example.com',
        fullName: 'Test User',
      };
      const mockAuthRepo: Partial<IAuthRepository> = {
        getCurrentUser: async () => ok(mockUser),
      };

      const useCase = new GetCurrentUserUseCase(mockAuthRepo as IAuthRepository);
      const result = await useCase.execute();

      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.deepStrictEqual(result.data, mockUser);
      }
    });

    it('returns ok(null) when user is unauthenticated (absence)', async () => {
      const mockAuthRepo: Partial<IAuthRepository> = {
        getCurrentUser: async () => ok(null),
      };

      const useCase = new GetCurrentUserUseCase(mockAuthRepo as IAuthRepository);
      const result = await useCase.execute();

      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data, null);
      }
    });

    it('preserves and returns fail(error) on repository failure', async () => {
      const failureError = new Error('Supabase Auth Service 503 Service Unavailable');
      const mockAuthRepo: Partial<IAuthRepository> = {
        getCurrentUser: async () => fail(failureError),
      };

      const useCase = new GetCurrentUserUseCase(mockAuthRepo as IAuthRepository);
      const result = await useCase.execute();

      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.strictEqual(result.error.message, 'Supabase Auth Service 503 Service Unavailable');
      }
    });

    it('catches unexpected thrown exception and returns fail(error)', async () => {
      const mockAuthRepo: Partial<IAuthRepository> = {
        getCurrentUser: async () => {
          throw new Error('Connection reset by peer');
        },
      };

      const useCase = new GetCurrentUserUseCase(mockAuthRepo as IAuthRepository);
      const result = await useCase.execute();

      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.strictEqual(result.error.message, 'Connection reset by peer');
      }
    });
  });

  describe('GetProfileUseCase', () => {
    it('returns ok(profile) when profile exists', async () => {
      const mockProfile: AuthProfile = {
        id: 'user-456',
        fullName: 'Admin User',
        role: 'admin',
      };
      const mockAuthRepo: Partial<IAuthRepository> = {
        getProfile: async () => ok(mockProfile),
      };

      const useCase = new GetProfileUseCase(mockAuthRepo as IAuthRepository);
      const result = await useCase.execute('user-456');

      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.deepStrictEqual(result.data, mockProfile);
      }
    });

    it('returns ok(null) when profile does not exist in DB (absence)', async () => {
      const mockAuthRepo: Partial<IAuthRepository> = {
        getProfile: async () => ok(null),
      };

      const useCase = new GetProfileUseCase(mockAuthRepo as IAuthRepository);
      const result = await useCase.execute('missing-user');

      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data, null);
      }
    });

    it('preserves and returns fail(error) on profile query failure', async () => {
      const failureError = new Error('Postgres connection pool exhausted');
      const mockAuthRepo: Partial<IAuthRepository> = {
        getProfile: async () => fail(failureError),
      };

      const useCase = new GetProfileUseCase(mockAuthRepo as IAuthRepository);
      const result = await useCase.execute('user-456');

      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.strictEqual(result.error.message, 'Postgres connection pool exhausted');
      }
    });

    it('catches unexpected thrown exception and returns fail(error)', async () => {
      const mockAuthRepo: Partial<IAuthRepository> = {
        getProfile: async () => {
          throw new Error('Database read timeout');
        },
      };

      const useCase = new GetProfileUseCase(mockAuthRepo as IAuthRepository);
      const result = await useCase.execute('user-456');

      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.strictEqual(result.error.message, 'Database read timeout');
      }
    });
  });
});
