"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import React from "react";
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingCart, 
  Users, 
  Globe, 
  Languages, 
  Settings 
} from "lucide-react";

interface NavLinkProps {
  href: string;
  icon: string;
  children: React.ReactNode;
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  dashboard: LayoutDashboard,
  inventory_2: Package,
  products: Package,
  category: FolderTree,
  categories: FolderTree,
  shopping_cart: ShoppingCart,
  orders: ShoppingCart,
  group: Users,
  customers: Users,
  language: Globe,
  languages: Globe,
  translate: Languages,
  translations: Languages,
  settings: Settings,
};

export function NavLink({ href, icon, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
  const IconComponent = ICON_MAP[icon] || LayoutDashboard;

  return (
    <li>
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 px-3.5 py-2.5 transition-all duration-150 ease-in-out rounded-xl group text-sm font-medium",
          isActive
            ? "bg-primary text-white shadow-xs font-semibold"
            : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
        )}
      >
        <IconComponent 
          size={18} 
          className={cn(
            "transition-colors flex-shrink-0",
            isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900"
          )} 
        />
        <span>{children}</span>
      </Link>
    </li>
  );
}
