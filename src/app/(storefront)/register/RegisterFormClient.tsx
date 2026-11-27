"use client";

import { useState, useTransition } from "react";
import { signup } from "@/server/presentation/actions/auth";
import { toast } from "@/client/hooks/useToastStore";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Loader2, Info } from "lucide-react";

interface RegisterFormClientProps {
  locale: string;
  authDict: Record<string, string>;
  error?: string;
}

const FIELD_CLASS =
  "h-10 w-full border border-border bg-background pl-9 pr-3 text-[12px] text-dark outline-none transition-colors placeholder:text-dark/30 focus:border-dark";

/**
 * Account creation form on the Spec Sheet chrome.
 *
 * @param props - Locale, dictionary section and optional server error code.
 * @returns Registration form.
 */
export function RegisterFormClient({ locale, authDict, error }: RegisterFormClientProps): React.JSX.Element {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
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
        <div className="flex items-start gap-2 border border-error/30 bg-error/5 p-3 text-[11.5px] leading-relaxed text-error">
          <span>{authDict.registerError || (locale === "vi" ? "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin." : "Registration failed. Please try again.")}</span>
        </div>
      )}

      {/* Names */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mono-meta mb-1.5 block text-[8.5px] text-dark/55" htmlFor="firstName">
            {authDict.firstNameLabel || (locale === "vi" ? "Họ & Tên lót" : "First Name")}
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dark/35" />
            <input
              id="firstName"
              name="firstName"
              type="text"
              placeholder={locale === "vi" ? "Nguyễn Văn" : "Jane"}
              className={FIELD_CLASS}
            />
          </div>
        </div>

        <div>
          <label className="mono-meta mb-1.5 block text-[8.5px] text-dark/55" htmlFor="lastName">
            {authDict.lastNameLabel || (locale === "vi" ? "Tên" : "Last Name")}{" "}
            <span className="text-primary">*</span>
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dark/35" />
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              placeholder={locale === "vi" ? "A" : "Doe"}
              className={FIELD_CLASS}
            />
          </div>
        </div>
      </div>

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
            className={FIELD_CLASS}
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="mono-meta mb-1.5 block text-[8.5px] text-dark/55" htmlFor="password">
          {authDict.passwordLabel || (locale === "vi" ? "Mật khẩu" : "Password")}{" "}
          <span className="text-primary">*</span>
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dark/35" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        <p className="mono-meta mt-1.5 flex items-center gap-1.5 text-[7.5px] text-dark/35">
          <Info className="h-3 w-3 shrink-0" />
          <span>{authDict.passwordRequirement || (locale === "vi" ? "Mật khẩu phải có tối thiểu 6 ký tự." : "Password must be at least 6 characters.")}</span>
        </p>
      </div>

      {/* Confirm password */}
      <div>
        <label className="mono-meta mb-1.5 block text-[8.5px] text-dark/55" htmlFor="confirmPassword">
          {authDict.confirmPasswordLabel || (locale === "vi" ? "Xác nhận mật khẩu" : "Confirm Password")}{" "}
          <span className="text-primary">*</span>
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dark/35" />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
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

      {/* Submit */}
      <div className="border-t border-border pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 bg-primary py-3 text-[11.5px] font-semibold text-background transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{locale === "vi" ? "Đang xử lý..." : "Creating account..."}</span>
            </>
          ) : (
            <>
              <span>{authDict.createAccountButton || (locale === "vi" ? "Đăng ký tài khoản" : "Create Account")}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
