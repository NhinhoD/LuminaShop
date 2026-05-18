'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { verifySignupOtpAction, resendOtpAction } from '@/presentation/actions/auth'
import { motion } from 'framer-motion'

interface VerifyOtpFormProps {
  email: string
}

export default function VerifyOtpForm({ email }: VerifyOtpFormProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const [timer, setTimer] = useState(60)
  const canResend = timer === 0
  const [resendStatus, setResendStatus] = useState<{ type: 'success' | 'error' | 'pending', message: string } | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [timer])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value
    if (!/^[0-9]*$/.test(value)) return // Only allow numbers

    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1) // Keep only the last character entered
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit if all filled
    if (newOtp.every(digit => digit !== '')) {
      submitOtp(newOtp.join(''))
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6)
    if (!pastedData) return

    const newOtp = [...otp]
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i]
    }
    setOtp(newOtp)

    if (pastedData.length === 6) {
      submitOtp(newOtp.join(''))
      inputRefs.current[5]?.focus()
    } else {
      inputRefs.current[pastedData.length]?.focus()
    }
  }

  const submitOtp = (tokenString: string) => {
    setError(null)
    setResendStatus(null)
    
    startTransition(async () => {
      const formData = new FormData()
      formData.append('token', tokenString)
      const result = await verifySignupOtpAction(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  const handleResend = async () => {
    // Guard: return early if resend is already in progress
    if (resendStatus?.type === 'pending') {
      return
    }

    setResendStatus({ type: 'pending', message: 'Đang gửi...' })
    setError(null)

    const result = await resendOtpAction()

    if (result?.error) {
      setResendStatus({ type: 'error', message: result.error })
    } else {
      setResendStatus({ type: 'success', message: 'Mã OTP mới đã được gửi.' })
      // Only reset timer on successful resend
      setTimer(60)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-[480px] bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-slate-100 p-10 md:p-12 text-center"
    >
      <div className="mb-8 flex justify-center">
        <span className="material-symbols-outlined text-5xl text-[#0051d5] bg-blue-50 p-4 rounded-full">
          mark_email_read
        </span>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-2">Xác minh Email</h2>
      <p className="text-slate-500 text-sm mb-8">
        Mã OTP 6 chữ số đã được gửi đến <br />
        <span className="font-medium text-slate-900">{email}</span>
      </p>

      {error && (
        <p className="text-red-500 text-xs mb-6 font-medium bg-red-50 py-3 rounded-sm">{error}</p>
      )}

      {resendStatus && (
        <p className={`text-xs mb-6 font-medium py-3 rounded-sm ${resendStatus.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
          {resendStatus.message}
        </p>
      )}

      <div className="flex justify-center gap-3 mb-8">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el }}
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
            className="w-12 h-14 text-center text-xl font-bold bg-white border border-slate-200 rounded-sm focus:border-[#0051d5] focus:ring-1 focus:ring-[#0051d5] outline-none transition-all disabled:opacity-50 disabled:bg-slate-50"
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => submitOtp(otp.join(''))}
        disabled={isPending || otp.some(d => d === '')}
        className="w-full h-12 bg-black text-white font-bold rounded-sm hover:bg-slate-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-black group mb-6"
      >
        {isPending ? (
          <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
        ) : (
          <>
            Xác nhận
            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
          </>
        )}
      </button>

      <div className="text-sm font-medium text-slate-500">
        Bạn chưa nhận được mã?{' '}
        {canResend ? (
          <button 
            type="button" 
            onClick={handleResend}
            disabled={isPending}
            className="text-[#0051d5] hover:underline underline-offset-4 disabled:opacity-50"
          >
            Gửi lại mã
          </button>
        ) : (
          <span className="text-slate-400">
            Gửi lại sau {timer}s
          </span>
        )}
      </div>
    </motion.div>
  )
}
