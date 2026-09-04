import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import VerifyOtpForm from '@/presentation/components/VerifyOtpForm'
import { ROUTES } from '@/presentation/constants'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'

export default async function VerifyOtpPage(): Promise<React.ReactNode> {
  const cookieStore = await cookies()
  const email = cookieStore.get('pending_verification_email')?.value

  if (!email) {
    redirect(ROUTES.REGISTER)
  }

  return (
    <div className="min-h-screen bg-background-subtle/50 flex flex-col items-center justify-center py-20 px-4 font-sans">
      {/* Brand Header */}
      <Link href={ROUTES.HOME} className="mb-10">
        <Image src="/LogoKhoUI.png" alt="KhoUI Logo" width={160} height={56} priority className="h-14 w-auto object-contain" />
      </Link>

      <VerifyOtpForm email={email} />
    </div>
  )
}
