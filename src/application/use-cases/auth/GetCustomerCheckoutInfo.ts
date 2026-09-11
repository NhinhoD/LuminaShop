import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { Result, ok, fail } from '@/domain/shared/Result';

export interface CustomerCheckoutInfoDTO {
  fullName: string;
  email: string;
  phone: string;
}

export class GetCustomerCheckoutInfoUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(): Promise<Result<CustomerCheckoutInfoDTO | null>> {
    try {
      const user = await this.authRepo.getCurrentUser();
      if (!user) {
        return ok(null);
      }

      const profile = await this.authRepo.getProfile(user.id);

      const fullName = (profile?.fullName || user.fullName || '').trim();
      const email = (user.email || '').trim();
      const phone = (profile?.phone || user.phone || '').trim();

      return ok({
        fullName,
        email,
        phone,
      });
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Không thể tải thông tin khách hàng.'));
    }
  }
}
