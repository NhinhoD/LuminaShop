import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  ChevronLeft,
  Search,
  Bell,
  Menu
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import React, { useState, createContext, useContext } from 'react';

// Create a context to share sidebar state across components
const SidebarContext = createContext({
  isCollapsed: false,
  toggle: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const toggle = () => setIsCollapsed(!isCollapsed);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export default function AdminSidebar() {
  const location = useLocation();
  const { isCollapsed, toggle } = useSidebar();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { name: 'Products', icon: Package, href: '/admin/products' },
    { name: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
    { name: 'Customers', icon: Users, href: '/admin/customers' },
    { name: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    { name: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <aside 
      className={cn(
        "h-screen fixed left-0 top-0 glass-panel border-y-0 border-l-0 shadow-none border-white/10 flex flex-col z-50 transition-all duration-500 ease-in-out",
        isCollapsed ? "w-24" : "w-72"
      )}
    >
      {/* Admin Branding */}
      <div className={cn(
        "flex items-center justify-between transition-all duration-500",
        isCollapsed ? "p-6 justify-center" : "p-8 pb-12"
      )}>
        {!isCollapsed && (
          <Link to="/" className="text-2xl font-black tracking-tighter text-white uppercase font-display">Lumina</Link>
        )}
        <button 
          onClick={toggle}
          className={cn(
            "w-10 h-10 rounded-xl glass-panel border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all",
            !isCollapsed && "ml-4"
          )}
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {!isCollapsed && (
        <span className="mx-8 mb-8 bg-purple-600/30 text-[9px] font-bold text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 tracking-widest uppercase text-center">
          Admin Control
        </span>
      )}

      {/* Main Nav */}
      <nav className={cn(
        "flex-grow space-y-2 transition-all duration-500",
        isCollapsed ? "px-4" : "px-6"
      )}>
        {!isCollapsed && (
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 mb-6 px-4">Management</p>
        )}
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex items-center rounded-2xl text-xs font-bold uppercase tracking-widest transition-all group relative",
              isCollapsed ? "justify-center h-14" : "gap-3 px-5 py-3.5",
              location.pathname === item.href 
                ? "bg-white/10 text-white border border-white/10 shadow-lg" 
                : "text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent"
            )}
            title={isCollapsed ? item.name : ""}
          >
            <item.icon size={18} className={cn(
              "transition-all shrink-0",
              location.pathname === item.href ? "text-purple-400 scale-110" : "text-white/30 group-hover:text-white/50"
            )} />
            {!isCollapsed && <span>{item.name}</span>}
            {location.pathname === item.href && (
              <motion.div 
                layoutId="active-pill" 
                className={cn(
                  "absolute bg-purple-500 rounded-full",
                  isCollapsed ? "bottom-1 w-6 h-1" : "left-0 w-1 h-6"
                )} 
              />
            )}
          </Link>
        ))}
      </nav>

      {/* User / Footer */}
      <div className={cn(
        "border-t border-white/10 space-y-6 transition-all duration-500",
        isCollapsed ? "p-4 items-center flex flex-col" : "p-8"
      )}>
        <div className={cn("flex items-center gap-4 px-2", isCollapsed && "justify-center px-0")}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-blue-500 p-[1px] shrink-0">
            <div className="w-full h-full rounded-[15px] bg-[#0f172a] flex items-center justify-center text-white font-black text-xs">
              AD
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex-grow min-w-0">
              <p className="text-xs font-bold text-white truncate uppercase tracking-widest">Administrator</p>
              <p className="text-[10px] text-white/30 truncate font-medium">SYSTEM_AUTH_01</p>
            </div>
          )}
        </div>
        {!isCollapsed ? (
          <button className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 hover:bg-white/5 hover:text-red-400 transition-all group border border-transparent hover:border-red-400/20">
            <LogOut size={16} />
            Deauthorize
          </button>
        ) : (
          <button className="p-3 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all" title="Logout">
            <LogOut size={20} />
          </button>
        )}
      </div>
    </aside>
  );
}

export function AdminHeader({ title }: { title: string }) {
  const { isCollapsed } = useSidebar();
  
  return (
    <header 
      className={cn(
        "h-[92px] glass-panel border-x-0 border-t-0 shadow-none border-white/10 flex items-center justify-between px-12 sticky top-0 z-40 transition-all duration-500",
        isCollapsed ? "lg:ml-24" : "lg:ml-72"
      )}
    >
      <div className="flex flex-col">
        <p className="text-[9px] font-bold text-purple-400 uppercase tracking-[0.4em] mb-1">Navigation</p>
        <h1 className="text-2xl font-display font-bold text-white tracking-tight">{title}</h1>
      </div>
      
      <div className="flex items-center gap-10">
        <div className="relative group hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
          <input 
            placeholder="Search system..." 
            className="h-12 pl-12 pr-6 w-72 bg-white/5 rounded-2xl border border-white/10 focus:border-white/30 text-white transition-all text-xs outline-none font-bold uppercase tracking-widest placeholder:text-white/10"
          />
        </div>
        
        <div className="flex items-center gap-6">
          <button className="w-11 h-11 rounded-2xl glass-panel border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all relative">
            <Bell size={18} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-purple-500 rounded-full border-2 border-[#0f172a]"></span>
          </button>
          <div className="w-[1px] h-10 bg-white/10 mx-2"></div>
          <div className="flex items-center gap-4 cursor-pointer group">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white uppercase tracking-widest transition-colors group-hover:text-purple-300">Jane Doe</p>
              <p className="text-[10px] text-white/20 font-bold uppercase tracking-tighter">Chief Architect</p>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop" 
              className="w-11 h-11 rounded-2xl border border-white/10 group-hover:border-white/30 transition-all p-[2px]" 
            />
          </div>
        </div>
      </div>
    </header>
  );
}
