import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { Result, ok, fail } from '@/domain/shared/Result';

export class ForgotPasswordUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(email: string, redirectTo: string): Promise<Result<void>> {
    try {
      if (!email || !email.includes('@')) {
        return fail(new Error('Địa chỉ email không hợp lệ'));
      }

      const result = await this.authRepo.resetPasswordForEmail(email, redirectTo);
      if (!result.success) {
        return fail(result.error);
      }

      return ok(undefined);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Lỗi hệ thống khi gửi email đặt lại mật khẩu'));
    }
  }
}
