import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert';
import { assertAdmin, assertAuthenticated } from './authGuards';
import { setCustomAuthRepositoryFactoryForTesting } from '@/server/di/container';
import { IAuthRepository, AuthUser, AuthProfile } from '@/server/domain/repositories/IAuthRepository';
import { ok, fail } from '@/server/domain/shared/Result';
import { ROLES } from '@/shared/constants';

describe('AuthGuards (assertAdmin & assertAuthenticated) - Failure & Absence Preservation', () => {
  afterEach(() => {
    setCustomAuthRepositoryFactoryForTesting(null);
  });

  describe('assertAdmin', () => {
    it('succeeds and returns admin details when user has admin role', async () => {
      const mockUser: AuthUser = {
        id: 'admin-1',
        email: 'admin@khoui.vn',
        fullName: 'Admin Super',
      };
      const mockProfile: AuthProfile = {
        id: 'admin-1',
        fullName: 'Admin Super',
        role: ROLES.ADMIN,
      };

      const mockAuthRepo: Partial<IAuthRepository> = {
        getCurrentUser: async () => ok(mockUser),
        getProfile: async () => ok(mockProfile),
      };

      setCustomAuthRepositoryFactoryForTesting(async () => mockAuthRepo as IAuthRepository);

      const result = await assertAdmin();
      assert.deepStrictEqual(result, {
        id: 'admin-1',
        email: 'admin@khoui.vn',
        fullName: 'Admin Super',
        role: ROLES.ADMIN,
      });
    });

    it('throws Unauthorized when user is unauthenticated (null)', async () => {
      const mockAuthRepo: Partial<IAuthRepository> = {
        getCurrentUser: async () => ok(null),
      };

      setCustomAuthRepositoryFactoryForTesting(async () => mockAuthRepo as IAuthRepository);

      await assert.rejects(
        async () => {
          await assertAdmin();
        },
        {
          name: 'Error',
          message: 'Unauthorized: Yêu cầu đăng nhập.',
        }
      );
    });

    it('propagates lookup error when getCurrentUser fails (instead of false unauthorized)', async () => {
      const failureError = new Error('Auth DB down 500');
      const mockAuthRepo: Partial<IAuthRepository> = {
        getCurrentUser: async () => fail(failureError),
      };

      setCustomAuthRepositoryFactoryForTesting(async () => mockAuthRepo as IAuthRepository);

      await assert.rejects(
        async () => {
          await assertAdmin();
        },
        {
          name: 'Error',
          message: 'Auth DB down 500',
        }
      );
    });

    it('throws Forbidden when profile has non-admin role', async () => {
      const mockUser: AuthUser = {
        id: 'user-1',
        email: 'user@khoui.vn',
      };
      const mockProfile: AuthProfile = {
        id: 'user-1',
        role: 'customer',
      };

      const mockAuthRepo: Partial<IAuthRepository> = {
        getCurrentUser: async () => ok(mockUser),
        getProfile: async () => ok(mockProfile),
      };

      setCustomAuthRepositoryFactoryForTesting(async () => mockAuthRepo as IAuthRepository);

      await assert.rejects(
        async () => {
          await assertAdmin();
        },
        {
          name: 'Error',
          message: 'Forbidden: Bạn không có quyền thực hiện thao tác này.',
        }
      );
    });

    it('throws Forbidden when profile is null (absent in DB)', async () => {
      const mockUser: AuthUser = {
        id: 'user-1',
        email: 'user@khoui.vn',
      };

      const mockAuthRepo: Partial<IAuthRepository> = {
        getCurrentUser: async () => ok(mockUser),
        getProfile: async () => ok(null),
      };

      setCustomAuthRepositoryFactoryForTesting(async () => mockAuthRepo as IAuthRepository);

      await assert.rejects(
        async () => {
          await assertAdmin();
        },
        {
          name: 'Error',
          message: 'Forbidden: Bạn không có quyền thực hiện thao tác này.',
        }
      );
    });

    it('propagates lookup error when getProfile fails (instead of false 403/Forbidden)', async () => {
      const mockUser: AuthUser = {
        id: 'user-1',
        email: 'user@khoui.vn',
      };
      const failureError = new Error('Profile query connection error');

      const mockAuthRepo: Partial<IAuthRepository> = {
        getCurrentUser: async () => ok(mockUser),
        getProfile: async () => fail(failureError),
      };

      setCustomAuthRepositoryFactoryForTesting(async () => mockAuthRepo as IAuthRepository);

      await assert.rejects(
        async () => {
          await assertAdmin();
        },
        {
          name: 'Error',
          message: 'Profile query connection error',
        }
      );
    });
  });

  describe('assertAuthenticated', () => {
    it('succeeds and returns user summary when authenticated', async () => {
      const mockUser: AuthUser = {
        id: 'user-999',
        email: 'logged@khoui.vn',
      };

      const mockAuthRepo: Partial<IAuthRepository> = {
        getCurrentUser: async () => ok(mockUser),
      };

      setCustomAuthRepositoryFactoryForTesting(async () => mockAuthRepo as IAuthRepository);

      const result = await assertAuthenticated();
      assert.deepStrictEqual(result, {
        id: 'user-999',
        email: 'logged@khoui.vn',
      });
    });

    it('throws Unauthorized when user is unauthenticated (null)', async () => {
      const mockAuthRepo: Partial<IAuthRepository> = {
        getCurrentUser: async () => ok(null),
      };

      setCustomAuthRepositoryFactoryForTesting(async () => mockAuthRepo as IAuthRepository);

      await assert.rejects(
        async () => {
          await assertAuthenticated();
        },
        {
          name: 'Error',
          message: 'Unauthorized: Yêu cầu đăng nhập.',
        }
      );
    });

    it('propagates lookup error when getCurrentUser fails', async () => {
      const failureError = new Error('Session token validation timeout');
      const mockAuthRepo: Partial<IAuthRepository> = {
        getCurrentUser: async () => fail(failureError),
      };

      setCustomAuthRepositoryFactoryForTesting(async () => mockAuthRepo as IAuthRepository);

      await assert.rejects(
        async () => {
          await assertAuthenticated();
        },
        {
          name: 'Error',
          message: 'Session token validation timeout',
        }
      );
    });
  });
});
