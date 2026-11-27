import { getLocale } from "@/i18n/getDictionary";
import { getAppDictionary } from "@/server/di/container";
import { AuthShell } from "@/client/components/auth/AuthShell";
import { ForgotPasswordClient } from "./ForgotPasswordClient";

export const metadata = { title: { absolute: "Quên mật khẩu | KhoUI" } };

/**
 * Renders the forgot-password request page.
 */
export default async function ForgotPasswordPage() {
  const locale = await getLocale();
  const dict = await getAppDictionary();
  const authDict = (dict?.auth as Record<string, string>) || {};

  return (
    <AuthShell
      code="AUTH-03"
      tag={authDict.forgotPasswordTag || (locale === "vi" ? "KHÔI PHỤC TÀI KHOẢN" : "ACCOUNT RECOVERY")}
      title={authDict.forgotPasswordTitle || (locale === "vi" ? "Quên mật khẩu" : "Forgot Password")}
      subtitle={authDict.forgotPasswordSubtitle || (locale === "vi"
        ? "Nhập email đăng ký của bạn. Chúng tôi sẽ gửi liên kết khôi phục mật khẩu vào hộp thư."
        : "Enter your registered email address. We'll send instructions to reset your password.")}
    >
      <ForgotPasswordClient locale={locale} authDict={authDict} />
    </AuthShell>
  );
}
