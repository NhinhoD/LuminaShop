import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import VerifyOtpForm from '@/presentation/components/VerifyOtpForm';
import { ROUTES } from '@/presentation/constants';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';

export default async function VerifyOtpPage(): Promise<React.ReactNode> {
  const cookieStore = await cookies();
  const email = cookieStore.get('pending_verification_email')?.value;

  if (!email) {
    redirect(ROUTES.REGISTER);
  }

  return (
    <main className="min-h-[calc(100vh-140px)] bg-background-subtle flex flex-col items-center justify-center py-16 px-4 font-sans">
      {/* Brand Logo */}
      <Link href={ROUTES.HOME} className="mb-8 group transition-transform hover:scale-102 flex flex-col items-center">
        <Image
          src="/LogoKhoUI.png"
          alt="KhoUI Logo"
          width={140}
          height={48}
          priority
          className="h-11 w-auto object-contain"
        />
      </Link>

      <VerifyOtpForm email={email} />
    </main>
  );
}
