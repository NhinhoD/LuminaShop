"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { updatePasswordAction } from "@/presentation/actions/auth";
import { createClient } from "@/infrastructure/supabase/client";
import { ROUTES } from "@/presentation/constants";
import { Lock, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

interface Props {
  locale: string;
  authDict?: Record<string, string>;
  initialError?: string;
  code?: string;
}

export function ResetPasswordClient({ locale, authDict = {}, initialError, code }: Props) {
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

  const handleSubmit = async (e: React.FormEvent) => {
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
      <div className="text-center py-4 space-y-5">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {locale === "vi" ? "Đổi mật khẩu thành công!" : "Password Updated!"}
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {locale === "vi" 
              ? "Mật khẩu của bạn đã được cập nhật an toàn. Bạn có thể đăng nhập lại ngay bây giờ." 
              : "Your password has been successfully updated. You can now sign in with your new password."}
          </p>
        </div>
        <div className="pt-2">
          <Link
            href={ROUTES.LOGIN}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-all text-sm shadow-xs active:scale-98"
          >
            <span>{locale === "vi" ? "Đăng nhập ngay" : "Sign In Now"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-red-600 text-xs font-medium bg-red-50 py-2.5 px-3.5 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* New Password */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="password">
          {authDict.newPasswordLabel || (locale === "vi" ? "Mật khẩu mới (tối thiểu 6 ký tự)" : "New Password (min 6 characters)")}{" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            id="password" 
            name="password" 
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required 
            autoComplete="new-password"
            className="w-full h-11 pl-10 pr-11 bg-white border border-slate-200/80 rounded-xl text-sm font-normal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Confirm New Password */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="confirmPassword">
          {authDict.confirmPasswordLabel || (locale === "vi" ? "Xác nhận mật khẩu mới" : "Confirm New Password")}{" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            id="confirmPassword" 
            name="confirmPassword" 
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required 
            autoComplete="new-password"
            className="w-full h-11 pl-10 pr-11 bg-white border border-slate-200/80 rounded-xl text-sm font-normal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="pt-2">
        <button 
          type="submit"
          disabled={loading || isExchangingCode}
          className="w-full h-11 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 group shadow-xs active:scale-98 cursor-pointer text-sm disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{locale === "vi" ? "Đang lưu..." : "Saving..."}</span>
            </>
          ) : isExchangingCode ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{locale === "vi" ? "Đang xác thực phiên..." : "Verifying session..."}</span>
            </>
          ) : (
            <>
              <span>{authDict.saveNewPassword || (locale === "vi" ? "Lưu mật khẩu mới" : "Save New Password")}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
