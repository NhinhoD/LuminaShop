import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/infrastructure/supabase/server';
import { signout } from '@/presentation/actions/auth';
import { ROUTES } from '@/presentation/constants';
import { getDictionary, getLocale } from '@/i18n/getDictionary';
import { makeLanguageRepository } from '@/infrastructure/supabase/container';
import { User, Download, LogOut } from 'lucide-react';
import { ProfileFormClient } from './ProfileFormClient';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(ROUTES.LOGIN);
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const locale = await getLocale();
  const langRepo = await makeLanguageRepository();
  const dict = await getDictionary(langRepo);
  const profileDict = (dict?.profile as Record<string, string>) || {};

  const { UserOrdersRealtimeTracker } = await import('@/presentation/components/orders/UserOrdersRealtimeTracker');

  return (
    <main className="flex-grow pt-24 pb-24 bg-[#fcfbf9] font-manrope">
      <UserOrdersRealtimeTracker userId={user.id} />
      <div className="max-w-[1440px] mx-auto px-8 md:px-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
              {/* User Identity */}
              <div className="flex flex-col items-center text-center mb-10">
                <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-slate-50 shadow-sm relative">
                  <Image 
                    alt="Profile" 
                    className="object-cover" 
                    src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || user.email || 'User')}&background=0051d5&color=fff&size=128`} 
                    fill
                    sizes="80px"
                  />
                </div>
                <h2 className="text-base font-extrabold text-slate-900 leading-snug">
                  {profile?.full_name || profileDict.userDefault || (locale === "vi" ? "Khách hàng KhoUI" : "KhoUI Customer")}
                </h2>
                <p className="text-slate-400 text-[10px] truncate w-full font-bold mt-1 uppercase tracking-wider">{user.email}</p>
              </div>

              {/* Sidebar Navigation */}
              <nav className="space-y-1">
                <Link href="/profile" className="flex items-center gap-3 px-4 py-3 bg-[#0b1c30] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm">
                  <User size={16} />
                  <span>{profileDict.personalProfile || (locale === "vi" ? "Hồ sơ cá nhân" : "Personal Profile")}</span>
                </Link>
                <Link href="/profile/orders" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider transition-all group">
                  <Download size={16} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                  <span>{profileDict.myTemplates || (locale === "vi" ? "Mã nguồn của tôi" : "My Templates")}</span>
                </Link>
                
                <form action={signout} className="pt-6">
                  <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold text-xs uppercase tracking-wider transition-all group cursor-pointer">
                    <LogOut size={16} className="text-red-400 group-hover:text-red-500 transition-colors" />
                    <span>{profileDict.logout || (locale === "vi" ? "Đăng xuất" : "Sign Out")}</span>
                  </button>
                </form>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* Profile Information Section */}
            <section className="bg-white rounded-3xl border border-slate-100 p-8 md:p-10 shadow-sm">
              <div className="mb-10">
                <span className="text-[10px] font-black tracking-widest text-[#0051d5] uppercase block mb-1">
                  {profileDict.tag || (locale === "vi" ? "CÀI ĐẶT TÀI KHOẢN" : "ACCOUNT SETTINGS")}
                </span>
                <h1 className="text-2xl font-bold text-slate-950 font-playfair">
                  {profileDict.title || (locale === "vi" ? "Thông tin hồ sơ" : "Profile Information")}
                </h1>
                <div className="h-1 w-12 bg-[#0051d5] rounded-full mt-2" />
              </div>

              <ProfileFormClient
                initialFullName={profile?.full_name || ''}
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
