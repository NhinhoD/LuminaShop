import Link from "next/link";
import { makeProductRepository } from "@/infrastructure/supabase/container";
import { ROUTES } from "@/presentation/constants";
import QuickAddButton from "@/presentation/components/product/QuickAddButton";
import { Product } from "@/domain/entities/Product";

export default async function ShopPage() {
  const productRepository = await makeProductRepository();
  const { products } = await productRepository.findAll();

  return (
    <main className="flex-grow bg-white pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-8 md:px-12">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-slate-100 pb-8">
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              <Link href={ROUTES.HOME} className="hover:text-slate-900 transition-colors">HOME</Link>
              <span>/</span>
              <span className="text-slate-900">SHOP ALL</span>
            </nav>
            <h1 className="text-4xl font-bold text-slate-950 mb-2">Our Collection</h1>
            <p className="text-slate-500 text-sm">Discover pieces designed for modern life.</p>
          </div>
          
          <div className="flex items-center gap-6 mt-6 md:mt-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Sort By:</span>
            <select className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer">
              <option>Newest Arrivals</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Most Popular</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Filters Sidebar */}
          <aside className="lg:col-span-3 space-y-10">
            <div>
              <h3 className="text-[11px] font-bold text-slate-950 uppercase tracking-[0.2em] mb-6">Categories</h3>
              <ul className="space-y-4">
                {["All Pieces", "Outerwear", "Knitwear", "Accessories", "Home"].map((cat) => (
                  <li key={cat}>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-slate-900 focus:ring-slate-900" />
                      <span className="text-sm text-slate-600 group-hover:text-slate-950 transition-colors">{cat}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-bold text-slate-950 uppercase tracking-[0.2em] mb-6">Price Range</h3>
              <div className="px-2">
                <input type="range" className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-950" />
                <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-500 uppercase">
                  <span>$0</span>
                  <span>$1,000+</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-bold text-slate-950 uppercase tracking-[0.2em] mb-6">Material</h3>
              <div className="flex flex-wrap gap-2">
                {["Organic Cotton", "Merino Wool", "Recycled Nylon", "Silk"].map((mat) => (
                  <button key={mat} className="px-3 py-1.5 border border-slate-100 rounded-full text-[10px] font-bold text-slate-500 hover:border-slate-900 hover:text-slate-900 transition-all uppercase tracking-wider">
                    {mat}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-9">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
              {products.map((product: Product) => (
                <Link key={product.id} href={`${ROUTES.PRODUCT}/${product.id}`} className="group flex flex-col">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-slate-50 mb-6">
                    {product.imageUrl ? (
                      <img 
                        alt={product.title} 
                        className="w-full h-full object-cover mix-blend-multiply opacity-90 transition-transform duration-700 group-hover:scale-105" 
                        src={product.imageUrl} 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 text-slate-900 text-[9px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
                        New In
                      </span>
                    </div>
                    <QuickAddButton 
                      product={{
                        id: product.id,
                        productId: product.id,
                        title: product.title,
                        price: Number(product.price),
                        imageUrl: product.imageUrl || undefined,
                        quantity: 1
                      }} 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-[15px] group-hover:text-[#0051d5] transition-colors">{product.title}</h3>
                    <p className="text-slate-500 text-[11px] uppercase tracking-widest font-semibold">Premium Collection</p>
                    <p className="font-bold text-slate-900 text-sm mt-2">${product.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Placeholder */}
            <div className="mt-20 pt-10 border-t border-slate-100 flex justify-center gap-2">
              <button className="w-10 h-10 rounded-full border border-slate-900 bg-slate-900 text-white font-bold text-xs">1</button>
              <button className="w-10 h-10 rounded-full border border-slate-100 text-slate-500 font-bold text-xs hover:border-slate-900 hover:text-slate-900 transition-colors">2</button>
              <button className="w-10 h-10 rounded-full border border-slate-100 text-slate-500 font-bold text-xs hover:border-slate-900 hover:text-slate-900 transition-colors">3</button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
