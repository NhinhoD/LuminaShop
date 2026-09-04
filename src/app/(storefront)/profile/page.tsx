import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { makeAuthRepository, makeLanguageRepository } from '@/infrastructure/supabase/container';
import { signout } from '@/presentation/actions/auth';
import { ROUTES } from '@/presentation/constants';
import { getDictionary, getLocale } from '@/i18n/getDictionary';
import { User, Download, LogOut } from 'lucide-react';
import { ProfileFormClient } from './ProfileFormClient';
import { UserOrdersRealtimeTracker } from '@/presentation/components/orders/UserOrdersRealtimeTracker';

/**
 * User profile page displaying account information and navigation sidebar.
 * Requires authentication; redirects to login if not authenticated.
 */
export default async function ProfilePage() {
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
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              {/* User Identity */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-slate-100 shadow-sm relative">
                  <Image 
                    alt="Profile" 
                    className="object-cover" 
                    src={profile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || user.email || 'User')}&background=0051d5&color=fff&size=128`} 
                    fill
                    sizes="80px"
                  />
                </div>
                <h2 className="text-base font-extrabold text-slate-900 leading-snug">
                  {profile?.fullName || profileDict.userDefault || (locale === "vi" ? "Khách hàng KhoUI" : "KhoUI Customer")}
                </h2>
                <p className="text-slate-400 text-[11px] truncate w-full font-bold mt-1 uppercase tracking-wider">{user.email}</p>
              </div>

              {/* Sidebar Navigation */}
              <nav className="space-y-1">
                <Link href="/profile" className="flex items-center gap-3 px-3.5 py-2.5 bg-primary text-white rounded-xl font-medium text-sm transition-all shadow-xs">
                  <User size={16} />
                  <span>{profileDict.personalProfile || (locale === "vi" ? "Hồ sơ cá nhân" : "Personal Profile")}</span>
                </Link>
                <Link href="/profile/orders" className="flex items-center gap-3 px-3.5 py-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl font-medium text-sm transition-all group">
                  <Download size={16} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                  <span>{profileDict.myTemplates || (locale === "vi" ? "Mã nguồn của tôi" : "My Templates")}</span>
                </Link>
                
                <form action={signout} className="pt-3 border-t border-slate-100">
                  <button type="submit" className="w-full flex items-center gap-3 px-3.5 py-2.5 text-red-500 hover:bg-red-50 rounded-xl font-medium text-sm transition-all group cursor-pointer">
                    <LogOut size={16} className="text-red-400 group-hover:text-red-500 transition-colors" />
                    <span>{profileDict.logout || (locale === "vi" ? "Đăng xuất" : "Sign Out")}</span>
                  </button>
                </form>
              </nav>
            </div>
          </aside>

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
