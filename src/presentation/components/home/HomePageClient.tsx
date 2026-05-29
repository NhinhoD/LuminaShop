"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ROUTES } from "@/presentation/constants";
import { formatCurrency } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Product } from "@/domain/entities/Product";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HomePageClientProps {
  readonly featuredProducts: readonly Product[];
}

export default function HomePageClient({ featuredProducts }: HomePageClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const gridSectionRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Keep animations isolated to this client component instances using gsap.context
    const ctx = gsap.context(() => {
      
      // 1. Multi-layered Parallax Hero scroll animation
      if (heroBgRef.current && heroImgRef.current && heroContentRef.current) {
        gsap.to(heroBgRef.current, {
          yPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: heroBgRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        });

        gsap.to(heroImgRef.current, {
          yPercent: -10,
          ease: "none",
          scrollTrigger: {
            trigger: heroImgRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        });

        gsap.to(heroContentRef.current, {
          yPercent: -15,
          opacity: 0.8,
          ease: "none",
          scrollTrigger: {
            trigger: heroContentRef.current,
            start: "top 20%",
            end: "bottom top",
            scrub: true
          }
        });
      }

      // 2. Staggered reveal for Category Cards on viewport entrance
      if (categoriesRef.current) {
        const cards = categoriesRef.current.querySelectorAll(".category-card");
        if (cards.length > 0) {
          gsap.fromTo(cards, 
            { opacity: 0, y: 50 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 1, 
              ease: "power3.out", 
              stagger: 0.15,
              scrollTrigger: {
                trigger: categoriesRef.current,
                start: "top 80%",
                toggleActions: "play none none none"
              }
            }
          );
        }
      }

      // 3. Staggered reveal for Masonry Product Cards on viewport entrance
      if (gridSectionRef.current) {
        const products = gridSectionRef.current.querySelectorAll(".product-card");
        if (products.length > 0) {
          gsap.fromTo(products,
            { opacity: 0, y: 60 },
            {
              opacity: 1,
              y: 0,
              duration: 1.2,
              ease: "power4.out",
              stagger: 0.1,
              scrollTrigger: {
                trigger: gridSectionRef.current,
                start: "top 80%",
                toggleActions: "play none none none"
              }
            }
          );
        }
      }

    }, containerRef);

    return () => {
      ctx.revert(); // clean up and revert all active timelines and ScrollTriggers to prevent memory leaks
    };
  }, []);

  return (
    <div ref={containerRef} className="flex-grow bg-slate-50/20 font-manrope overflow-hidden">
      
      {/* Parallax Hero Section */}
      <section className="relative w-full h-[80vh] md:h-[90vh] flex items-center justify-center overflow-hidden bg-slate-900">
        
        {/* Layer 1: Parallax Background */}
        <div 
          ref={heroBgRef}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.6)_0%,rgba(15,23,42,1)_100%)] z-10" 
        />
        
        {/* Layer 2: Parallax Image */}
        <img 
          ref={heroImgRef}
          alt="Lumina Luxury Collection" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 z-0 scale-105" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuABPQZDdL10rfSPF6U6Zc_69c9jeDKoUTIHI7buYyX2DcnG-lucxXtErY1w-JDfT9g01dJd9U7oAhnqAFlXj8Nk2QnGyEIwuaFnis70TLOvr2RPGt-eDb9uIZfP5RUH_JJrutQyuVI04huaYNkVTZZiCs8HsIOYxoFRykirOaUaUEGObUyksNxQBPuUgWSt0XdwJJ_UXmkL0_mVL_LF8ZHdwSqA92N1AW7Flr3I7uiEog7WQfTh9F_KLdGN8uVnjy0kyzZJbNH-x5vs"
        />
        
        {/* Soft Tonal Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />

        {/* Layer 3: Parallax Content Foreground */}
        <div 
          ref={heroContentRef}
          className="relative max-w-[1440px] w-full mx-auto px-8 md:px-12 z-20 flex flex-col justify-center items-start h-full"
        >
          <div className="max-w-2xl text-left">
            <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md text-white/90 font-bold text-[10px] rounded-full mb-6 uppercase tracking-[0.2em]">
              SS24 Premium Collection
            </span>
            <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
              The Essence of <br /> Modernity
            </h1>
            <p className="text-base md:text-xl text-slate-350 mb-10 leading-relaxed max-w-lg font-light text-slate-300">
              Discover our new line of essential pieces designed for effortless elegance, clean structures, and everyday versatility.
            </p>
            <Link 
              href={ROUTES.SHOP}
              className="inline-flex items-center justify-center gap-3 bg-white text-slate-950 font-bold px-9 py-5 rounded-2xl hover:bg-slate-100 transition-all duration-300 shadow-xl shadow-white/5 active:scale-98 text-xs uppercase tracking-widest"
            >
              <span>Explore Collection</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section ref={categoriesRef} className="max-w-[1280px] mx-auto px-8 md:px-12 py-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">Bespoke Categories</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-950 mt-2">Shop by Category</h2>
          </div>
          <Link className="text-xs font-bold text-slate-950 flex items-center gap-2 hover:underline uppercase tracking-widest" href={ROUTES.SHOP}>
            View All Categories <span className="material-symbols-outlined text-[16px]">east</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Apparel", count: "32 Items", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3h50e_Gc3j8AajRynQ3ZC3oCbydv-QcWdKlGvJ0kqFSTVDOtvwja3XLuQa857kaPesmtaFlSnRViidGNaW16gW3c79C4jO9K5VXk5gWeHX5jrTOUXEzFfZ8UOGlhki-DsTUOW7qno1Hm57Iet8-JGz8vwEqry2QqU0cA0-osb8-8LbAk-881eiGALYa3c_hsZA806_244FDDihkg_m-2Buh82sJ1Z8edxXeSIUDY__0ZfQitsSq04ZtiXVMMllm7tYQ6rrmwnUvA6" },
            { name: "Footwear", count: "18 Items", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_6HxL1oBR2zSF2WkQp5wJ6zHR451G2yo2UgijYUWKpakwwn_Ru94UGff9uTEjIiSvENc1FuVrH21hTKXo9WHfsU5liw6iu7lnocRjTOAq4A3v4m9WflWbHnkz-wa4bEOJCqrAvA7ooTwIapF_41V7gDhMX91AkhMC9fXmhFTGMfcYJ-FQpB77E82xhslRer4otxWQ-dmwiXA3nmg7Bq_zbmHMRPxDZPd33PXjxl9OTkTrmSTxATYu2XqDc9V9VZnM-7rSErq5fKvQ" },
            { name: "Home", count: "24 Items", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQOrIVaEVxTCAH-ckbH7VzfUzzm5lzUDDDF185sa102041EZWKOrG4CHcsWPIstUY0m7-ofsOIjB8svntxoyPwI0rGm__YLUw13N5_fucuF9SLe2R-DMI8KRNvYdce8pr36jJs1cM-z7gLt5OOw2rUKSmbylAUdiP4lxT5CG0zIlJYZBTrVpPHx7j5U1yPAnkMoK0ky2v_E84V2BJ0Bk0nt-qgvFN5KVo52sLmdVqCLoMl367ukFoUwE6Pu8IC8211Fyzt49NMdM88" }
          ].map((cat) => (
            <Link 
              key={cat.name} 
              href={`${ROUTES.SHOP}?category=${cat.name.toLowerCase()}`} 
              className="category-card group relative bg-white border border-slate-100/50 rounded-3xl p-8 flex flex-col items-center justify-between hover:shadow-2xl hover:shadow-slate-100/80 transition-all duration-500 min-h-[440px]"
            >
              <div className="w-full text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cat.count}</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{cat.name}</h3>
              </div>
              <div className="w-full flex-1 relative flex items-center justify-center p-6 my-4">
                <img 
                  alt={cat.name} 
                  className="max-h-[220px] max-w-full object-contain transition-transform duration-700 group-hover:scale-108" 
                  src={cat.img} 
                />
              </div>
              <div className="w-full flex justify-end items-center pt-4 border-t border-slate-50">
                <span className="w-10 h-10 rounded-2xl bg-slate-50 group-hover:bg-slate-950 flex items-center justify-center text-slate-400 group-hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined text-[18px]">east</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section - Asymmetric Masonry Layout */}
      <section ref={gridSectionRef} className="bg-slate-50/40 py-24">
        <div className="max-w-[1280px] mx-auto px-8 md:px-12">
          
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">Curated Spotlight</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-950 mt-2">Featured Collection</h2>
            <p className="text-slate-500 text-sm mt-3 font-light">Distinct items crafted with timeless, architectural precision.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.slice(0, 4).map((product, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <Link 
                  key={product.id} 
                  href={`${ROUTES.PRODUCT}/${product.id}`} 
                  className={`product-card group text-left flex flex-col transition-transform duration-500 ${
                    isEven ? "mt-0" : "lg:mt-10"
                  }`}
                >
                  <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-white border border-slate-100/50 mb-5 shadow-sm group-hover:shadow-xl transition-all duration-500">
                    {product.imageUrl ? (
                      <img 
                        alt={product.title} 
                        className="w-full h-full object-cover mix-blend-multiply opacity-90 transition-transform duration-1000 group-hover:scale-106" 
                        src={product.imageUrl} 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-slate-950/95 backdrop-blur-md text-white text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                        New In
                      </span>
                    </div>
                  </div>
                  <div className="px-2">
                    <h3 className="font-bold text-slate-900 text-base mb-1 truncate group-hover:text-slate-950 transition-colors">{product.title}</h3>
                    <p className="text-slate-400 text-[10px] mb-2.5 uppercase tracking-widest font-bold">Premium Collection</p>
                    <p className="font-extrabold text-slate-950 text-[15px]">{formatCurrency(product.price)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="max-w-[1280px] mx-auto px-8 md:px-12 py-24">
        <div className="bg-[#e7eefe]/80 border border-blue-50/50 backdrop-blur-md rounded-3xl p-12 md:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-xl shadow-blue-50/20">
          <div className="max-w-xl text-center lg:text-left">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.25em] mb-4 block">Newsletter</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-950 mb-4 leading-tight">Join the Insider List</h2>
            <p className="text-sm md:text-base text-slate-600 leading-relaxed font-light">
              Subscribe to receive early access to new collections, exclusive editorial content, and 10% off your first order.
            </p>
          </div>
          <div className="w-full lg:w-auto flex-1 max-w-md">
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 mb-3">
              <input 
                className="flex-grow bg-white border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-slate-950/5 transition-all text-sm font-medium" 
                placeholder="Email address" 
                type="email" 
              />
              <button className="bg-slate-950 text-white font-bold px-8 py-4 rounded-2xl hover:bg-slate-850 active:scale-98 transition-all duration-300 text-xs uppercase tracking-widest cursor-pointer shadow-lg shadow-slate-950/10">
                Subscribe
              </button>
            </form>
            <p className="text-[10px] text-slate-500 text-center lg:text-left font-medium tracking-wide">
              By subscribing, you agree to our Terms of Service & Privacy Policy.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
