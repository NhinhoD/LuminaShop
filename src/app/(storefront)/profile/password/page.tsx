import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { makeAuthRepository, makeLanguageRepository } from '@/infrastructure/supabase/container';
import { ROUTES } from '@/presentation/constants';
import { getDictionary, getLocale } from '@/i18n/getDictionary';
import { ProfileSidebar } from '../ProfileSidebar';
import { ChangePasswordForm } from './ChangePasswordForm';
import { UserOrdersRealtimeTracker } from '@/presentation/components/orders/UserOrdersRealtimeTracker';

export const metadata: Metadata = {
  title: 'Đổi mật khẩu | KhoUI',
  description: 'Cập nhật mật khẩu tài khoản của bạn trên KhoUI',
};

export default async function ChangePasswordPage() {
  const authRepo = await makeAuthRepository();
  const user = await authRepo.getCurrentUser();

  if (!user) {
    redirect(ROUTES.LOGIN);
  }

  const profile = await authRepo.getProfile(user.id);
  const locale = await getLocale();
  const langRepo = await makeLanguageRepository();
  const dict = await getDictionary(langRepo);
  const profileDict = (dict?.profile as Record<string, string>) || {};

  return (
    <main className="flex-grow pt-16 pb-24 bg-background-subtle">
      <UserOrdersRealtimeTracker userId={user.id} />
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar */}
          <ProfileSidebar
            activeTab="password"
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
                  {locale === 'vi' ? 'BẢO MẬT TÀI KHOẢN' : 'ACCOUNT SECURITY'}
                </span>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {profileDict.changePassword || (locale === 'vi' ? 'Đổi mật khẩu' : 'Change Password')}
                </h1>
                <p className="text-slate-500 text-xs mt-1.5 font-normal">
                  {locale === 'vi'
                    ? 'Để bảo mật tài khoản, vui lòng sử dụng mật khẩu mạnh và không chia sẻ cho người khác.'
                    : 'For your security, please use a strong password and do not share it with others.'}
                </p>
                <div className="h-0.5 w-12 bg-primary rounded-full mt-3" />
              </div>

              <ChangePasswordForm locale={locale} />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
