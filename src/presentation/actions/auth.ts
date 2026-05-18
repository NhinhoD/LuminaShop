'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { makeSupabaseClient } from '@/infrastructure/supabase/container'

export async function login(formData: FormData) {
  const supabase = await makeSupabaseClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=InvalidCredentials')
  }

  revalidatePath('/', 'layout')
  redirect('/profile')
}

export async function signup(formData: FormData) {
  const supabase = await makeSupabaseClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const data = {
    email,
    password,
    options: {
      data: {
        full_name: `${formData.get('firstName')} ${formData.get('lastName')}`.trim(),
      }
    }
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/register?error=SignUpFailed')
  }

  // Store email in cookie for OTP page
  const cookieStore = await cookies()
  cookieStore.set('pending_verification_email', email, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10 // 10 minutes
  })

  redirect('/verify-otp')
}

export async function verifySignupOtpAction(formData: FormData) {
  const supabase = await makeSupabaseClient()
  const cookieStore = await cookies()
  const email = cookieStore.get('pending_verification_email')?.value

  if (!email) {
    return { error: 'Phiên bản đã hết hạn hoặc không tìm thấy email' }
  }

  const token = formData.get('token') as string
  if (!token) {
    return { error: 'Vui lòng nhập mã OTP' }
  }

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup'
  })

  if (error) {
    return { error: error.message || 'Mã OTP không hợp lệ hoặc đã hết hạn' }
  }

  // Clear the cookie upon success
  cookieStore.delete('pending_verification_email')

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function resendOtpAction() {
  const supabase = await makeSupabaseClient()
  const cookieStore = await cookies()
  const email = cookieStore.get('pending_verification_email')?.value

  if (!email) {
    return { error: 'Phiên bản đã hết hạn hoặc không tìm thấy email' }
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })

  if (error) {
    return { error: error.message || 'Gửi lại mã OTP thất bại' }
  }

  return { success: true }
}

export async function signout() {
  const supabase = await makeSupabaseClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
