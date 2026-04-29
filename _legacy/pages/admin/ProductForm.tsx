import AdminSidebar, { AdminHeader, useSidebar } from '@/src/components/AdminLayout';
import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Upload, 
  Plus, 
  Trash2, 
  Save, 
  X,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function AdminProductForm() {
  const { isCollapsed } = useSidebar();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'Apparel',
    status: 'Draft',
    material: '',
    tags: [] as string[],
  });

  const [newTag, setNewTag] = useState('');
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1544022613-e87ce7526ed1?q=80&w=1974&auto=format&fit=crop'
  ]);

  const categories = ['Apparel', 'Footwear', 'Accessories', 'Home', 'Objects', 'Knitwear', 'Outerwear'];

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({ ...formData, tags: [...formData.tags, newTag] });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <AdminSidebar />
      <AdminHeader title={isEditing ? 'Edit Product' : 'Create Product'} />
      
      <main className={cn(
        "p-10 max-w-6xl mx-auto transition-all duration-500",
        isCollapsed ? "lg:ml-24" : "lg:ml-72"
      )}>
        <div className="mb-10 flex items-center justify-between">
          <Link 
            to="/admin/products" 
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group text-sm font-bold uppercase tracking-widest"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Products
          </Link>
          
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/admin/products')}
              className="px-6 py-3 rounded-2xl glass-panel border-white/10 text-white/70 font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              Discard
            </button>
            <button className="px-8 py-3 bg-white text-[#0f172a] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/90 shadow-xl flex items-center gap-2 transition-all active:scale-95">
              <Save size={18} />
              {isEditing ? 'Update Product' : 'Publish Product'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-8">
            {/* Basic Info */}
            <section className="glass-panel rounded-[40px] border-white/10 p-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[80px] -mr-32 -mt-32"></div>
               <h3 className="text-xl font-display font-bold text-white mb-8 relative z-10">Basic Information</h3>
               
               <div className="space-y-6 relative z-10">
                 <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] block mb-3 ml-1">Product Designation</label>
                    <input 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. The Architect Coat" 
                      className="w-full h-14 px-6 rounded-2xl bg-white/5 border border-white/10 focus:border-white/30 text-white outline-none transition-all text-sm font-medium"
                    />
                 </div>
                 
                 <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] block mb-3 ml-1">Description Manifesto</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe the soul of this product..." 
                      rows={6}
                      className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 focus:border-white/30 text-white outline-none transition-all text-sm font-medium resize-none"
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] block mb-3 ml-1">Material Composition</label>
                      <input 
                        value={formData.material}
                        onChange={(e) => setFormData({...formData, material: e.target.value})}
                        placeholder="e.g. 100% Merino Wool" 
                        className="w-full h-14 px-6 rounded-2xl bg-white/5 border border-white/10 focus:border-white/30 text-white outline-none transition-all text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] block mb-3 ml-1">Category Registry</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full h-14 px-6 rounded-2xl bg-white/5 border border-white/10 focus:border-white/30 text-white outline-none transition-all text-sm font-medium appearance-none cursor-pointer"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                 </div>
               </div>
            </section>

            {/* Inventory & Pricing */}
            <section className="glass-panel rounded-[40px] border-white/10 p-10 relative overflow-hidden">
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[80px] -ml-32 -mb-32"></div>
               <h3 className="text-xl font-display font-bold text-white mb-8 relative z-10">Inventory & Value</h3>
               
               <div className="grid grid-cols-2 gap-8 relative z-10">
                 <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] block mb-3 ml-1">Price Unit ($)</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 font-bold">$</span>
                      <input 
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        placeholder="0.00" 
                        className="w-full h-14 pl-12 pr-6 rounded-2xl bg-white/5 border border-white/10 focus:border-white/30 text-white outline-none transition-all text-sm font-medium"
                      />
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] block mb-3 ml-1">Stock Availability</label>
                    <input 
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      placeholder="0" 
                      className="w-full h-14 px-6 rounded-2xl bg-white/5 border border-white/10 focus:border-white/30 text-white outline-none transition-all text-sm font-medium"
                    />
                 </div>
               </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-8">
            {/* Status & Visibility */}
            <section className="glass-panel rounded-[40px] border-white/10 p-8">
              <h3 className="text-[10px] font-bold text-purple-300 uppercase tracking-[0.3em] mb-6">Status Flow</h3>
              <div className="space-y-4">
                {['Draft', 'Active', 'Archived'].map((status) => (
                  <button 
                    key={status}
                    onClick={() => setFormData({...formData, status})}
                    className={cn(
                      "w-full h-12 rounded-2xl border flex items-center justify-between px-5 transition-all text-[11px] font-bold uppercase tracking-widest",
                      formData.status === status 
                        ? "bg-white text-[#0f172a] border-white" 
                        : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                    )}
                  >
                    {status}
                    {formData.status === status && <CheckCircle2 size={16} />}
                  </button>
                ))}
              </div>
            </section>

            {/* Media Upload */}
            <section className="glass-panel rounded-[40px] border-white/10 p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-bold text-purple-300 uppercase tracking-[0.3em]">Visual Assets</h3>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest font-sans">{images.length}/4</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {images.map((img, i) => (
                  <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden glass-card border-white/10">
                    <img src={img} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" />
                    <button 
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                      className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-[#0f172a] text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {images.length < 4 && (
                  <button className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-white/30 hover:border-white/30 hover:text-white transition-all group">
                    <Upload size={24} className="mb-2 group-hover:-translate-y-1 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Upload</span>
                  </button>
                )}
              </div>
              
              <div className="p-4 bg-purple-500/5 rounded-2xl border border-white/5 flex gap-3 text-white/40">
                <AlertCircle size={16} className="shrink-0 text-purple-400" />
                <p className="text-[9px] leading-relaxed font-medium uppercase tracking-wider">Recommended: Use high-contrast architectural imagery with 4:5 aspect ratio.</p>
              </div>
            </section>

            {/* Tags */}
            <section className="glass-panel rounded-[40px] border-white/10 p-8">
              <h3 className="text-[10px] font-bold text-purple-300 uppercase tracking-[0.3em] mb-6">Taxonomy Tags</h3>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <AnimatePresence>
                  {formData.tags.map((tag) => (
                    <motion.span 
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-white/80"
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-red-400"><X size={12} /></button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex gap-2 p-1 glass-panel border-white/10 rounded-2xl">
                <input 
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Add tag..." 
                  className="flex-grow bg-transparent border-none rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none text-xs font-bold"
                />
                <button 
                  onClick={addTag}
                  className="w-10 h-10 bg-white text-[#0f172a] rounded-xl flex items-center justify-center transition-all active:scale-90"
                >
                  <Plus size={18} />
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
