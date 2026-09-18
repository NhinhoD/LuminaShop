"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/client/components/common/I18nContext";

export interface PaginationControlsProps {
  /** Current active page (1-based) */
  readonly currentPage: number;
  /** Total number of pages */
  readonly totalPages: number;
  /** Total number of items across all pages (optional, used for item counter) */
  readonly totalItems?: number;
  /** Number of items displayed per page (optional, used for item counter) */
  readonly itemsPerPage?: number;
  /** Optional callback for client-controlled pagination. If omitted, Next.js Link navigation is used. */
  readonly onPageChange?: (page: number) => void;
  /** Whether pagination transition is in progress (e.g. useTransition) */
  readonly isPending?: boolean;
  /** Optional hash anchor to append to URL, e.g. 'showcase' -> '#showcase' */
  readonly anchor?: string;
  /** Unique layoutId for Framer Motion spring active capsule */
  readonly layoutId?: string;
  /** Label for item counter, e.g. { vi: "template", en: "templates" } or "đơn hàng" */
  readonly itemName?: string | { vi: string; en: string };
  /** Explicitly toggle item counter display */
  readonly showItemCount?: boolean;
  /** Additional container classes */
  readonly className?: string;
  /** Whether to show top border line (default: true) */
  readonly bordered?: boolean;
  /** Scroll behavior for Link navigation (default: true) */
  readonly scroll?: boolean;
}

/**
 * Computes the page numbers array with smart ellipsis windowing
 * Keeps max 7 visible pill slots for clean mobile/tablet responsiveness.
 */
