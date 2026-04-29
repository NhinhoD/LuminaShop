"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useBreadcrumbs } from "./BreadcrumbContext";
import { ROUTES, UI_CONFIG } from "@/presentation/constants";

/**
 * AutoBreadcrumbs Component
 * Automatically generates breadcrumbs based on the current URL path.
 * Format: Home > Segment 1 > Segment 2 ...
 */
export function AutoBreadcrumbs() {
  const pathname = usePathname();
  const router = useRouter();
  const { customLabels } = useBreadcrumbs();
  const [referrer, setReferrer] = useState("");

  useEffect(() => {
    if (typeof document !== "undefined") {
      setReferrer(document.referrer);
    }
  }, []);

  // Don't show breadcrumbs on the homepage
  if (pathname === ROUTES.HOME) return null;

  // Split path into segments and filter out empty ones
  const segments = pathname.split("/").filter((v) => v.length > 0);
  
  // Create breadcrumb items
  const breadcrumbs = [
    { label: "Home", href: ROUTES.HOME },
    ...segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      
      // Use custom label if available, otherwise format the segment
      let label = customLabels[href] || (segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "));
      
      // Fallback for long technical segments
      if (!customLabels[href] && segment.length > 20) label = "Detail"; 

      return { label, href };
    }),
  ];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (referrer.includes(href)) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <div className="bg-white border-b border-slate-50">
      <nav className={`max-w-[${UI_CONFIG.MAX_WIDTH}] mx-auto px-8 md:px-12 flex items-center space-x-3 text-[13px] py-4 text-slate-500 font-medium`}>
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <div key={item.href} className="flex items-center space-x-3">
              {index > 0 && (
                <span className="text-slate-300 font-normal select-none">{'>'}</span>
              )}
              
              {isLast ? (
                <span className="text-slate-900 font-bold truncate">
                  {item.label}
                </span>
              ) : (
                <Link 
                  href={item.href}
                  onClick={(e) => handleClick(e, item.href)}
                  className={`hover:text-[${UI_CONFIG.ACCENT_COLOR}] hover:underline transition-all underline-offset-4`}
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
