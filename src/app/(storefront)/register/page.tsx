import Link from "next/link";
import Image from "next/image";
import { signup } from "@/presentation/actions/auth";
import { ROUTES } from "@/presentation/constants";
import { getDictionary, getLocale } from "@/i18n/getDictionary";
import { makeLanguageRepository } from "@/infrastructure/supabase/container";
import { Mail, Lock, KeyRound, Info, ArrowRight } from "lucide-react";
import { AuthErrorToast } from "@/presentation/components/auth/AuthErrorToast";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const locale = await getLocale();
  const langRepo = await makeLanguageRepository();
  const dict = await getDictionary(langRepo);
  const authDict = (dict?.auth as Record<string, string>) || {};

  return (
    <div className="min-h-screen bg-background-subtle/50 flex flex-col items-center justify-center py-20 px-4 font-sans">
      <AuthErrorToast locale={locale} />

      {/* Brand Header */}
      <Link href={ROUTES.HOME} className="mb-10">
        <Image src="/LogoKhoUI.png" alt="KhoUI Logo" width={160} height={56} priority className="h-14 w-auto object-contain" />
      </Link>

      {/* Registration Card */}
      <div className="w-full max-w-[540px] bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-100 p-8 sm:p-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-slate-950 mb-2 tracking-tight">
            {authDict.registerTitle || (locale === "vi" ? "Tạo tài khoản mới" : "Create an Account")}
          </h2>
          <p className="text-slate-500 text-sm max-w-[85%] mx-auto">
            {authDict.registerSubtitle || (locale === "vi" ? "Tham gia cùng KhoUI để quản lý và tải các mẫu website bản quyền dễ dàng." : "Join KhoUI to easily manage and download your licensed templates.")}
          </p>
          {params?.error && (
            <p className="text-red-500 text-xs mt-4 font-medium bg-red-50 py-2.5 rounded-xl border border-red-100">
              {authDict.registerError || (locale === "vi" ? "Đăng ký thất bại. Vui lòng thử lại." : "Registration failed. Please try again.")}
            </p>
          )}
        </div>

        <form action={signup} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2" htmlFor="firstName">
                {authDict.firstNameLabel || (locale === "vi" ? "Họ & Tên đệm" : "First Name")}
              </label>
              <input 
                className="w-full h-12 px-4 bg-slate-50/50 border border-slate-200/80 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 font-medium"
                id="firstName" 
                name="firstName" 
                placeholder={locale === "vi" ? "Nguyễn Văn" : "Jane"} 
                required 
                type="text" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2" htmlFor="lastName">
                {authDict.lastNameLabel || (locale === "vi" ? "Tên" : "Last Name")}
              </label>
              <input 
                className="w-full h-12 px-4 bg-slate-50/50 border border-slate-200/80 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 font-medium"
                id="lastName" 
                name="lastName" 
                placeholder={locale === "vi" ? "A" : "Doe"} 
                required 
                type="text" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2" htmlFor="email">
              {authDict.emailLabel || (locale === "vi" ? "Địa chỉ Email" : "Email Address")}
            </label>
            <div className="relative group">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                className="w-full h-12 pl-12 pr-4 bg-slate-50/50 border border-slate-200/80 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 font-medium"
                id="email" 
                name="email" 
                placeholder="example@gmail.com" 
                required 
                type="email" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2" htmlFor="password">
              {authDict.passwordLabel || (locale === "vi" ? "Mật khẩu" : "Password")}
            </label>
            <div className="relative group">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                className="w-full h-12 pl-12 pr-4 bg-slate-50/50 border border-slate-200/80 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 font-medium"
                id="password" 
                name="password" 
                placeholder="••••••••" 
                required 
                type="password" 
              />
            </div>
            <p className="mt-2 flex items-start gap-2 text-[10px] text-slate-400 leading-tight font-medium">
              <Info size={14} className="flex-shrink-0 text-slate-400 mt-0.5" />
              <span>{authDict.passwordRequirement || (locale === "vi" ? "Mật khẩu phải có ít nhất 8 ký tự, gồm ít nhất một chữ hoa và một số." : "Password must be at least 8 characters with at least one uppercase letter and one number.")}</span>
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2" htmlFor="confirmPassword">
              {authDict.confirmPasswordLabel || (locale === "vi" ? "Xác nhận mật khẩu" : "Confirm Password")}
            </label>
            <div className="relative group">
              <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                className="w-full h-12 pl-12 pr-4 bg-slate-50/50 border border-slate-200/80 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 font-medium"
                id="confirmPassword" 
                name="confirmPassword" 
                placeholder="••••••••" 
                required 
                type="password" 
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full h-12 bg-primary text-white font-extrabold rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 group shadow-md shadow-primary/20 active:scale-[0.98] cursor-pointer text-xs uppercase tracking-wider pt-0.5"
          >
            <span>{authDict.createAccountButton || (locale === "vi" ? "Đăng ký tài khoản" : "Create Account")}</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
            <span className="bg-white px-4">{authDict.orText || (locale === "vi" ? "Hoặc" : "Or")}</span>
          </div>
        </div>

        <div className="text-center text-sm text-slate-500">
          {authDict.hasAccount || (locale === "vi" ? "Đã có tài khoản?" : "Already have an account?")}{" "}
          <Link href={ROUTES.LOGIN} className="text-primary font-extrabold hover:underline underline-offset-4">
            {authDict.loginButton || (locale === "vi" ? "Đăng nhập" : "Sign In")}
          </Link>
        </div>
      </div>
    </div>
  );
}

