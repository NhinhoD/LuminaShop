"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import QuickAddButton from "./QuickAddButton";
import { Product } from "@/domain/entities/Product";
import { ROUTES } from "@/presentation/constants";
import { formatCurrency } from "@/lib/utils";
import gsap from "gsap";
import { Heart, Search, SlidersHorizontal, Monitor } from "lucide-react";

interface ShopProductGridProps {
  readonly initialProducts: readonly Product[];
}

export default function ShopProductGrid({ initialProducts }: ShopProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTech, setSelectedTech] = useState<readonly string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(10000000);
  const [isLoading, setIsLoading] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const categories = [
    { label: "Tất cả", value: "all" },
    { label: "Landing Page", value: "landing-page" },
    { label: "E-Commerce", value: "e-commerce" },
    { label: "Admin Dashboard", value: "admin-dashboard" },
    { label: "Portfolio", value: "portfolio" },
  ];

  const techFilters = ["Next.js 15", "Tailwind 4", "GSAP", "Framer Motion", "React 19"];

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // 1. Filter by category (either matching product properties, title, description or category slug)
      if (selectedCategory !== "all") {
        const catMatch =
          product.categoryId?.toLowerCase().includes(selectedCategory) ||
          product.title.toLowerCase().includes(selectedCategory) ||
          product.description?.toLowerCase().includes(selectedCategory);
        if (!catMatch) return false;
      }

      // 2. Filter by max price
      if (product.price > maxPrice) return false;

      // 3. Filter by tech stack tags
      if (selectedTech.length > 0) {
        // Tech stack check: if product has techStack array, match it, otherwise check description/title
        const match = selectedTech.some((tech) => {
          const inStack = product.techStack?.some((t) => t.toLowerCase().includes(tech.toLowerCase()));
          const inDesc = product.description?.toLowerCase().includes(tech.toLowerCase());
          const inTitle = product.title.toLowerCase().includes(tech.toLowerCase());
          return inStack || inDesc || inTitle;
        });
        if (!match) return false;
      }

      return true;
    });
  }, [initialProducts, selectedCategory, selectedTech, maxPrice]);

  const handleCategorySelect = (category: string) => {
    setIsLoading(true);
    setSelectedCategory(category);
    setTimeout(() => setIsLoading(false), 300);
  };

  const toggleTech = (tech: string) => {
    setIsLoading(true);
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
    setTimeout(() => setIsLoading(false), 300);
  };

  // GSAP animation triggered on product card change
  useEffect(() => {
    const currentGrid = gridRef.current;
    if (!isLoading && currentGrid) {
      const items = currentGrid.querySelectorAll(".product-card-anim");
      if (items.length > 0) {
        gsap.killTweensOf(items);
        gsap.fromTo(
          items,
          { opacity: 0, y: 25, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.05,
            overwrite: "auto",
          }
        );
      }
    }
    return () => {
      if (currentGrid) {
        const items = currentGrid.querySelectorAll(".product-card-anim");
        gsap.killTweensOf(items);
      }
    };
  }, [isLoading, filteredProducts]);

  return (
    <div className="bg-[#fcfbf9] min-h-screen text-slate-800 font-manrope">

      {/* Page Header */}
      <div className="bg-gradient-to-b from-[#f6f3ed] to-[#fcfbf9] py-16 border-b border-slate-100">
        <div className="max-w-[1200px] mx-auto px-4 text-center space-y-3">
          <span className="text-[10px] font-black tracking-widest text-[#0051d5] uppercase block">LUMINA CATALOG</span>
          <h1 className="text-4xl font-extrabold font-playfair text-slate-950">Kho Giao Diện Độc Quyền</h1>
          <div className="h-1.5 w-16 bg-[#0051d5] mx-auto rounded-full" />
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Sở hữu trọn đời mã nguồn website chất lượng cao, chuẩn SEO, tích hợp sẵn GSAP & Tailwind v4.0.
          </p>
        </div>
      </div>

      {/* Filter Category Bar */}
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategorySelect(cat.value)}
              className={`rounded-xl px-6 py-2.5 text-xs font-bold transition-all border cursor-pointer ${selectedCategory === cat.value
                  ? "bg-[#0051d5] border-[#0051d5] text-white shadow-lg shadow-blue-900/10"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-800"
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Sidebar Filters */}
          <aside className="lg:col-span-3 space-y-6">

            {/* Price Filter */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-xs font-black text-slate-900 mb-4 uppercase tracking-widest">
                <SlidersHorizontal size={14} className="text-[#0051d5]" />
                Khoảng giá bản quyền
              </h3>
              <input
                type="range"
                min="0"
                max="10000000"
                step="500000"
                value={maxPrice}
                onChange={(e) => {
                  setIsLoading(true);
                  setMaxPrice(Number(e.target.value));
                  setTimeout(() => setIsLoading(false), 200);
                }}
                className="w-full h-1.5 bg-[#eee] rounded-lg appearance-none cursor-pointer accent-[#0051d5]"
              />
              <div className="flex justify-between mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Min: 0đ</span>
                <span className="font-extrabold text-slate-800">
                  Max: {formatCurrency(maxPrice)}
                </span>
              </div>
            </div>

            {/* Tech Stack Filters */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-xs font-black text-slate-900 mb-4 uppercase tracking-widest">
                <Search size={14} className="text-[#0051d5]" />
                Công nghệ tích hợp
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {techFilters.map((tech) => {
                  const isSelected = selectedTech.includes(tech);
                  return (
                    <button
                      key={tech}
                      onClick={() => toggleTech(tech)}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${isSelected
                          ? "bg-[#0051d5] text-white shadow-md shadow-blue-900/10"
                          : "bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        }`}
                    >
                      {tech}
                    </button>
                  );
                })}
              </div>
            </div>

          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-9">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm animate-pulse">
                    <div className="aspect-[4/3] bg-slate-100" />
                    <div className="p-6 space-y-3">
                      <div className="h-2.5 bg-slate-100 w-1/3 rounded" />
                      <div className="h-4 bg-slate-100 w-3/4 rounded" />
                      <div className="h-2.5 bg-slate-100 w-full rounded" />
                      <div className="h-4 bg-slate-100 w-1/4 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
                <Search size={48} className="text-slate-200 mx-auto mb-4" />
                <h3 className="text-base font-extrabold text-slate-800 mb-2">Không tìm thấy mã nguồn phù hợp</h3>
                <p className="text-slate-400 text-xs">Hãy thử thay đổi bộ lọc hoặc mở rộng khoảng giá của bạn.</p>
              </div>
            ) : (
              <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product: Product) => {
                  const isFree = product.price === 0;

                  return (
                    <div
                      key={product.id}
                      className="product-card-anim bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col h-full"
                    >
                      <Link href={`${ROUTES.PRODUCT}/${product.id}`}>
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
                              <Monitor size={30} />
                            </div>
                          )}
                          <div className="absolute top-3 left-3 bg-[#0b1c30] text-white rounded-lg px-2.5 py-0.5 text-[8px] font-black tracking-widest uppercase">
                            {isFree ? "Miễn phí" : "Premium"}
                          </div>
                          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 cursor-pointer hover:text-red-500 hover:scale-115 transition-all shadow-sm">
                            <Heart size={13} />
                          </div>
                        </div>
                      </Link>

                      {/* Info Body */}
                      <div className="p-5 flex flex-col flex-grow space-y-3.5">
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1">
                            {product.techStack && product.techStack.length > 0 ? (
                              product.techStack.map((tech) => (
                                <span key={tech} className="bg-slate-100 text-slate-500 text-[8px] font-bold px-1.5 py-0.5 rounded">
                                  {tech}
                                </span>
                              ))
                            ) : (
                              <>
                                <span className="bg-slate-100 text-slate-500 text-[8px] font-bold px-1.5 py-0.5 rounded">Next.js 15</span>
                                <span className="bg-slate-100 text-slate-500 text-[8px] font-bold px-1.5 py-0.5 rounded">Tailwind 4</span>
                              </>
                            )}
                          </div>
                          <Link href={`${ROUTES.PRODUCT}/${product.id}`}>
                            <h3 className="text-base font-extrabold text-slate-900 hover:text-[#0051d5] transition-colors truncate">
                              {product.title}
                            </h3>
                          </Link>
                          <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed h-8">
                            {product.description || "Giao diện website cao cấp được thiết kế tỉ mỉ, đầy đủ công nghệ hiện đại."}
                          </p>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-auto">
                          <div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Giá bản quyền</div>
                            <div className="text-base font-extrabold text-[#0051d5] font-playfair">
                              {isFree ? "MIỄN PHÍ" : formatCurrency(product.price)}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {product.demoUrl && (
                              <Link 
                                href={`/demo/${product.id}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-slate-900 text-white text-[10px] font-bold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center shadow-md"
                              >
                                Xem Demo
                              </Link>
                            )}
                            <QuickAddButton
                              product={{
                                id: product.id,
                                productId: product.id,
                                title: product.title,
                                price: Number(product.price),
                                imageUrl: product.imageUrl || undefined,
                                quantity: 1,
                              }}
                              hasVariants={false}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
