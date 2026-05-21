import { Result } from '../shared/Result';

export interface IAuthRepository {
  signInWithPassword(email: string, password: string): Promise<Result<void>>;
  signUp(email: string, password: string, fullName: string): Promise<Result<void>>;
  verifyOtp(email: string, token: string): Promise<Result<void>>;
  resendOtp(email: string): Promise<Result<void>>;
  signOut(): Promise<Result<void>>;
  getOtpRateLimit(email: string): Promise<Result<Date | null>>;
  upsertOtpRateLimit(email: string, date: Date): Promise<Result<void>>;
}
