import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { Result, ok, fail } from '@/domain/shared/Result';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseAuthRepository implements IAuthRepository {
  constructor(private supabase: SupabaseClient) {}

  async signInWithPassword(email: string, password: string): Promise<Result<void>> {
    try {
      const { error } = await this.supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return fail(new Error(error.message || 'Đăng nhập thất bại'));
      }
      return ok(undefined);
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Lỗi hệ thống khi đăng nhập'));
    }
  }

  async signUp(email: string, password: string, fullName: string): Promise<Result<void>> {
    try {
      const { error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) {
        return fail(new Error(error.message || 'Đăng ký thất bại'));
      }
      return ok(undefined);
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Lỗi hệ thống khi đăng ký'));
    }
  }

  async verifyOtp(email: string, token: string): Promise<Result<void>> {
    try {
      const { error } = await this.supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      });
      if (error) {
        return fail(new Error(error.message || 'Xác thực OTP thất bại'));
      }
      return ok(undefined);
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Lỗi hệ thống khi xác thực OTP'));
    }
  }

  async resendOtp(email: string): Promise<Result<void>> {
    try {
      const { error } = await this.supabase.auth.resend({
        email,
        type: 'signup',
      });
      if (error) {
        return fail(new Error(error.message || 'Gửi lại mã OTP thất bại'));
      }
      return ok(undefined);
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Lỗi hệ thống khi gửi lại OTP'));
    }
  }

  async signOut(): Promise<Result<void>> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) {
        return fail(new Error(error.message || 'Đăng xuất thất bại'));
      }
      return ok(undefined);
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Lỗi hệ thống khi đăng xuất'));
    }
  }

  async getOtpRateLimit(email: string): Promise<Result<Date | null>> {
    try {
      const { data, error } = await this.supabase
        .from('otp_rate_limits')
        .select('last_resend_at')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        return fail(new Error(error.message || 'Không thể lấy thông tin hạn mức OTP'));
      }

      if (!data || !data.last_resend_at) {
        return ok(null);
      }

      return ok(new Date(data.last_resend_at));
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Lỗi hệ thống khi lấy hạn mức OTP'));
    }
  }

  async upsertOtpRateLimit(email: string, date: Date): Promise<Result<void>> {
    try {
      const { error } = await this.supabase
        .from('otp_rate_limits')
        .upsert(
          {
            email,
            last_resend_at: date.toISOString(),
          },
          {
            onConflict: 'email',
          }
        );

      if (error) {
        return fail(new Error(error.message || 'Không thể ghi nhận hạn mức OTP'));
      }

      return ok(undefined);
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Lỗi hệ thống khi cập nhật hạn mức OTP'));
    }
  }

  async getCurrentUser(): Promise<{ id: string; email?: string } | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return null;
      return { id: user.id, email: user.email };
    } catch {
      return null;
    }
  }

  async getProfile(userId: string): Promise<{ id: string; fullName?: string; phone?: string; avatarUrl?: string } | null> {
    try {
      const { data } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!data) return null;
      return {
        id: data.id,
        fullName: data.full_name,
        phone: data.phone,
        avatarUrl: data.avatar_url,
      };
    } catch {
      return null;
    }
  }

  async updateProfile(userId: string, data: { fullName: string; phone?: string | null }): Promise<Result<void>> {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          phone: data.phone ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        return fail(new Error(error.message || 'Cập nhật hồ sơ thất bại'));
      }

      return ok(undefined);
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Lỗi hệ thống khi cập nhật hồ sơ'));
    }
  }

  async resetPasswordForEmail(email: string, redirectTo: string): Promise<Result<void>> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) {
        return fail(new Error(error.message || 'Gửi email đặt lại mật khẩu thất bại'));
      }
      return ok(undefined);
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Lỗi hệ thống khi gửi email đặt lại mật khẩu'));
    }
  }

  async updatePassword(newPassword: string): Promise<Result<void>> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        return fail(new Error(error.message || 'Cập nhật mật khẩu thất bại'));
      }
      return ok(undefined);
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Lỗi hệ thống khi cập nhật mật khẩu'));
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<Result<void>> {
    try {
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user || !user.email) {
        return fail(new Error('Người dùng chưa đăng nhập hoặc không tìm thấy phiên làm việc'));
      }

      // Re-authenticate using current password to ensure verification
      const { error: signInError } = await this.supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        return fail(new Error('Mật khẩu hiện tại không chính xác'));
      }

      // Update password for verified user
      const { error: updateError } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        return fail(new Error(updateError.message || 'Cập nhật mật khẩu thất bại'));
      }

      return ok(undefined);
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Lỗi hệ thống khi đổi mật khẩu'));
    }
  }
}
