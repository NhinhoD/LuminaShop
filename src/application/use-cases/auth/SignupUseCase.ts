import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { Result, fail } from '@/domain/shared/Result';

export class SignupUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(email: string, password: string, fullName: string): Promise<Result<void>> {
    try {
      return await this.authRepo.signUp(email, password, fullName);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Lỗi hệ thống khi đăng ký'));
    }
  }
}
