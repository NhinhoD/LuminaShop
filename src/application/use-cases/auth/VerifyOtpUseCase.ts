import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { Result, fail } from '@/domain/shared/Result';

export class VerifyOtpUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(email: string, token: string): Promise<Result<void>> {
    try {
      return await this.authRepo.verifyOtp(email, token);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Lỗi hệ thống khi xác thực OTP'));
    }
  }
}
