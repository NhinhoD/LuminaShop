import { User, ReceiptText, Heart, Home, Package, Truck, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

export default function Profile() {
  const sidebarItems = [
    { name: 'Profile Info', icon: User, active: true },
    { name: 'Order History', icon: ReceiptText },
    { name: 'Wishlist', icon: Heart },
    { name: 'Addresses', icon: Home },
  ];

  return (
    <div className="pt-32 pb-20 max-w-[1280px] mx-auto w-full px-8 flex flex-col md:flex-row gap-12">
      {/* Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="sticky top-32 bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
               <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 truncate">Jane Doe</h3>
              <p className="text-xs text-slate-400 font-medium truncate">jane.doe@example.com</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button 
                key={item.name}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all",
                  item.active ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-black"
                )}
              >
                <item.icon size={18} />
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow space-y-12">
        <section className="bg-white rounded-xl p-10 border border-slate-100 shadow-sm">
          <h1 className="text-3xl font-extrabold tracking-tighter mb-4">Profile Information</h1>
          <p className="text-slate-500 mb-8 font-medium">Manage your personal details and account settings.</p>
          
          <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">First Name</label>
              <input defaultValue="Jane" className="w-full border-slate-200 rounded-lg py-3 px-4 focus:border-black focus:ring-0 text-sm bg-slate-50" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Last Name</label>
              <input defaultValue="Doe" className="w-full border-slate-200 rounded-lg py-3 px-4 focus:border-black focus:ring-0 text-sm bg-slate-50" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Email Address</label>
              <input defaultValue="jane.doe@example.com" className="w-full border-slate-200 rounded-lg py-3 px-4 focus:border-black focus:ring-0 text-sm bg-slate-50" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Phone Number</label>
              <input defaultValue="+1 (555) 123-4567" className="w-full border-slate-200 rounded-lg py-3 px-4 focus:border-black focus:ring-0 text-sm bg-slate-50" />
            </div>
            <div className="md:col-span-2 flex justify-end pt-4">
              <button className="bg-blue-600 text-white font-bold py-3 px-10 rounded-sm hover:bg-blue-700 transition-colors shadow-md">
                Save Changes
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white rounded-xl p-10 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-extrabold tracking-tighter">Recent Orders</h2>
            <Link to="#" className="text-sm font-bold text-blue-600 hover:underline">View All</Link>
          </div>
          
          <div className="space-y-4">
            {[
              { id: 'ORD-84729', date: 'Oct 12, 2023', status: 'Delivered', color: 'emerald', icon: Package, total: 145 },
              { id: 'ORD-84610', date: 'Sep 28, 2023', status: 'In Transit', color: 'blue', icon: Truck, total: 89.50 },
            ].map((order) => (
              <div key={order.id} className="flex flex-col md:flex-row items-center justify-between p-6 border border-slate-50 rounded-xl hover:border-slate-200 transition-all bg-slate-50/30 group">
                <div className="flex items-center gap-6 w-full md:w-auto mb-4 md:mb-0">
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm group-hover:text-black transition-colors">
                    <order.icon size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Order #{order.id}</h4>
                    <p className="text-xs text-slate-400 font-medium">Placed on {order.date}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full md:w-auto gap-12">
                  <div className="text-left md:text-right">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status</span>
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest",
                      order.color === 'emerald' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                    )}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total</span>
                    <span className="text-lg font-bold text-slate-900">${order.total.toFixed(2)}</span>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-black transition-colors hidden md:block" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
