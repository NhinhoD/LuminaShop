"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import QuickAddButton from "./QuickAddButton";
import { Product } from "@/domain/entities/Product";
import { ROUTES } from "@/presentation/constants";
import { formatCurrency } from "@/lib/utils";
import gsap from "gsap";

interface ShopProductGridProps {
  readonly initialProducts: readonly Product[];
}

export default function ShopProductGrid({ initialProducts }: ShopProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Dishes");
  const [selectedDietary, setSelectedDietary] = useState<readonly string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(10000000); // 10M VND
  const [isLoading, setIsLoading] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Category mapping for F&B
  const categoryMap: Record<string, string> = {
    "Appetizers": "appetizer",
    "Main Courses": "main",
    "Desserts": "dessert",
    "Mocktails": "mocktail"
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // Category Filter
      if (selectedCategory !== "All Dishes") {
        const mappedCat = categoryMap[selectedCategory];
        if (product.categoryId?.toLowerCase() !== mappedCat && 
            !product.title.toLowerCase().includes(mappedCat) &&
            !product.description?.toLowerCase().includes(mappedCat)) {
          return false;
        }
      }
      
      // Price Filter
      if (product.price > maxPrice) {
        return false;
      }
      
      // Dietary / Profile Filter
      if (selectedDietary.length > 0) {
        const match = selectedDietary.some((diet) => 
          product.description?.toLowerCase().includes(diet.toLowerCase()) ||
          product.title.toLowerCase().includes(diet.toLowerCase())
        );
        if (!match) return false;
      }

      return true;
    });
  }, [initialProducts, selectedCategory, selectedDietary, maxPrice]);

  // Handle category toggle
  const handleCategorySelect = (category: string) => {
    setIsLoading(true);
    setSelectedCategory(category);
    setTimeout(() => {
      setIsLoading(false);
    }, 450); // Premium skeletal loading delay
  };

  // Handle dietary preference toggle
  const toggleDietary = (diet: string) => {
    setIsLoading(true);
    setSelectedDietary((prev) => 
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]
    );
    setTimeout(() => {
      setIsLoading(false);
    }, 450);
  };

  // GSAP Grid animation when loading resolves or items change
  useEffect(() => {
    const currentGrid = gridRef.current;
    if (!isLoading && currentGrid) {
      const items = currentGrid.querySelectorAll(".product-card-anim");
      if (items.length > 0) {
        gsap.killTweensOf(items);
        
        gsap.fromTo(items,
          { opacity: 0, y: 30, scale: 0.98 },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1, 
            duration: 0.7, 
            ease: "power3.out", 
            stagger: 0.06,
            overwrite: "auto"
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 bg-[#F8FAFC] p-8 md:p-12 soft-elevation">
      
      {/* Filters Sidebar */}
      <aside className="lg:col-span-3 space-y-12">
        <div>
          <h3 className="font-label-caps text-[10px] text-slate-400 uppercase tracking-[0.25em] mb-6">Culinary Categories</h3>
          <ul className="space-y-4">
            {["All Dishes", "Appetizers", "Main Courses", "Desserts", "Mocktails"].map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => handleCategorySelect(cat)}
                  className={`font-manrope text-sm transition-all duration-300 relative py-1 focus:outline-none cursor-pointer flex items-center ${
                    selectedCategory === cat 
                      ? "text-slate-950 font-bold translate-x-1" 
                      : "text-slate-500 hover:text-slate-950"
                  }`}
                >
                  {selectedCategory === cat && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-gold mr-2.5 animate-pulse" />
                  )}
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-label-caps text-[10px] text-slate-400 uppercase tracking-[0.25em] mb-6">Price Ceiling</h3>
          <div className="px-2">
            <input 
              type="range" 
              min="0"
              max="15000000"
              step="500000"
              value={maxPrice}
              onChange={(e) => {
                setIsLoading(true);
                setMaxPrice(Number(e.target.value));
                setTimeout(() => setIsLoading(false), 300);
              }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-950" 
            />
            <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase font-manrope">
              <span>Min</span>
              <span className="text-slate-900 font-bold">Max: VND {maxPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-label-caps text-[10px] text-slate-400 uppercase tracking-[0.25em] mb-6">Dietary Profile</h3>
          <div className="flex flex-wrap gap-2">
            {["Organic", "Gluten-Free", "Vegan", "Chef Special"].map((diet) => {
              const isSelected = selectedDietary.includes(diet);
              return (
                <button 
                  key={diet}
                  onClick={() => toggleDietary(diet)}
                  className={`px-4 py-2 text-[10px] font-bold transition-all uppercase tracking-wider cursor-pointer rounded-none font-manrope ${
                    isSelected 
                      ? "bg-slate-950 text-white shadow-sm" 
                      : "bg-[#F1F5F9] text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {diet}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Product Grid Area */}
      <div className="lg:col-span-9">
        {isLoading ? (
          // Premium skeletal shimmers
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col space-y-4 animate-pulse">
                <div className="relative aspect-[3/4] bg-slate-200 rounded-none overflow-hidden" />
                <div className="h-4 bg-slate-200 w-3/4" />
                <div className="h-3 bg-slate-200 w-1/2" />
                <div className="h-4 bg-slate-200 w-1/4" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white soft-elevation p-12">
            <span className="material-symbols-outlined text-[48px] text-slate-350 mb-4">
              search_off
            </span>
            <p className="font-headline-md text-lg text-slate-800 mb-2">No selections found</p>
            <p className="text-slate-400 text-xs font-manrope">Please alter your culinary attributes or preferences.</p>
          </div>
        ) : (
          /* Asymmetric Masonry product grids without borders */
          <div 
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16"
          >
            {filteredProducts.map((product: Product, index: number) => {
              const isEven = index % 2 === 0;
              const hasVariants = (product.variants?.length ?? 0) > 0;
              
              return (
                <Link 
                  key={product.id} 
                  href={`${ROUTES.PRODUCT}/${product.id}`} 
                  className={`group flex flex-col product-card-anim will-change-transform bg-white p-6 soft-elevation ${
                    isEven ? "mt-0" : "sm:mt-8"
                  }`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#F8FAFC] mb-6 rounded-none">
                    {product.imageUrl ? (
                      <img 
                        alt={product.title} 
                        className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-transform duration-1000 group-hover:scale-105" 
                        src={product.imageUrl} 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-slate-950 text-white text-[9px] font-label-caps px-2.5 py-1.5 uppercase tracking-widest">
                        Fresh
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
                      hasVariants={hasVariants}
                    />
                  </div>
                  
                  <div className="space-y-1 py-1">
                    <h3 className="font-playfair font-bold text-slate-900 text-base group-hover:text-accent-gold transition-colors line-clamp-1">
                      {product.title}
                    </h3>
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold font-manrope">
                      Gourmet Offering
                    </p>
                    <p className="font-bold text-slate-950 text-sm mt-3 font-manrope">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
