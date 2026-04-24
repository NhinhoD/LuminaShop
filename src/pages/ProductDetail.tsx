import { useState } from 'react';
import { Star, CheckCircle, ChevronRight, ShoppingBag, Plus, Minus, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function ProductDetail() {
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Navy');

  const product = {
    name: 'The Architect Overcoat',
    price: 695.0,
    rating: 4.8,
    reviews: 124,
    description: 'Meticulously tailored from a heavyweight Italian wool blend, The Architect Overcoat offers a structured, minimalist silhouette designed for urban versatility and enduring warmth.',
    colors: [
      { name: 'Navy', hex: '#1A2530' },
      { name: 'Charcoal', hex: '#4A4A4A' },
      { name: 'Camel', hex: '#D2B48C' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1544022613-e87ce7526ed1?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1974&auto=format&fit=crop',
    ]
  };

  return (
    <div className="pt-20">
      {/* Breadcrumbs */}
      <div className="max-w-[1280px] mx-auto px-8 md:px-12 py-6">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop" className="hover:text-black transition-colors">Men's Outerwear</Link>
          <ChevronRight size={14} />
          <span className="text-black">The Architect Overcoat</span>
        </div>
      </div>

      <section className="max-w-[1280px] mx-auto px-8 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
        {/* Left: Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="w-full aspect-[4/5] bg-slate-50 rounded-xl overflow-hidden relative group shadow-sm">
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
            {product.images.map((img, i) => (
              <button key={i} className={`w-24 aspect-square flex-shrink-0 rounded-lg overflow-hidden border-2 ${i === 0 ? 'border-black' : 'border-transparent'}`}>
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
            <div className="w-24 aspect-square flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-200 transition-colors">
              <span className="font-bold text-[10px] uppercase">Play Video</span>
            </div>
          </div>
        </div>

        {/* Right: Info */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-[10px] font-bold uppercase tracking-widest">New Season</span>
            <span className="flex items-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              <CheckCircle size={14} className="mr-1 text-emerald-600" /> In Stock
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tighter mb-2">{product.name}</h1>
          <p className="text-3xl font-bold mb-6">${product.price.toFixed(2)}</p>

          <div className="flex items-center gap-2 mb-8">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill={i < 4 ? 'currentColor' : 'none'} stroke={i < 4 ? 'none' : 'currentColor'} />
              ))}
            </div>
            <span className="text-sm font-semibold text-slate-500 hover:text-black cursor-pointer underline underline-offset-4">{product.rating} ({product.reviews} Reviews)</span>
          </div>

          <p className="text-slate-500 leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="w-full h-px bg-slate-100 mb-8"></div>

          {/* Color */}
          <div className="mb-6">
            <span className="block text-xs font-bold uppercase tracking-widest mb-3">Color: <span className="font-medium normal-case text-slate-500">{selectedColor}</span></span>
            <div className="flex gap-4">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  style={{ backgroundColor: c.hex }}
                  className={`w-10 h-10 rounded-full border-2 ${selectedColor === c.name ? 'border-black ring-2 ring-slate-200' : 'border-transparent hover:scale-110 transition-transform'}`}
                />
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-widest">Size</span>
              <button className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-black">Size Guide</button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`py-3 rounded-sm text-xs font-bold transition-all border ${selectedSize === s ? 'border-black bg-black text-white' : 'border-slate-200 text-slate-500 hover:border-black hover:text-black'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 mb-12">
            <button className="w-full bg-black text-white py-4 rounded-sm font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-colors shadow-md">
              <ShoppingBag size={20} />
              Add to Cart
            </button>
            <button className="w-full border border-black text-black py-4 rounded-sm font-bold hover:bg-slate-50 transition-colors">
              Buy it Now
            </button>
          </div>

          {/* Accordions */}
          <div className="divide-y divide-slate-100 border-y border-slate-100">
            {['Product Details', 'Material & Care', 'Shipping & Returns'].map((item) => (
              <button key={item} className="w-full py-4 flex justify-between items-center group">
                <span className="font-bold text-slate-900 group-hover:opacity-70 transition-opacity">{item}</span>
                <Plus size={20} className="text-slate-400 group-hover:text-black" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Complete the Look */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-[1280px] mx-auto px-8 md:px-12">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-4xl font-extrabold tracking-tighter">Complete the Look</h2>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center hover:bg-white transition-colors"><ArrowLeft size={18} /></button>
              <button className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center hover:bg-white transition-colors"><ArrowRight size={18} /></button>
            </div>
          </div>
          <div className="flex gap-8 overflow-x-auto no-scrollbar pb-4">
            {[
              { name: 'Essential Poplin Shirt', price: 125, img: 'https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?q=80&w=1974&auto=format&fit=crop' },
              { name: 'Tailored Wool Trousers', price: 245, img: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1974&auto=format&fit=crop' },
              { name: 'City Leather Sneaker', price: 195, img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop' },
              { name: 'Classic Bifold Wallet', price: 85, img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1974&auto=format&fit=crop' },
            ].map((item, idx) => (
              <div key={idx} className="min-w-[280px] group cursor-pointer">
                <div className="aspect-[3/4] bg-white rounded-xl overflow-hidden mb-4 relative">
                  <img src={item.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                  <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-full bg-white/90 backdrop-blur py-2 rounded font-bold text-xs shadow-sm">Quick Add</button>
                  </div>
                </div>
                <h3 className="font-bold truncate">{item.name}</h3>
                <p className="text-slate-500 text-sm mt-1">${item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
