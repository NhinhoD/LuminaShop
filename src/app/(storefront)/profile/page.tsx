import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/infrastructure/supabase/server';
import { signout } from '@/presentation/actions/auth';
import { ROUTES, UI_LABELS, PLACEHOLDERS } from '@/presentation/constants';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(ROUTES.LOGIN);
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  return (
    <main className="flex-grow pt-24 pb-24 bg-[#f8f9fa]">
      <div className="max-w-[1440px] mx-auto px-8 md:px-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl border border-slate-100 p-8 shadow-sm">
              {/* User Identity */}
              <div className="flex flex-col items-center text-center mb-10">
                <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-slate-50">
                  <img 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                    src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || user.email}&background=0b1c30&color=fff&size=128`} 
                  />
                </div>
                <h2 className="text-lg font-bold text-slate-900">{profile?.full_name || 'Jane Doe'}</h2>
                <p className="text-slate-400 text-[11px] truncate w-full">{user.email}</p>
              </div>

              {/* Sidebar Navigation */}
              <nav className="space-y-1">
                <Link href="#" className="flex items-center gap-4 px-4 py-3.5 bg-[#0b1c30] text-white rounded-lg font-semibold text-[13px] transition-all">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                  {UI_LABELS.PROFILE_INFO}
                </Link>
                <Link href="#" className="flex items-center gap-4 px-4 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-semibold text-[13px] transition-all group">
                  <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-slate-900">receipt_long</span>
                  {UI_LABELS.ORDER_HISTORY}
                </Link>
                <Link href="#" className="flex items-center gap-4 px-4 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-semibold text-[13px] transition-all group">
                  <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-slate-900">favorite</span>
                  {UI_LABELS.WISHLIST}
                </Link>
                <Link href="#" className="flex items-center gap-4 px-4 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-semibold text-[13px] transition-all group">
                  <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-slate-900">home</span>
                  {UI_LABELS.ADDRESSES}
                </Link>
                
                <form action={signout} className="pt-6">
                  <button type="submit" className="w-full flex items-center gap-4 px-4 py-3.5 text-red-500 hover:bg-red-50 rounded-lg font-semibold text-[13px] transition-all group">
                    <span className="material-symbols-outlined text-[20px] text-red-400">logout</span>
                    {UI_LABELS.LOG_OUT}
                  </button>
                </form>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* Profile Information Section */}
            <section className="bg-white rounded-xl border border-slate-100 p-10 shadow-sm">
              <div className="mb-10">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">{UI_LABELS.PROFILE_INFO}</h1>
                <p className="text-slate-500 text-[13px]">Manage your personal details and account settings.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">First Name</label>
                  <input 
                    type="text" 
                    defaultValue={profile?.full_name?.split(' ')[0] || ''}
                    className="w-full h-12 px-4 bg-white border border-slate-200 rounded-sm text-sm focus:border-[#0051d5] focus:ring-1 focus:ring-[#0051d5] outline-none transition-all"
                    placeholder={PLACEHOLDERS.FIRST_NAME}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Last Name</label>
                  <input 
                    type="text" 
                    defaultValue={profile?.full_name?.split(' ').slice(1).join(' ') || ''}
                    className="w-full h-12 px-4 bg-white border border-slate-200 rounded-sm text-sm focus:border-[#0051d5] focus:ring-1 focus:ring-[#0051d5] outline-none transition-all"
                    placeholder={PLACEHOLDERS.LAST_NAME}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    type="email" 
                    readOnly
                    defaultValue={user.email}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-sm text-sm text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+1 (555) 123-4567"
                    className="w-full h-12 px-4 bg-white border border-slate-200 rounded-sm text-sm focus:border-[#0051d5] focus:ring-1 focus:ring-[#0051d5] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-10">
                <button className="bg-[#0051d5] text-white font-bold px-8 py-3.5 rounded-sm hover:bg-[#0041ac] transition-all shadow-md text-sm active:scale-95">
                  {UI_LABELS.SAVE_CHANGES}
                </button>
              </div>
            </section>

            {/* Recent Orders Section */}
            <section className="bg-white rounded-xl border border-slate-100 p-10 shadow-sm">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-xl font-bold text-slate-900">{UI_LABELS.RECENT_ORDERS}</h2>
                <Link href="#" className="text-[11px] font-bold text-[#0051d5] uppercase tracking-[0.1em] hover:underline underline-offset-4">{UI_LABELS.VIEW_ALL}</Link>
              </div>

              <div className="space-y-4">
                {/* Order Item 1 */}
                <div className="flex items-center gap-6 p-6 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors group">
                  <div className="w-14 h-14 bg-blue-50 text-[#0051d5] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[28px]">inventory_2</span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-[#0051d5] transition-colors">Order #ORD-84729</h3>
                    <p className="text-slate-400 text-[11px]">Placed on Oct 12, 2023</p>
                  </div>
                  <div className="text-right">
                    <span className="block font-black text-slate-900 text-lg mb-1">$145.00</span>
                    <span className="inline-flex px-2.5 py-1 bg-green-50 text-green-600 text-[9px] font-bold uppercase tracking-wider rounded-sm">Delivered</span>
                  </div>
                </div>

                {/* Order Item 2 */}
                <div className="flex items-center gap-6 p-6 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors group">
                  <div className="w-14 h-14 bg-blue-50 text-[#0051d5] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[28px]">local_shipping</span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-[#0051d5] transition-colors">Order #ORD-84610</h3>
                    <p className="text-slate-400 text-[11px]">Placed on Sep 28, 2023</p>
                  </div>
                  <div className="text-right">
                    <span className="block font-black text-slate-900 text-lg mb-1">$89.50</span>
                    <span className="inline-flex px-2.5 py-1 bg-blue-50 text-[#0051d5] text-[9px] font-bold uppercase tracking-wider rounded-sm">In Transit</span>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}
