import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { Result, ok, fail } from '@/domain/shared/Result';

export class ForgotPasswordUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(email: string, redirectTo: string): Promise<Result<void>> {
    try {
      if (!email || !email.includes('@')) {
        return fail(new Error('Địa chỉ email không hợp lệ'));
      }

      if (!redirectTo || (!redirectTo.startsWith('http://') && !redirectTo.startsWith('https://'))) {
        return fail(new Error('Địa chỉ chuyển hướng không hợp lệ'));
      }

      try {
        const parsedUrl = new URL(redirectTo);
        const isAllowedProtocol = parsedUrl.protocol === 'https:' || 
          (process.env.NODE_ENV === 'development' && parsedUrl.protocol === 'http:');
        if (!isAllowedProtocol) {
          return fail(new Error('Giao thức chuyển hướng không an toàn: chỉ chấp nhận HTTPS'));
        }
      } catch {
        return fail(new Error('Định dạng URL chuyển hướng không hợp lệ'));
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
