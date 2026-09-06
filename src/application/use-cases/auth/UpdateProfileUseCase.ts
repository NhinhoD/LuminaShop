import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { Result, ok, fail } from '@/domain/shared/Result';

export const VIETNAMESE_PHONE_REGEX = /^(0|\+84)[35789][0-9]{8}$/;

export class UpdateProfileUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(
    fullName: string,
    rawPhone?: string | null,
    explicitUserId?: string
  ): Promise<Result<void>> {
    try {
      let targetUserId = explicitUserId;

      if (!targetUserId) {
        const currentUser = await this.authRepo.getCurrentUser();
        if (!currentUser) {
          return fail(new Error('Vui lòng đăng nhập lại để cập nhật thông tin.'));
        }
        targetUserId = currentUser.id;
      }

      if (!targetUserId || !targetUserId.trim()) {
        return fail(new Error('Định danh người dùng không hợp lệ.'));
      }

      const trimmedFullName = fullName ? fullName.trim() : '';
      if (!trimmedFullName) {
        return fail(new Error('Vui lòng nhập họ và tên.'));
      }

      if (trimmedFullName.length < 2) {
        return fail(new Error('Họ và tên phải có ít nhất 2 ký tự.'));
      }

      let normalizedPhone: string | null = null;

      if (rawPhone && typeof rawPhone === 'string') {
        const cleaned = rawPhone.trim().replace(/[\s.\-()]/g, '');
        if (cleaned.length > 0) {
          if (!VIETNAMESE_PHONE_REGEX.test(cleaned)) {
            return fail(
              new Error(
                'Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 số di động (bắt đầu bằng 03, 05, 07, 08, 09) hoặc định dạng +84.'
              )
            );
          }
          normalizedPhone = cleaned;
        }
      }

      const result = await this.authRepo.updateProfile(targetUserId, {
        fullName: trimmedFullName,
        phone: normalizedPhone,
      });

      if (!result.success) {
        return fail(result.error);
      }

      return ok(undefined);
    } catch (error) {
      return fail(
        error instanceof Error ? error : new Error('Lỗi hệ thống khi cập nhật hồ sơ.')
      );
    }
  }
}
