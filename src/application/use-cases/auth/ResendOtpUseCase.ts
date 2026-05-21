import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { Result, ok, fail } from '@/domain/shared/Result';

export class ResendOtpUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(email: string): Promise<Result<void>> {
    // 1. Get current OTP rate limit
    const getLimitResult = await this.authRepo.getOtpRateLimit(email);
    if (!getLimitResult.success) {
      return fail(getLimitResult.error);
    }

    const lastResendAt = getLimitResult.data;

    // 2. Check if we must wait (60 seconds)
    if (lastResendAt) {
      const lastResend = lastResendAt.getTime();
      const now = Date.now();
      if (now - lastResend < 60000) {
        return fail(new Error('Vui lòng chờ trước khi yêu cầu mã OTP mới'));
      }
    }

    // 3. Upsert OTP Rate Limit FIRST to prevent bypass (reverse logic)
    const now = new Date();
    const upsertResult = await this.authRepo.upsertOtpRateLimit(email, now);
    if (!upsertResult.success) {
      return fail(upsertResult.error);
    }

    // 4. Send the OTP
    const resendResult = await this.authRepo.resendOtp(email);
    if (!resendResult.success) {
      return fail(resendResult.error);
    }

    return ok(undefined);
  }
}
