import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/presentation/constants";
import { getDictionary, getLocale } from "@/i18n/getDictionary";
import { makeLanguageRepository } from "@/infrastructure/supabase/container";
import { ForgotPasswordClient } from "./ForgotPasswordClient";

export default async function ForgotPasswordPage() {
  const locale = await getLocale();
  const langRepo = await makeLanguageRepository();
  const dict = await getDictionary(langRepo);
  const authDict = (dict?.auth as Record<string, string>) || {};

  return (
    <main className="min-h-[calc(100vh-140px)] bg-background-subtle flex flex-col items-center justify-center py-16 px-4 font-sans">
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

      {/* Card */}
      <div className="w-full max-w-[460px] bg-white rounded-3xl border border-slate-100 p-8 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold tracking-wider text-primary uppercase block mb-1">
            {authDict.forgotPasswordTag || (locale === "vi" ? "KHÔI PHỤC TÀI KHOẢN" : "ACCOUNT RECOVERY")}
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {authDict.forgotPasswordTitle || (locale === "vi" ? "Quên mật khẩu" : "Forgot Password")}
          </h1>
          <p className="text-slate-500 text-xs mt-1.5 font-normal leading-relaxed">
            {authDict.forgotPasswordSubtitle || (locale === "vi"
              ? "Nhập email đăng ký của bạn. Chúng tôi sẽ gửi liên kết khôi phục mật khẩu vào hộp thư."
              : "Enter your registered email address. We'll send instructions to reset your password.")}
          </p>
        </div>

        <ForgotPasswordClient locale={locale} authDict={authDict} />
      </div>
    </main>
  );
}
