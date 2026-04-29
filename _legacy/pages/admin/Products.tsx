import AdminSidebar, { AdminHeader, useSidebar } from '@/src/components/AdminLayout';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  PackageOpen,
  Image as ImageIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function AdminProducts() {
  const { isCollapsed } = useSidebar();
  
  const products = [
    { id: 1, name: 'The Architect Coat', category: 'Outerwear', price: 345, stock: 124, status: 'Active', img: 'https://images.unsplash.com/photo-1544022613-e87ce7526ed1?q=80&w=1974&auto=format&fit=crop' },
    { id: 2, name: 'Oversized Poplin Shirt', category: 'Apparel', price: 120, stock: 450, status: 'Active', img: 'https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?q=80&w=1974&auto=format&fit=crop' },
    { id: 3, name: 'Heritage Straight Denim', category: 'Bottoms', price: 185, stock: 0, status: 'Out of Stock', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1926&auto=format&fit=crop' },
    { id: 4, name: 'Alpaca Blend Crew', category: 'Knitwear', price: 210, stock: 85, status: 'Draft', img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=2005&auto=format&fit=crop' },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <AdminSidebar />
      <AdminHeader title="Products" />
      
      <main className={cn(
        "p-10 space-y-12 transition-all duration-500",
        isCollapsed ? "lg:ml-24" : "lg:ml-72"
      )}>
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex glass-panel p-1 border-white/10 rounded-2xl shadow-none">
            <button className="px-6 py-2.5 rounded-xl bg-white text-[#0f172a] text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-2">
              <PackageCheck size={16} />
              All Inventory
            </button>
            <button className="px-6 py-2.5 rounded-xl text-white/40 text-[10px] font-bold tracking-widest uppercase transition-all hover:text-white flex items-center gap-2">
              <PackageOpen size={16} />
              Draft Vault
            </button>
          </div>
          
          <Link to="/admin/products/new" className="px-10 py-4 bg-white text-[#0f172a] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/90 shadow-[0_20px_50px_rgba(255,255,255,0.2)] active:scale-95 flex items-center gap-2">
            <Plus size={20} />
            Create Product
          </Link>
        </div>

        {/* Table/List View */}
        <div className="glass-panel rounded-[40px] border-white/10 overflow-hidden shadow-none">
          <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between gap-8">
            <div className="relative group flex-grow max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                placeholder="Query inventory registry..." 
                className="h-14 pl-12 pr-6 w-full bg-white/5 rounded-2xl border border-white/10 focus:border-white/30 transition-all text-xs font-bold uppercase tracking-widest text-white outline-none placeholder:text-white/10"
              />
            </div>
            <div className="flex gap-4">
              <button className="h-14 px-8 glass-panel border-white/10 text-white/40 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:text-white transition-all">
                <Filter size={18} />
                Filters
              </button>
              <button className="h-14 px-8 glass-panel border-white/10 text-white/40 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:text-white transition-all">
                Registry Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Object Designation</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Classification</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Value</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Inventory</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Status</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-white/5 transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl glass-card border-white/10 overflow-hidden shrink-0 flex items-center justify-center text-white/20">
                          {prod.img ? (
                            <img src={prod.img} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" />
                          ) : (
                            <ImageIcon size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white text-base font-display group-hover:text-purple-300 transition-colors uppercase tracking-tight">{prod.name}</p>
                          <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.2em] mt-1">ID: ARCH-00{prod.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{prod.category}</span>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-sm font-bold text-white">${prod.price.toFixed(2)}</span>
                    </td>
                    <td className="px-10 py-6">
                       <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        prod.stock === 0 ? "text-purple-400" : "text-white/40"
                       )}>
                        {prod.stock} Units
                       </span>
                    </td>
                    <td className="px-10 py-6">
                      <span className={cn(
                        "inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                        prod.status === 'Active' ? "bg-white/10 text-white border-white/20" : 
                        prod.status === 'Draft' ? "bg-white/5 text-white/30 border-white/10" : "bg-purple-500/10 text-purple-300 border-purple-500/20"
                      )}>
                        {prod.status}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                        <Link to={`/admin/products/edit/${prod.id}`} className="w-10 h-10 glass-panel border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white hover:text-[#0f172a] transition-all"><Edit size={16} /></Link>
                        <button className="w-10 h-10 glass-panel border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
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
