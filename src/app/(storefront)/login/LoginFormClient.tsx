"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { login } from "@/server/presentation/actions/auth";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

interface LoginFormClientProps {
  locale: string;
  authDict: Record<string, string>;
  error?: string;
}

/**
 * Email/password sign-in form on the Spec Sheet chrome.
 *
 * @param props - Locale, dictionary section and optional server error code.
 * @returns Sign-in form.
 */
export function LoginFormClient({ locale, authDict, error }: LoginFormClientProps): React.JSX.Element {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await login(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 border border-error/30 bg-error/5 p-3 text-[11.5px] leading-relaxed text-error">
          <span>{authDict.loginError || (locale === "vi" ? "Email hoặc mật khẩu không chính xác." : "Invalid email or password.")}</span>
        </div>
      )}

      {/* Email */}
      <div>
        <label className="mono-meta mb-1.5 block text-[8.5px] text-dark/55" htmlFor="email">
          {authDict.emailLabel || (locale === "vi" ? "Địa chỉ Email" : "Email Address")}{" "}
          <span className="text-primary">*</span>
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dark/35" />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="example@gmail.com"
            className="h-10 w-full border border-border bg-background pl-9 pr-3 text-[12px] text-dark outline-none transition-colors placeholder:text-dark/30 focus:border-dark"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label className="mono-meta block text-[8.5px] text-dark/55" htmlFor="password">
            {authDict.passwordLabel || (locale === "vi" ? "Mật khẩu" : "Password")}{" "}
            <span className="text-primary">*</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-[10.5px] text-primary transition-colors hover:text-dark"
          >
            {authDict.forgotPassword || (locale === "vi" ? "Quên mật khẩu?" : "Forgot password?")}
          </Link>
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dark/35" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••"
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

      {/* Submit */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 bg-primary py-3 text-[11.5px] font-semibold text-background transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{locale === "vi" ? "Đang đăng nhập..." : "Signing in..."}</span>
            </>
          ) : (
            <>
              <span>{authDict.loginButton || (locale === "vi" ? "Đăng nhập" : "Sign In")}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
