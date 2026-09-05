import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/presentation/constants";
import { getDictionary, getLocale } from "@/i18n/getDictionary";
import { makeLanguageRepository } from "@/infrastructure/supabase/container";
import { AuthErrorToast } from "@/presentation/components/auth/AuthErrorToast";
import { LoginFormClient } from "./LoginFormClient";

/**
 * Login page with email/password authentication form.
 * Harmonized with KhoUI design system specifications.
 */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const locale = await getLocale();
  const langRepo = await makeLanguageRepository();
  const dict = await getDictionary(langRepo);
  const authDict = (dict?.auth as Record<string, string>) || {};

  return (
    <main className="min-h-[calc(100vh-140px)] bg-background-subtle flex flex-col items-center justify-center py-16 px-4 font-sans">
      <AuthErrorToast locale={locale} />

      {/* Brand Logo */}
      <Link href={ROUTES.HOME} className="mb-8 group transition-transform hover:scale-102 flex flex-col items-center">
        <Image
          src="/LogoKhoUI.png"
          alt="KhoUI Logo"
          width={140}
          height={48}
          priority
          className="h-11 w-auto object-contain"
        />
      </Link>

      {/* Login Card */}
      <div className="w-full max-w-[460px] bg-white rounded-3xl border border-slate-100 p-8 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold tracking-wider text-primary uppercase block mb-1">
            {authDict.tag || (locale === "vi" ? "TÀI KHOẢN KHOUI" : "KHOUI ACCOUNT")}
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {authDict.loginTitle || (locale === "vi" ? "Đăng nhập tài khoản" : "Sign In")}
          </h1>
          <p className="text-slate-500 text-xs mt-1.5 font-normal leading-relaxed">
            {authDict.loginSubtitle || (locale === "vi" ? "Chào mừng bạn quay lại. Vui lòng nhập thông tin để tiếp tục." : "Welcome back. Please enter your credentials to continue.")}
          </p>
        </div>

        <LoginFormClient locale={locale} authDict={authDict} error={params?.error} />

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-xs font-normal text-slate-400">
            <span className="bg-white px-3">{authDict.orText || (locale === "vi" ? "Hoặc" : "Or")}</span>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 font-normal">
          {authDict.noAccount || (locale === "vi" ? "Chưa có tài khoản?" : "Don't have an account?")}{" "}
          <Link href={ROUTES.REGISTER} className="text-primary font-semibold hover:underline">
            {authDict.signUpNow || (locale === "vi" ? "Đăng ký ngay" : "Sign Up Now")}
          </Link>
        </div>
      </div>
    </main>
  );
}
