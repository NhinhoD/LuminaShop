import Link from 'next/link';
import Image from 'next/image';
import { User, Lock, LogOut, ShoppingBag } from 'lucide-react';
import { signout } from '@/presentation/actions/auth';

interface ProfileSidebarProps {
  user: {
    id: string;
    email?: string;
  };
  profile: {
    id?: string;
    fullName?: string;
    avatarUrl?: string;
    phone?: string;
  } | null;
  activeTab: 'profile' | 'password' | 'orders';
  locale: string;
  profileDict?: Record<string, string>;
}

/**
 * Sidebar navigation component for user profile management.
 * Displays user identity summary and provides tab navigation between
 * Profile Info, Change Password, and Orders & Templates.
 *
 * @param props - ProfileSidebarProps containing user, profile, active tab, locale, and dictionary.
 * @returns JSX Element for the profile sidebar navigation.
 */
export function ProfileSidebar({
  user,
  profile,
  activeTab,
  locale,
  profileDict = {},
}: ProfileSidebarProps) {
  const navItems = [
    {
      id: 'profile',
      href: '/profile',
      label: profileDict.personalProfile || (locale === 'vi' ? 'Hồ sơ cá nhân' : 'Personal Profile'),
      icon: User,
    },
    {
      id: 'password',
      href: '/profile/password',
      label: profileDict.changePassword || (locale === 'vi' ? 'Đổi mật khẩu' : 'Change Password'),
      icon: Lock,
    },
    {
      id: 'orders',
      href: '/profile/orders',
      label: profileDict.myOrders || (locale === 'vi' ? 'Đơn hàng & Mã nguồn' : 'Orders & Templates'),
      icon: ShoppingBag,
    },
  ];

  return (
    <aside className="lg:col-span-3 lg:sticky lg:top-24 z-10 self-start space-y-6">
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        {/* User Identity */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-slate-100 shadow-sm relative">
            {profile?.avatarUrl ? (
              <Image
                alt="Profile"
                className="object-cover"
                src={profile.avatarUrl}
                fill
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-2xl select-none">
                {(profile?.fullName?.trim() || user.email?.trim() || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h2 className="text-base font-extrabold text-slate-900 leading-snug">
            {profile?.fullName || profileDict.userDefault || (locale === 'vi' ? 'Khách hàng KhoUI' : 'KhoUI Customer')}
          </h2>
          <p className="text-slate-400 text-[11px] truncate w-full font-bold mt-1 uppercase tracking-wider">
            {user.email}
          </p>
        </div>

        {/* Sidebar Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <form action={signout} className="pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-red-500 hover:bg-red-50 rounded-xl font-medium text-sm transition-all group cursor-pointer"
            >
              <LogOut size={16} className="text-red-400 group-hover:text-red-500 transition-colors" />
              <span>{profileDict.logout || (locale === 'vi' ? 'Đăng xuất' : 'Sign Out')}</span>
            </button>
          </form>
        </nav>
      </div>
    </aside>
  );
}
