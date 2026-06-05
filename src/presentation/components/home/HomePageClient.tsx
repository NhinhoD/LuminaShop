"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n/getDictionary";
import { ROUTES } from "@/presentation/constants";
import { formatCurrency } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Product } from "@/domain/entities/Product";
import {
  Star,
  Zap,
  ShoppingCart,
  ArrowRight,
  Heart,
  Send,
  Lock,
  Code2,
  Cpu,
  Monitor,
  Flame,
  Layout,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HomePageClientProps {
  readonly featuredProducts: readonly Product[];
  readonly dict: Dictionary['home'];
}

/* ─── Digital Marketplace Static Data ─── */
const MARQUEE_ITEMS = [
  "Next.js 15 App Router",
  "Tailwind CSS v4.0",
  "GSAP Ultra Performance",
  "Framer Motion Fluid Transitions",
  "Clean Architecture Clean Code",
  "Supabase PostgreSQL + Auth",
  "SEO Optimized Templates",
];

const CATEGORIES = [
  { name: "Tất cả", filter: "all", count: "Premium & Free", icon: Layout },
  { name: "Landing Page", filter: "landing-page", count: "Trang đơn chuyển đổi", icon: Monitor },
  { name: "E-Commerce", filter: "e-commerce", count: "Cửa hàng trực tuyến", icon: ShoppingCart },
  { name: "Admin Dashboard", filter: "admin-dashboard", count: "Hệ quản trị nội bộ", icon: Cpu },
  { name: "Portfolio", filter: "portfolio", count: "Hồ sơ cá nhân sáng tạo", icon: Code2 },
];

const ADVANTAGES = [
  {
    icon: Code2,
    color: "text-[#0051d5] bg-blue-50/50",
    title: "Mã nguồn chuẩn Clean Architecture",
    desc: "Tổ chức layer rõ ràng từ Domain, Application đến Infrastructure. Dễ bảo trì và mở rộng.",
  },
  {
    icon: Flame,
    color: "text-amber-500 bg-amber-50/50",
    title: "Hiệu ứng GSAP & Tailwind 4 đỉnh cao",
    desc: "Mượt mà 60fps trên mọi thiết bị. Giao diện chuẩn Sarab Spec thời thượng, sang trọng.",
  },
  {
    icon: Zap,
    color: "text-emerald-500 bg-emerald-50/50",
    title: "Tối ưu SEO & Tải trang tức thì",
    desc: "Cấu trúc HTML5 semantic chuẩn, Next.js Server Components giúp đạt điểm tối đa Core Web Vitals.",
  },
];

const JOURNEY_STEPS = [
  { year: "Bước 1", title: "Lựa chọn Template", desc: "Khám phá bộ sưu tập mã nguồn đa dạng từ Landing Page đến E-Commerce được thiết kế tỉ mỉ." },
  { year: "Bước 2", title: "Thanh toán bảo mật", desc: "Chuyển khoản VietQR/Manual nhanh chóng. Hệ thống tự động xác nhận đơn hàng." },
  { year: "Bước 3", title: "Tải về & Triển khai", desc: "Tải ngay file .zip chứa toàn bộ code gốc, hướng dẫn cài đặt và sẵn sàng deploy chỉ trong 5 phút." },
];

export default function HomePageClient({ featuredProducts, dict }: HomePageClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const advantagesRef = useRef<HTMLElement>(null);
  const showcaseRef = useRef<HTMLElement>(null);
  const journeyRef = useRef<HTMLElement>(null);

  const [activeCategory, setActiveCategory] = useState("all");

  // Filter products based on category name or tags
  const filteredProducts = featuredProducts.filter((product) => {
    if (activeCategory === "all") return true;
    return (
      product.categoryId?.toLowerCase().includes(activeCategory) ||
      product.title.toLowerCase().includes(activeCategory) ||
      product.description?.toLowerCase().includes(activeCategory)
    );
  });

  // Scoped GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Floating cards micro-interactions
      gsap.to(".float-card-1", { y: -10, duration: 2.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".float-card-2", { y: -8, duration: 2.5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.5 });
      gsap.to(".float-card-3", { y: -12, duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1 });

      // Hero text entrance
      gsap.fromTo(".hero-badge", { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
      gsap.fromTo(".hero-title", { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.9, delay: 0.2, ease: "power3.out" });
      gsap.fromTo(".hero-desc", { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: "power3.out" });
      gsap.fromTo(".hero-cta", { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.6, ease: "power3.out" });
      gsap.fromTo(".hero-stats > div", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, delay: 0.8, ease: "power3.out" });

      // Category cards scroll trigger
      if (categoriesRef.current) {
        const cards = categoriesRef.current.querySelectorAll(".cat-card");
        gsap.fromTo(cards,
          { opacity: 0, y: 30, scale: 0.98 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: "power3.out",
            scrollTrigger: { trigger: categoriesRef.current, start: "top 80%", toggleActions: "play none none none" }
          }
        );
      }

      // Advantages grid scroll trigger
      if (advantagesRef.current) {
        const cards = advantagesRef.current.querySelectorAll(".adv-card");
        gsap.fromTo(cards,
          { opacity: 0, x: -30 },
          {
            opacity: 1, x: 0, duration: 0.8, stagger: 0.12, ease: "power3.out",
            scrollTrigger: { trigger: advantagesRef.current, start: "top 78%", toggleActions: "play none none none" }
          }
        );
      }

      // Showcase product cards scroll trigger
      if (showcaseRef.current) {
        const products = showcaseRef.current.querySelectorAll(".prod-card");
        gsap.fromTo(products,
          { opacity: 0, y: 35 },
          {
            opacity: 1, y: 0, duration: 0.75, stagger: 0.1, ease: "power3.out",
            scrollTrigger: { trigger: showcaseRef.current, start: "top 78%", toggleActions: "play none none none" }
          }
        );
      }

      // Journey steps scroll trigger
      if (journeyRef.current) {
        const steps = journeyRef.current.querySelectorAll(".jr-step");
        gsap.fromTo(steps,
          { opacity: 0, y: 25 },
          {
            opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out",
            scrollTrigger: { trigger: journeyRef.current, start: "top 80%", toggleActions: "play none none none" }
          }
        );
      }

    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="bg-[#fcfbf9] text-slate-900 overflow-hidden font-manrope">

      {/* ══════════ HERO SECTION ══════════ */}
      <section className="relative min-h-[92vh] flex items-center pt-24 pb-12 overflow-hidden bg-gradient-to-br from-[#f6f3ed] to-[#fcfbf9]">
        {/* Soft background light */}
        <div className="absolute top-0 right-0 w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle,rgba(0,81,213,0.04),transparent_65%)] pointer-events-none" />
        <div className="absolute bottom-0 left-[10%] w-[380px] h-[380px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.04),transparent_65%)] pointer-events-none" />

        {/* Editorial Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[18vw] font-extrabold font-playfair text-[rgba(0,0,0,0.015)] pointer-events-none whitespace-nowrap select-none">
          LUMINA
        </div>

        <div className="max-w-[1440px] mx-auto px-8 md:px-12 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Column: Text & Badges */}
            <div className="lg:col-span-7 space-y-6">
              <div className="hero-badge inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-100/60">
                <span className="flex h-2 w-2 rounded-full bg-[#0051d5] animate-pulse" />
                <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-700">{dict?.hero?.badge || 'Chợ Mua Bán Website Template Cao Cấp Việt Nam'}</span>
              </div>

              <h1 className="hero-title text-[clamp(2.4rem,5.5vw,4.2rem)] font-extrabold leading-[1.08] text-slate-950 font-playfair">
                {dict?.hero?.title1 || 'Xây dựng thương hiệu số'} <br />
                <span className="text-[#0051d5] relative inline-block">
                  {dict?.hero?.title2 || 'Đẳng cấp & Mượt mà'}
                  <span className="absolute bottom-[3px] left-0 right-0 h-[6px] bg-blue-100 rounded z-[-1]" />
                </span>
                <br />{dict?.hero?.title3 || 'chỉ trong 5 phút.'}
              </h1>

              <p className="hero-desc text-base text-slate-500 leading-relaxed max-w-[540px]">
                {dict?.hero?.desc || 'Sở hữu trọn bộ mã nguồn (Next.js 15, Tailwind v4, GSAP) chuẩn Clean Architecture được lập trình tối ưu bởi các lập trình viên kỳ cựu. Bàn giao nhanh chóng, an toàn, hỗ trợ deploy lên Vercel/Netlify miễn phí.'}
              </p>

              <div className="hero-cta flex flex-wrap gap-4 pt-2">
                <Link href={ROUTES.SHOP} className="inline-flex items-center gap-2 bg-[#0051d5] hover:bg-[#0041ac] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/10 active:scale-95 group text-sm">
                  <span>{dict?.hero?.cta1 || 'Khám phá Template'}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#advantages" className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-8 py-4 rounded-xl font-bold transition-all active:scale-95 text-sm">
                  {dict?.hero?.cta2 || 'Tại sao chọn Lumina?'}
                </a>
              </div>

              {/* Metrics */}
              <div className="hero-stats flex flex-wrap gap-x-8 gap-y-4 pt-6 border-t border-slate-200/50">
                {[
                  { num: "50+", suffix: "Template", label: "Giao diện độc quyền" },
                  { num: "98%", suffix: "Score", label: "Tối ưu Core Web Vitals" },
                  { num: "1,200+", suffix: "Devs", label: "Đã và đang tin dùng" },
                  { num: "24/7", suffix: "", label: "Hỗ trợ cài đặt kỹ thuật" },
                ].map((stat) => (
                  <div key={stat.label} className="min-w-[120px]">
                    <span className="font-playfair text-2xl font-black text-slate-900 block">
                      {stat.num}<span className="text-[#0051d5]">{stat.suffix}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Visual Asymmetric Cards */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="relative w-full h-[500px] flex items-center justify-center">

                {/* Asymmetric Core Showcase Graphic */}
                <div className="relative w-[340px] h-[440px] rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/10 bg-white border border-slate-100 p-3 rotate-[-3deg] hover:rotate-0 transition-transform duration-500">
                  <Image
                    src="/sarab-1.0.0/sarab/img/banner-img.jpg"
                    alt="Lumina Template Mockup"
                    fill
                    className="object-cover rounded-2xl"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white rounded-2xl">
                    <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase mb-1">BEST SELLER</span>
                    <h3 className="text-xl font-bold font-playfair mb-1">Lumina Creative Editorial Portfolio</h3>
                    <p className="text-xs text-slate-300">Tích hợp sẵn GSAP ScrollTrigger & Smooth Scroll.</p>
                  </div>
                </div>

                {/* Floating Micro-Interactions Cards */}
                <div className="float-card-1 absolute top-[40px] left-[-30px] bg-white/95 backdrop-blur rounded-2xl px-5 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.06)] border border-slate-100 flex items-center gap-3">
                  <div className="w-[38px] h-[38px] rounded-xl bg-blue-50 text-[#0051d5] flex items-center justify-center flex-shrink-0">
                    <Monitor size={18} />
                  </div>
                  <div>
                    <span className="block font-extrabold text-xs text-slate-800 leading-none">Responsive</span>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Mobile & Desktop</span>
                  </div>
                </div>

                <div className="float-card-2 absolute bottom-[60px] right-[-20px] bg-white/95 backdrop-blur rounded-2xl px-5 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.06)] border border-slate-100 flex items-center gap-3">
                  <div className="w-[38px] h-[38px] rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
                    <Star size={18} fill="currentColor" />
                  </div>
                  <div>
                    <span className="block font-extrabold text-xs text-slate-800 leading-none">Lĩnh vực</span>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Mọi ngành nghề</span>
                  </div>
                </div>

                <div className="float-card-3 absolute top-[40%] right-[-50px] bg-white/95 backdrop-blur rounded-2xl px-5 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.06)] border border-slate-100 flex items-center gap-3">
                  <div className="w-[38px] h-[38px] rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
                    <Code2 size={18} />
                  </div>
                  <div>
                    <span className="block font-extrabold text-xs text-slate-800 leading-none">React 19 Ready</span>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Next.js 16 Compatible</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════ MARQUEE TECH STACK ══════════ */}
      <div className="bg-[#0b1c30] py-4 overflow-hidden border-y border-slate-800">
        <div className="flex gap-12 whitespace-nowrap animate-[marquee-scroll_24s_linear_infinite]">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <div key={`${item}-${i}`} className="inline-flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest select-none">
              <span className="text-[#0051d5] text-lg">✦</span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ ADVANTAGES SECTION ══════════ */}
      <section id="advantages" ref={advantagesRef} className="py-24 bg-white">
        <div className="max-w-[1440px] mx-auto px-8 md:px-12">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">

            <div className="lg:col-span-1 space-y-4">
              <span className="text-[10px] font-black tracking-widest text-[#0051d5] uppercase block">ƯU ĐIỂM VƯỢT TRỘI</span>
              <h2 className="text-3xl font-bold font-playfair leading-tight text-slate-950">Tại sao nên chọn mã nguồn tại KhoUI?</h2>
              <div className="h-1.5 w-16 bg-[#0051d5] rounded-full" />
              <p className="text-slate-500 text-sm leading-relaxed">
                Chúng tôi cung cấp các website template cao cấp với chất lượng tốt nhất trên thị trường Việt Nam, cấu hình dễ dàng và tích hợp sẵn đầy đủ hạ tầng hiện đại.
              </p>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
              {ADVANTAGES.map((adv) => {
                const Icon = adv.icon;
                return (
                  <div key={adv.title} className="adv-card bg-slate-50 border border-slate-100 rounded-3xl p-8 hover:shadow-xl hover:bg-white transition-all duration-300">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg mb-6 ${adv.color}`}>
                      <Icon size={22} />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base mb-3 leading-snug">{adv.title}</h3>
                    <p className="text-[13px] text-slate-500 leading-relaxed">{adv.desc}</p>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </section>

      {/* ══════════ CATEGORIES NAVIGATION & SHIELD ══════════ */}
      <section ref={categoriesRef} className="py-20 bg-[#fbfaf6] border-t border-slate-100">
        <div className="max-w-[1440px] mx-auto px-8 md:px-12">

          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-black tracking-widest text-[#0051d5] uppercase block">BỘ SƯU TẬP TEMPLATE</span>
            <h2 className="text-3xl font-extrabold font-playfair text-slate-950">Tìm kiếm mẫu website phù hợp</h2>
            <div className="h-1 w-16 bg-[#0051d5] mx-auto rounded-full" />
            <p className="text-slate-500 text-sm">
              Chọn lựa mẫu thiết kế chuyên nghiệp trong hệ sinh thái của chúng tôi để nâng cấp doanh nghiệp của bạn.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 justify-center">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.filter}
                  onClick={() => setActiveCategory(cat.filter)}
                  className={`cat-card text-left bg-white rounded-3xl p-6 border-2 transition-all duration-300 shadow-sm hover:scale-[1.03] group ${activeCategory === cat.filter
                    ? "border-[#0051d5] ring-4 ring-blue-50/50"
                    : "border-slate-100 hover:border-slate-300"
                    }`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${activeCategory === cat.filter
                    ? "bg-[#0051d5] text-white"
                    : "bg-slate-100 text-slate-600 group-hover:bg-[#0051d5]/10 group-hover:text-[#0051d5]"
                    } mb-4`}>
                    <Icon size={18} />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-[15px] mb-1">{cat.name}</h3>
                  <p className="text-[11px] text-slate-400 font-semibold">{cat.count}</p>
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* ══════════ SHOWCASE TEMPLATES GRID ══════════ */}
      <section ref={showcaseRef} className="py-24 bg-white">
        <div className="max-w-[1440px] mx-auto px-8 md:px-12">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-slate-100 pb-8">
            <div className="space-y-2">
              <span className="text-[10px] font-black tracking-widest text-[#0051d5] uppercase block">DỰ ÁN NỔI BẬT</span>
              <h2 className="text-3xl font-extrabold font-playfair text-slate-950">Giao diện sẵn sàng kích hoạt</h2>
            </div>
            <Link href={ROUTES.SHOP} className="text-[#0051d5] hover:text-[#0041ac] font-bold text-xs uppercase tracking-widest mt-4 md:mt-0 flex items-center gap-1">
              Xem toàn bộ template <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.slice(0, 6).map((product) => {
              const isFree = product.price === 0;
              return (
                <div
                  key={product.id}
                  className="prod-card bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col h-full"
                >

                  {/* Visual Frame */}
                  <div className="relative overflow-hidden aspect-[4/3] bg-[#fbfaf6]">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Monitor size={36} />
                      </div>
                    )}

                    {/* Category Label / Status */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-[#0b1c30] text-white rounded-lg px-3 py-1 text-[9px] font-black tracking-widest uppercase">
                        {isFree ? "Miễn phí" : "Premium"}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white flex items-center justify-center text-slate-400 cursor-pointer hover:text-red-500 hover:scale-110 transition-all shadow-sm">
                      <Heart size={14} />
                    </div>
                  </div>

                  {/* Template Info Body */}
                  <div className="p-6 flex flex-col flex-grow space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap gap-1.5">
                        {product.techStack && product.techStack.length > 0 ? (
                          product.techStack.map((tech) => (
                            <span key={tech} className="bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded">
                              {tech}
                            </span>
                          ))
                        ) : (
                          <>
                            <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded">Next.js 15</span>
                            <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded">Tailwind 4</span>
                            <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded">GSAP</span>
                          </>
                        )}
                      </div>
                      <Link href={`${ROUTES.PRODUCT}/${product.id}`}>
                        <h3 className="text-lg font-bold font-playfair text-slate-950 truncate hover:text-[#0051d5] transition-colors">
                          {product.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed h-8">
                        {product.description || "Website Template chất lượng cao, tích hợp đầy đủ công nghệ hiện đại nhất hiện nay."}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100/60 mt-auto">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Đơn giá bản quyền</div>
                        <div className="text-lg font-extrabold text-[#0051d5] font-playfair">
                          {isFree ? "MIỄN PHÍ" : formatCurrency(product.price)}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {product.demoUrl && (
                          <a
                            href={product.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200"
                          >
                            Demo
                          </a>
                        )}
                        <Link
                          href={`${ROUTES.PRODUCT}/${product.id}`}
                          className="w-9 h-9 rounded-xl bg-[#0b1c30] text-white flex items-center justify-center hover:bg-[#0051d5] transition-all shadow-md group-hover:scale-105"
                        >
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-3xl">
              <Code2 size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 font-semibold text-sm">Không tìm thấy mẫu nào trong mục này. Vui lòng chọn danh mục khác!</p>
            </div>
          )}

        </div>
      </section>

      {/* ══════════ SYSTEM TIMELINE JOURNEY ══════════ */}
      <section ref={journeyRef} className="py-24 bg-[#fbfaf6]">
        <div className="max-w-[1440px] mx-auto px-8 md:px-12">

          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-black tracking-widest text-[#0051d5] uppercase block">QUY TRÌNH MUA HÀNG</span>
            <h2 className="text-3xl font-extrabold font-playfair text-slate-950">Nhận Source Code chỉ trong 3 bước</h2>
            <div className="h-1 w-16 bg-[#0051d5] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {JOURNEY_STEPS.map((step, idx) => (
              <div key={step.year} className="jr-step bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex gap-5 items-start">
                <div className="w-12 h-12 bg-blue-50 text-[#0051d5] font-extrabold text-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">{step.year}</span>
                  <h4 className="font-extrabold text-slate-950 text-base leading-snug">{step.title}</h4>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════ NEWSLETTER ══════════ */}
      <section className="relative py-24 overflow-hidden bg-[#0b1c30] border-t border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,81,213,0.12),transparent_75%)] pointer-events-none" />
        <div className="max-w-[1440px] mx-auto px-8 md:px-12 relative z-10">

          <div className="bg-white/5 border border-slate-800 rounded-3xl p-10 md:p-16 text-center max-w-3xl mx-auto backdrop-blur-sm space-y-6">
            <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase block">ĐĂNG KÝ BẢN TIN</span>
            <h2 className="text-white text-3xl font-extrabold font-playfair">
              Nhận thông báo khi có <span className="text-[#0051d5]">Template</span> mới
            </h2>
            <p className="text-slate-300 text-sm max-w-md mx-auto">
              Đăng ký email để nhận thông tin về các template mới nhất, mã giảm giá đặc quyền và các bài chia sẻ công nghệ hữu ích từ KhoUI.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
            >
              <input
                type="email"
                placeholder="Địa chỉ email của bạn..."
                className="flex-grow bg-slate-900/60 border border-slate-700/80 rounded-xl px-5 py-3 text-white placeholder:text-slate-500 outline-none focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/20 transition-all text-xs font-semibold"
              />
              <button className="bg-[#0051d5] hover:bg-[#0041ac] text-white px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-900/20 active:scale-95">
                <Send size={12} /> Đăng ký
              </button>
            </form>

            <p className="text-slate-500 text-[10px] flex items-center justify-center gap-1">
              <Lock size={10} /> Cam kết bảo mật thông tin, không gửi thư rác.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
