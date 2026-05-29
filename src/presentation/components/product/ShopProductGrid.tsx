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
  const [selectedCategory, setSelectedCategory] = useState<string>("All Pieces");
  const [selectedMaterials, setSelectedMaterials] = useState<readonly string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(10000000); // 10M VND
  const [isLoading, setIsLoading] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Category mapping
  const categoryMap: Record<string, string> = {
    "Outerwear": "outerwear",
    "Knitwear": "knitwear",
    "Accessories": "accessories",
    "Home": "home"
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // Category Filter
      if (selectedCategory !== "All Pieces") {
        const mappedCat = categoryMap[selectedCategory];
        if (product.categoryId?.toLowerCase() !== mappedCat && 
            !product.title.toLowerCase().includes(mappedCat)) {
          return false;
        }
      }
      
      // Price Filter (in VND, converting $ range to VND or matching directly)
      if (product.price > maxPrice) {
        return false;
      }
      
      // Material Filter
      if (selectedMaterials.length > 0) {
        const descriptionMatch = selectedMaterials.some((mat) => 
          product.description?.toLowerCase().includes(mat.toLowerCase())
        );
        if (!descriptionMatch) return false;
      }

      return true;
    });
  }, [initialProducts, selectedCategory, selectedMaterials, maxPrice]);

  // Handle category toggle
  const handleCategorySelect = (category: string) => {
    setIsLoading(true);
    setSelectedCategory(category);
    setTimeout(() => {
      setIsLoading(false);
    }, 450); // Simulate skeletal loading delay for premium feel
  };

  // Handle material toggle
  const toggleMaterial = (material: string) => {
    setIsLoading(true);
    setSelectedMaterials((prev) => 
      prev.includes(material) ? prev.filter((m) => m !== material) : [...prev, material]
    );
    setTimeout(() => {
      setIsLoading(false);
    }, 450);
  };

  // GSAP Grid animation when loading resolves or items change
  useEffect(() => {
    if (!isLoading && gridRef.current) {
      const items = gridRef.current.querySelectorAll(".product-card-anim");
      if (items.length > 0) {
        // Kill active tweens on these elements to prevent overlaps
        gsap.killTweensOf(items);
        
        gsap.fromTo(items,
          { opacity: 0, y: 30, scale: 0.95 },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1, 
            duration: 0.6, 
            ease: "power3.out", 
            stagger: 0.08,
            overwrite: "auto"
          }
        );
      }
    }
  }, [isLoading, filteredProducts]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      
      {/* Filters Sidebar */}
      <aside className="lg:col-span-3 space-y-10">
        <div>
          <h3 className="text-[11px] font-bold text-slate-950 uppercase tracking-[0.2em] mb-6">Categories</h3>
          <ul className="space-y-4">
            {["All Pieces", "Outerwear", "Knitwear", "Accessories", "Home"].map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => handleCategorySelect(cat)}
                  className={`text-sm transition-all duration-300 relative py-1 focus:outline-none cursor-pointer ${
                    selectedCategory === cat 
                      ? "text-slate-950 font-bold translate-x-1" 
                      : "text-slate-500 hover:text-slate-950"
                  }`}
                >
                  {cat}
                  {selectedCategory === cat && (
                    <span className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-bold text-slate-950 uppercase tracking-[0.2em] mb-6">Price Limit</h3>
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
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-950" 
            />
            <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-500 uppercase">
              <span>Min</span>
              <span className="text-slate-900 font-bold">Max: VND {maxPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-bold text-slate-950 uppercase tracking-[0.2em] mb-6">Material</h3>
          <div className="flex flex-wrap gap-2">
            {["Cotton", "Wool", "Nylon", "Silk"].map((mat) => {
              const isSelected = selectedMaterials.includes(mat);
              return (
                <button 
                  key={mat}
                  onClick={() => toggleMaterial(mat)}
                  className={`px-3.5 py-2 border rounded-full text-[10px] font-bold transition-all uppercase tracking-wider cursor-pointer ${
                    isSelected 
                      ? "bg-slate-950 border-slate-950 text-white shadow-md scale-105" 
                      : "border-slate-100 text-slate-500 hover:border-slate-900 hover:text-slate-900"
                  }`}
                >
                  {mat}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Product Grid Area */}
      <div className="lg:col-span-9">
        {isLoading ? (
          // Shimmering Skeletal loader layout
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col space-y-4 animate-pulse">
                <div className="relative aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden Shimmer" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-4 bg-slate-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-[48px] text-slate-300 mb-4">
              search_off
            </span>
            <p className="font-bold text-slate-800 uppercase tracking-widest text-sm mb-1">No products found</p>
            <p className="text-slate-400 text-xs">Try selecting a different filter combination</p>
          </div>
        ) : (
          /* Masonry-Style Asymmetric Grid: Alternating heights using margins or column spacing */
          <div 
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16"
          >
            {filteredProducts.map((product: Product, index: number) => {
              // Creating a Masonry/Asymmetric feel by adding offset padding to alternating elements
              const isEven = index % 2 === 0;
              const hasVariants = (product.variants?.length ?? 0) > 0;
              
              return (
                <Link 
                  key={product.id} 
                  href={`${ROUTES.PRODUCT}/${product.id}`} 
                  className={`group flex flex-col product-card-anim will-change-transform ${
                    isEven ? "mt-0" : "sm:mt-8"
                  }`}
                >
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-slate-50 mb-6 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                    {product.imageUrl ? (
                      <img 
                        alt={product.title} 
                        className="w-full h-full object-cover mix-blend-multiply opacity-90 transition-transform duration-1000 group-hover:scale-105" 
                        src={product.imageUrl} 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/95 text-slate-900 text-[9px] font-black px-2 py-1 rounded-sm uppercase tracking-widest border border-slate-100/50">
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
                      hasVariants={hasVariants}
                    />
                  </div>
                  
                  <div className="space-y-1 py-1">
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#2563eb] transition-colors line-clamp-1">
                      {product.title}
                    </h3>
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black">
                      Premium Collection
                    </p>
                    <p className="font-bold text-slate-900 text-sm mt-2">
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
