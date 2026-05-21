import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { Result } from '@/domain/shared/Result';

export class VerifyOtpUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(email: string, token: string): Promise<Result<void>> {
    return this.authRepo.verifyOtp(email, token);
  }
}
