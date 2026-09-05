import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { Result, ok, fail } from '@/domain/shared/Result';

export class ChangePasswordUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(currentPassword: string, newPassword: string): Promise<Result<void>> {
    try {
      if (!currentPassword) {
        return fail(new Error('Vui lòng nhập mật khẩu hiện tại'));
      }

      if (!newPassword || newPassword.length < 6) {
        return fail(new Error('Mật khẩu mới phải có ít nhất 6 ký tự'));
      }

      if (currentPassword === newPassword) {
        return fail(new Error('Mật khẩu mới không được trùng với mật khẩu hiện tại'));
      }

      const result = await this.authRepo.changePassword(currentPassword, newPassword);
      if (!result.success) {
        return fail(result.error);
      }

      return ok(undefined);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Lỗi hệ thống khi đổi mật khẩu'));
    }
  }
}
