'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { 
  makeLoginUseCase, 
  makeSignupUseCase, 
  makeVerifyOtpUseCase, 
  makeResendOtpUseCase, 
  makeSignoutUseCase,
  makeForgotPasswordUseCase,
  makeUpdatePasswordUseCase,
  makeChangePasswordUseCase,
  makeUpdateProfileUseCase
} from '@/infrastructure/supabase/container'
import { z } from 'zod'
import { unstable_rethrow } from 'next/navigation'

const credentialsSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự'),
})

const SignUpFormSchema = z.object({
  firstName: z.preprocess((val) => val ?? undefined, z.string().optional()),
  lastName: z.preprocess((val) => val ?? undefined, z.string().optional()),
})

const otpVerificationSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  token: z.string().min(1, 'Vui lòng nhập mã OTP'),
})

const emailCookieSchema = z.string().email('Email không hợp lệ')

export async function login(formData: FormData): Promise<never> {
  try {
    const email = formData.get('email')
    const password = formData.get('password')

    const parsed = credentialsSchema.safeParse({ email, password })
    if (!parsed.success) {
      redirect('/login?error=InvalidCredentials')
    }

    const { email: parsedEmail, password: parsedPassword } = parsed.data

    const loginUseCase = await makeLoginUseCase()
    const result = await loginUseCase.execute(parsedEmail, parsedPassword)

    if (!result.success) {
      redirect('/login?error=InvalidCredentials')
    }

    revalidatePath('/', 'layout')
    redirect('/profile')
  } catch (error: unknown) {
    unstable_rethrow(error)
    redirect('/login?error=ServerError')
  }
}

export async function signup(formData: FormData): Promise<never> {
  try {
    const email = formData.get('email')
    const password = formData.get('password')

    const parsedCredentials = credentialsSchema.safeParse({ email, password })
    if (!parsedCredentials.success) {
      redirect('/register?error=SignUpFailed')
    }

    const parsedNames = SignUpFormSchema.safeParse({
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
    })

    if (!parsedNames.success) {
      redirect('/register?error=SignUpFailed')
    }

    const { email: parsedEmail, password: parsedPassword } = parsedCredentials.data
    const { firstName, lastName } = parsedNames.data

    const signupUseCase = await makeSignupUseCase()
    const fullName = `${firstName || ''} ${lastName || ''}`.trim()
    
    const result = await signupUseCase.execute(parsedEmail, parsedPassword, fullName)

    if (!result.success) {
      redirect('/register?error=SignUpFailed')
    }

    // Store email in cookie for OTP page
    const cookieStore = await cookies()
    cookieStore.set('pending_verification_email', parsedEmail, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 10 // 10 minutes
    })

    redirect('/verify-otp')
  } catch (error: unknown) {
    unstable_rethrow(error)
    redirect('/register?error=ServerError')
  }
}

export async function verifySignupOtpAction(formData: FormData): Promise<{ error?: string }> {
  try {
    const cookieStore = await cookies()
    const email = cookieStore.get('pending_verification_email')?.value
    const token = formData.get('token')

    const parsed = otpVerificationSchema.safeParse({ email, token })
    if (!parsed.success) {
      const errors = parsed.error.format()
      if (errors.email) {
        return { error: 'Phiên bản đã hết hạn hoặc không tìm thấy email' }
      }
      if (errors.token) {
        return { error: errors.token._errors[0] || 'Vui lòng nhập mã OTP' }
      }
      return { error: 'Dữ liệu không hợp lệ' }
    }

    const { email: validatedEmail, token: validatedToken } = parsed.data

    const verifyOtpUseCase = await makeVerifyOtpUseCase()
    const result = await verifyOtpUseCase.execute(validatedEmail, validatedToken)

    if (!result.success) {
      return { error: result.error.message || 'Mã OTP không hợp lệ hoặc đã hết hạn' }
    }

    // Clear the cookie upon success
    cookieStore.delete('pending_verification_email')

    revalidatePath('/', 'layout')
    redirect('/')
  } catch (error: unknown) {
    unstable_rethrow(error)
    return { error: 'Lỗi máy chủ khi xác nhận mã OTP' }
  }
}

