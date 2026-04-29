import AdminSidebar, { AdminHeader, useSidebar } from '@/src/components/AdminLayout';
import { 
  Search, 
  Filter, 
  Eye, 
  Download,
  Calendar,
  CreditCard,
  User,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  DollarSign,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function AdminOrders() {
  const { isCollapsed } = useSidebar();
  
  const orders = [
    { id: '#ORD-9281', customer: 'Alex Rivera', date: '2024-04-22', total: 450.00, status: 'Processing', payment: 'Paid', email: 'alex@example.com' },
    { id: '#ORD-9280', customer: 'Sarah Johnson', date: '2024-04-21', total: 120.00, status: 'Shipped', payment: 'Paid', email: 'sarah@example.com' },
    { id: '#ORD-9279', customer: 'Michael Chen', date: '2024-04-20', total: 890.00, status: 'Delivered', payment: 'Paid', email: 'michael@example.com' },
    { id: '#ORD-9278', customer: 'Emma Wilson', date: '2024-04-20', total: 245.00, status: 'Processing', payment: 'Failed', email: 'emma@example.com' },
    { id: '#ORD-9277', customer: 'James Miller', date: '2024-04-19', total: 67.00, status: 'Cancelled', payment: 'Refunded', email: 'james@example.com' },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <AdminSidebar />
      <AdminHeader title="Order Registry" />
      
      <main className={cn(
        "p-10 space-y-12 transition-all duration-500",
        isCollapsed ? "lg:ml-24" : "lg:ml-72"
      )}>
        {/* Sales Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { label: 'Total Revenue', value: '$128,430', change: '+12.5%', icon: DollarSign },
            { label: 'Active Orders', value: '452', change: '+4.2%', icon: ShoppingBag },
            { label: 'Completion Rate', value: '98.2%', change: '+0.5%', icon: CheckCircle },
            { label: 'Refund Volume', value: '$1,240', change: '-2.1%', icon: CreditCard },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-8 rounded-[32px] border-white/10"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-purple-300">
                  <stat.icon size={24} />
                </div>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">{stat.change}</span>
              </div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
              <h3 className="text-3xl font-display font-bold text-white uppercase tracking-tight">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Orders Table */}
        <div className="glass-panel rounded-[40px] border-white/10 overflow-hidden shadow-none">
          <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between gap-8">
            <div className="relative group flex-grow max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                placeholder="Trace order ID, customer name..." 
                className="h-14 pl-12 pr-6 w-full bg-white/5 rounded-2xl border border-white/10 focus:border-white/30 transition-all text-xs font-bold uppercase tracking-widest text-white outline-none placeholder:text-white/10"
              />
            </div>
            <div className="flex gap-4">
              <button className="h-14 px-8 glass-panel border-white/10 text-white/40 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:text-white transition-all">
                <Calendar size={18} />
                Date Selection
              </button>
              <button className="h-14 px-8 bg-white text-[#0f172a] rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/90 transition-all shadow-xl active:scale-95">
                <Download size={18} />
                Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Order Identifier</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Customer Entity</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Timestamp</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Contract Value</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Status</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Payment</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 text-right">Auth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-all group">
                    <td className="px-10 py-6">
                      <span className="text-sm font-bold text-white font-mono tracking-tight">{order.id}</span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/40">
                          {order.customer.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white/80">{order.customer}</p>
                          <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">{order.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-sm text-white/40 font-medium">
                      {order.date}
                    </td>
                    <td className="px-10 py-6 text-sm font-bold text-white">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-10 py-6">
                      <span className={cn(
                        "inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        order.status === 'Delivered' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                        order.status === 'Processing' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : 
                        order.status === 'Shipped' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-sm">
                      <div className="flex items-center gap-2">
                         <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          order.payment === 'Paid' ? "bg-emerald-400" : "bg-red-400"
                         )} />
                         <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">{order.payment}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button className="w-10 h-10 glass-panel border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white hover:text-[#0f172a] transition-all"><Eye size={16} /></button>
                        <button className="w-10 h-10 glass-panel border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white hover:text-[#0f172a] transition-all"><ExternalLink size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-10 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
              Trace Page <span className="text-white font-black">01</span> of 124
            </span>
            <div className="flex items-center gap-3">
              <button className="h-12 px-6 glass-panel border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white/20 disabled:opacity-30 flex items-center gap-2" disabled>
                <ChevronLeft size={16} />
                Back
              </button>
              <button className="h-12 px-6 glass-panel border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-[#0f172a] transition-all flex items-center gap-2">
                Forward
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
