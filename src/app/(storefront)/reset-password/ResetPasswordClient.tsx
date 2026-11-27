"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { updatePasswordAction } from "@/server/presentation/actions/auth";
import { createClient } from "@/client/lib/supabase";
import { ROUTES } from "@/shared/constants";
import { Lock, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

interface Props {
  locale: string;
  authDict?: Record<string, string>;
  initialError?: string;
  code?: string;
}

/**
 * Completes a password reset via the browser Supabase session with a
 * server-action fallback. Business logic is unchanged.
 *
 * @param props - Locale, dictionary section, initial error and PKCE code.
 * @returns Reset form or success state.
 */
export function ResetPasswordClient({ locale, authDict = {}, initialError, code }: Props): React.JSX.Element {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isExchangingCode, setIsExchangingCode] = useState(Boolean(code));
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    // 1. Coordinate PKCE exchange: wait for exchangeCodeForSession to complete before allowing submission
    if (code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .catch(() => {
          // Handled or already exchanged via server route
        })
        .finally(() => {
          if (isMounted) {
            setIsExchangingCode(false);
          }
        });
    }

    // 2. Listen for recovery events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setError(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [code]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (loading || isExchangingCode) return;

    if (password.length < 6) {
      setError(locale === "vi" ? "Mật khẩu phải có ít nhất 6 ký tự." : "Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError(locale === "vi" ? "Mật khẩu xác nhận không khớp." : "Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();

    // 1. Attempt update via browser client (handles URL hash tokens / active recovery sessions)
    try {
      const { error: clientError } = await supabase.auth.updateUser({ password });

      if (!clientError) {
        setLoading(false);
        setSubmitted(true);
        return;
      }
    } catch {
      // Fall through to server action fallback
    }

    // 3. Fallback to server action (handles HTTP-only cookie sessions from /auth/callback)
    const formData = new FormData();
    formData.append("password", password);
    const res = await updatePasswordAction(formData);

    setLoading(false);
    if (!res.error) {
      setSubmitted(true);
    } else {
      setError(
        locale === "vi"
          ? "Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng gửi lại yêu cầu mới."
          : (res.error || "Password reset session is invalid or expired.")
      );
    }
  };

  if (submitted) {
    return (
      <div className="py-2">
        <div className="flex items-start gap-3 border border-success/30 border-l-2 border-l-success bg-success/5 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div className="min-w-0">
            <h2 className="font-display text-[15px] font-semibold tracking-[-0.03em] text-dark">
              {locale === "vi" ? "Đổi mật khẩu thành công!" : "Password Updated!"}
            </h2>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-dark/55">
              {locale === "vi"
                ? "Mật khẩu của bạn đã được cập nhật an toàn. Bạn có thể đăng nhập lại ngay bây giờ."
                : "Your password has been successfully updated. You can now sign in with your new password."}
            </p>
          </div>
        </div>

        <div className="mt-5 border-t border-border pt-5">
          <Link
            href={ROUTES.LOGIN}
            className="inline-flex items-center justify-center gap-2 bg-dark px-5 py-3 text-[11.5px] font-semibold text-background transition-colors hover:bg-primary"
          >
            <span>{locale === "vi" ? "Đăng nhập ngay" : "Sign In Now"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
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

      {/* New password */}
      <div>
        <label className="mono-meta mb-1.5 block text-[8.5px] text-dark/55" htmlFor="password">
          {authDict.newPasswordLabel || (locale === "vi" ? "Mật khẩu mới (tối thiểu 6 ký tự)" : "New Password (min 6 characters)")}{" "}
          <span className="text-primary">*</span>
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dark/35" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
            className="h-10 w-full border border-border bg-background pl-9 pr-10 text-[12px] text-dark outline-none transition-colors placeholder:text-dark/30 focus:border-dark"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-dark/35 transition-colors hover:text-dark"
            aria-label={showPassword ? (authDict.hidePassword || "Hide password") : (authDict.showPassword || "Show password")}
          >
            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Confirm new password */}
      <div>
        <label className="mono-meta mb-1.5 block text-[8.5px] text-dark/55" htmlFor="confirmPassword">
          {authDict.confirmPasswordLabel || (locale === "vi" ? "Xác nhận mật khẩu mới" : "Confirm New Password")}{" "}
          <span className="text-primary">*</span>
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dark/35" />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
            className="h-10 w-full border border-border bg-background pl-9 pr-10 text-[12px] text-dark outline-none transition-colors placeholder:text-dark/30 focus:border-dark"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-dark/35 transition-colors hover:text-dark"
            aria-label={showConfirmPassword ? (authDict.hidePassword || "Hide password") : (authDict.showPassword || "Show password")}
          >
            {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <button
          type="submit"
          disabled={loading || isExchangingCode}
          className="flex w-full items-center justify-center gap-2 bg-primary py-3 text-[11.5px] font-semibold text-background transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{locale === "vi" ? "Đang lưu..." : "Saving..."}</span>
            </>
          ) : isExchangingCode ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{locale === "vi" ? "Đang xác thực phiên..." : "Verifying session..."}</span>
            </>
          ) : (
            <>
              <span>{authDict.saveNewPassword || (locale === "vi" ? "Lưu mật khẩu mới" : "Save New Password")}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
