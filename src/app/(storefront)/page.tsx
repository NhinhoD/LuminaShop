import Link from "next/link";
import { makeProductRepository } from "@/infrastructure/supabase/container";
import { ROUTES } from "@/presentation/constants";
import { formatCurrency } from "@/lib/utils";

export default async function HomePage() {
  const productRepository = await makeProductRepository();
  const { products: featuredProducts } = await productRepository.findAll({ limit: 4 });

  return (
    <main className="flex-grow bg-white">
      {/* Hero Section */}
      <section className="max-w-[1440px] mx-auto px-8 md:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[720px]">
          
          {/* Main Feature */}
          <div className="lg:col-span-8 relative rounded-lg overflow-hidden group bg-[#0b1c30] min-h-[400px]">
            <img 
              alt="SS24 Collection" 
              className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuABPQZDdL10rfSPF6U6Zc_69c9jeDKoUTIHI7buYyX2DcnG-lucxXtErY1w-JDfT9g01dJd9U7oAhnqAFlXj8Nk2QnGyEIwuaFnis70TLOvr2RPGt-eDb9uIZfP5RUH_JJrutQyuVI04huaYNkVTZZiCs8HsIOYxoFRykirOaUaUEGObUyksNxQBPuUgWSt0XdwJJ_UXmkL0_mVL_LF8ZHdwSqA92N1AW7Flr3I7uiEog7WQfTh9F_KLdGN8uVnjy0kyzZJbNH-x5vs"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30]/90 via-transparent to-transparent"></div>
            
            <div className="absolute inset-0 flex flex-col justify-end p-10 md:p-16">
              <div className="max-w-[480px]">
                <span className="inline-block px-3 py-1 bg-slate-200/90 text-slate-900 font-bold text-[11px] rounded-full mb-6 uppercase tracking-wider">
                  SS24 Collection
                </span>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
                  The Essence of <br /> Modernity.
                </h1>
                <p className="text-base md:text-lg text-white/80 mb-10 leading-relaxed">
                  Discover our new line of essential pieces designed for effortless elegance and everyday versatility.
                </p>
                <Link 
                  href={ROUTES.SHOP}
                  className="inline-flex items-center justify-center gap-2 bg-white text-slate-950 font-bold px-8 py-4 min-w-[220px] rounded-sm hover:bg-slate-100 transition-colors shadow-lg group text-sm"
                >
                  Shop the Collection
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Side Tiles */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Top Tile */}
            <div className="flex-1 relative rounded-lg overflow-hidden group min-h-[300px]">
              <img 
                alt="Curated Spaces" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9lX2gzDPKeR4HJbxBzHYjqA2rLpDSFH1bHdgzsS62F9hKZur5BnFIZqwdeb7J4OBTnizzwYZeC619QeI3GMbw4wpI1g7fmUdJOl8IFuZls2DKdlPaxugTNO8F91LfpkgqwiS1imRnYm2Qi9DlOgFdUxB-UpTDNKbMB8Fm7z1qJ4sz6yCVwcDh5XS75jHt0clUE9ZXIcUk7hWlEb81pZvFDlz8iZH4Vf8l1fElPL3NVV0my-oSMyvrox6SSeBNMJCTyAMfNwjpoeuE"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <h2 className="text-xl font-bold text-white mb-1">Curated Spaces</h2>
                <Link className="text-[11px] font-bold text-white/80 underline underline-offset-4 hover:text-white transition-colors tracking-widest uppercase" href={ROUTES.SHOP}>EXPLORE HOME</Link>
              </div>
            </div>

            {/* Bottom Tile */}
            <div className="flex-1 relative rounded-lg overflow-hidden group bg-[#1a2533] min-h-[300px]">
              <img 
                alt="Finer Details" 
                className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9D07EJuWhQR9_79bZ5iID2tjETxOwPcAMPLmx58e5qVCX9YFhUW5qLm4qm4wCzJVqekyXchHjmWFzqKhezlUe1rohLO2K8D5u_5gf_pDUM_dVc7dZy_oNVue9jA_tyz_0x3FbisA2S0PDcrxEjAVGFnojwxN2GM8QjBFDhEzxE8TxsLi3k60fUmkZvBfDj3VwTGedlJ_-44AMu8osxNGA0ArrJ5W9uo0ijzLcYLALUhq1KbvBg_dSnx9H7QMiqFPxbveUcfrsHsbO"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <h2 className="text-xl font-bold text-white mb-1">Finer Details</h2>
                <Link className="text-[11px] font-bold text-white/80 underline underline-offset-4 hover:text-white transition-colors tracking-widest uppercase" href={`${ROUTES.SHOP}?category=accessories`}>SHOP ACCESSORIES</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="max-w-[1440px] mx-auto px-8 md:px-12 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Shop by Category</h2>
          <Link className="text-xs font-bold text-slate-900 flex items-center gap-2 hover:underline uppercase tracking-wider" href={ROUTES.SHOP}>
            View All <span className="material-symbols-outlined text-[16px]">east</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Apparel", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3h50e_Gc3j8AajRynQ3ZC3oCbydv-QcWdKlGvJ0kqFSTVDOtvwja3XLuQa857kaPesmtaFlSnRViidGNaW16gW3c79C4jO9K5VXk5gWeHX5jrTOUXEzFfZ8UOGlhki-DsTUOW7qno1Hm57Iet8-JGz8vwEqry2QqU0cA0-osb8-8LbAk-881eiGALYa3c_hsZA806_244FDDihkg_m-2Buh82sJ1Z8edxXeSIUDY__0ZfQitsSq04ZtiXVMMllm7tYQ6rrmwnUvA6" },
            { name: "Footwear", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_6HxL1oBR2zSF2WkQp5wJ6zHR451G2yo2UgijYUWKpakwwn_Ru94UGff9uTEjIiSvENc1FuVrH21hTKXo9WHfsU5liw6iu7lnocRjTOAq4A3v4m9WflWbHnkz-wa4bEOJCqrAvA7ooTwIapF_41V7gDhMX91AkhMC9fXmhFTGMfcYJ-FQpB77E82xhslRer4otxWQ-dmwiXA3nmg7Bq_zbmHMRPxDZPd33PXjxl9OTkTrmSTxATYu2XqDc9V9VZnM-7rSErq5fKvQ" },
            { name: "Home", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQOrIVaEVxTCAH-ckbH7VzfUzzm5lzUDDDF185sa102041EZWKOrG4CHcsWPIstUY0m7-ofsOIjB8svntxoyPwI0rGm__YLUw13N5_fucuF9SLe2R-DMI8KRNvYdce8pr36jJs1cM-z7gLt5OOw2rUKSmbylAUdiP4lxT5CG0zIlJYZBTrVpPHx7j5U1yPAnkMoK0ky2v_E84V2BJ0Bk0nt-qgvFN5KVo52sLmdVqCLoMl367ukFoUwE6Pu8IC8211Fyzt49NMdM88" }
          ].map((cat) => (
            <Link key={cat.name} href={`${ROUTES.SHOP}?category=${cat.name.toLowerCase()}`} className="group relative bg-white border border-slate-100 rounded-lg p-8 flex flex-col items-center justify-between hover:shadow-lg transition-all min-h-[400px]">
              <div className="w-full flex-1 relative flex items-center justify-center">
                <img alt={cat.name} className="max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-105" src={cat.img} />
              </div>
              <div className="w-full flex justify-between items-center pt-6 border-t border-slate-50">
                <span className="text-base font-bold text-slate-900">{cat.name}</span>
                <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-900 transition-colors">east</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-[1440px] mx-auto px-8 md:px-12 py-16 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-12">Featured Products</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.slice(0, 4).map((product) => (
            <Link key={product.id} href={`${ROUTES.PRODUCT}/${product.id}`} className="group text-left flex flex-col">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-50 mb-4">
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
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-base mb-1 truncate">{product.title}</h3>
                <p className="text-slate-500 text-[10px] mb-2 uppercase tracking-widest font-semibold">Premium Collection</p>
                <p className="font-bold text-slate-900 text-sm">{formatCurrency(product.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="max-w-[1440px] mx-auto px-8 md:px-12 pb-20">
        <div className="bg-[#e2edff] rounded-lg p-12 md:p-20 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-xl text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Join the Insider List</h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Subscribe to receive early access to new collections, exclusive editorial content, and 10% off your first order.
            </p>
          </div>
          <div className="w-full lg:w-auto flex-1 max-w-md">
            <form className="flex gap-3 mb-3">
              <input 
                className="flex-grow bg-white border-none rounded-sm px-6 py-4 text-slate-900 placeholder:text-slate-400 outline-none shadow-sm text-sm" 
                placeholder="Email address" 
                type="email" 
              />
              <button className="bg-black text-white font-bold px-8 py-4 rounded-sm hover:bg-slate-800 transition-colors text-xs uppercase tracking-widest">
                Subscribe
              </button>
            </form>
            <p className="text-[10px] text-slate-500 text-center lg:text-left font-medium">
              By subscribing, you agree to our Terms of Service & Privacy Policy.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