export async function resendOtpAction(): Promise<{ success?: boolean; error?: string }> {
  try {
    const cookieStore = await cookies()
    const email = cookieStore.get('pending_verification_email')?.value

    const parsed = emailCookieSchema.safeParse(email)
    if (!parsed.success) {
      return { error: 'Phiên bản đã hết hạn hoặc không tìm thấy email' }
    }

    const validatedEmail = parsed.data

    const resendOtpUseCase = await makeResendOtpUseCase()
    const result = await resendOtpUseCase.execute(validatedEmail)

    if (!result.success) {
      return { error: result.error.message }
    }

    // Refresh the pending_verification_email cookie with updated expiry (10 more minutes)
    cookieStore.set('pending_verification_email', validatedEmail, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 10 // 10 minutes
    })

    return { success: true }
  } catch {
    return { error: 'Lỗi máy chủ khi gửi lại mã OTP' }
  }
}

export async function updateProfileAction(fullName: string, phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    const useCase = await makeUpdateProfileUseCase();
    const result = await useCase.execute(fullName, phone);

    if (!result.success) {
      return { success: false, error: result.error.message };
    }

    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Đã có lỗi xảy ra khi cập nhật hồ sơ." 
    };
  }
}

export async function signout(): Promise<never> {
  try {
    const signoutUseCase = await makeSignoutUseCase()
    const result = await signoutUseCase.execute()

    if (!result.success) {
      redirect('/')
    }

    revalidatePath('/', 'layout')
    redirect('/')
  } catch (error: unknown) {
    unstable_rethrow(error)
    redirect('/')
  }
}

const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

const updatePasswordSchema = z.object({
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export async function forgotPasswordAction(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  try {
    const rawEmail = formData.get('email');
    const parsed = forgotPasswordSchema.safeParse({ email: rawEmail });
    if (!parsed.success) {
      return { error: 'Địa chỉ email không hợp lệ' };
    }

    const { email } = parsed.data;

    let baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
    if (!baseUrl) {
      try {
        const { headers } = await import('next/headers');
        const headerList = await headers();
        const host = headerList.get('host');
        const proto = headerList.get('x-forwarded-proto') || 'http';
        if (host) {
          baseUrl = `${proto}://${host}`;
        }
      } catch {
        baseUrl = 'http://localhost:3000';
      }
    }
    const redirectTo = `${baseUrl}/reset-password`;

    const useCase = await makeForgotPasswordUseCase();
    const result = await useCase.execute(email, redirectTo);

    if (!result.success) {
      return { error: result.error.message || 'Không thể gửi email đặt lại mật khẩu' };
    }

    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Lỗi hệ thống khi gửi email đặt lại mật khẩu' };
  }
}

export async function updatePasswordAction(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  try {
    const rawPassword = formData.get('password');
    const parsed = updatePasswordSchema.safeParse({ password: rawPassword });
    if (!parsed.success) {
      return { error: 'Mật khẩu phải có ít nhất 6 ký tự' };
    }

    const { password } = parsed.data;
    const useCase = await makeUpdatePasswordUseCase();
    const result = await useCase.execute(password);

    if (!result.success) {
      return { error: result.error.message || 'Không thể cập nhật mật khẩu' };
    }

    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Lỗi hệ thống khi cập nhật mật khẩu' };
  }
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().min(6, 'Vui lòng xác nhận mật khẩu mới'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại',
  path: ['newPassword'],
});

export async function changePasswordAction(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  try {
    const rawCurrentPassword = formData.get('currentPassword');
    const rawNewPassword = formData.get('newPassword');
    const rawConfirmPassword = formData.get('confirmPassword');

    const parsed = changePasswordSchema.safeParse({
      currentPassword: rawCurrentPassword,
      newPassword: rawNewPassword,
      confirmPassword: rawConfirmPassword,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ' };
    }

    const { currentPassword, newPassword } = parsed.data;
    const useCase = await makeChangePasswordUseCase();
    const result = await useCase.execute(currentPassword, newPassword);

    if (!result.success) {
      return { error: result.error.message || 'Không thể đổi mật khẩu' };
    }

    revalidatePath('/profile');
    revalidatePath('/profile/password');
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Lỗi hệ thống khi đổi mật khẩu' };
  }
}
