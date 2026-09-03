"use client";

import { useCart } from "@/presentation/hooks/useCart";
import { useCartDrawerStore } from "@/presentation/hooks/useCartDrawerStore";
import { ShoppingBag } from "lucide-react";
import { useI18n } from "@/presentation/components/common/I18nContext";
import { motion, AnimatePresence } from "framer-motion";

export default function NavbarCartIcon() {
  const { totalItems } = useCart();
  const { toggleDrawer } = useCartDrawerStore();
  const { dict } = useI18n();

  return (
    <button 
      onClick={() => toggleDrawer()}
      className="relative w-9 h-9 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none flex items-center justify-center border border-slate-100"
      aria-label={dict?.cart?.title || "Shopping Cart"}
      title={dict?.cart?.title || "Shopping Cart"}
      type="button"
    >
      <ShoppingBag size={15} />
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.span 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 450, damping: 25 }}
            className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-mono shadow-2xs"
          >
            {totalItems > 99 ? "99+" : totalItems}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
