import AdminSidebar, { AdminHeader, useSidebar } from '@/src/components/AdminLayout';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  Activity,
  Zap,
  Globe
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4500 },
  { name: 'May', value: 6000 },
  { name: 'Jun', value: 5500 },
  { name: 'Jul', value: 8000 },
];

export default function AdminDashboard() {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="min-h-screen bg-[#0f172a] text-white overflow-x-hidden">
      <AdminSidebar />
      <AdminHeader title="System Status" />
      
      <main className={cn(
        "p-10 space-y-12 transition-all duration-500",
        isCollapsed ? "lg:ml-24" : "lg:ml-72"
      )}>
        {/* Real-time Pulse */}
        <section className="glass-panel rounded-[40px] border-white/10 p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] -mr-64 -mt-64 transition-all group-hover:scale-110 duration-1000"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.4em]">Subsystem Nominal</p>
              </div>
              <h2 className="text-5xl font-display font-bold text-white tracking-tight leading-none uppercase">Global Architecture Pulse</h2>
              <p className="text-white/30 text-sm font-medium max-w-lg leading-relaxed">System performance is currently optimized at 98.4% efficiency. Global traffic surge detected in the APAC region (+24%). All payment gateways operational.</p>
            </div>
            <div className="flex gap-6">
              <div className="text-center p-6 glass-panel border-white/10 rounded-3xl min-w-[140px]">
                <Globe className="mx-auto mb-3 text-purple-400" size={24} />
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">Endpoints</p>
                <p className="text-xl font-display font-bold">12 / 12</p>
              </div>
              <div className="text-center p-6 glass-panel border-white/10 rounded-3xl min-w-[140px]">
                <Zap className="mx-auto mb-3 text-blue-400" size={24} />
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">Latency</p>
                <p className="text-xl font-display font-bold">42ms</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {[
            { label: 'Revenue Stream', value: '$128,430', trend: '+12.5%', isUp: true, icon: DollarSign },
            { label: 'User Entities', value: '4,230', trend: '+18.2%', isUp: true, icon: Users },
            { label: 'Network Orders', value: '18,540', trend: '-2.4%', isUp: false, icon: ShoppingBag },
            { label: 'Active Sessions', value: '1,120', trend: '+4.1%', isUp: true, icon: TrendingUp },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-8 rounded-[32px] border-white/10 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-white/5 text-purple-300">
                  <stat.icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter ${stat.isUp ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'} px-2 py-1 rounded-full`}>
                  {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.trend}
                </div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-2">{stat.label}</p>
              <h3 className="text-3xl font-display font-bold text-white uppercase tracking-tight">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Charts & Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* Main Chart */}
          <div className="xl:col-span-8 glass-panel p-10 rounded-[40px] border-white/10">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight">Growth Projection</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 mt-2">Metric: REVENUE_VAL_7M</p>
              </div>
              <select className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-white outline-none cursor-pointer hover:bg-white/10 transition-all">
                <option>Temporal: 6M</option>
                <option>Temporal: 1Y</option>
              </select>
            </div>
            <div className="h-[400px] w-full pr-4 relative">
              <ResponsiveContainer width="100%" height="100%" minHeight={400}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A855F7" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700}} dy={20} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700}} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{background: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff'}}
                    itemStyle={{fontWeight: 'bold', fontSize: '12px'}}
                  />
                  <Area type="monotone" dataKey="value" stroke="#A855F7" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="xl:col-span-4 glass-panel p-10 rounded-[40px] border-white/10">
            <div className="flex items-center gap-3 mb-10">
              <Activity className="text-purple-400" size={20} />
              <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight">System Logs</h3>
            </div>
            <div className="space-y-8">
              {[
                { user: 'ARCH_0A', msg: 'Order payload synchronized', time: '02M_AGO', color: 'bg-emerald-400' },
                { user: 'ARCH_0B', msg: 'Account credential update', time: '15M_AGO', color: 'bg-blue-400' },
                { user: 'ARCH_0C', msg: 'System integrity verify', time: '01H_AGO', color: 'bg-purple-400' },
                { user: 'ARCH_0D', msg: 'Anomaly blocked in APAC', time: '03H_AGO', color: 'bg-red-400' },
              ].map((log, i) => (
                <div key={i} className="flex gap-5 items-start">
                  <div className={`w-1.5 h-10 ${log.color} rounded-full shrink-0 group-hover:scale-y-110 transition-transform`}></div>
                  <div>
                    <p className="text-[11px] font-bold leading-tight">
                      <span className="text-white uppercase tracking-widest">{log.user}:</span>{' '}
                      <span className="text-white/40 uppercase tracking-tight">{log.msg}</span>
                    </p>
                    <p className="text-[9px] text-white/20 font-black tracking-[0.2em] mt-2">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-12 py-4 glass-panel border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-white/5 transition-all">
              Full Archive
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
