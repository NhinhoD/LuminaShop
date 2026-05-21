import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { Result, fail } from '@/domain/shared/Result';

export class SignoutUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(): Promise<Result<void>> {
    try {
      return await this.authRepo.signOut();
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Lỗi hệ thống khi đăng xuất'));
    }
  }
}
