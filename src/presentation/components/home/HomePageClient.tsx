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

  // Time remaining for Chef's Special Reserve Release countdown
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

  const culinaryTimeline = [
    { 
      year: "1998", 
      title: "The Founding Bistro", 
      description: "Our humble origins as an organic farm-to-table culinary workshop.", 
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWPxuVwMnt7FM3ojOzpdCbN2gw-yxANnlguFA6fgwxUKBxBOGOioFmE6j9R86-03iiOXSb6dIzlVpudvZlvs3sqdUWVf__hyWev0JO97NIGNUSEl6rnemiUqEIST0ksfx0nhOUSUFCwtaO3xQdeOTnnhewkHBOwAb80-1dVNC_cMe-g6mGfu0cN71e5fpA4N2LWjwBAiQVHsfNRFL9QTEbgaDbRrP_O9CjPXmlZBLD8_ubtD5QeHkfpRXWJBHF2NTmesbdolwUQTRW" 
    },
    { 
      year: "2012", 
      title: "Botanical Mocktails", 
      description: "Pioneering premium low-abv elixir pairings and custom cold brews.", 
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdG_0IT2JZJx7InP8X_9_j3HQJKcj3kmGReatvVLhflnVlIjcibXMrK3wpDN371claG2928iq0yD4dXPYhiK_oPfPgLCz4Jy-m5swmFeg9yCxn_CplGYYgWF5ahcwDXE38xlhJ_Thzh0YPpZnsoNHOkIGOtlM_OkUgswWN5Pw93LDgimFA3GZEj-iR1zgrTayHBGEw09_Fkb8TC3auis0evbP_OM0s_6PcXKnG0gOfpq8YW53SUwxFVf8Q7U70kHpt2G2dsdbKDXoE" 
    },
    { 
      year: "2020", 
      title: "Michelin Star Accolade", 
      description: "Recognized globally for culinary authenticity, structural elegance, and clean flavors.", 
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5x8Mx71QUNn7HlEejoyFlcb6EOhwff_XGOlrhIWcbpYln-FE_SinD682Xkp0VpM39uxXK_JJg3gFb3feEhEKluO8bYbNV4Xl3b4uT3eEKIuu4gis0sWtcKjSouL-cXyndNQf6hCX3Lbl-opUtmZVku-tv-1Lnpuq3MLUoFaK_zdujSap-7ygNK_jlqBowJKbFy3Kb2hNcEeJqLkh5-OcXyH_s7GnFI8cY0CoivXwkhJ3Sr0oZ3FXgW3Z1Cn4_V0_VpXRB0dtJYlsg" 
    },
    { 
      year: "2026", 
      title: "Luxe Gourmet Online", 
      description: "Bringing signature epicurean dishes directly to your premium dining table.", 
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2gK9lYMIkRVi90tkoAsO6fQBrykShhvUejSIh9ruTOZvpe9IvDK__sMLZlGUP4SMrUZO_vIPuOCshfhliCPsMwvXTa9O1M2CNIejl9Y9UO1Nab5X7cZdtikWcnnX1r4JBEaXU8PEpx2FXjZ023qaBxXlEXPOc7J42N02BCN8tUJg9zSGUbtQC99AnJoDNwfr7tg4XgknyBGOy8TWyTMeIXsaniQm8WrKufX6ceb-8SonvKlQ-KjbUnQIbPmDfqxE7_SNbdkCBgyK_" 
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
          alt="Sarab Gourmet Delicacies" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 z-0 scale-105" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWPxuVwMnt7FM3ojOzpdCbN2gw-yxANnlguFA6fgwxUKBxBOGOioFmE6j9R86-03iiOXSb6dIzlVpudvZlvs3sqdUWVf__hyWev0JO97NIGNUSEl6rnemiUqEIST0ksfx0nhOUSUFCwtaO3xQdeOTnnhewkHBOwAb80-1dVNC_cMe-g6mGfu0cN71e5fpA4N2LWjwBAiQVHsfNRFL9QTEbgaDbRrP_O9CjPXmlZBLD8_ubtD5QeHkfpRXWJBHF2NTmesbdolwUQTRW"
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
              SARAB LUXE GOURMET
            </span>
            <h1 className="text-5xl md:text-8xl font-bold font-playfair text-white mb-8 leading-[1.1] tracking-tight">
              The Art of <br /> <span className="italic font-normal">Taste.</span>
            </h1>
            <p className="text-base md:text-lg text-slate-300 mb-12 leading-relaxed max-w-md font-light">
              Discover signature gourmet selections designed for the ultimate epicurean. Borderless containers, pure taste—timeless culinary art.
            </p>
            <Link 
              href={ROUTES.SHOP}
              className="inline-flex items-center justify-center gap-4 bg-[#FFFFFF] text-slate-950 font-button text-button px-10 py-6 hover:bg-[#F1F5F9] transition-all duration-300 shadow-xl shadow-white/5 uppercase tracking-widest active:scale-98"
            >
              <span>View Menu Board</span>
              <span className="material-symbols-outlined text-[16px]">east</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Shop by Category (Asymmetric Masonry Category Grid) */}
      <section ref={categoriesRef} className="max-w-[1280px] mx-auto px-gutter py-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-6">
          <div>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-[0.2em]">Signature Galleries</span>
            <h2 className="text-3xl md:text-5xl font-playfair font-bold text-slate-950 mt-3">Selected Departments</h2>
          </div>
          <Link className="font-button text-button text-slate-950 flex items-center gap-3 hover:opacity-70 transition-opacity uppercase tracking-widest" href={ROUTES.SHOP}>
            Explore Menu <span className="material-symbols-outlined text-[16px]">east</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              name: "Appetizers", 
              count: "12 curated starters", 
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3h50e_Gc3j8AajRynQ3ZC3oCbydv-QcWdKlGvJ0kqFSTVDOtvwja3XLuQa857kaPesmtaFlSnRViidGNaW16gW3c79C4jO9K5VXk5gWeHX5jrTOUXEzFfZ8UOGlhki-DsTUOW7qno1Hm57Iet8-JGz8vwEqry2QqU0cA0-osb8-8LbAk-881eiGALYa3c_hsZA806_244FDDihkg_m-2Buh82sJ1Z8edxXeSIUDY__0ZfQitsSq04ZtiXVMMllm7tYQ6rrmwnUvA6",
              heightClass: "min-h-[460px]"
            },
            { 
              name: "Main Courses", 
              count: "8 signature mains", 
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8t5jKG34C0faRzyXVogbJTrxy5Dt_DDDfuG2g3axitxQDfDWrAEH0MIXSR4MMWNpzjdLPaKA_ZemoKYMtcpDzbAk1Azqp926C_OYGwHdasubtwO13xr0oaSa4Zc0ulricAqnesCnKWrDFfcI1oABlF9x0-GjqO2KRJIcBacoK3To_Ig6Tsh-35V_Z5TYqlxbswfOwKWzpjTQsqbzf_ANowjnQe79_YG1-ZwtSK5rFGhoNnMWzS_O22jvh4_nPe8BL1pQjbv1nA-sx",
              heightClass: "min-h-[520px] md:translate-y-8"
            },
            { 
              name: "Mocktails", 
              count: "14 artisan pairings", 
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdG_0IT2JZJx7InP8X_9_j3HQJKcj3kmGReatvVLhflnVlIjcibXMrK3wpDN371claG2928iq0yD4dXPYhiK_oPfPgLCz4Jy-m5swmFeg9yCxn_CplGYYgWF5ahcwDXE38xlhJ_Thzh0YPpZnsoNHOkIGOtlM_OkUgswWN5Pw93LDgimFA3GZEj-iR1zgrTayHBGEw09_Fkb8TC3auis0evbP_OM0s_6PcXKnG0gOfpq8YW53SUwxFVf8Q7U70kHpt2G2dsdbKDXoE",
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
              Chef&apos;s Special Reserve Release
            </span>
            <h2 className="text-3xl md:text-5xl font-playfair font-bold mb-6 leading-tight">
              Culinary Vault Tasting Set <br /> <span className="italic font-normal">Special Epicurean Reserve pricing.</span>
            </h2>
            <p className="text-slate-400 font-light leading-relaxed max-w-md">
              A meticulously paired flight of our signature courses and botanical pairings. Extremely limited release from the Chef&apos;s personal laboratory.
            </p>
            <div className="mt-8">
              <Link 
                href={ROUTES.SHOP} 
                className="inline-flex items-center gap-3 text-white font-button text-button uppercase tracking-widest border-b border-white/20 pb-2 hover:border-accent-gold transition-colors"
              >
                Reserve Your Flight <span className="material-symbols-outlined text-[16px]">east</span>
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
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-[0.25em]">Our Story</span>
              <h2 className="text-3xl md:text-5xl font-playfair font-bold text-slate-950 mt-3">Culinary Chronology</h2>
            </div>
            <p className="text-slate-400 font-light text-sm max-w-sm">
              Tracing the signature gastronomic transitions and ingredient milestones of Sarab Luxe Gourmet.
            </p>
          </div>
          
          <div ref={carouselContainerRef} className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {culinaryTimeline.map((item, idx) => (
              <div 
                key={item.year}
                className="timeline-card bg-white p-8 soft-elevation flex flex-col justify-between transition-all duration-500 hover:scale-[1.02] min-h-[460px] relative"
              >
                <div>
                  <div className="flex justify-between items-baseline mb-6 border-b border-slate-50 pb-4">
                    <span className="text-4xl font-playfair font-bold text-slate-950">{item.year}</span>
                    <span className="font-label-caps text-[9px] text-accent-gold uppercase tracking-wider">Epoch {idx + 1}</span>
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
                  <span className="font-label-caps text-[10px] tracking-widest uppercase">Sarab Archives</span>
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
            <span className="font-label-caps text-[10px] text-slate-400 uppercase tracking-[0.25em]">Chef&apos;s Specials</span>
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-slate-950 mt-3">Signature Dishes</h2>
            <p className="text-slate-500 text-sm mt-4 font-light max-w-sm mx-auto">Distinct flavor palettes crafted with absolute epicurean precision.</p>
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
                        Fresh Release
                      </span>
                    </div>
                  </div>
                  <div className="px-2">
                    <h3 className="font-bold text-slate-900 text-base mb-1 truncate group-hover:text-slate-950 transition-colors">{product.title}</h3>
                    <p className="text-slate-400 text-[10px] mb-3 uppercase tracking-widest font-bold font-manrope">Gourmet Selection</p>
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
            <span className="font-label-caps text-[10px] text-slate-400 uppercase tracking-[0.25em] mb-4 block">Mailing List</span>
            <h2 className="text-3xl md:text-5xl font-playfair font-bold text-slate-950 mb-6 leading-tight">Join the Culinary Circle</h2>
            <p className="text-sm md:text-base text-slate-600 leading-relaxed font-light">
              Subscribe to receive priority reservation codes, private tasting invites, and ingredient stories from our master kitchen.
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
