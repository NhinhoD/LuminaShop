import { z } from 'zod';

export const credentialsSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự'),
});

export const signUpFormSchema = z.object({
  firstName: z.preprocess((val) => val ?? undefined, z.string().optional()),
  lastName: z.preprocess((val) => val ?? undefined, z.string().optional()),
});

export const otpVerificationSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  token: z.string().min(1, 'Vui lòng nhập mã OTP'),
});

export const emailCookieSchema = z.string().email('Email không hợp lệ');

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

export const updatePasswordSchema = z.object({
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export const changePasswordSchema = z.object({
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
