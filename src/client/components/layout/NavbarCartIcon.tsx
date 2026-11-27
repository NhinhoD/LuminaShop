"use client";

import { useCart } from "@/client/hooks/useCart";
import { useCartDrawerStore } from "@/client/hooks/useCartDrawerStore";
import { ShoppingBag } from "lucide-react";
import { useI18n } from "@/client/components/common/I18nContext";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Cart trigger for the storefront navigation.
 *
 * Uses the same square hairline treatment as the other action buttons; the
 * badge stays animated because it is a genuine interaction surface.
 *
 * @returns Cart button with an animated item counter.
 */
export default function NavbarCartIcon(): React.JSX.Element {
  const { totalItems } = useCart();
  const { toggleDrawer } = useCartDrawerStore();
  const { dict } = useI18n();

  return (
    <button
      onClick={() => toggleDrawer()}
      className="relative flex h-9 w-9 items-center justify-center border border-border text-dark/70 transition-colors hover:border-dark hover:text-dark focus-visible:outline-none"
      aria-label={dict.cart.title}
      title={dict.cart.title}
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
            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center bg-primary font-mono text-[9px] font-bold text-dark"
          >
            {totalItems > 99 ? "99+" : totalItems}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
