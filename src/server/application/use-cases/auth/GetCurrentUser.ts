import { IAuthRepository, AuthUser } from '@/server/domain/repositories/IAuthRepository';
import { Result, fail } from '@/server/domain/shared/Result';

/**
 * Use case to retrieve the currently authenticated user.
 */
export class GetCurrentUserUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(): Promise<Result<AuthUser | null>> {
    try {
      return await this.authRepo.getCurrentUser();
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Lỗi khi lấy thông tin người dùng'));
    }
  }
}
