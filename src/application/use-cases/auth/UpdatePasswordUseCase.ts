import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { Result, ok, fail } from '@/domain/shared/Result';

export class UpdatePasswordUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(newPassword: string): Promise<Result<void>> {
    try {
      if (!newPassword || newPassword.length < 6) {
        return fail(new Error('Mật khẩu mới phải có ít nhất 6 ký tự'));
      }

      const result = await this.authRepo.updatePassword(newPassword);
      if (!result.success) {
        return fail(result.error);
      }

      return ok(undefined);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Lỗi hệ thống khi cập nhật mật khẩu'));
    }
  }
}
