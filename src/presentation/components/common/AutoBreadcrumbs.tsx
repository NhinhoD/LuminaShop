"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useBreadcrumbs } from "./BreadcrumbContext";
import { ROUTES } from "@/presentation/constants";
import { ChevronRight } from "lucide-react";

export function AutoBreadcrumbs() {
  const pathname = usePathname();
  const router = useRouter();
  const { customLabels } = useBreadcrumbs();
  
  if (pathname === ROUTES.HOME) return null;

  const segments = pathname.split("/").filter((v) => v.length > 0);
  
  const breadcrumbs = [
    { label: "Home", href: ROUTES.HOME },
    ...segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      let label = customLabels[href] || (segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "));
      if (!customLabels[href] && segment.length > 20) label = "Detail"; 
      return { label, href };
    }),
  ];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (typeof document !== "undefined" && document.referrer.includes(href)) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <div className="bg-slate-50/80 border-b border-slate-200/80 font-sans">
      <nav className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 flex items-center space-x-2 text-xs py-3 text-slate-500 font-medium">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <div key={item.href} className="flex items-center space-x-2">
              {index > 0 && (
                <ChevronRight size={13} className="text-slate-400 select-none flex-shrink-0" />
              )}
              
              {isLast ? (
                <span className="text-slate-900 font-bold truncate">
                  {item.label}
                </span>
              ) : (
                <Link 
                  href={item.href}
                  onClick={(e) => handleClick(e, item.href)}
                  className="hover:text-primary transition-colors text-slate-600 font-medium"
                >
                  {item.label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
