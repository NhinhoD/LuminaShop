import { IAuthRepository } from '@/domain/repositories/IAuthRepository';

/**
 * Use case to retrieve the currently authenticated user.
 */
export class GetCurrentUserUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute() {
    return this.authRepo.getCurrentUser();
  }
}
