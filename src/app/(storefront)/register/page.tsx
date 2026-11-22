import Link from "next/link";
import { ROUTES } from "@/shared/constants";
import { getLocale } from "@/i18n/getDictionary";
import { getAppDictionary } from "@/server/di/container";
import { AuthErrorToast } from "@/client/components/auth/AuthErrorToast";
import { AuthShell } from "@/client/components/auth/AuthShell";
import { RegisterFormClient } from "./RegisterFormClient";

/**
 * User registration page with account creation form.
 */
export const metadata = { title: { absolute: "Đăng ký | KhoUI" } };

/**
 * Renders the registration page with the localized authentication form.
 */
export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const locale = await getLocale();
  const dict = await getAppDictionary();
  const authDict = (dict?.auth as Record<string, string>) || {};

  return (
    <AuthShell
      code="AUTH-02"
      tag={authDict.tag || (locale === "vi" ? "TÀI KHOẢN KHOUI" : "KHOUI ACCOUNT")}
      title={authDict.registerTitle || (locale === "vi" ? "Tạo tài khoản mới" : "Create an Account")}
      subtitle={authDict.registerSubtitle || (locale === "vi" ? "Tham gia cùng KhoUI để sở hữu bản quyền và tải các mẫu website dễ dàng." : "Join KhoUI to license and download premium templates.")}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-dark/50">
          <span>{authDict.hasAccount || (locale === "vi" ? "Đã có tài khoản?" : "Already have an account?")}</span>
          <Link
            href={ROUTES.LOGIN}
            className="mono-meta border-b border-dark/30 pb-0.5 text-[8.5px] text-primary transition-colors hover:border-primary"
          >
            {authDict.loginButton || (locale === "vi" ? "Đăng nhập" : "Sign In")}
          </Link>
        </div>
      }
    >
      <AuthErrorToast locale={locale} />

      <RegisterFormClient locale={locale} authDict={authDict} error={params?.error} />
    </AuthShell>
  );
}
