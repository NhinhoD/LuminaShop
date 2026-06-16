import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/infrastructure/supabase/server';
import { signout } from '@/presentation/actions/auth';
import { ROUTES } from '@/presentation/constants';
import { StatusBadge } from '@/presentation/components/orders/StatusBadge';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(ROUTES.LOGIN);
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  
  // Only profile data is needed now

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
                <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-slate-50 shadow-sm">
                  <img 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                    src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || user.email}&background=0051d5&color=fff&size=128`} 
                  />
                </div>
                <h2 className="text-base font-extrabold text-slate-900 leading-snug">{profile?.full_name || 'Khách hàng Lumina'}</h2>
                <p className="text-slate-400 text-[10px] truncate w-full font-bold mt-1 uppercase tracking-wider">{user.email}</p>
              </div>

              {/* Sidebar Navigation */}
              <nav className="space-y-1">
                <Link href="/profile" className="flex items-center gap-4 px-4 py-3 bg-[#0b1c30] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Hồ sơ cá nhân
                </Link>
                <Link href="/profile/orders" className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider transition-all group">
                  <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-slate-900">download_for_offline</span>
                  Mã nguồn của tôi
                </Link>
                
                <form action={signout} className="pt-6">
                  <button type="submit" className="w-full flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold text-xs uppercase tracking-wider transition-all group cursor-pointer">
                    <span className="material-symbols-outlined text-[18px] text-red-400">logout</span>
                    Đăng xuất
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
                <span className="text-[10px] font-black tracking-widest text-[#0051d5] uppercase block mb-1">CÀI ĐẶT TÀI KHOẢN</span>
                <h1 className="text-2xl font-bold text-slate-950 font-playfair">Thông tin hồ sơ</h1>
                <div className="h-1 w-12 bg-[#0051d5] rounded-full mt-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Họ & Tên lót</label>
                  <input 
                    type="text" 
                    defaultValue={profile?.full_name?.split(' ').slice(0, -1).join(' ') || ''}
                    className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-[#0051d5] outline-none transition-all"
                    placeholder="Nguyễn Văn"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tên</label>
                  <input 
                    type="text" 
                    defaultValue={profile?.full_name?.split(' ').slice(-1).join('') || ''}
                    className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-[#0051d5] outline-none transition-all"
                    placeholder="A"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Địa chỉ Email</label>
                  <input 
                    type="email" 
                    readOnly
                    defaultValue={user.email}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-400 outline-none cursor-not-allowed"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Số điện thoại liên hệ</label>
                  <input 
                    type="tel" 
                    defaultValue={profile?.phone || ''}
                    placeholder="0912345678"
                    className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-[#0051d5] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-10">
                <button className="bg-[#0051d5] hover:bg-[#0041ac] text-white font-bold px-8 py-3 rounded-xl transition-all shadow-md shadow-blue-900/10 text-xs active:scale-95 uppercase tracking-wider cursor-pointer">
                  Lưu thay đổi
                </button>
              </div>
            </section>


          </div>
        </div>
      </div>
    </main>
  );
}
