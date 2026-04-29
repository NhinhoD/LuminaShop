"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumbs Component
 * Provides hierarchical navigation as requested: Home > Category > Subcategory > Product
 * Includes smart logic to restore scroll position if the link matches the previous page.
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const router = useRouter();
  const [referrer, setReferrer] = useState("");

  useEffect(() => {
    if (typeof document !== "undefined") {
      setReferrer(document.referrer);
    }
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // If we're returning to a page we just came from, use history.back() for scroll restoration
    if (referrer.includes(href)) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <nav className="flex items-center space-x-3 text-[14px] py-6 text-slate-500 font-medium">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={item.href} className="flex items-center space-x-3">
            {index > 0 && (
              <span className="text-slate-300 font-normal select-none">{'>'}</span>
            )}
            
            {isLast ? (
              <span className="text-slate-900 font-bold truncate max-w-[200px] md:max-w-none">
                {item.label}
              </span>
            ) : (
              <Link 
                href={item.href}
                onClick={(e) => handleClick(e, item.href)}
                className="hover:text-[#0051d5] hover:underline transition-all underline-offset-4"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
