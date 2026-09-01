"use client";

import { useCart } from "@/presentation/hooks/useCart";
import { useCartDrawerStore } from "@/presentation/hooks/useCartDrawerStore";
import { ShoppingCart } from "lucide-react";
import { useI18n } from "@/presentation/components/common/I18nContext";

export default function NavbarCartIcon() {
  const { totalItems } = useCart();
  const { toggleDrawer } = useCartDrawerStore();
  const { dict } = useI18n();

  return (
    <button 
      onClick={() => toggleDrawer()}
      className="p-2 rounded-lg text-[#555] hover:bg-slate-100 hover:text-[#0051d5] transition-all relative cursor-pointer focus:outline-none flex items-center justify-center active:scale-95"
      aria-label={dict?.cart?.title || "Shopping Cart"}
      title={dict?.cart?.title || "Shopping Cart"}
      type="button"
    >
      <ShoppingCart size={18} className="transition-transform group-hover:scale-110" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#0051d5] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-md shadow-blue-500/30 animate-in fade-in zoom-in duration-300">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </button>
  );
}
