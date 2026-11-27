import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import VerifyOtpForm from '@/client/components/VerifyOtpForm';
import { ROUTES } from '@/shared/constants';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = { title: { absolute: "Xác thực OTP | KhoUI" } };

/**
 * Renders the OTP verification page using the pending email cookie.
 */
export default async function VerifyOtpPage(): Promise<React.ReactNode> {
  const cookieStore = await cookies();
  const email = cookieStore.get('pending_verification_email')?.value;

  if (!email) {
    redirect(ROUTES.REGISTER);
  }

  return (
    <main className="flex-grow bg-background font-sans">
      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-[560px]">
          <Link href={ROUTES.HOME} className="inline-flex items-center gap-2 transition-opacity hover:opacity-70">
            <Image
              src="/LogoKhoUI.png"
              alt="KhoUI"
              width={110}
              height={34}
              className="h-8 w-auto object-contain"
            />
            <span className="mono-meta border border-border px-1.5 py-1 text-[7.5px] text-dark/40">
              VN
            </span>
          </Link>

          <div className="mt-8 border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="mono-meta text-[8.5px] text-dark/45">AUTH-05 / VERIFY</span>
              <span className="mono-meta text-[8px] text-dark/25">KHOUI / SECURE</span>
            </div>
            <div className="p-5 text-center sm:p-8">
              <VerifyOtpForm email={email} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
