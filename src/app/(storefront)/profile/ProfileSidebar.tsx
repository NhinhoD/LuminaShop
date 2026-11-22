import Link from 'next/link';
import Image from 'next/image';
import { User, Lock, LogOut, ShoppingBag } from 'lucide-react';
import { signout } from '@/server/presentation/actions/auth';

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
}: ProfileSidebarProps): React.JSX.Element {
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
    <aside className="z-10 self-start lg:sticky lg:top-24 lg:col-span-3">
      <div className="border border-border bg-surface">
        {/* Identity */}
        <div className="border-b border-border p-5">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-border">
              {profile?.avatarUrl ? (
                <Image
                  alt="Profile"
                  className="object-cover"
                  src={profile.avatarUrl}
                  fill
                  sizes="48px"
                />
              ) : (
                <div className="flex h-full w-full select-none items-center justify-center bg-dark font-display text-lg font-bold text-background">
                  {(profile?.fullName?.trim() || user.email?.trim() || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <span className="mono-meta block text-[7.5px] text-dark/30">
                {profileDict.accountLabel || (locale === 'vi' ? 'Tài khoản' : 'Account')}
              </span>
              <h2 className="mt-1 truncate text-[13.5px] font-semibold leading-tight text-dark">
                {profile?.fullName || profileDict.userDefault || (locale === 'vi' ? 'Khách hàng KhoUI' : 'KhoUI Customer')}
              </h2>
              <p className="mt-1 truncate font-mono text-[10px] text-dark/40">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-px bg-border">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2.5 px-4 py-3 text-[11.5px] font-medium transition-colors ${
                  isActive
                    ? 'bg-dark text-background'
                    : 'bg-surface text-dark/60 hover:bg-background hover:text-dark'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-primary' : 'text-dark/35'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <form action={signout} className="border-t border-border">
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 px-4 py-3 text-[11.5px] font-medium text-error/80 transition-colors hover:bg-error/5 hover:text-error"
          >
            <LogOut size={14} />
            <span>{profileDict.logout || (locale === 'vi' ? 'Đăng xuất' : 'Sign Out')}</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
