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
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm cursor-pointer"
          />

          {/* Sliding Side-Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[420px] bg-white z-50 shadow-2xl flex flex-col h-full border-l border-slate-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-800">shopping_bag</span>
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-widest">Your Bag</h2>
                <span className="bg-slate-100 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {items.reduce((acc, curr) => acc + curr.quantity, 0)}
                </span>
              </div>
              <button 
                onClick={closeDrawer}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors focus:outline-none"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {isLoading && items.length === 0 ? (
                // Shimmering Skeletal Loader for Cart Item
                <div className="space-y-4 py-8">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="w-20 h-24 bg-slate-100 rounded" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-slate-100 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                        <div className="h-3 bg-slate-100 rounded w-1/4 mt-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <span className="material-symbols-outlined text-[48px] text-slate-300 mb-4 animate-bounce">
                    shopping_bag
                  </span>
                  <p className="text-slate-800 font-bold text-sm mb-1 uppercase tracking-wider">Your bag is empty</p>
                  <p className="text-slate-400 text-xs mb-6">Add beautiful essential pieces to start</p>
                  <button 
                    onClick={closeDrawer}
                    className="bg-slate-950 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded hover:bg-slate-800 transition-colors"
                  >
                    Continue Shopping
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
                        className="flex gap-4 p-3 border border-slate-100 rounded-lg hover:border-slate-200 transition-all group"
                      >
                        <div className="w-20 h-24 bg-slate-50 rounded overflow-hidden relative flex-shrink-0">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.title} 
                              className="w-full h-full object-cover mix-blend-multiply opacity-90 transition-transform duration-500 group-hover:scale-105"
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
                              <h3 className="font-bold text-slate-900 text-xs line-clamp-2 leading-tight">
                                {item.title}
                              </h3>
                              <button 
                                onClick={() => removeItem(item.id)}
                                className="text-slate-300 hover:text-red-500 transition-colors"
                                aria-label="Remove item"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </div>
                            {item.variantName && (
                              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
                                Size: {item.variantName}
                              </p>
                            )}
                          </div>

                          <div className="flex justify-between items-end mt-2">
                            <div className="flex items-center border border-slate-100 rounded-sm">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors focus:outline-none text-xs"
                                aria-label="Decrease quantity"
                              >
                                -
                              </button>
                              <span className="text-slate-800 text-xs font-bold w-6 text-center select-none">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors focus:outline-none text-xs"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                            <span className="font-bold text-slate-900 text-xs">
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
              <div className="border-t border-slate-100 px-6 py-6 bg-slate-50 space-y-4">
                <div className="flex justify-between items-center text-slate-900 font-bold">
                  <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Subtotal</span>
                  <span className="text-base">VND {subtotal.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  Shipping, taxes, and discounts calculated at checkout.
                </p>
                <div className="grid grid-cols-1 gap-2 pt-2">
                  <Link 
                    href={ROUTES.CHECKOUT}
                    onClick={closeDrawer}
                    className="w-full bg-slate-950 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    Proceed to Checkout
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                  <button 
                    onClick={closeDrawer}
                    className="w-full bg-transparent border border-slate-200 text-slate-800 font-bold text-[10px] uppercase tracking-widest py-3.5 rounded-sm hover:border-slate-900 hover:text-slate-950 transition-all"
                  >
                    Continue Shopping
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
