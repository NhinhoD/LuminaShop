import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { Result } from '@/domain/shared/Result';

export class SignupUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(email: string, password: string, fullName: string): Promise<Result<void>> {
    return this.authRepo.signUp(email, password, fullName);
  }
}
