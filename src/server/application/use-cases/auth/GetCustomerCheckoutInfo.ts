import { IAuthRepository } from '@/server/domain/repositories/IAuthRepository';
import { Result, ok, fail } from '@/server/domain/shared/Result';

export interface CustomerCheckoutInfoDTO {
  fullName: string;
  email: string;
  phone: string;
}

/**
 * Use case to retrieve and aggregate customer delivery profile information
 * (full name, email, contact phone) for seamless checkout pre-filling.
 */
export class GetCustomerCheckoutInfoUseCase {
  constructor(private authRepo: IAuthRepository) {}

  /**
   * Retrieves checkout information for the currently authenticated customer.
   *
   * @returns Result containing CustomerCheckoutInfoDTO or null if not authenticated.
   */
  async execute(): Promise<Result<CustomerCheckoutInfoDTO | null>> {
    try {
      const userResult = await this.authRepo.getCurrentUser();
      if (!userResult.success) {
        return fail(userResult.error);
      }
      const user = userResult.data;
      if (!user) {
        return ok(null);
      }

      const profileResult = await this.authRepo.getProfile(user.id);
      if (!profileResult.success) {
        return fail(profileResult.error);
      }
      const profile = profileResult.data;

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