export function getPageNumbers(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 1) {
    return [1];
  }
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Near start: [1, 2, 3, 4, 5, '...', totalPages]
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  // Near end: [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  // Middle: [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  isPending = false,
  anchor,
  layoutId = "pagination-pill-active",
  itemName,
  showItemCount,
  className = "",
  bordered = true,
  scroll = true,
}: PaginationControlsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale } = useI18n();

  const shouldShowCount = showItemCount ?? (totalItems !== undefined && totalItems > 0);
  const resolvedItemName = typeof itemName === "object"
    ? (locale === "vi" ? itemName.vi : itemName.en)
    : (itemName || (locale === "vi" ? "kết quả" : "items"));

  // If there is only 1 page (or 0):
  // Render item count summary if requested and items exist, otherwise return null
  if (totalPages <= 1) {
    if (!shouldShowCount || totalItems === undefined || totalItems <= 0) {
      return null;
    }

    return (
      <div
        className={`flex items-center justify-between gap-4 pt-6 font-sans ${bordered ? "border-t border-slate-100" : ""} ${className}`}
      >
        <div className="text-xs font-medium text-slate-500 text-center sm:text-left">
          {locale === "vi" ? (
            <span>
              Hiển thị{" "}
              <span className="font-semibold text-slate-900">
                1 - {totalItems}
              </span>{" "}
              trên{" "}
              <span className="font-semibold text-slate-900">{totalItems}</span>{" "}
              {resolvedItemName}
            </span>
          ) : (
            <span>
              Showing{" "}
              <span className="font-semibold text-slate-900">
                1 - {totalItems}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">{totalItems}</span>{" "}
              {resolvedItemName}
            </span>
          )}
        </div>
      </div>
    );
  }

  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    params.set("page", pageNumber.toString());
    const cleanAnchor = anchor ? (anchor.startsWith("#") ? anchor : `#${anchor}`) : "";
    return `${pathname}?${params.toString()}${cleanAnchor}`;
  };

  const isPrevDisabled = safeCurrentPage <= 1 || isPending;
  const isNextDisabled = safeCurrentPage >= totalPages || isPending;

  const from = totalItems && totalItems > 0 && itemsPerPage
    ? (safeCurrentPage - 1) * itemsPerPage + 1
    : 1;
  const to = totalItems && totalItems > 0 && itemsPerPage
    ? Math.min(safeCurrentPage * itemsPerPage, totalItems)
    : totalItems;

  const pageNumbers = getPageNumbers(safeCurrentPage, totalPages);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center ${
        shouldShowCount && totalItems !== undefined ? "justify-between" : "justify-center"
      } gap-4 pt-6 font-sans ${bordered ? "border-t border-slate-100" : ""} ${className}`}
    >
      {/* ─── Item Count Summary ─── */}
      {shouldShowCount && totalItems !== undefined && (
        <div className="text-xs font-medium text-slate-500 order-2 sm:order-1 text-center sm:text-left">
          {locale === "vi" ? (
            <span>
              Hiển thị{" "}
              <span className="font-semibold text-slate-900">
                {from} - {to}
              </span>{" "}
              trên{" "}
              <span className="font-semibold text-slate-900">{totalItems}</span>{" "}
              {resolvedItemName}
            </span>
          ) : (
            <span>
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {from} - {to}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">{totalItems}</span>{" "}
              {resolvedItemName}
            </span>
          )}
        </div>
      )}

      {/* ─── Navigation Controls ─── */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        {/* Previous Button */}
        {onPageChange ? (
          <button
            type="button"
            onClick={() => onPageChange(safeCurrentPage - 1)}
            disabled={isPrevDisabled}
            aria-label={locale === "vi" ? "Trang trước" : "Previous page"}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 border ${
              isPrevDisabled
                ? "border-slate-100 text-slate-300 bg-slate-50/50 cursor-not-allowed"
                : "border-slate-200 bg-white text-slate-700 hover:text-primary hover:border-primary/40 hover:bg-primary/5 shadow-2xs active:scale-95 cursor-pointer"
            }`}
          >
            <ChevronLeft size={16} />
          </button>
        ) : isPrevDisabled ? (
          <span
            aria-disabled="true"
            aria-label={locale === "vi" ? "Trang trước" : "Previous page"}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-100 text-slate-300 bg-slate-50/50 cursor-not-allowed select-none"
          >
            <ChevronLeft size={16} />
          </span>
        ) : (
          <Link
            href={createPageUrl(safeCurrentPage - 1)}
            scroll={scroll}
            aria-label={locale === "vi" ? "Trang trước" : "Previous page"}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 border border-slate-200 bg-white text-slate-700 hover:text-primary hover:border-primary/40 hover:bg-primary/5 shadow-2xs active:scale-95 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </Link>
        )}

        {/* Number Pills & Ellipsis */}
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="w-8 h-9 flex items-center justify-center text-xs font-semibold text-slate-400 select-none"
              >
                ...
              </span>
            );
          }

          const isActive = page === safeCurrentPage;

          if (onPageChange) {
            return (
              <button
                key={page}
                type="button"
                disabled={isPending}
                onClick={() => onPageChange(page)}
                className={`relative w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:scale-95"
                } ${isPending ? "opacity-60 cursor-wait" : ""}`}
              >
                {isActive && (
                  <motion.div
                    layoutId={layoutId}
                    className="absolute inset-0 bg-primary rounded-xl shadow-xs shadow-primary/25"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  />
                )}
                <span className="relative z-10">{page}</span>
              </button>
            );
          }

          return (
            <Link
              key={page}
              href={createPageUrl(page)}
              scroll={scroll}
              className={`relative w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:scale-95"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId={layoutId}
                  className="absolute inset-0 bg-primary rounded-xl shadow-xs shadow-primary/25"
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                />
              )}
              <span className="relative z-10">{page}</span>
            </Link>
          );
        })}

        {/* Next Button */}
        {onPageChange ? (
          <button
            type="button"
            onClick={() => onPageChange(safeCurrentPage + 1)}
            disabled={isNextDisabled}
            aria-label={locale === "vi" ? "Trang sau" : "Next page"}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 border ${
              isNextDisabled
                ? "border-slate-100 text-slate-300 bg-slate-50/50 cursor-not-allowed"
                : "border-slate-200 bg-white text-slate-700 hover:text-primary hover:border-primary/40 hover:bg-primary/5 shadow-2xs active:scale-95 cursor-pointer"
            }`}
          >
            <ChevronRight size={16} />
          </button>
        ) : isNextDisabled ? (
          <span
            aria-disabled="true"
            aria-label={locale === "vi" ? "Trang sau" : "Next page"}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-100 text-slate-300 bg-slate-50/50 cursor-not-allowed select-none"
          >
            <ChevronRight size={16} />
          </span>
        ) : (
          <Link
            href={createPageUrl(safeCurrentPage + 1)}
            scroll={scroll}
            aria-label={locale === "vi" ? "Trang sau" : "Next page"}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 border border-slate-200 bg-white text-slate-700 hover:text-primary hover:border-primary/40 hover:bg-primary/5 shadow-2xs active:scale-95 cursor-pointer"
          >
            <ChevronRight size={16} />
          </Link>
        )}
      </div>
    </div>
  );
}
