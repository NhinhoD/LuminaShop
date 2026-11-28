import Link from "next/link";
import { ROUTES } from "@/shared/constants";
import { getLocale } from "@/i18n/getDictionary";
import { getAppDictionary } from "@/server/di/container";
import { AuthErrorToast } from "@/client/components/auth/AuthErrorToast";
import { AuthShell } from "@/client/components/auth/AuthShell";
import { LoginFormClient } from "./LoginFormClient";

/**
 * Login page with email/password authentication form.
 */
export const metadata = { title: { absolute: "Đăng nhập | KhoUI" } };

/**
 * Renders the login page with the localized authentication form.
 */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const locale = await getLocale();
  const dict = await getAppDictionary();
  const authDict = (dict?.auth as Record<string, string>) || {};

  return (
    <AuthShell
      code="AUTH-01"
      tag={authDict.tag || (locale === "vi" ? "TÀI KHOẢN KHOUI" : "KHOUI ACCOUNT")}
      title={authDict.loginTitle || (locale === "vi" ? "Đăng nhập tài khoản" : "Sign In")}
      subtitle={authDict.loginSubtitle || (locale === "vi" ? "Chào mừng bạn quay lại. Vui lòng nhập thông tin để tiếp tục." : "Welcome back. Please enter your credentials to continue.")}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-dark/50">
          <span>{authDict.noAccount || (locale === "vi" ? "Chưa có tài khoản?" : "Don't have an account?")}</span>
          <Link
            href={ROUTES.REGISTER}
            className="mono-meta border-b border-dark/30 pb-0.5 text-[8.5px] text-primary transition-colors hover:border-primary"
          >
            {authDict.signUpNow || (locale === "vi" ? "Đăng ký ngay" : "Sign Up Now")}
          </Link>
        </div>
      }
    >
      <AuthErrorToast locale={locale} />

      <LoginFormClient locale={locale} authDict={authDict} error={params?.error} />

      <div className="mt-7 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="mono-meta text-[7.5px] text-dark/30">
          {authDict.orText || (locale === "vi" ? "Hoặc" : "Or")}
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </AuthShell>
  );
}
