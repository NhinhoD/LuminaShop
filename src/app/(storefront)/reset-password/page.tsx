import { getLocale } from "@/i18n/getDictionary";
import { getAppDictionary } from "@/server/di/container";
import { AuthShell } from "@/client/components/auth/AuthShell";
import { ResetPasswordClient } from "./ResetPasswordClient";

export const metadata = { title: { absolute: "Đặt lại mật khẩu | KhoUI" } };

/**
 * Renders the password reset page for recovery links.
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string; code?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const dict = await getAppDictionary();
  const authDict = (dict?.auth as Record<string, string>) || {};

  const rawError = params.error_description || params.error;
  const initialError = rawError
    ? (locale === "vi" ? "Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng gửi lại yêu cầu mới." : rawError)
    : undefined;

  return (
    <AuthShell
      code="AUTH-04"
      tag={authDict.resetPasswordTag || (locale === "vi" ? "BẢO MẬT TÀI KHOẢN" : "ACCOUNT SECURITY")}
      title={authDict.resetPasswordTitle || (locale === "vi" ? "Đặt lại mật khẩu mới" : "Create New Password")}
      subtitle={authDict.resetPasswordSubtitle || (locale === "vi"
        ? "Vui lòng nhập mật khẩu mới an toàn cho tài khoản của bạn."
        : "Please enter a strong new password for your account.")}
    >
      <ResetPasswordClient locale={locale} authDict={authDict} initialError={initialError} code={params.code} />
    </AuthShell>
  );
}
