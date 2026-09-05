"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/presentation/actions/auth";
import { createClient } from "@/infrastructure/supabase/client";
import { ROUTES } from "@/presentation/constants";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

interface Props {
  locale: string;
  authDict?: Record<string, string>;
}

export function ForgotPasswordClient({ locale, authDict = {} }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Call browser Supabase client to store the PKCE code_verifier cookie
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/reset-password`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (!resetError) {
        setLoading(false);
        setSubmitted(true);
        return;
      }
    } catch {
      // Fall through to server action fallback
    }

    // 2. Server Action fallback
    const formData = new FormData();
    formData.append("email", email);
    const res = await forgotPasswordAction(formData);

    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-4 space-y-5">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {locale === "vi" ? "Đã gửi email khôi phục!" : "Recovery Email Sent!"}
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {locale === "vi" 
              ? `Chúng tôi đã gửi liên kết đặt lại mật khẩu đến ${email}. Vui lòng kiểm tra hộp thư đến của bạn.` 
              : `We have sent a password reset link to ${email}. Please check your inbox to continue.`}
          </p>
        </div>

        <div className="pt-2">
          <Link
            href={ROUTES.LOGIN}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-all text-sm shadow-xs active:scale-98"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{authDict.backToLogin || (locale === "vi" ? "Quay lại Đăng nhập" : "Back to Sign In")}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="text-red-600 text-xs font-medium bg-red-50 py-2.5 px-3.5 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="email">
          {authDict.emailLabel || (locale === "vi" ? "Địa chỉ Email của bạn" : "Your Email Address")}{" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            id="email" 
            name="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@gmail.com"
            required 
            type="email" 
            autoComplete="email"
            className="w-full h-11 pl-10 pr-3.5 bg-white border border-slate-200/80 rounded-xl text-sm font-normal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <button 
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 group shadow-xs active:scale-98 cursor-pointer text-sm disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{authDict.sending || (locale === "vi" ? "Đang gửi..." : "Sending...")}</span>
          </>
        ) : (
          <>
            <span>{authDict.sendResetLink || (locale === "vi" ? "Gửi liên kết khôi phục" : "Send Reset Link")}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      <div className="text-center pt-2">
        <Link 
          href={ROUTES.LOGIN} 
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{authDict.backToLogin || (locale === "vi" ? "Quay lại Đăng nhập" : "Back to Sign In")}</span>
        </Link>
      </div>
    </form>
  );
}
