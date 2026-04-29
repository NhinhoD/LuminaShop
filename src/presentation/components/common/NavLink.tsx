"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  icon: string;
  children: React.ReactNode;
}

export function NavLink({ href, icon, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <li>
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 px-4 py-3 transition-all duration-200 ease-in-out rounded-lg group",
          isActive
            ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-50"
        )}
      >
        <span 
          className={cn(
            "material-symbols-outlined transition-colors",
            isActive ? "text-[#0051d5]" : "text-slate-400 group-hover:text-slate-600"
          )}
          style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          {icon}
        </span>
        {children}
      </Link>
    </li>
  );
}
