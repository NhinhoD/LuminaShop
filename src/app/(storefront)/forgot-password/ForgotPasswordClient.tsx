"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/server/presentation/actions/auth";
import { createClient } from "@/client/lib/supabase";
import { ROUTES } from "@/shared/constants";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

interface Props {
  locale: string;
  authDict?: Record<string, string>;
}

/**
 * Sends a password recovery email through the browser client with a
 * server-action fallback. Business logic is unchanged.
 *
 * @param props - Locale and dictionary section.
 * @returns Recovery form or success state.
 */
export function ForgotPasswordClient({ locale, authDict = {} }: Props): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
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
      <div className="py-2">
        <div className="flex items-start gap-3 border border-success/30 border-l-2 border-l-success bg-success/5 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div className="min-w-0">
            <h2 className="font-display text-[15px] font-semibold tracking-[-0.03em] text-dark">
              {locale === "vi" ? "Đã gửi email khôi phục!" : "Recovery Email Sent!"}
            </h2>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-dark/55">
              {locale === "vi"
                ? `Chúng tôi đã gửi liên kết đặt lại mật khẩu đến ${email}. Vui lòng kiểm tra hộp thư đến của bạn.`
                : `We have sent a password reset link to ${email}. Please check your inbox to continue.`}
            </p>
          </div>
        </div>

        <div className="mt-5 border-t border-border pt-5">
          <Link
            href={ROUTES.LOGIN}
            className="inline-flex items-center justify-center gap-2 bg-dark px-5 py-3 text-[11.5px] font-semibold text-background transition-colors hover:bg-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{authDict.backToLogin || (locale === "vi" ? "Quay lại Đăng nhập" : "Back to Sign In")}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="border border-error/30 bg-error/5 p-3 text-[11.5px] leading-relaxed text-error">
          {error}
        </div>
      )}

      <div>
        <label className="mono-meta mb-1.5 block text-[8.5px] text-dark/55" htmlFor="email">
          {authDict.emailLabel || (locale === "vi" ? "Địa chỉ Email của bạn" : "Your Email Address")}{" "}
          <span className="text-primary">*</span>
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dark/35" />
          <input
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@gmail.com"
            required
            type="email"
            autoComplete="email"
            className="h-10 w-full border border-border bg-background pl-9 pr-3 text-[12px] text-dark outline-none transition-colors placeholder:text-dark/30 focus:border-dark"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 bg-primary py-3 text-[11.5px] font-semibold text-background transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>{authDict.sending || (locale === "vi" ? "Đang gửi..." : "Sending...")}</span>
          </>
        ) : (
          <>
            <span>{authDict.sendResetLink || (locale === "vi" ? "Gửi liên kết khôi phục" : "Send Reset Link")}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>

      <div className="border-t border-border pt-4">
        <Link
          href={ROUTES.LOGIN}
          className="inline-flex items-center gap-1.5 text-[11px] text-dark/45 transition-colors hover:text-dark"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{authDict.backToLogin || (locale === "vi" ? "Quay lại Đăng nhập" : "Back to Sign In")}</span>
        </Link>
      </div>
    </form>
  );
}
