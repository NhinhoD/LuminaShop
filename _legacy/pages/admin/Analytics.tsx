import AdminSidebar, { AdminHeader, useSidebar } from '@/src/components/AdminLayout';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Cell, Pie
} from 'recharts';

const areaData = [
  { name: 'Mon', revenue: 4000, users: 2400 },
  { name: 'Tue', revenue: 3000, users: 1398 },
  { name: 'Wed', revenue: 2000, users: 9800 },
  { name: 'Thu', revenue: 2780, users: 3908 },
  { name: 'Fri', revenue: 1890, users: 4800 },
  { name: 'Sat', revenue: 2390, users: 3800 },
  { name: 'Sun', revenue: 3490, users: 4300 },
];

const categoryData = [
  { name: 'Apparel', value: 400 },
  { name: 'Footwear', value: 300 },
  { name: 'Home', value: 300 },
  { name: 'Accessories', value: 200 },
];

const COLORS = ['#A855F7', '#3B82F6', '#EC4899', '#10B981'];

export default function AdminAnalytics() {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <AdminSidebar />
      <AdminHeader title="Analytics Core" />
      
      <main className={cn(
        "p-10 space-y-12 transition-all duration-500",
        isCollapsed ? "lg:ml-24" : "lg:ml-72"
      )}>
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.5em] mb-2">Metrics Hub</p>
            <h2 className="text-4xl font-display font-bold text-white tracking-tight uppercase">Economic Architecture</h2>
          </div>
          <div className="flex gap-4">
            <button className="h-14 px-8 glass-panel border-white/10 text-white/40 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:text-white transition-all">
              <Calendar size={18} />
              Temporal Shift
            </button>
            <button className="h-14 px-8 bg-white text-[#0f172a] rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/90 transition-all shadow-xl active:scale-95">
              <Download size={18} />
              Datastream
            </button>
          </div>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Conversion Delta', value: '4.82%', trend: '+0.5%', isUp: true },
            { label: 'Avg Order Velocity', value: '$842.10', trend: '+12%', isUp: true },
            { label: 'Bounce Frequency', value: '24.1%', trend: '-2%', isUp: false },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-10 rounded-[40px] border-white/10"
            >
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-4">{stat.label}</p>
              <div className="flex justify-between items-end">
                <h3 className="text-4xl font-display font-bold text-white">{stat.value}</h3>
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full mb-1",
                  stat.isUp ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"
                )}>
                  {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.trend}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          <div className="glass-panel p-10 rounded-[40px] border-white/10">
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-3">
                <TrendingUp size={20} className="text-purple-400" />
                Revenue Trajectory
              </h3>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20">
                <Zap size={18} />
              </div>
            </div>
            <div className="h-[400px] relative">
              <ResponsiveContainer width="100%" height="100%" minHeight={400}>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700}} dy={20} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700}} />
                  <Tooltip 
                    contentStyle={{background: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff'}}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#A855F7" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-10 rounded-[40px] border-white/10 flex flex-col">
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-3">
                <PieChartIcon size={20} className="text-blue-400" />
                Classification Spread
              </h3>
            </div>
            <div className="flex-grow flex items-center justify-center relative min-h-[300px]">
              <div className="h-[300px] w-full max-w-[400px] relative">
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{background: '#1e293b', borderRadius: '16px', border: 'none', color: '#fff'}}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {categoryData.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
