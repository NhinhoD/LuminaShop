"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import QuickAddButton from "./QuickAddButton";
import { Product } from "@/domain/entities/Product";
import { Category } from "@/domain/entities/Category";
import { ROUTES } from "@/presentation/constants";
import { formatCurrency } from "@/lib/utils";
import gsap from "gsap";
import { Search, SlidersHorizontal, Monitor, Eye, ArrowRight, Code2 } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { useI18n } from "@/presentation/components/common/I18nContext";
import { getLocalizedText } from "@/presentation/utils/locale";

interface ShopProductGridProps {
  initialProducts: readonly Product[];
  currentSearch: string;
  currentSort: string;
  currentCategory: string;
  initialCategory?: string;
  dbCategories?: readonly Category[];
}

export default function ShopProductGrid({ 
  initialProducts, 
  currentSearch, 
  currentSort, 
  currentCategory,
  dbCategories,
}: ShopProductGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { dict, locale } = useI18n();

  const [searchQuery, setSearchQuery] = useState(currentSearch);
  const [maxPrice, setMaxPrice] = useState<number>(10000000);
  const [selectedTech, setSelectedTech] = useState<readonly string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const categories = [
    { label: dict?.shop?.allCategories || (locale === "vi" ? "Tất cả" : "All"), value: "all" },
    ...(dbCategories && dbCategories.length > 0
      ? dbCategories.map((c) => ({
          label: getLocalizedText(c.name as unknown as Record<string, string>, locale) || c.slug,
          value: c.slug,
        }))
      : [
          { label: "E-Commerce", value: "e-commerce" },
          { label: "SaaS & Tech", value: "saas-tech" },
          { label: "Portfolio & Agency", value: "portfolio-agency" },
          { label: "Food & Hospitality", value: "food-hospitality" },
          { label: "Fintech & Corporate", value: "fintech-corporate" },
        ]),
  ];

  const techFilters = ["Next.js 16", "Next.js 15", "Tailwind 4", "GSAP", "Framer Motion", "React 19"];

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  const updateUrl = (updates: { q?: string; category?: string; sort?: string }) => {
    setIsLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    
    // Always clear legacy/alias 'cat' param so URL stays unified on 'category'
    params.delete("cat");

    if (updates.q !== undefined) {
      if (updates.q) params.set("q", updates.q);
      else params.delete("q");
    }
    
    if (updates.category !== undefined) {
      if (updates.category !== "all") params.set("category", updates.category);
      else params.delete("category");
    }
    
    if (updates.sort !== undefined) {
      if (updates.sort !== "newest") params.set("sort", updates.sort);
      else params.delete("sort");
    }

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    loadingTimeoutRef.current = setTimeout(() => setIsLoading(false), 400);
  };

  const handleSearch = useDebouncedCallback((term: string) => {
    updateUrl({ q: term });
  }, 400);

  const handleCategorySelect = (category: string) => {
    updateUrl({ category });
  };

  const handleSortSelect = (sort: string) => {
    updateUrl({ sort });
  };

  const toggleTech = (tech: string) => {
    setIsLoading(true);
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    loadingTimeoutRef.current = setTimeout(() => setIsLoading(false), 250);
  };

  const filteredProducts = initialProducts.filter(product => {
    if (product.price > maxPrice) return false;
    if (selectedTech.length > 0) {
      const match = selectedTech.some((tech) => {
        const inStack = product.techStack?.some((t) => t.toLowerCase().includes(tech.toLowerCase()));
        const descText = getLocalizedText(product.description as unknown as Record<string, string>, locale);
        const inDesc = descText.toLowerCase().includes(tech.toLowerCase());
        const titleText = getLocalizedText(product.title as unknown as Record<string, string>, locale);
        const inTitle = titleText.toLowerCase().includes(tech.toLowerCase());
        return inStack || inDesc || inTitle;
      });
      if (!match) return false;
    }
    return true;
  });

  // GSAP animation triggered on product card change
  useEffect(() => {
    const currentGrid = gridRef.current;
    if (!isLoading && currentGrid) {
      const items = currentGrid.querySelectorAll(".product-card-anim");
      if (items.length > 0) {
        gsap.killTweensOf(items);
        gsap.fromTo(
          items,
          { opacity: 0, y: 20, scale: 0.99 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: "power3.out",
            stagger: 0.04,
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
  }, [isLoading, filteredProducts, initialProducts]);

  return (
    <div className="bg-white text-slate-800 font-sans rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100">
      {/* Top Filter & Sort Bar */}
      <div className="bg-slate-50/60 p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategorySelect(cat.value)}
              className={`rounded-xl px-4 py-2 text-xs font-medium transition-all border cursor-pointer ${
                currentCategory === cat.value
                  ? "bg-primary border-primary text-white shadow-xs font-semibold"
                  : "bg-white border-slate-200/80 text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={dict?.shop?.searchPlaceholder || (locale === "vi" ? "Tìm kiếm giao diện..." : "Search templates...")}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
            />
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xs font-medium text-slate-400 hidden sm:inline">
              {dict?.shop?.sortLabel || (locale === "vi" ? "Sắp xếp:" : "Sort:")}
            </span>
            <select 
              className="bg-white text-xs font-medium text-slate-700 focus:outline-none cursor-pointer py-2 pl-3 pr-7 border border-slate-200/80 rounded-xl shadow-xs"
              value={currentSort}
              onChange={(e) => handleSortSelect(e.target.value)}
            >
              <option value="newest">{dict?.shop?.sortNewest || (locale === "vi" ? "Mới nhất" : "Newest")}</option>
              <option value="price_asc">{dict?.shop?.sortPriceAsc || (locale === "vi" ? "Giá: Thấp đến Cao" : "Price: Low to High")}</option>
              <option value="price_desc">{dict?.shop?.sortPriceDesc || (locale === "vi" ? "Giá: Cao đến Thấp" : "Price: High to Low")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Sidebar Filters */}
          <aside className="lg:col-span-3 space-y-6">

            {/* Price Filter */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
              <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-900 mb-4">
                <SlidersHorizontal size={14} className="text-primary" />
                {dict?.shop?.filterPrice || (locale === "vi" ? "Khoảng giá bản quyền" : "License Price Range")}
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
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between mt-3 text-xs text-slate-500 font-normal">
                <span>Min: {formatCurrency(0, locale)}</span>
                <span className="font-bold text-primary font-mono">
                  Max: {formatCurrency(maxPrice, locale)}
                </span>
              </div>
            </div>

            {/* Tech Stack Filters */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
              <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-900 mb-4">
                <Search size={14} className="text-primary" />
                {dict?.shop?.filterTech || (locale === "vi" ? "Công nghệ tích hợp" : "Tech Stack")}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {techFilters.map((tech) => {
                  const isSelected = selectedTech.includes(tech);
                  return (
                    <button
                      key={tech}
                      onClick={() => toggleTech(tech)}
                      className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? "bg-primary border border-primary text-white shadow-xs font-semibold"
                          : "bg-slate-50 border border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm animate-pulse">
                    <div className="aspect-[16/10] bg-slate-100" />
                    <div className="p-5 space-y-3">
                      <div className="h-2.5 bg-slate-100 w-1/3 rounded" />
                      <div className="h-4 bg-slate-100 w-3/4 rounded" />
                      <div className="h-2.5 bg-slate-100 w-full rounded" />
                      <div className="h-4 bg-slate-100 w-1/4 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center shadow-sm">
                <Search size={40} className="text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-extrabold text-slate-900 mb-1 tracking-tight">
                  {dict?.shop?.emptyTitle || (locale === "vi" ? "Không tìm thấy mã nguồn phù hợp" : "No matching source code found")}
                </h3>
                <p className="text-slate-500 text-xs">
                  {dict?.shop?.emptyDesc || (locale === "vi" ? "Hãy thử thay đổi bộ lọc hoặc mở rộng khoảng giá của bạn." : "Try adjusting your search query or expanding your price filter range.")}
                </p>
              </div>
            ) : (
              <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product: Product) => {
                  const isFree = product.price === 0;

                  return (
                    <div
                      key={product.id}
                      className="product-card-anim bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-primary/40 transition-all duration-300 group flex flex-col h-full"
                    >
                      {/* Visual Frame */}
                      <div className="relative overflow-hidden aspect-[16/10] bg-slate-50">
                        <Link href={`${ROUTES.PRODUCT}/${product.id}`}>
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={getLocalizedText(product.title as unknown as Record<string, string>, locale)}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Monitor size={30} />
                            </div>
                          )}
                        </Link>
                        
                        <div className="absolute top-3 left-3 backdrop-blur-md bg-slate-950/75 border border-white/15 text-white rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase shadow-xs pointer-events-none flex items-center gap-1.5">
                          {isFree ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>{dict?.common?.free || (locale === "vi" ? "Miễn phí" : "Free")}</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              <span>{dict?.common?.premium || "Premium"}</span>
                            </>
                          )}
                        </div>

                        {/* Floating Quick Add Button on Thumbnail Hover */}
                        <QuickAddButton
                          product={{
                            id: product.id,
                            productId: product.id,
                            title: product.title as unknown as Record<string, string>,
                            price: Number(product.price),
                            imageUrl: product.imageUrl || undefined,
                            quantity: 1,
                          }}
                          hasVariants={false}
                        />
                      </div>

                      {/* Info Body */}
                      <div className="p-5 flex flex-col flex-grow justify-between">
                        <div className="space-y-2 mb-4">
                          <div className="flex flex-wrap gap-1">
                            {(product.techStack && product.techStack.length > 0
                              ? product.techStack.slice(0, 3)
                              : ["Next.js 16", "Tailwind 4"]
                            ).map((tech) => (
                              <span key={tech} className="bg-slate-50 border border-slate-200/60 text-slate-600 text-[11px] font-mono font-normal px-2 py-0.5 rounded-md">
                                {tech}
                              </span>
                            ))}
                            {product.techStack && product.techStack.length > 3 && (
                              <span className="bg-slate-50 border border-slate-200/60 text-slate-400 text-[10px] font-mono font-normal px-1.5 py-0.5 rounded-md">
                                +{product.techStack.length - 3}
                              </span>
                            )}
                          </div>
                          <Link href={`${ROUTES.PRODUCT}/${product.id}`}>
                            <h3 className="text-[15px] font-semibold text-slate-900 group-hover:text-primary transition-colors line-clamp-1 tracking-tight">
                              {getLocalizedText(product.title as unknown as Record<string, string>, locale)}
                            </h3>
                          </Link>
                          <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed font-normal min-h-[38px]">
                            {getLocalizedText(product.description as unknown as Record<string, string>, locale) || (locale === "vi" ? "Giao diện website cao cấp được thiết kế tỉ mỉ, đầy đủ công nghệ hiện đại." : "High-fidelity website template engineered with state-of-the-art modern technologies.")}
                          </p>
                        </div>

                        {/* Card Footer: 2-Tier Structured Layout (Zero overlapping, 100% consistent) */}
                        <div className="pt-3.5 border-t border-slate-100 mt-auto">
                          {/* Price & Status Row */}
                          <div className="flex items-end justify-between gap-2 mb-3">
                            <div className="min-w-0">
                              <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">
                                {dict?.shop?.priceLabel || (locale === "vi" ? "Giá bản quyền" : "License Price")}
                              </span>
                              <div className="flex items-baseline gap-1 font-mono">
                                <span className="text-base sm:text-lg font-bold text-primary tracking-tight">
                                  {isFree ? (dict?.common?.free?.toUpperCase() || (locale === "vi" ? "MIỄN PHÍ" : "FREE")) : formatCurrency(product.price, locale)}
                                </span>
                                {!isFree && (
                                  <span className="text-[11px] font-normal text-slate-400 font-sans">
                                    {locale === "vi" ? "/ trọn đời" : "/ lifetime"}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="shrink-0">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>{locale === "vi" ? "Sẵn sàng" : "Instant"}</span>
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons Row: Grid 2-cols ensures uniform height and zero overlap */}
                          <div className="grid grid-cols-2 gap-2">
                            {product.demoUrl ? (
                              /* Routes to in-app responsive sandbox viewer at /demo/[id] which proxies demoUrl and adds viewport controls */
                              <Link 
                                href={`/demo/${product.id}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="h-9 rounded-xl text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300 transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98]"
                              >
                                <Eye size={13} className="text-slate-500" />
                                <span>{dict?.shop?.demoButton || (locale === "vi" ? "Xem Demo" : "Live Demo")}</span>
                              </Link>
                            ) : (
                              <div className="h-9 rounded-xl text-xs font-medium bg-slate-50/60 text-slate-400 border border-slate-100 flex items-center justify-center gap-1.5 cursor-default select-none">
                                <Code2 size={13} className="text-slate-300" />
                                <span>{locale === "vi" ? "Mã nguồn" : "Source Code"}</span>
                              </div>
                            )}

                            <Link 
                              href={`${ROUTES.PRODUCT}/${product.id}`}
                              className="h-9 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-white shadow-2xs shadow-primary/20 transition-all flex items-center justify-center gap-1.5 group/btn active:scale-[0.98]"
                            >
                              <span>{dict?.shop?.detailsButton || (locale === "vi" ? "Chi tiết" : "Details")}</span>
                              <ArrowRight size={13} className="transition-transform group-hover/btn:translate-x-0.5" />
                            </Link>
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
