import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { Result, fail } from '@/domain/shared/Result';

export class LoginUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(email: string, password: string): Promise<Result<void>> {
    try {
      return await this.authRepo.signInWithPassword(email, password);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Lỗi hệ thống khi đăng nhập'));
    }
  }
}
