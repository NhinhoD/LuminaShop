'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { verifySignupOtpAction, resendOtpAction } from '@/server/presentation/actions/auth';
import { useI18n } from '@/client/components/common/I18nContext';
import { toast } from '@/client/hooks/useToastStore';
import { MailCheck, Loader2, ArrowRight } from 'lucide-react';

interface VerifyOtpFormProps {
  email: string;
}

/**
 * Six-digit OTP verification form.
 *
 * Renders inside the auth Spec Sheet panel provided by the page; input,
 * paste, auto-submit and resend logic are unchanged.
 *
 * @param props - Pending verification email.
 * @returns OTP form.
 */
export default function VerifyOtpForm({ email }: VerifyOtpFormProps): React.JSX.Element {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { dict, locale } = useI18n();

  const [timer, setTimer] = useState(60);
  const canResend = timer === 0;
  const [resendStatus, setResendStatus] = useState<{ type: 'success' | 'error' | 'pending'; message: string } | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number): void => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number): void => {
    const value = e.target.value;
    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      submitOtp(newOtp.join(''));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    if (pastedData.length === 6) {
      submitOtp(newOtp.join(''));
      inputRefs.current[5]?.focus();
    } else {
      inputRefs.current[pastedData.length]?.focus();
    }
  };

  const submitOtp = (tokenString: string): void => {
    setError(null);
    setResendStatus(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append('token', tokenString);
      const result = await verifySignupOtpAction(formData);
      if (result?.error) {
        setError(result.error);
        toast.error(
          locale === 'vi' ? 'Mã OTP không hợp lệ' : 'Invalid OTP',
          result.error
        );
      } else {
        toast.success(
          locale === 'vi' ? 'Xác thực thành công!' : 'Verification successful!',
          locale === 'vi' ? 'Chào mừng bạn gia nhập KhoUI.' : 'Welcome to KhoUI.'
        );
      }
    });
  };

  const handleResend = async (): Promise<void> => {
    if (resendStatus?.type === 'pending') {
      return;
    }

    setResendStatus({
      type: 'pending',
      message: dict?.auth?.sending || 'Đang gửi mã...',
    });
    setError(null);

    const result = await resendOtpAction();

    if (result?.error) {
      setResendStatus({ type: 'error', message: result.error });
      toast.error(
        locale === 'vi' ? 'Gửi lại OTP thất bại' : 'Failed to resend OTP',
        result.error
      );
    } else {
      const msg = dict?.auth?.otpResentSuccess || 'Mã xác thực mới đã được gửi.';
      setResendStatus({
        type: 'success',
        message: msg,
      });
      toast.success(
        locale === 'vi' ? 'Đã gửi lại mã OTP!' : 'OTP resent!',
        locale === 'vi' ? 'Vui lòng kiểm tra hộp thư đến của bạn.' : 'Please check your inbox.'
      );
      setTimer(60);
    }
  };

  return (
    <div>
      <div className="mb-5 flex justify-center">
        <span className="flex h-12 w-12 items-center justify-center border border-border text-primary">
          <MailCheck className="h-5 w-5" />
        </span>
      </div>

      <div className="border-b border-border pb-5">
        <span className="mono-meta flex items-center justify-center gap-2 text-primary">
          <span className="h-1.5 w-1.5 bg-primary" />
          {dict?.auth?.verifyOtpTag || (locale === 'vi' ? 'BẢO MẬT & XÁC THỰC' : 'SECURITY & VERIFICATION')}
        </span>
        <h2 className="mt-2.5 font-display text-[1.4rem] font-bold tracking-[-0.04em] text-dark">
          {dict?.auth?.verifyEmailTitle || (locale === 'vi' ? 'Xác minh Email' : 'Verify Email')}
        </h2>
        <p className="mt-2 text-[11.5px] leading-relaxed text-dark/50">
          {dict?.auth?.verifyEmailSent || (locale === 'vi' ? 'Mã OTP 6 chữ số đã được gửi đến:' : 'A 6-digit code was sent to:')}{' '}
          <strong className="font-semibold text-dark">{email}</strong>
        </p>
      </div>

      {error && (
        <div className="mt-4 border border-error/30 bg-error/5 p-3 text-left text-[11.5px] leading-relaxed text-error">
          {error}
        </div>
      )}

      {resendStatus && (
        <div
          className={`mt-4 border p-3 text-left text-[11.5px] leading-relaxed ${
            resendStatus.type === 'error'
              ? 'border-error/30 bg-error/5 text-error'
              : 'border-success/30 bg-success/5 text-success'
          }`}
        >
          {resendStatus.message}
        </div>
      )}

      <div className="mb-6 mt-6 flex justify-center gap-1.5 sm:gap-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{1}"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            disabled={isPending}
            className="h-12 w-10 border border-border bg-background text-center font-mono text-[1.15rem] font-bold text-dark outline-none transition-colors focus:border-dark disabled:bg-background-subtle disabled:opacity-50 sm:w-12"
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => submitOtp(otp.join(''))}
        disabled={isPending || otp.some((d) => d === '')}
        className="mb-5 flex w-full items-center justify-center gap-2 bg-dark py-3 text-[11.5px] font-semibold text-background transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>{locale === 'vi' ? 'Đang xác thực...' : 'Verifying...'}</span>
          </>
        ) : (
          <>
            <span>{dict?.auth?.confirm || (locale === 'vi' ? 'Xác nhận & Hoàn tất' : 'Confirm & Complete')}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>

      <div className="border-t border-border pt-4 text-[11px] text-dark/45">
        {dict?.auth?.noCodeReceived || (locale === 'vi' ? 'Chưa nhận được mã?' : "Didn't receive code?")}{' '}
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={isPending}
            className="font-semibold text-primary transition-colors hover:text-dark"
          >
            {dict?.auth?.resendCode || (locale === 'vi' ? 'Gửi lại mã' : 'Resend Code')}
          </button>
        ) : (
          <span className="font-mono text-dark/35">
            {dict?.auth?.resendIn || (locale === 'vi' ? 'Gửi lại sau' : 'Resend in')} {timer}s
          </span>
        )}
      </div>
    </div>
  );
}
