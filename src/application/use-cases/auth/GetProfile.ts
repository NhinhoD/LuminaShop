import { IAuthRepository, AuthProfile } from '@/domain/repositories/IAuthRepository';
import { Result, fail } from '@/domain/shared/Result';

/**
 * Use case to retrieve a user profile by ID.
 */
export class GetProfileUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(userId: string): Promise<Result<AuthProfile | null>> {
    try {
      return await this.authRepo.getProfile(userId);
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Lỗi khi lấy thông tin hồ sơ'));
    }
  }
}
