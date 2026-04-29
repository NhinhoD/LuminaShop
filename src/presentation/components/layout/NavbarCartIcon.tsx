"use client";

import Link from "next/link";
import { useCart } from "@/presentation/components/common/CartContext";
import { ROUTES } from "@/presentation/constants";

export default function NavbarCartIcon() {
  const { totalItems } = useCart();

  return (
    <Link href={ROUTES.CART} className="hover:text-slate-950 transition-colors relative">
      <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1.5 bg-[#0051d5] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center animate-in fade-in zoom-in duration-300">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
