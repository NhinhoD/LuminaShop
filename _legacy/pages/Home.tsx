import { motion } from 'motion/react';
import { ArrowRight, ShoppingCart as ShoppingCartIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="pt-[72px]">
      {/* Hero Section */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 mt-10 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:h-[760px]">
          {/* Main Feature */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-8 relative rounded-[40px] overflow-hidden glass-panel border-white/10 group"
          >
            <img 
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
              alt="SS24 Collection" 
              className="absolute inset-0 w-full h-full object-cover opacity-40 transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0f172a] via-transparent to-purple-500/10"></div>
            
            <div className="relative h-full flex flex-col justify-center p-12 md:p-20 lg:w-3/4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 self-start px-6 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest border border-white/10 mb-8"
              >
                New Era 2024
              </motion.div>
              <h1 className="font-display font-bold text-6xl md:text-8xl text-white mb-8 leading-[0.9] tracking-tighter uppercase transition-all">
                Pure<br/><span className="text-purple-300">Minimal</span>
              </h1>
              <p className="text-lg text-white/60 mb-10 max-w-sm leading-relaxed">
                Experience the perfect harmony of form and function. Our curated objects are designed to elevate your lifestyle.
              </p>
              <div className="flex items-center gap-6">
                <Link to="/shop" className="px-10 py-5 bg-white text-[#0f172a] rounded-2xl font-bold text-sm uppercase transition-all hover:bg-white/90 shadow-[0_20px_50px_rgba(255,255,255,0.2)] active:scale-95">
                  Shop Collection
                </Link>
                <div className="w-14 h-14 rounded-2xl border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer">
                   <ArrowRight size={24} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Secondary Tiles */}
          <div className="lg:col-span-4 grid grid-rows-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative rounded-[32px] overflow-hidden glass-card group p-8 flex flex-col justify-end"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent opacity-80 z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2158&auto=format&fit=crop" 
                alt="Interior" 
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="relative z-20">
                <p className="text-[10px] font-bold text-purple-300 uppercase tracking-widest mb-2">Curated</p>
                <h2 className="text-3xl font-display font-bold text-white mb-4">Architectural Spaces</h2>
                <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white transition-colors uppercase tracking-wider">
                  Explore <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="relative rounded-[32px] overflow-hidden glass-card group p-8 flex flex-col justify-end"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent opacity-80 z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop" 
                alt="Accessories" 
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="relative z-20">
                <p className="text-[10px] font-bold text-purple-300 uppercase tracking-widest mb-2">Essential</p>
                <h2 className="text-3xl font-display font-bold text-white mb-4">Finer Details</h2>
                <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white transition-colors uppercase tracking-wider">
                  Shop Now <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 mb-32">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.3em] mb-3">Browse</p>
            <h2 className="text-5xl font-display font-bold text-white tracking-tight">Style Directory</h2>
          </div>
          <Link to="/shop" className="text-xs font-bold text-white/60 hover:text-white uppercase tracking-widest border-b border-white/20 pb-1 transition-all">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[
            { name: 'Apparel', count: '12 Items', img: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=1935&auto=format&fit=crop' },
            { name: 'Footwear', count: '24 Items', img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop' },
            { name: 'Objects', count: '08 Items', img: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=2070&auto=format&fit=crop' },
          ].map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative h-[450px] rounded-[32px] overflow-hidden glass-card"
            >
              <img 
                src={cat.img} 
                alt={cat.name} 
                className="w-full h-full object-cover opacity-50 transition-all duration-700 group-hover:scale-110 group-hover:opacity-70"
              />
              <div className="absolute bottom-6 left-6 right-6 glass-panel rounded-2xl p-6 flex justify-between items-center transform transition-all duration-500 group-hover:-translate-y-2">
                <div>
                  <h3 className="text-xl font-bold text-white font-display mb-1">{cat.name}</h3>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">{cat.count}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 border border-white/20 flex items-center justify-center text-white">
                  <ArrowRight size={18} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 mb-32">
        <div className="text-center mb-16">
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.4em] mb-4">Trending</p>
          <h2 className="text-5xl font-display font-bold text-white tracking-tight">Our Favorites</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { id: 1, name: 'Essential Cotton Tee', price: 45, material: 'Organic Cotton', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop', badge: 'New In' },
            { id: 2, name: 'Structured Leather Jacket', price: 450, material: 'Italian Leather', img: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?q=80&w=1964&auto=format&fit=crop' },
            { id: 3, name: 'Merino Wool Knit', price: 185, material: 'Ethically Sourced', img: 'https://images.unsplash.com/photo-1626497746270-244495660447?q=80&w=1974&auto=format&fit=crop' },
            { id: 4, name: 'Everyday Canvas Tote', price: 85, material: 'Heavyweight Canvas', img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1974&auto=format&fit=crop' },
          ].map((prod) => (
            <motion.div key={prod.id} className="group flex flex-col">
              <div className="relative h-[400px] glass-card rounded-[28px] overflow-hidden mb-6">
                <img 
                  src={prod.img} 
                  alt={prod.name} 
                  className="w-full h-full object-cover opacity-60 transition-all duration-700 group-hover:scale-110 group-hover:opacity-90"
                />
                {prod.badge && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold text-[9px] px-3 py-1 rounded-full uppercase tracking-widest">
                      {prod.badge}
                    </span>
                  </div>
                )}
                <button className="absolute bottom-4 right-4 w-12 h-12 glass-panel flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-white hover:text-[#0f172a]">
                  <ShoppingCartIcon size={20} />
                </button>
              </div>
              <div className="px-2">
                <h3 className="font-bold text-white text-lg font-display mb-1">{prod.name}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-white/50 font-bold uppercase tracking-widest">{prod.material}</p>
                  <p className="text-purple-300 font-bold text-sm">${prod.price.toFixed(2)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 mb-32">
        <div className="glass-panel rounded-[40px] p-12 md:p-24 flex flex-col lg:flex-row items-center justify-between gap-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[100px] -mr-48 -mt-48"></div>
          
          <div className="lg:w-1/2 relative z-10">
            <p className="text-[10px] font-bold text-purple-300 uppercase tracking-[0.5em] mb-6">Manifesto</p>
            <h2 className="text-5xl font-display font-bold text-white mb-6 leading-tight">Elevate Your Lifestyle</h2>
            <p className="text-xl text-white/60 font-medium leading-relaxed max-w-lg">
              Join our architectural collective and be the first to experience our seasonal drops and curated editorial content.
            </p>
          </div>
          
          <div className="lg:w-1/2 w-full relative z-10">
            <form className="flex flex-col sm:flex-row gap-4 p-2 glass-panel border-white/10 rounded-3xl">
              <input 
                type="email" 
                placeholder="Email address" 
                className="flex-grow bg-transparent border-none rounded-2xl px-6 py-4 text-white placeholder:text-white/30 outline-none text-sm font-medium"
                required
              />
              <button type="submit" className="bg-white text-[#0f172a] px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/90 transition-all active:scale-95">
                Subscribe
              </button>
            </form>
            <p className="text-[9px] text-white/30 mt-6 text-center lg:text-left uppercase tracking-[0.2em] font-medium font-sans">
              *By subscribing, you agree to our <span className="text-white/50 cursor-pointer">Terms & Conditions</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
