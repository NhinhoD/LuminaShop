import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { Result } from '@/domain/shared/Result';

export class SignoutUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(): Promise<Result<void>> {
    return this.authRepo.signOut();
  }
}
