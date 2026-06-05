"use client";

import { useCart } from "@/presentation/hooks/useCart";
import { useCartDrawerStore } from "@/presentation/hooks/useCartDrawerStore";

export default function NavbarCartIcon() {
  const { totalItems } = useCart();
  const { toggleDrawer } = useCartDrawerStore();

  return (
    <button 
      onClick={() => {
        toggleDrawer();
      }}
      className="hover:text-slate-950 transition-colors relative cursor-pointer p-1 focus:outline-none"
    >
      <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
      {totalItems > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-[#2563eb] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center animate-in fade-in zoom-in duration-300">
          {totalItems}
        </span>
      )}
    </button>
  );
}
