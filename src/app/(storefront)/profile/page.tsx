import { redirect } from 'next/navigation';
import { makeGetCurrentUserUseCase, makeGetProfileUseCase, getAppDictionary } from '@/di/container';
import { ROUTES } from '@/presentation/constants';
import { getLocale } from '@/i18n/getDictionary';
import { ProfileFormClient } from './ProfileFormClient';
import { ProfileSidebar } from './ProfileSidebar';
import { UserOrdersRealtimeTracker } from '@/presentation/components/orders/UserOrdersRealtimeTracker';

/**
 * User profile page displaying account information and navigation sidebar.
 * Requires authentication; redirects to login if not authenticated.
 */
export default async function ProfilePage() {
  const getCurrentUserUseCase = await makeGetCurrentUserUseCase();
  const userResult = await getCurrentUserUseCase.execute();
  const locale = await getLocale();

  if (!userResult.success) {
    return (
      <main className="flex-grow pt-16 pb-24 bg-background-subtle font-sans">
        <div className="max-w-xl mx-auto px-6 text-center">
          <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-red-700">
            <p className="font-semibold text-sm">
              {locale === "vi" ? "Không thể xác thực thông tin người dùng từ máy chủ" : "Failed to authenticate user from server"}
            </p>
            <p className="text-xs text-red-500 mt-1 font-mono">
              {userResult.error.message || "Unknown error"}
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
  const profile = profileResult.success ? profileResult.data : null;
  const dict = await getAppDictionary();
  const profileDict = (dict?.profile as Record<string, string>) || {};

  return (
    <main className="flex-grow pt-16 pb-24 bg-background-subtle">
      <UserOrdersRealtimeTracker userId={user.id} />
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar */}
          <ProfileSidebar
            activeTab="profile"
            user={user}
            profile={profile}
            locale={locale}
            profileDict={profileDict}
          />

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-8">
            <section className="bg-white rounded-3xl border border-slate-100 p-8 md:p-10 shadow-xs">
              <div className="mb-8">
                <span className="text-xs font-semibold tracking-wider text-primary uppercase block mb-1">
                  {profileDict.tag || (locale === "vi" ? "CÀI ĐẶT TÀI KHOẢN" : "ACCOUNT SETTINGS")}
                </span>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {profileDict.title || (locale === "vi" ? "Thông tin hồ sơ" : "Profile Information")}
                </h1>
                <div className="h-0.5 w-12 bg-primary rounded-full mt-2" />
              </div>

              <ProfileFormClient
                initialFullName={profile?.fullName || ''}
                initialPhone={profile?.phone || ''}
                email={user.email || ''}
                locale={locale}
                profileDict={profileDict}
              />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
