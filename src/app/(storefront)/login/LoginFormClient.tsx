"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { login } from "@/presentation/actions/auth";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

interface LoginFormClientProps {
  locale: string;
  authDict: Record<string, string>;
  error?: string;
}

export function LoginFormClient({ locale, authDict, error }: LoginFormClientProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await login(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="text-red-600 text-xs font-medium bg-red-50 py-2.5 px-3.5 rounded-xl border border-red-100 flex items-center gap-2">
          <span>{authDict.loginError || (locale === "vi" ? "Email hoặc mật khẩu không chính xác." : "Invalid email or password.")}</span>
        </div>
      )}

      {/* Email Input */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="email">
          {authDict.emailLabel || (locale === "vi" ? "Địa chỉ Email" : "Email Address")}{" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="example@gmail.com"
            className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200/80 rounded-xl text-sm font-normal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Password Input */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-xs font-medium text-slate-700" htmlFor="password">
            {authDict.passwordLabel || (locale === "vi" ? "Mật khẩu" : "Password")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-primary hover:text-primary-dark hover:underline transition-colors font-medium"
          >
            {authDict.forgotPassword || (locale === "vi" ? "Quên mật khẩu?" : "Forgot password?")}
          </Link>
        </div>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••"
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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 group shadow-xs active:scale-98 cursor-pointer text-sm disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{locale === "vi" ? "Đang đăng nhập..." : "Signing in..."}</span>
          </>
        ) : (
          <>
            <span>{authDict.loginButton || (locale === "vi" ? "Đăng nhập" : "Sign In")}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  );
}
