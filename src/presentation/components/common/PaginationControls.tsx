"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
}

export function PaginationControls({ currentPage, totalPages }: PaginationControlsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-12 mb-8 font-bricolage">
      <Link
        href={createPageUrl(Math.max(1, currentPage - 1))}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
          currentPage === 1
            ? "bg-slate-50 text-slate-300 pointer-events-none"
            : "bg-white text-slate-600 hover:bg-slate-100 shadow-sm hover:shadow-md border border-slate-100"
        }`}
      >
        <ChevronLeft size={18} />
      </Link>

      {pages.map((page) => {
        const isActive = page === currentPage;
        return (
          <Link
            key={page}
            href={createPageUrl(page)}
            className="relative flex items-center justify-center w-10 h-10"
          >
            {isActive && (
              <motion.div
                layoutId="pagination-active"
                className="absolute inset-0 bg-[#0051d5] rounded-full shadow-md shadow-blue-500/20"
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            )}
            <span
              className={`relative z-10 text-sm font-bold transition-colors duration-300 ${
                isActive ? "text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {page}
            </span>
          </Link>
        );
      })}

      <Link
        href={createPageUrl(Math.min(totalPages, currentPage + 1))}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
          currentPage === totalPages
            ? "bg-slate-50 text-slate-300 pointer-events-none"
            : "bg-white text-slate-600 hover:bg-slate-100 shadow-sm hover:shadow-md border border-slate-100"
        }`}
      >
        <ChevronRight size={18} />
      </Link>
    </div>
  );
}
