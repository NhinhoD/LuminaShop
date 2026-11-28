import { redirect } from 'next/navigation';
import { makeGetCurrentUserUseCase, makeGetProfileUseCase, getAppDictionary } from '@/server/di/container';
import { ROUTES } from '@/shared/constants';
import { getLocale } from '@/i18n/getDictionary';
import { ProfileFormClient } from './ProfileFormClient';
import { ProfileSidebar } from './ProfileSidebar';
import { UserOrdersRealtimeTracker } from '@/client/components/orders/UserOrdersRealtimeTracker';

/**
 * User profile page displaying account information and navigation sidebar.
 * Requires authentication; redirects to login if not authenticated.
 */
export const metadata = { title: { absolute: "Tài khoản của tôi | KhoUI" } };

/**
 * Renders the signed-in customer profile page.
 */
export default async function ProfilePage() {
  // Parallelize independent initial tasks: locale, dictionary, and DI factory creation
  const [locale, dict, getCurrentUserUseCase, getProfileUseCase] = await Promise.all([
    getLocale(),
    getAppDictionary(),
    makeGetCurrentUserUseCase(),
    makeGetProfileUseCase(),
  ]);
  const profileDict = (dict?.profile as Record<string, string>) || {};
  const homeUi = (dict?.homeUi as Record<string, string>) || {};

  const userResult = await getCurrentUserUseCase.execute();

  if (!userResult.success) {
    console.error("ProfilePage: failed to authenticate user:", userResult.error);
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

  const profileResult = await getProfileUseCase.execute(user.id);

  if (!profileResult.success) {
    console.error("ProfilePage: failed to load user profile:", profileResult.error);
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

  return (
    <main className="flex-grow bg-background font-sans">
      <UserOrdersRealtimeTracker userId={user.id} />
      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 sm:py-14">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Navigation Sidebar */}
          <ProfileSidebar
            activeTab="profile"
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
                  01 / {profileDict.profileCode || (locale === "vi" ? "Hồ sơ" : "Profile")}
                </span>
                <span className="mono-meta text-[8px] text-dark/25">{homeUi.labelSpec}</span>
              </div>

              <div className="p-5 sm:p-8">
                <div className="mb-6 border-b border-border pb-5">
                  <span className="mono-meta flex items-center gap-2 text-primary">
                    <span className="h-1.5 w-1.5 bg-primary" />
                    {profileDict.tag || (locale === "vi" ? "CÀI ĐẶT TÀI KHOẢN" : "ACCOUNT SETTINGS")}
                  </span>
                  <h1 className="mt-2.5 display text-[clamp(1.5rem,2.6vw,2rem)] text-dark">
                    {profileDict.title || (locale === "vi" ? "Thông tin hồ sơ" : "Profile Information")}
                  </h1>
                </div>

                <ProfileFormClient
                  initialFullName={profile?.fullName || ''}
                  initialPhone={profile?.phone || ''}
                  email={user.email || ''}
                  locale={locale}
                  profileDict={profileDict}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
