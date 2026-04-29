import { useState } from 'react';
import { Search, ShoppingCart, User, Filter, SortAsc, ChevronLeft, ChevronRight, ShoppingCart as ShoppingCartIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Link } from 'react-router-dom';

const products = [
  { id: 1, name: 'The Architect Coat', category: 'Outerwear', sub: 'Charcoal Heavyweight Wool', price: 345, img: 'https://images.unsplash.com/photo-1544022613-e87ce7526ed1?q=80&w=1974&auto=format&fit=crop', badge: 'New In' },
  { id: 2, name: 'Oversized Poplin Shirt', category: 'Apparel', sub: 'Optic White Cotton', price: 120, img: 'https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?q=80&w=1974&auto=format&fit=crop' },
  { id: 3, name: 'Heritage Straight Denim', category: 'Bottoms', sub: 'Vintage Wash Selvedge', price: 185, img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1926&auto=format&fit=crop' },
  { id: 4, name: 'Alpaca Blend Crew', category: 'Knitwear', sub: 'Oatmeal Heather', price: 210, img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=2005&auto=format&fit=crop', badge: 'Bestseller' },
  { id: 5, name: 'Ribbed Merino Turtleneck', category: 'Knitwear', sub: 'Midnight Black', price: 145, img: 'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?q=80&w=2024&auto=format&fit=crop' },
  { id: 6, name: 'Fluid Drape Trousers', category: 'Bottoms', sub: 'Camel Twill', price: 195, img: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1974&auto=format&fit=crop' },
];

export default function Shop() {
  const [selectedCategories, setSelectedCategories] = useState(['All Clothing']);

  const categories = ['All Clothing', 'Outerwear', 'Knitwear', 'Bottoms'];

  return (
    <div className="pt-24 min-h-screen">
      <main className="max-w-[1440px] mx-auto px-8 md:px-12 py-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b border-white/10 pb-10">
          <div>
            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.4em] mb-4">Collection</p>
            <h1 className="text-6xl font-display font-bold text-white tracking-tighter">Shop Products</h1>
          </div>
          <div className="mt-8 md:mt-0 flex items-center gap-6">
            <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-xl border-white/10">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Sort by</label>
              <select className="bg-transparent border-none text-white text-xs font-bold focus:outline-none cursor-pointer">
                <option>Featured</option>
                <option>Newest Arrivals</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          {/* Sidebar */}
          <aside className="md:col-span-3 space-y-12">
            <div className="glass-panel p-8 rounded-[32px] border-white/10">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-8 text-purple-300">Category</h3>
              <ul className="space-y-4">
                {categories.map((cat) => (
                  <li key={cat}>
                    <label className="flex items-center gap-4 cursor-pointer group">
                      <div className={cn(
                        "w-5 h-5 rounded-md border border-white/20 flex items-center justify-center transition-all",
                        selectedCategories.includes(cat) ? "bg-white border-white" : "bg-white/5"
                      )}>
                        {selectedCategories.includes(cat) && <div className="w-2 h-2 bg-[#0f172a] rounded-sm" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => {
                          if (cat === 'All Clothing') {
                            setSelectedCategories(['All Clothing']);
                          } else {
                            const newCats = selectedCategories.filter(c => c !== 'All Clothing');
                            if (newCats.includes(cat)) {
                              setSelectedCategories(newCats.filter(c => c !== cat).length === 0 ? ['All Clothing'] : newCats.filter(c => c !== cat));
                            } else {
                              setSelectedCategories([...newCats, cat]);
                            }
                          }
                        }}
                      />
                      <span className={cn(
                        "text-sm font-bold tracking-wide transition-colors",
                        selectedCategories.includes(cat) ? "text-white" : "text-white/40 hover:text-white/70"
                      )}>{cat}</span>
                    </label>
                  </li>
                ))}
              </ul>

              <div className="my-10 h-px bg-white/10" />

              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-purple-300 transition-all">Price Range</h3>
              <div className="flex items-center gap-3">
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white/30">$</span>
                  <input type="number" placeholder="Min" className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 py-3 text-xs font-bold text-white focus:outline-none focus:border-white/30 transition-all" />
                </div>
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white/30">$</span>
                  <input type="number" placeholder="Max" className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 py-3 text-xs font-bold text-white focus:outline-none focus:border-white/30 transition-all" />
                </div>
              </div>

              <div className="my-10 h-px bg-white/10" />

              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-purple-300">Size</h3>
              <div className="grid grid-cols-3 gap-3">
                {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                  <button 
                    key={size}
                    className={cn(
                      "border border-white/10 rounded-xl py-3 text-[10px] font-bold transition-all",
                      size === 'M' ? "bg-white text-[#0f172a] border-white" : "text-white/50 hover:border-white/30 hover:text-white"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="md:col-span-9">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {products.map((prod) => (
                <motion.article 
                  key={prod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group flex flex-col"
                >
                  <Link to={`/product/${prod.id}`} className="relative h-[450px] glass-card rounded-[32px] overflow-hidden mb-6 block">
                    <img 
                      src={prod.img} 
                      alt={prod.name} 
                      className="object-cover w-full h-full opacity-60 transition-all duration-700 group-hover:scale-110 group-hover:opacity-90"
                    />
                    {prod.badge && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold text-[9px] px-3 py-1 rounded-full uppercase tracking-widest">
                          {prod.badge}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <button className="w-full bg-white text-[#0f172a] font-bold text-[10px] uppercase tracking-widest py-4 rounded-2xl shadow-xl transition-all hover:bg-white/90 active:scale-95 flex items-center justify-center gap-2">
                        <ShoppingCartIcon size={16} />
                        Add to Cart
                      </button>
                    </div>
                  </Link>
                  <div className="px-2">
                    <h3 className="text-xl font-display font-bold text-white mb-1">{prod.name}</h3>
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{prod.sub}</p>
                      <span className="text-purple-300 font-bold text-sm">${prod.price}</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-24 flex flex-col sm:flex-row items-center justify-between gap-8 border-t border-white/10 pt-10">
              <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Showing 1 to 6 of 24 results</span>
              <div className="flex items-center gap-3">
                <button className="w-12 h-12 glass-panel border-white/10 flex items-center justify-center rounded-2xl text-white/40 hover:text-white transition-all disabled:opacity-50" disabled>
                   <ChevronLeft size={20} />
                </button>
                <button className="w-12 h-12 bg-white text-[#0f172a] rounded-2xl font-black text-sm">1</button>
                <button className="w-12 h-12 glass-panel border-white/10 text-white/40 rounded-2xl font-bold text-sm hover:text-white transition-all">2</button>
                <button className="w-12 h-12 glass-panel border-white/10 text-white/40 rounded-2xl font-bold text-sm hover:text-white transition-all">3</button>
                <span className="text-white/20 font-bold px-2">...</span>
                <button className="w-12 h-12 glass-panel border-white/10 text-white/40 rounded-2xl flex items-center justify-center hover:text-white transition-all">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
