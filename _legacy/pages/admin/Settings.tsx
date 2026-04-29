import AdminSidebar, { AdminHeader, useSidebar } from '@/src/components/AdminLayout';
import { 
  Settings, 
  User, 
  Bell, 
  ShieldCheck, 
  Globe, 
  Save,
  CreditCard,
  Mail,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useState } from 'react';

export default function AdminSettings() {
  const { isCollapsed } = useSidebar();
  const [activeTab, setActiveTab] = useState('General');

  const tabs = [
    { name: 'General', icon: Settings },
    { name: 'Security', icon: ShieldCheck },
    { name: 'Notifications', icon: Bell },
    { name: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <AdminSidebar />
      <AdminHeader title="System Configuration" />
      
      <main className={cn(
        "p-10 max-w-6xl mx-auto space-y-10 transition-all duration-500",
        isCollapsed ? "lg:ml-24" : "lg:ml-72"
      )}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Navigation */}
          <div className="lg:col-span-3 space-y-2">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] mb-6 px-4">Navigation</p>
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all",
                  activeTab === tab.name 
                    ? "bg-white text-[#0f172a] shadow-xl" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <tab.icon size={18} />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="lg:col-span-9 space-y-10">
            <section className="glass-panel rounded-[40px] border-white/10 p-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 blur-[100px] -mr-40 -mt-40"></div>
               
               <div className="flex justify-between items-center mb-10 relative z-10">
                 <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">{activeTab} Parameters</h3>
                 <button className="px-8 py-3 bg-white text-[#0f172a] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/90 transition-all flex items-center gap-2">
                   <Save size={16} />
                   Save Sync
                 </button>
               </div>

               <div className="space-y-8 relative z-10">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] block mb-3 ml-1">Store Designation</label>
                      <input placeholder="Lumina Archive" className="w-full h-14 px-6 rounded-2xl bg-white/5 border border-white/10 focus:border-white/30 text-white outline-none transition-all text-sm font-medium" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] block mb-3 ml-1">Contact Link</label>
                      <input placeholder="admin@lumina.co" className="w-full h-14 px-6 rounded-2xl bg-white/5 border border-white/10 focus:border-white/30 text-white outline-none transition-all text-sm font-medium" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] block mb-3 ml-1">Manifesto Description</label>
                    <textarea rows={4} placeholder="Core architecture for modern lifestyle curation." className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 focus:border-white/30 text-white outline-none transition-all text-sm font-medium resize-none" />
                  </div>

                  <div className="flex items-center justify-between p-8 rounded-[32px] bg-white/5 border border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                        <Globe size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-widest">Public Endpoint</p>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-tight mt-1">Status: Operational</p>
                      </div>
                    </div>
                    <button className="text-[10px] font-black text-purple-300 uppercase tracking-widest hover:text-white transition-all">Configure</button>
                  </div>
               </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-panel p-8 rounded-[32px] border-white/10 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] mb-6">User Flow</h4>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                      <User size={20} />
                    </div>
                    <p className="text-xs font-bold text-white uppercase tracking-widest">Guest Checkout</p>
                  </div>
                  <p className="text-[10px] text-white/30 font-medium leading-relaxed">Allow entities to process acquisitions without synchronization.</p>
                </div>
                <div className="mt-8 flex justify-end">
                   <div className="w-12 h-6 bg-purple-500 rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                   </div>
                </div>
              </div>

              <div className="glass-panel p-8 rounded-[32px] border-white/10 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] mb-6">Access Layer</h4>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                      <ShieldCheck size={20} />
                    </div>
                    <p className="text-xs font-bold text-white uppercase tracking-widest">Two-Factor Sync</p>
                  </div>
                  <p className="text-[10px] text-white/30 font-medium leading-relaxed">Mandatory secondary verification for all administrative endpoints.</p>
                </div>
                <div className="mt-8 flex justify-end">
                   <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white/20 rounded-full"></div>
                   </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
