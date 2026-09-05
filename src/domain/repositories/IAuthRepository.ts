import { Result } from '../shared/Result';

export interface IAuthRepository {
  signInWithPassword(email: string, password: string): Promise<Result<void>>;
  signUp(email: string, password: string, fullName: string): Promise<Result<void>>;
  verifyOtp(email: string, token: string): Promise<Result<void>>;
  resendOtp(email: string): Promise<Result<void>>;
  signOut(): Promise<Result<void>>;
  getOtpRateLimit(email: string): Promise<Result<Date | null>>;
  upsertOtpRateLimit(email: string, date: Date): Promise<Result<void>>;
  getCurrentUser(): Promise<{ id: string; email?: string } | null>;
  getProfile(userId: string): Promise<{ id: string; fullName?: string; phone?: string; avatarUrl?: string } | null>;
  updateProfile(userId: string, data: { fullName: string; phone?: string | null }): Promise<Result<void>>;
  resetPasswordForEmail(email: string, redirectTo: string): Promise<Result<void>>;
  updatePassword(newPassword: string): Promise<Result<void>>;
  changePassword(currentPassword: string, newPassword: string): Promise<Result<void>>;
}
