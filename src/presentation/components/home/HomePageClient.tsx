"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  const countdownSectionRef = useRef<HTMLElement>(null);
  const carouselContainerRef = useRef<HTMLDivElement>(null);

  // Time remaining for Limited Offer countdown
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  // Ticking countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Keep animations isolated to this client component instance using gsap.context
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
              duration: 1.2, 
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
              duration: 1.4,
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

      // 4. Parallax scroll reveal for Limited Offer countdown section
      if (countdownSectionRef.current) {
        const title = countdownSectionRef.current.querySelector(".countdown-title");
        const timerBlocks = countdownSectionRef.current.querySelectorAll(".timer-block");
        
        if (title && timerBlocks.length > 0) {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: countdownSectionRef.current,
              start: "top 75%",
              toggleActions: "play none none none"
            }
          });
          
          tl.fromTo(title, 
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
          ).fromTo(timerBlocks,
            { opacity: 0, scale: 0.9, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.5)" },
            "-=0.6"
          );
        }
      }

      // 5. Lookbook timeline horizontal carousel entry animation
      if (carouselContainerRef.current) {
        const timelineEntries = carouselContainerRef.current.querySelectorAll(".timeline-card");
        if (timelineEntries.length > 0) {
          gsap.fromTo(timelineEntries,
            { opacity: 0, x: 50 },
            {
              opacity: 1,
              x: 0,
              duration: 1.2,
              stagger: 0.15,
              ease: "power3.out",
              scrollTrigger: {
                trigger: carouselContainerRef.current,
                start: "top 85%",
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

  const lookbookTimeline = [
    { 
      year: "1998", 
      title: "Minimalist Genesis", 
      description: "The birth of architectural structure in modern drapery.", 
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeThSi3q-n2c8uuViyam1b2_2pJAgJlHuNIIgjEmCyPwG5XpcajjcWm-5FGiLliZNL_gshSTBtxWDzDKPNHOva9Ph-GJeDXnpdDn7tQSgKwBDZadnCeuQxqS09E-Wf4BPt-ftlB9QdobtniTQCyxavZMXrid606Nl3YZfJEelerGPzGLHIhq8f4WofWGLm5fwm8B9_dnUq3Tb-Io-NFovt-sTT34MmJX6iApgvJJ9BzK8llQShaPrkAUlJ8_1XoA8zalMw3Qr5ngq6" 
    },
    { 
      year: "2012", 
      title: "Monochrome Obsidian", 
      description: "Exploring raw materials and textured volcanic finishes.", 
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAd6_odzYx0FDTRx4M7o1lMezeCU3fa461FqM3CpA4vMYlqTrfE7H5dBIHyLtWfj0UanxhbQSUh9Xt1-Z7kjMu-NRUPH42dy2__X6mSew9u5PxMMftl4l2vGqK7xUnCJIyLAFvLNKbeDWPxsNGuZNKz6IN1gFzXzu4NjSCZfOpJWAfW4xCwJJ2UMMJPOmbks--wy_O2eHF-fLG4Msf7lmyMKiUlOFsfhwszbCnZrYYQ49qvXlc-hvLV9IXkYJ3nkppraGNbP7qjp4Iy" 
    },
    { 
      year: "2020", 
      title: "Bespoke Void", 
      description: "Embracing negative space as a luxury styling standard.", 
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8t5jKG34C0faRzyXVogbJTrxy5Dt_DDDfuG2g3axitxQDfDWrAEH0MIXSR4MMWNpzjdLPaKA_ZemoKYMtcpDzbAk1Azqp926C_OYGwHdasubtwO13xr0oaSa4Zc0ulricAqnesCnKWrDFfcI1oABlF9x0-GjqO2KRJIcBacoK3To_Ig6Tsh-35V_Z5TYqlxbswfOwKWzpjTQsqbzf_ANowjnQe79_YG1-ZwtSK5rFGhoNnMWzS_O22jvh4_nPe8BL1pQjbv1nA-sx" 
    },
    { 
      year: "2026", 
      title: "The Modern Édition", 
      description: "Lumina's definitive contemporary design release.", 
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBpwGh8511sfWTVEwz8_bMYjr2UvHxxcO3dGctXQovDDsz_Dei6SkscusGq51JffTE6UF4lPTnJvVuFto4zAXwH5FdzLFIag4cnPCd1j6v1eWwq76mgSLQTaM_QRocQmAtSfhepzLsP6xkBzmrpHtrI2xzuZECHBwcNgjUYt_uD5QqQOMsnxFISP6mD8AxvqmBgsMIXChjITpfQS0UpS52aGsFGz2oYBgvbW-HaF-SDt-Jpn0woD729drMlHhXxB_Ufo1vX7t9JJNdZ" 
    }
  ];

  return (
    <div ref={containerRef} className="flex-grow bg-[#F8FAFC] font-manrope overflow-hidden">
      
      {/* 1. Multi-layered Parallax Hero Section */}
      <section className="relative w-full h-[85vh] md:h-[95vh] flex items-center justify-center overflow-hidden bg-slate-950">
        {/* Layer 1: Parallax Background Gradient */}
        <div 
          ref={heroBgRef}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.45)_0%,rgba(15,23,42,0.95)_100%)] z-10" 
        />
        
        {/* Layer 2: Parallax Image */}
        <img 
          ref={heroImgRef}
          alt="Lumina Luxury Collection" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 z-0 scale-105" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuABPQZDdL10rfSPF6U6Zc_69c9jeDKoUTIHI7buYyX2DcnG-lucxXtErY1w-JDfT9g01dJd9U7oAhnqAFlXj8Nk2QnGyEIwuaFnis70TLOvr2RPGt-eDb9uIZfP5RUH_JJrutQyuVI04huaYNkVTZZiCs8HsIOYxoFRykirOaUaUEGObUyksNxQBPuUgWSt0XdwJJ_UXmkL0_mVL_LF8ZHdwSqA92N1AW7Flr3I7uiEog7WQfTh9F_KLdGN8uVnjy0kyzZJbNH-x5vs"
        />
        
        {/* Subtle Vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />

        {/* Layer 3: Foreground Text Content */}
        <div 
          ref={heroContentRef}
          className="relative max-w-[1280px] w-full mx-auto px-gutter z-20 flex flex-col justify-center items-start h-full"
        >
          <div className="max-w-2xl text-left">
            <span className="inline-block font-label-caps text-[10px] text-accent-gold uppercase tracking-[0.3em] mb-6">
              SS26 MODERN ÉDITION
            </span>
            <h1 className="text-5xl md:text-8xl font-bold font-playfair text-white mb-8 leading-[1.1] tracking-tight">
              The Art of <br /> <span className="italic font-normal">Silence.</span>
            </h1>
            <p className="text-base md:text-lg text-slate-350 mb-12 leading-relaxed max-w-md font-light text-slate-300">
              Curated minimal statements made for the discerning eye. No borders, no noise—only pure form and structural design.
            </p>
            <Link 
              href={ROUTES.SHOP}
              className="inline-flex items-center justify-center gap-4 bg-[#FFFFFF] text-slate-950 font-button text-button px-10 py-6 hover:bg-[#F1F5F9] transition-all duration-300 shadow-xl shadow-white/5 uppercase tracking-widest active:scale-98"
            >
              <span>View Collection</span>
              <span className="material-symbols-outlined text-[16px]">east</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Shop by Category (Asymmetric Masonry Category Grid) */}
      <section ref={categoriesRef} className="max-w-[1280px] mx-auto px-gutter py-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-6">
          <div>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-[0.2em]">Bespoke Layouts</span>
            <h2 className="text-3xl md:text-5xl font-playfair font-bold text-slate-950 mt-3">Selected Galleries</h2>
          </div>
          <Link className="font-button text-button text-slate-950 flex items-center gap-3 hover:opacity-70 transition-opacity uppercase tracking-widest" href={ROUTES.SHOP}>
            Explore All <span className="material-symbols-outlined text-[16px]">east</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              name: "Apparel", 
              count: "32 pieces", 
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3h50e_Gc3j8AajRynQ3ZC3oCbydv-QcWdKlGvJ0kqFSTVDOtvwja3XLuQa857kaPesmtaFlSnRViidGNaW16gW3c79C4jO9K5VXk5gWeHX5jrTOUXEzFfZ8UOGlhki-DsTUOW7qno1Hm57Iet8-JGz8vwEqry2QqU0cA0-osb8-8LbAk-881eiGALYa3c_hsZA806_244FDDihkg_m-2Buh82sJ1Z8edxXeSIUDY__0ZfQitsSq04ZtiXVMMllm7tYQ6rrmwnUvA6",
              heightClass: "min-h-[460px]"
            },
            { 
              name: "Footwear", 
              count: "18 pieces", 
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_6HxL1oBR2zSF2WkQp5wJ6zHR451G2yo2UgijYUWKpakwwn_Ru94UGff9uTEjIiSvENc1FuVrH21hTKXo9WHfsU5liw6iu7lnocRjTOAq4A3v4m9WflWbHnkz-wa4bEOJCqrAvA7ooTwIapF_41V7gDhMX91AkhMC9fXmhFTGMfcYJ-FQpB77E82xhslRer4otxWQ-dmwiXA3nmg7Bq_zbmHMRPxDZPd33PXjxl9OTkTrmSTxATYu2XqDc9V9VZnM-7rSErq5fKvQ",
              heightClass: "min-h-[520px] md:translate-y-8"
            },
            { 
              name: "Home Gallery", 
              count: "24 pieces", 
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQOrIVaEVxTCAH-ckbH7VzfUzzm5lzUDDDF185sa102041EZWKOrG4CHcsWPIstUY0m7-ofsOIjB8svntxoyPwI0rGm__YLUw13N5_fucuF9SLe2R-DMI8KRNvYdce8pr36jJs1cM-z7gLt5OOw2rUKSmbylAUdiP4lxT5CG0zIlJYZBTrVpPHx7j5U1yPAnkMoK0ky2v_E84V2BJ0Bk0nt-qgvFN5KVo52sLmdVqCLoMl367ukFoUwE6Pu8IC8211Fyzt49NMdM88",
              heightClass: "min-h-[460px]"
            }
          ].map((cat) => (
            <Link 
              key={cat.name} 
              href={`${ROUTES.SHOP}?category=${cat.name.toLowerCase()}`} 
              className={`category-card group relative bg-white rounded-none p-10 flex flex-col justify-between transition-all duration-700 soft-elevation hover:scale-[1.02] ${cat.heightClass}`}
            >
              <div className="w-full text-left">
                <span className="font-label-caps text-[10px] text-slate-400 uppercase tracking-widest">{cat.count}</span>
                <h3 className="text-2xl font-playfair font-bold text-slate-900 mt-2">{cat.name}</h3>
              </div>
              <div className="w-full flex-1 relative flex items-center justify-center p-6 my-6 overflow-hidden">
                <img 
                  alt={cat.name} 
                  className="max-h-[240px] max-w-full object-contain grayscale-[20%] transition-transform duration-[1000ms] group-hover:scale-105 group-hover:grayscale-0" 
                  src={cat.img} 
                />
              </div>
              <div className="w-full flex justify-end items-center pt-6">
                <span className="w-12 h-12 bg-slate-50 group-hover:bg-slate-950 flex items-center justify-center text-slate-400 group-hover:text-white transition-all duration-500">
                  <span className="material-symbols-outlined text-[18px]">east</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Timed "Limited Offer" Section (Countdown banner) */}
      <section 
        ref={countdownSectionRef} 
        className="relative bg-slate-950 py-32 text-white overflow-hidden my-16"
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(246,166,33,0.15)_0%,transparent_70%)] pointer-events-none"></div>
        <div className="max-w-[1280px] w-full mx-auto px-gutter flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="max-w-xl text-center lg:text-left">
            <span className="font-label-caps text-[10px] text-accent-gold uppercase tracking-[0.25em] mb-4 block countdown-title">
              Limited Archive Release
            </span>
            <h2 className="text-3xl md:text-5xl font-playfair font-bold mb-6 leading-tight">
              Curated Obsidian Set <br /> <span className="italic font-normal">Special Premium pricing.</span>
            </h2>
            <p className="text-slate-400 font-light leading-relaxed max-w-md">
              A carefully matched selection of three bespoke home elements. Only available for a highly constrained period of time.
            </p>
            <div className="mt-8">
              <Link 
                href={ROUTES.SHOP} 
                className="inline-flex items-center gap-3 text-white font-button text-button uppercase tracking-widest border-b border-white/20 pb-2 hover:border-accent-gold transition-colors"
              >
                Claim This Set <span className="material-symbols-outlined text-[16px]">east</span>
              </Link>
            </div>
          </div>
          
          <div className="flex gap-4 sm:gap-8 items-center justify-center">
            {[
              { label: "Hours", value: timeLeft.hours.toString().padStart(2, '0') },
              { label: "Minutes", value: timeLeft.minutes.toString().padStart(2, '0') },
              { label: "Seconds", value: timeLeft.seconds.toString().padStart(2, '0') }
            ].map((block) => (
              <div key={block.label} className="timer-block flex flex-col items-center justify-center w-28 h-28 sm:w-36 sm:h-36 bg-white/5 backdrop-blur-md border border-white/10 relative">
                <span className="text-4xl sm:text-5xl font-bold font-playfair text-accent-gold mb-1">{block.value}</span>
                <span className="font-label-caps text-[9px] text-slate-400 uppercase tracking-widest">{block.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Lookbook Timeline Horizontal Product Timeline Carousel */}
      <section className="py-32 bg-[#F8FAFC]">
        <div className="max-w-[1280px] mx-auto px-gutter">
          <div className="mb-20 text-center lg:text-left flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
            <div>
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-[0.25em]">Design Evolution</span>
              <h2 className="text-3xl md:text-5xl font-playfair font-bold text-slate-950 mt-3">The Lookbook Timeline</h2>
            </div>
            <p className="text-slate-400 font-light text-sm max-w-sm">
              Tracing the signature silhouette transitions and material milestones of LuminaÉdition.
            </p>
          </div>
          
          <div ref={carouselContainerRef} className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {lookbookTimeline.map((item, idx) => (
              <div 
                key={item.year}
                className="timeline-card bg-white p-8 soft-elevation flex flex-col justify-between transition-all duration-500 hover:scale-[1.02] min-h-[460px] relative"
              >
                <div>
                  <div className="flex justify-between items-baseline mb-6 border-b border-slate-50 pb-4">
                    <span className="text-4xl font-playfair font-bold text-slate-950">{item.year}</span>
                    <span className="font-label-caps text-[9px] text-accent-gold uppercase tracking-wider">Phase {idx + 1}</span>
                  </div>
                  <div className="w-full aspect-[4/3] bg-slate-50 overflow-hidden mb-6">
                    <img 
                      alt={item.title} 
                      className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 hover:scale-105 transition-all duration-700" 
                      src={item.image} 
                    />
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2 leading-tight">{item.title}</h3>
                  <p className="text-xs text-on-surface-variant font-light leading-relaxed">{item.description}</p>
                </div>
                
                <div className="mt-8 pt-4 border-t border-slate-50 flex justify-between items-center text-slate-400">
                  <span className="font-label-caps text-[10px] tracking-widest uppercase">Lumina Archives</span>
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Featured Products Section - Asymmetric Grid */}
      <section ref={gridSectionRef} className="bg-white py-32 border-t border-slate-50">
        <div className="max-w-[1280px] mx-auto px-gutter">
          
          <div className="text-center mb-24">
            <span className="font-label-caps text-[10px] text-slate-400 uppercase tracking-[0.25em]">Curated Spotlight</span>
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-slate-950 mt-3">Featured Pieces</h2>
            <p className="text-slate-500 text-sm mt-4 font-light max-w-sm mx-auto">Distinct items crafted with timeless, architectural precision.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.slice(0, 4).map((product, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <Link 
                  key={product.id} 
                  href={`${ROUTES.PRODUCT}/${product.id}`} 
                  className={`product-card group text-left flex flex-col transition-transform duration-750 ${
                    isEven ? "mt-0" : "lg:mt-12"
                  }`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-white mb-6 soft-elevation transition-all duration-700 group-hover:scale-[1.01] rounded-none">
                    {product.imageUrl ? (
                      <img 
                        alt={product.title} 
                        className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-transform duration-1000 group-hover:scale-105" 
                        src={product.imageUrl} 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-slate-950 text-white text-[9px] font-label-caps px-3 py-1.5 uppercase tracking-widest">
                        New In
                      </span>
                    </div>
                  </div>
                  <div className="px-2">
                    <h3 className="font-bold text-slate-900 text-base mb-1 truncate group-hover:text-slate-950 transition-colors">{product.title}</h3>
                    <p className="text-slate-400 text-[10px] mb-3 uppercase tracking-widest font-bold font-manrope">Premium Collection</p>
                    <p className="font-bold text-slate-950 text-[15px] font-manrope">{formatCurrency(product.price)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Newsletter Section */}
      <section className="max-w-[1280px] mx-auto px-gutter py-32">
        <div className="bg-white rounded-none p-12 md:p-24 flex flex-col lg:flex-row items-center justify-between gap-16 soft-elevation">
          <div className="max-w-xl text-center lg:text-left">
            <span className="font-label-caps text-[10px] text-slate-400 uppercase tracking-[0.25em] mb-4 block">Newsletter</span>
            <h2 className="text-3xl md:text-5xl font-playfair font-bold text-slate-950 mb-6 leading-tight">Join the Studio List</h2>
            <p className="text-sm md:text-base text-slate-600 leading-relaxed font-light">
              Subscribe to receive early access to new collections, exclusive lookbooks, and design stories from our studio.
            </p>
          </div>
          <div className="w-full lg:w-auto flex-1 max-w-md">
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 mb-4">
              <input 
                className="flex-grow bg-[#F1F5F9] border-none px-6 py-5 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-slate-950/20 transition-all text-sm font-medium" 
                placeholder="Email address" 
                type="email" 
              />
              <button className="bg-slate-950 text-white font-button text-button px-8 py-5 hover:bg-slate-900 active:scale-98 transition-all duration-300 uppercase tracking-widest cursor-pointer shadow-lg">
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
