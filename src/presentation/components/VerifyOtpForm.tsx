'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { verifySignupOtpAction, resendOtpAction } from '@/presentation/actions/auth';
import { motion } from 'framer-motion';
import { useI18n } from '@/presentation/components/common/I18nContext';
import { toast } from '@/presentation/hooks/useToastStore';
import { MailCheck, Loader2, ArrowRight } from 'lucide-react';

interface VerifyOtpFormProps {
  email: string;
}

export default function VerifyOtpForm({ email }: VerifyOtpFormProps) {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
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

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
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

  const submitOtp = (tokenString: string) => {
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

  const handleResend = async () => {
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-[460px] bg-white rounded-3xl border border-slate-100 p-8 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] text-center font-sans"
    >
      <div className="mb-6 flex justify-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
          <MailCheck className="w-7 h-7" />
        </div>
      </div>

      <div className="mb-8">
        <span className="text-xs font-semibold tracking-wider text-primary uppercase block mb-1">
          {dict?.auth?.verifyOtpTag || (locale === 'vi' ? 'BẢO MẬT & XÁC THỰC' : 'SECURITY & VERIFICATION')}
        </span>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {dict?.auth?.verifyEmailTitle || (locale === 'vi' ? 'Xác minh Email' : 'Verify Email')}
        </h1>
        <p className="text-slate-500 text-xs mt-1.5 font-normal leading-relaxed">
          {dict?.auth?.verifyEmailSent || (locale === 'vi' ? 'Mã OTP 6 chữ số đã được gửi đến:' : 'A 6-digit code was sent to:')}{' '}
          <strong className="font-semibold text-slate-900">{email}</strong>
        </p>
      </div>

      {error && (
        <div className="text-red-600 text-xs font-medium bg-red-50 py-2.5 px-3.5 rounded-xl border border-red-100 mb-6 text-left">
          {error}
        </div>
      )}

      {resendStatus && (
        <div
          className={`text-xs font-medium py-2.5 px-3.5 rounded-xl mb-6 text-left ${
            resendStatus.type === 'error'
              ? 'bg-red-50 text-red-600 border border-red-100'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
          }`}
        >
          {resendStatus.message}
        </div>
      )}

      <div className="flex justify-center gap-2.5 sm:gap-3 mb-8">
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
            className="w-11 h-13 sm:w-12 sm:h-13 text-center text-xl font-mono font-bold bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:bg-slate-50"
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => submitOtp(otp.join(''))}
        disabled={isPending || otp.some((d) => d === '')}
        className="w-full h-11 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 group shadow-xs active:scale-98 cursor-pointer text-sm mb-6 disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{locale === 'vi' ? 'Đang xác thực...' : 'Verifying...'}</span>
          </>
        ) : (
          <>
            <span>{dict?.auth?.confirm || (locale === 'vi' ? 'Xác nhận & Hoàn tất' : 'Confirm & Complete')}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      <div className="text-xs text-slate-500 font-normal">
        {dict?.auth?.noCodeReceived || (locale === 'vi' ? 'Chưa nhận được mã?' : "Didn't receive code?")}{' '}
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={isPending}
            className="text-primary font-semibold hover:underline cursor-pointer"
          >
            {dict?.auth?.resendCode || (locale === 'vi' ? 'Gửi lại mã' : 'Resend Code')}
          </button>
        ) : (
          <span className="text-slate-400 font-mono">
            {dict?.auth?.resendIn || (locale === 'vi' ? 'Gửi lại sau' : 'Resend in')} {timer}s
          </span>
        )}
      </div>
    </motion.div>
  );
}
