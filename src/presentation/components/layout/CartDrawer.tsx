"use client";

import { useCart } from "@/presentation/hooks/useCart";
import { useCartDrawerStore } from "@/presentation/hooks/useCartDrawerStore";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ROUTES } from "@/presentation/constants";
import { useEffect, useRef } from "react";

export default function CartDrawer() {
  const { items, subtotal, removeItem, updateQuantity, isLoading } = useCart();
  const { isOpen, closeDrawer } = useCartDrawerStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on ESC keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDrawer();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeDrawer]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark Glassmorphism Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm cursor-pointer"
          />

          {/* Sliding Side-Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[420px] bg-[#F8FAFC] z-50 shadow-2xl flex flex-col h-full border-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 bg-white soft-elevation">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-900">shopping_bag</span>
                <h2 className="text-lg font-playfair font-bold text-slate-900 tracking-wide">Your Gourmet Order</h2>
                <span className="bg-slate-100 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded-full font-manrope">
                  {items.reduce((acc, curr) => acc + curr.quantity, 0)}
                </span>
              </div>
              <button 
                onClick={closeDrawer}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors focus:outline-none"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {isLoading && items.length === 0 ? (
                // Premium Skeletal Shimmering Loader
                <div className="space-y-4 py-8">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="w-20 h-24 bg-slate-200" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-slate-200 w-3/4" />
                        <div className="h-3 bg-slate-200 w-1/2" />
                        <div className="h-3 bg-slate-200 w-1/4 mt-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <span className="material-symbols-outlined text-[48px] text-slate-350 mb-4">
                    shopping_bag
                  </span>
                  <p className="text-slate-800 font-bold text-sm mb-2 uppercase tracking-widest font-manrope">Your order is empty</p>
                  <p className="text-slate-400 text-xs mb-8 font-manrope">Select signature delicacies to start</p>
                  <button 
                    onClick={closeDrawer}
                    className="bg-slate-950 text-white font-button text-button uppercase tracking-widest px-8 py-4 hover:bg-slate-900 transition-colors"
                  >
                    Explore Menu Board
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {items.map((item, index) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-4 p-4 bg-white soft-elevation transition-all group rounded-none"
                      >
                        <div className="w-20 h-24 bg-slate-50 overflow-hidden relative flex-shrink-0">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.title} 
                              className="w-full h-full object-cover grayscale opacity-90 transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              No Image
                            </div>
                          )}
                        </div>

                        <div className="flex-1 flex flex-col justify-between py-0.5">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="font-playfair font-bold text-slate-900 text-sm line-clamp-2 leading-tight">
                                {item.title}
                              </h3>
                              <button 
                                onClick={() => removeItem(item.id)}
                                className="text-slate-350 hover:text-accent-gold transition-colors"
                                aria-label="Remove item"
                              >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                              </button>
                            </div>
                            {item.variantName && (
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 font-manrope">
                                Portion: {item.variantName}
                              </p>
                            )}
                          </div>

                          <div className="flex justify-between items-end mt-4">
                            <div className="flex items-center bg-[#F1F5F9] px-2 py-1">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors focus:outline-none text-xs"
                                aria-label="Decrease quantity"
                              >
                                -
                              </button>
                              <span className="text-slate-800 text-xs font-bold w-6 text-center select-none font-manrope">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors focus:outline-none text-xs"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                            <span className="font-bold text-slate-900 text-xs font-manrope">
                              VND {(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer Summary (Checkout CTA) */}
            {items.length > 0 && (
              <div className="border-none px-8 py-6 bg-white soft-elevation space-y-5">
                <div className="flex justify-between items-center text-slate-900 font-bold">
                  <span className="font-label-caps text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Subtotal</span>
                  <span className="text-base font-manrope">VND {subtotal.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-manrope leading-relaxed">
                  Complimentary temperature-controlled premium delivery is included with this selection.
                </p>
                <div className="grid grid-cols-1 gap-2 pt-2">
                  <Link 
                    href={ROUTES.CHECKOUT}
                    onClick={closeDrawer}
                    className="w-full bg-slate-950 text-white font-button text-button py-5 hover:bg-slate-900 transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-widest shadow-lg"
                  >
                    Proceed to Checkout
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                  <button 
                    onClick={closeDrawer}
                    className="w-full bg-transparent border-none text-slate-500 hover:text-slate-900 font-button text-[10px] uppercase tracking-widest py-3 hover:translate-x-1 transition-all"
                  >
                    Continue Exploring
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
