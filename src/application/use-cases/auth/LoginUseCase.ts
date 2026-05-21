import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { Result } from '@/domain/shared/Result';

export class LoginUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(email: string, password: string): Promise<Result<void>> {
    return this.authRepo.signInWithPassword(email, password);
  }
}
