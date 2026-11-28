"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import QuickAddButton from "./QuickAddButton";
import { Product } from "@/shared/types/product";
import { Category } from "@/shared/types/category";
import { ROUTES } from "@/shared/constants";
import { formatCurrency, resolveCleanPreviewUrl } from "@/shared/utils";
import gsap from "gsap";
import { Search, SlidersHorizontal, Monitor, ArrowUpRight, Code2 } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { useI18n } from "@/client/components/common/I18nContext";
import { getLocalizedText } from "@/shared/utils/locale";

interface ShopProductGridProps {
  initialProducts: readonly Product[];
  currentSearch: string;
  currentSort: string;
  currentCategory: string;
  initialCategory?: string;
  dbCategories?: readonly Category[];
}

/**
 * Filterable, paginated product catalog grid supporting instant search, category navigation,
 * price filtering, and dynamic responsive preview links.
 *
 * Presented as a Spec Sheet specimen index: a numbered filter rail, a square
 * hairline card grid and mono metadata. Filtering, sorting and URL state are
 * unchanged from the previous implementation.
 *
 * @param props - Shop product grid properties with products, search, sort, and categories.
 * @returns Rendered JSX element for the shop product catalog.
 */
export default function ShopProductGrid({
  initialProducts,
  currentSearch,
  currentSort,
  currentCategory,
  dbCategories,
}: ShopProductGridProps): React.JSX.Element {
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

  const shop = dict.shop;

  const categories = [
    { label: shop.allCategories, value: "all" },
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

  const updateUrl = (updates: { q?: string; category?: string; sort?: string }): void => {
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

  const handleCategorySelect = (category: string): void => {
    updateUrl({ category });
  };

  const handleSortSelect = (sort: string): void => {
    updateUrl({ sort });
  };

  const toggleTech = (tech: string): void => {
    setIsLoading(true);
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    loadingTimeoutRef.current = setTimeout(() => setIsLoading(false), 250);
  };

  const filteredProducts = initialProducts.filter((product) => {
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
    if (isLoading || !gridRef.current) return;

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(".product-card-anim");
      if (items.length > 0) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power3.out",
            stagger: 0.04,
            overwrite: "auto",
          }
        );
      }
    }, gridRef);

    return () => ctx.revert();
  }, [isLoading, filteredProducts, initialProducts]);

  return (
    <div className="border border-border border-t-2 border-t-primary bg-surface">
      {/* Index rail */}
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-2.5 sm:px-5">
        <span className="mono-meta text-[8.5px] text-dark/45">
          {shop.indexLabel} / {String(filteredProducts.length).padStart(2, "0")} {shop.resultsLabel}
        </span>
        <span className="mono-meta text-[8.5px] text-dark/30">HTML5 · CSS3 · JS · ZIP</span>
      </div>

      {/* Top filter & sort bar */}
      <div className="flex flex-col gap-4 border-b border-border bg-background-subtle/50 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex snap-x gap-1.5 overflow-x-auto pb-0.5">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategorySelect(cat.value)}
              aria-pressed={currentCategory === cat.value}
              className={`shrink-0 snap-start border px-3 py-2 text-[11.5px] font-medium leading-none transition-colors ${
                currentCategory === cat.value
                  ? "border-dark bg-dark text-background"
                  : "border-border bg-surface text-dark/65 hover:border-dark hover:text-dark"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1 lg:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dark/35" />
            <input
              type="text"
              placeholder={shop.searchPlaceholder}
              aria-label={shop.searchPlaceholder}
              className="h-9 w-full border border-border bg-surface pl-9 pr-3 text-[12px] text-dark outline-none transition-colors placeholder:text-dark/35 focus:border-dark"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
            />
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="mono-meta hidden text-[8.5px] text-dark/35 sm:inline">
              {shop.sortLabel}
            </span>
            <select
              className="h-9 cursor-pointer border border-border bg-surface py-0 pl-2.5 pr-7 text-[11.5px] font-medium text-dark/75 outline-none transition-colors focus:border-dark"
              value={currentSort}
              aria-label={shop.sortLabel}
              onChange={(e) => handleSortSelect(e.target.value)}
            >
              <option value="newest">{shop.sortNewest}</option>
              <option value="price_asc">{shop.sortPriceAsc}</option>
              <option value="price_desc">{shop.sortPriceDesc}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Sidebar filters */}
          <aside className="space-y-px self-start border border-border bg-border lg:col-span-3">
            <div className="bg-surface p-4">
              <h3 className="mono-meta mb-4 flex items-center gap-2 text-[9px] text-dark/55">
                <SlidersHorizontal size={11} className="text-primary" />
                {shop.filterPrice}
              </h3>
              <input
                type="range"
                min="0"
                max="10000000"
                step="500000"
                value={maxPrice}
                aria-label={shop.filterPrice}
                onChange={(e) => {
                  setIsLoading(true);
                  setMaxPrice(Number(e.target.value));
                  setTimeout(() => setIsLoading(false), 200);
                }}
                className="h-1 w-full cursor-pointer appearance-none rounded-none bg-border accent-primary"
              />
              <div className="mono-meta mt-3 flex justify-between text-[8px] text-dark/40">
                <span>
                  {shop.minLabel}: {formatCurrency(0, locale)}
                </span>
                <span className="text-primary">
                  {shop.maxLabel}: {formatCurrency(maxPrice, locale)}
                </span>
              </div>
            </div>

            <div className="bg-surface p-4">
              <h3 className="mono-meta mb-4 flex items-center gap-2 text-[9px] text-dark/55">
                <Search size={11} className="text-primary" />
                {shop.filterTech}
              </h3>
              <div className="flex flex-wrap gap-1">
                {techFilters.map((tech) => {
                  const isSelected = selectedTech.includes(tech);
                  return (
                    <button
                      key={tech}
                      onClick={() => toggleTech(tech)}
                      aria-pressed={isSelected}
                      className={`border px-2 py-1.5 font-mono text-[9.5px] transition-colors ${
                        isSelected
                          ? "border-dark bg-dark text-background"
                          : "border-border bg-background text-dark/60 hover:border-dark hover:text-dark"
                      }`}
                    >
                      {tech}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="lg:col-span-9">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse bg-surface">
                    <div className="aspect-[16/10] bg-background-subtle" />
                    <div className="space-y-3 p-4">
                      <div className="h-2 w-1/3 bg-background-subtle" />
                      <div className="h-3.5 w-3/4 bg-background-subtle" />
                      <div className="h-2 w-full bg-background-subtle" />
                      <div className="h-3 w-1/4 bg-background-subtle" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-start gap-3 border border-dashed border-border bg-surface p-10 sm:p-14">
                <Search size={26} className="text-dark/25" />
                <h3 className="font-display text-lg font-semibold tracking-[-0.03em] text-dark">
                  {shop.emptyTitle}
                </h3>
                <p className="max-w-sm text-[12.5px] leading-relaxed text-dark/55">{shop.emptyDesc}</p>
              </div>
            ) : (
              <div
                ref={gridRef}
                className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 xl:grid-cols-3"
              >
                {filteredProducts.map((product: Product) => {
                  const isFree = product.price === 0;
                  const title = getLocalizedText(product.title as unknown as Record<string, string>, locale);
                  const description = getLocalizedText(
                    product.description as unknown as Record<string, string>,
                    locale
                  );

                  return (
                    <div
                      key={product.id}
                      className="product-card-anim group flex h-full flex-col bg-surface transition-colors hover:bg-background"
                    >
                      {/* Specimen frame */}
                      <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-background-subtle">
                        <Link href={`${ROUTES.PRODUCT}/${product.id}`} className="block h-full w-full">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={title}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-background/35">
                              <Monitor size={26} />
                            </span>
                          )}
                        </Link>

                        <span className="pointer-events-none absolute left-2.5 top-2.5 flex items-center gap-1.5 border border-dark/15 bg-surface/95 px-1.5 py-1 backdrop-blur-sm">
                          <span
                            className={`h-1.5 w-1.5 ${isFree ? "bg-success" : "bg-primary"}`}
                          />
                          <span className="mono-meta text-[8px] text-dark/70">
                            {isFree ? dict.common.free : dict.common.premium}
                          </span>
                        </span>

                        {/* Floating quick add button on thumbnail hover */}
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

                      {/* Info body */}
                      <div className="flex flex-grow flex-col p-4">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="mono-meta text-[8px] text-dark/35">
                            {dict.homeUi.labelSpec} {product.slug.slice(0, 12)}
                          </span>
                          <span className="mono-meta text-[8px] text-dark/35">
                            {product.techStack?.[0] ?? shop.staticFile}
                          </span>
                        </div>

                        <Link href={`${ROUTES.PRODUCT}/${product.id}`} className="mt-1.5">
                          <h3 className="truncate font-display text-[1.02rem] font-semibold leading-tight tracking-[-0.03em] text-dark transition-colors group-hover:text-primary">
                            {title}
                          </h3>
                        </Link>

                        <p className="mt-2 line-clamp-2 min-h-[2.6em] text-[12px] leading-relaxed text-dark/55">
                          {description}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-1">
                          {(product.techStack && product.techStack.length > 0
                            ? product.techStack.slice(0, 3)
                            : ["HTML5", "CSS3"]
                          ).map((tech) => (
                            <span
                              key={tech}
                              className="border border-border px-1.5 py-1 text-[9.5px] leading-none text-dark/55"
                            >
                              {tech}
                            </span>
                          ))}
                          {product.techStack && product.techStack.length > 3 ? (
                            <span className="mono-meta px-1 py-1 text-[8.5px] text-dark/35">
                              +{product.techStack.length - 3}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-auto flex items-end justify-between gap-2 border-t border-border pt-3.5">
                          <div className="min-w-0">
                            <span className="mono-meta block whitespace-nowrap text-[8px] text-dark/35">
                              {shop.priceLabel}
                            </span>
                            <span className="mt-1 flex items-baseline gap-1">
                              <span
                                className={`font-mono text-[13px] font-semibold ${
                                  isFree ? "text-dark" : "text-primary"
                                }`}
                              >
                                {isFree ? dict.common.free : formatCurrency(product.price, locale)}
                              </span>
                              {!isFree ? (
                                <span className="whitespace-nowrap text-[9.5px] text-dark/35">
                                  {shop.perLifetime}
                                </span>
                              ) : null}
                            </span>
                          </div>
                          <span className="mono-meta flex shrink-0 items-center gap-1 border border-border px-1.5 py-1 text-[8px] text-dark/55">
                            <span className={`h-1.5 w-1.5 ${product.stock > 0 ? "bg-success" : "bg-dark/30"}`} />
                            {product.stock > 0 ? shop.availableLabel : dict.common.outOfStock}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-1.5">
                          {product.demoUrl ? (
                            <Link
                              href={resolveCleanPreviewUrl(product.demoUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex h-8 items-center justify-center gap-1 border border-border text-[10.5px] font-medium text-dark/65 transition-colors hover:border-dark hover:text-dark"
                            >
                              <Monitor size={11} />
                              <span>{shop.demoButton}</span>
                            </Link>
                          ) : (
                            <div className="flex h-8 select-none items-center justify-center gap-1 border border-border/60 text-[10.5px] text-dark/30">
                              <Code2 size={11} />
                              <span>{shop.staticFile}</span>
                            </div>
                          )}

                          <Link
                            href={`${ROUTES.PRODUCT}/${product.id}`}
                            className="flex h-8 items-center justify-center gap-1 bg-dark text-[10.5px] font-semibold text-background transition-colors hover:bg-primary"
                          >
                            <span>{shop.detailsButton}</span>
                            <ArrowUpRight size={11} />
                          </Link>
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
