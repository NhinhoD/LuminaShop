'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { makeSupabaseClient } from '@/infrastructure/supabase/container'
import { z } from 'zod'

const SignUpFormSchema = z.object({
  firstName: z.preprocess((val) => val ?? undefined, z.string().optional()),
  lastName: z.preprocess((val) => val ?? undefined, z.string().optional()),
})

export async function login(formData: FormData) {
  const supabase = await makeSupabaseClient()

  const email = formData.get('email')
  const password = formData.get('password')

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    redirect('/login?error=InvalidCredentials')
  }

  const data = {
    email,
    password,
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

  const email = formData.get('email')
  const password = formData.get('password')

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    redirect('/register?error=SignUpFailed')
  }

  const parsed = SignUpFormSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
  })

  if (!parsed.success) {
    redirect('/register?error=SignUpFailed')
  }

  const { firstName, lastName } = parsed.data

  const data = {
    email,
    password,
    options: {
      data: {
        full_name: `${firstName || ''} ${lastName || ''}`.trim(),
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

export async function verifySignupOtpAction(formData: FormData): Promise<{ error?: string }> {
  const supabase = await makeSupabaseClient()
  const cookieStore = await cookies()
  const email = cookieStore.get('pending_verification_email')?.value

  if (!email) {
    return { error: 'Phiên bản đã hết hạn hoặc không tìm thấy email' }
  }

  const token = formData.get('token')
  if (!token || typeof token !== 'string') {
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

export async function resendOtpAction(): Promise<{ success?: boolean; error?: string }> {
  const supabase = await makeSupabaseClient()
  const cookieStore = await cookies()
  const email = cookieStore.get('pending_verification_email')?.value

  if (!email) {
    return { error: 'Phiên bản đã hết hạn hoặc không tìm thấy email' }
  }

  // 1) look up the last_resend_at for the email from the persistent Supabase table
  const { data: rateLimit } = await supabase
    .from('otp_rate_limits')
    .select('last_resend_at')
    .eq('email', email)
    .maybeSingle()

  // 2) if now - last_resend_at < 60 seconds return error
  if (rateLimit?.last_resend_at) {
    const lastResend = new Date(rateLimit.last_resend_at).getTime()
    const now = Date.now()
    if (now - lastResend < 60000) {
      return { error: 'Vui lòng chờ trước khi yêu cầu mã OTP mới' }
    }
  }

  // 3) call supabase.auth.resend
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })

  if (error) {
    return { error: error.message || 'Gửi lại mã OTP thất bại' }
  }

  // On success, upsert last_resend_at to now
  await supabase
    .from('otp_rate_limits')
    .upsert({
      email,
      last_resend_at: new Date().toISOString()
    }, {
      onConflict: 'email'
    })

  // Refresh the pending_verification_email cookie with updated expiry (10 more minutes)
  cookieStore.set('pending_verification_email', email, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10 // 10 minutes
  })

  return { success: true }
}

export async function signout() {
  const supabase = await makeSupabaseClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
