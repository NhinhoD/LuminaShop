import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import VerifyOtpForm from '@/presentation/components/VerifyOtpForm'
import { BRAND_NAME } from '@/presentation/constants'

export default async function VerifyOtpPage() {
  const cookieStore = await cookies()
  const email = cookieStore.get('pending_verification_email')?.value

  if (!email) {
    redirect('/register')
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center py-20 px-4">
      {/* Brand Header */}
      <h1 className="text-4xl font-black tracking-[0.2em] text-slate-950 uppercase mb-12">
        {BRAND_NAME}
      </h1>

      <VerifyOtpForm email={email} />
    </div>
  )
}
