import AdminSidebar, { AdminHeader, useSidebar } from '@/src/components/AdminLayout';
import { 
  Users, 
  Search, 
  Filter, 
  Mail, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function AdminCustomers() {
  const { isCollapsed } = useSidebar();
  
  const customers = [
    { id: 'CUST-001', name: 'Alex Rivera', email: 'alex@example.com', orders: 12, spent: 4500.00, status: 'Active' },
    { id: 'CUST-002', name: 'Sarah Johnson', email: 'sarah@example.com', orders: 8, spent: 1200.00, status: 'Active' },
    { id: 'CUST-003', name: 'Michael Chen', email: 'michael@example.com', orders: 24, spent: 8900.00, status: 'VIP' },
    { id: 'CUST-004', name: 'Emma Wilson', email: 'emma@example.com', orders: 3, spent: 245.00, status: 'Active' },
    { id: 'CUST-005', name: 'James Miller', email: 'james@example.com', orders: 1, spent: 67.00, status: 'Inactive' },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <AdminSidebar />
      <AdminHeader title="Customer Entities" />
      
      <main className={cn(
        "p-10 space-y-12 transition-all duration-500",
        isCollapsed ? "lg:ml-24" : "lg:ml-72"
      )}>
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex glass-panel p-1 border-white/10 rounded-2xl">
            <button className="px-6 py-2.5 rounded-xl bg-white text-[#0f172a] text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-2">
              <Users size={16} />
              All Entities
            </button>
            <button className="px-6 py-2.5 rounded-xl text-white/40 text-[10px] font-bold tracking-widest uppercase transition-all hover:text-white flex items-center gap-2">
              Segmented
            </button>
          </div>
          
          <button className="px-10 py-4 bg-white text-[#0f172a] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/90 shadow-xl active:scale-95 flex items-center gap-2">
            <UserPlus size={20} />
            Add Entity
          </button>
        </div>

        {/* Database Section */}
        <div className="glass-panel rounded-[40px] border-white/10 overflow-hidden">
          <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between gap-8">
            <div className="relative group flex-grow max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                placeholder="Query entity database..." 
                className="h-14 pl-12 pr-6 w-full bg-white/5 rounded-2xl border border-white/10 focus:border-white/30 transition-all text-xs font-bold uppercase tracking-widest text-white outline-none placeholder:text-white/10"
              />
            </div>
            <button className="h-14 px-8 glass-panel border-white/10 text-white/40 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:text-white transition-all">
              <Filter size={18} />
              Refine Search
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Entity Persona</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Engagement</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Lifetime Value</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Classification</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 text-right">Auth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-white/5 transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-blue-500/20 flex items-center justify-center text-white font-bold text-sm border border-white/10">
                          {cust.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-white font-display group-hover:text-purple-300 transition-colors uppercase tracking-tight">{cust.name}</p>
                          <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.2em] mt-1">{cust.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{cust.orders} Acquisitions</span>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-sm font-bold text-white font-mono">${cust.spent.toLocaleString()}</span>
                    </td>
                    <td className="px-10 py-6">
                      <span className={cn(
                        "inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        cust.status === 'VIP' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : 
                        cust.status === 'Active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                        "bg-white/5 text-white/30 border-white/10"
                      )}>
                        {cust.status}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button className="w-10 h-10 glass-panel border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white hover:text-[#0f172a] transition-all"><Mail size={16} /></button>
                        <button className="w-10 h-10 glass-panel border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white hover:text-[#0f172a] transition-all"><MoreHorizontal size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-10 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
              Database Page <span className="text-white font-black">01</span> of 48
            </span>
            <div className="flex items-center gap-3">
              <button className="h-12 px-6 glass-panel border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white/20 disabled:opacity-30" disabled>
                <ChevronLeft size={18} />
              </button>
              <button className="h-12 px-6 glass-panel border-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white hover:text-[#0f172a] transition-all">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
