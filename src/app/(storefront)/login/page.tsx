import Link from "next/link";
import Image from "next/image";
import { login } from "@/presentation/actions/auth";
import { ROUTES } from "@/presentation/constants";
import { getDictionary, getLocale } from "@/i18n/getDictionary";
import { makeLanguageRepository } from "@/infrastructure/supabase/container";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { AuthErrorToast } from "@/presentation/components/auth/AuthErrorToast";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
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

      {/* Login Card */}
      <div className="w-full max-w-[480px] bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-100 p-8 sm:p-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-slate-950 mb-2 tracking-tight">
            {authDict.loginTitle || (locale === "vi" ? "Đăng nhập tài khoản" : "Sign In to KhoUI")}
          </h2>
          <p className="text-slate-500 text-sm">
            {authDict.loginSubtitle || (locale === "vi" ? "Chào mừng bạn quay lại. Vui lòng nhập thông tin để tiếp tục." : "Welcome back. Please enter your credentials to continue.")}
          </p>
          {params?.error && (
            <p className="text-red-500 text-xs mt-4 font-medium bg-red-50 py-2.5 rounded-xl border border-red-100">
              {authDict.loginError || (locale === "vi" ? "Email hoặc mật khẩu không chính xác." : "Invalid email address or password.")}
            </p>
          )}
        </div>

        <form action={login} className="space-y-5">
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
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider" htmlFor="password">
                {authDict.passwordLabel || (locale === "vi" ? "Mật khẩu" : "Password")}
              </label>
              <Link href="#" className="text-[10px] font-extrabold text-primary uppercase tracking-wider hover:underline">
                {authDict.forgotPassword || (locale === "vi" ? "Quên mật khẩu?" : "Forgot password?")}
              </Link>
            </div>
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
          </div>

          <button 
            type="submit"
            className="w-full h-12 bg-primary text-white font-extrabold rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 group shadow-md shadow-primary/20 active:scale-[0.98] cursor-pointer text-xs uppercase tracking-wider pt-0.5"
          >
            <span>{authDict.loginButton || (locale === "vi" ? "Đăng nhập" : "Sign In")}</span>
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
          {authDict.noAccount || (locale === "vi" ? "Chưa có tài khoản?" : "Don't have an account?")}{" "}
          <Link href={ROUTES.REGISTER} className="text-primary font-extrabold hover:underline underline-offset-4">
            {authDict.signUpNow || (locale === "vi" ? "Đăng ký ngay" : "Sign Up Now")}
          </Link>
        </div>
      </div>
    </div>
  );
}

