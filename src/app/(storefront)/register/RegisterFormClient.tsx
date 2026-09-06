"use client";

import { useState, useTransition } from "react";
import { signup } from "@/presentation/actions/auth";
import { toast } from "@/presentation/hooks/useToastStore";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Loader2, Info } from "lucide-react";

interface RegisterFormClientProps {
  locale: string;
  authDict: Record<string, string>;
  error?: string;
}

export function RegisterFormClient({ locale, authDict, error }: RegisterFormClientProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.warning(
        locale === "vi" ? "Mật khẩu quá ngắn" : "Password too short",
        locale === "vi" ? "Mật khẩu phải có ít nhất 6 ký tự." : "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.warning(
        locale === "vi" ? "Mật khẩu không khớp" : "Passwords do not match",
        locale === "vi" ? "Vui lòng kiểm tra lại mật khẩu xác nhận." : "Please check your confirm password."
      );
      return;
    }

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await signup(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-red-600 text-xs font-medium bg-red-50 py-2.5 px-3.5 rounded-xl border border-red-100 flex items-center gap-2">
          <span>{authDict.registerError || (locale === "vi" ? "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin." : "Registration failed. Please try again.")}</span>
        </div>
      )}

      {/* Names Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="firstName">
            {authDict.firstNameLabel || (locale === "vi" ? "Họ & Tên lót" : "First Name")}
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="firstName"
              name="firstName"
              type="text"
              placeholder={locale === "vi" ? "Nguyễn Văn" : "Jane"}
              className="w-full h-11 pl-10 pr-3.5 bg-white border border-slate-200/80 rounded-xl text-sm font-normal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="lastName">
            {authDict.lastNameLabel || (locale === "vi" ? "Tên" : "Last Name")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              placeholder={locale === "vi" ? "A" : "Doe"}
              className="w-full h-11 pl-10 pr-3.5 bg-white border border-slate-200/80 rounded-xl text-sm font-normal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

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
            className="w-full h-11 pl-10 pr-3.5 bg-white border border-slate-200/80 rounded-xl text-sm font-normal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Password Input */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="password">
          {authDict.passwordLabel || (locale === "vi" ? "Mật khẩu" : "Password")}{" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400 font-normal">
          <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>{authDict.passwordRequirement || (locale === "vi" ? "Mật khẩu phải có tối thiểu 6 ký tự." : "Password must be at least 6 characters.")}</span>
        </p>
      </div>

      {/* Confirm Password Input */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="confirmPassword">
          {authDict.confirmPasswordLabel || (locale === "vi" ? "Xác nhận mật khẩu" : "Confirm Password")}{" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
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

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full h-11 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 group shadow-xs active:scale-98 cursor-pointer text-sm disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{locale === "vi" ? "Đang xử lý..." : "Creating account..."}</span>
            </>
          ) : (
            <>
              <span>{authDict.createAccountButton || (locale === "vi" ? "Đăng ký tài khoản" : "Create Account")}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
