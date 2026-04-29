'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
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

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
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

  revalidatePath('/', 'layout')
  redirect('/profile')
}

export async function signout() {
  const supabase = await makeSupabaseClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
