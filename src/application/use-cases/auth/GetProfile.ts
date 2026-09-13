import { IAuthRepository } from '@/domain/repositories/IAuthRepository';

/**
 * Use case to retrieve a user profile by ID.
 */
export class GetProfileUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(userId: string) {
    return this.authRepo.getProfile(userId);
  }
}
