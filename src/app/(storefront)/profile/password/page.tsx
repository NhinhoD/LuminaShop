import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { makeGetCurrentUserUseCase, makeGetProfileUseCase, getAppDictionary } from '@/server/di/container';
import { ROUTES } from '@/shared/constants';
import { getLocale } from '@/i18n/getDictionary';
import { ProfileSidebar } from '../ProfileSidebar';
import { ChangePasswordForm } from './ChangePasswordForm';
import { UserOrdersRealtimeTracker } from '@/client/components/orders/UserOrdersRealtimeTracker';

export const metadata: Metadata = {
  title: { absolute: 'Đổi mật khẩu | KhoUI' },
  description: 'Cập nhật mật khẩu tài khoản của bạn trên KhoUI',
};

/**
 * Renders the change-password page for signed-in customers.
 */
export default async function ChangePasswordPage() {
  const getCurrentUserUseCase = await makeGetCurrentUserUseCase();
  const userResult = await getCurrentUserUseCase.execute();
  const locale = await getLocale();

  if (!userResult.success) {
    console.error("ChangePasswordPage: failed to authenticate user:", userResult.error);
    return (
      <main className="flex-grow bg-background py-16 font-sans">
        <div className="mx-auto max-w-xl px-6">
          <div className="border border-error/40 bg-surface p-8">
            <span className="mono-meta text-error">
              {locale === "vi" ? "Không thể xác thực thông tin người dùng" : "Failed to authenticate user"}
            </span>
            <p className="mt-3 text-[12.5px] leading-relaxed text-dark/55">
              {locale === "vi" ? "Vui lòng thử lại sau hoặc đăng nhập lại." : "Please try again later or sign in again."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const user = userResult.data;
  if (!user) {
    redirect(ROUTES.LOGIN);
  }

  const getProfileUseCase = await makeGetProfileUseCase();
  const profileResult = await getProfileUseCase.execute(user.id);

  if (!profileResult.success) {
    console.error("ChangePasswordPage: failed to load user profile:", profileResult.error);
    return (
      <main className="flex-grow bg-background py-16 font-sans">
        <div className="mx-auto max-w-xl px-6">
          <div className="border border-error/40 bg-surface p-8">
            <span className="mono-meta text-error">
              {locale === "vi" ? "Không thể tải thông tin hồ sơ" : "Failed to load profile details"}
            </span>
            <p className="mt-3 text-[12.5px] leading-relaxed text-dark/55">
              {locale === "vi" ? "Vui lòng thử lại sau." : "Please try again later."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const profile = profileResult.data;
  const dict = await getAppDictionary();
  const profileDict = (dict?.profile as Record<string, string>) || {};
  const homeUi = (dict?.homeUi as Record<string, string>) || {};

  return (
    <main className="flex-grow bg-background font-sans">
      <UserOrdersRealtimeTracker userId={user.id} />
      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 sm:py-14">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Navigation Sidebar */}
          <ProfileSidebar
            activeTab="password"
            user={user}
            profile={profile}
            locale={locale}
            profileDict={profileDict}
          />

          {/* Main Content Area */}
          <div className="space-y-6 lg:col-span-9">
            <section className="border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <span className="mono-meta text-[8.5px] text-dark/45">
                  02 / {profileDict.passwordCode || (locale === 'vi' ? 'Bảo mật' : 'Security')}
                </span>
                <span className="mono-meta text-[8px] text-dark/25">{homeUi.labelSpec}</span>
              </div>

              <div className="p-5 sm:p-8">
                <div className="mb-6 border-b border-border pb-5">
                  <span className="mono-meta flex items-center gap-2 text-primary">
                    <span className="h-1.5 w-1.5 bg-primary" />
                    {locale === 'vi' ? 'BẢO MẬT TÀI KHOẢN' : 'ACCOUNT SECURITY'}
                  </span>
                  <h1 className="mt-2.5 display text-[clamp(1.5rem,2.6vw,2rem)] text-dark">
                    {profileDict.changePassword || (locale === 'vi' ? 'Đổi mật khẩu' : 'Change Password')}
                  </h1>
                  <p className="mt-3 max-w-xl text-[12.5px] leading-relaxed text-dark/55">
                    {locale === 'vi'
                      ? 'Để bảo mật tài khoản, vui lòng sử dụng mật khẩu mạnh và không chia sẻ cho người khác.'
                      : 'For your security, please use a strong password and do not share it with others.'}
                  </p>
                </div>

                <ChangePasswordForm locale={locale} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
